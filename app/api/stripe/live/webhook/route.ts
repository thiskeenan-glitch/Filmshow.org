import { LIVE_ENTITLEMENT_KEY } from "@/lib/live/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyStripeWebhookSignature } from "@/lib/stripe-originals";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type LiveStripeSession = {
  id: string;
  payment_status?: string;
  payment_intent?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  customer_details?: { email?: string | null } | null;
  customer_email?: string | null;
  metadata?: {
    program?: string;
    event_id?: string;
    event_slug?: string;
    entitlement_key?: string;
    user_id?: string;
  } | null;
};

type StripeEvent = {
  id: string;
  type: string;
  data?: { object?: LiveStripeSession };
};

const successEvents = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);

export async function POST(request: Request) {
  const secret = process.env.STRIPE_LIVE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "Webhook is not configured." }, { status: 503 });
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature || !verifyStripeWebhookSignature({ payload, signatureHeader: signature, secret })) {
    return NextResponse.json({ message: "Invalid Stripe signature." }, { status: 400 });
  }

  const event = JSON.parse(payload) as StripeEvent;
  if (!successEvents.has(event.type)) return NextResponse.json({ received: true });

  const session = event.data?.object;
  if (
    !session ||
    session.metadata?.program !== "filmshow_live" ||
    session.metadata.entitlement_key !== LIVE_ENTITLEMENT_KEY ||
    !session.metadata.event_id ||
    !session.metadata.user_id
  ) {
    return NextResponse.json({ message: "Missing livestream metadata." }, { status: 400 });
  }
  if (event.type === "checkout.session.completed" && session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const supabase = createSupabaseAdminClient();
  const { data: liveEvent, error: eventError } = await supabase
    .from("live_events")
    .select("id,price_cents,currency,entitlement_key")
    .eq("id", session.metadata.event_id)
    .single();
  if (eventError || !liveEvent) {
    return NextResponse.json({ message: "Livestream event not found." }, { status: 404 });
  }
  if (
    liveEvent.entitlement_key !== session.metadata.entitlement_key ||
    session.amount_total !== liveEvent.price_cents ||
    session.currency?.toLowerCase() !== liveEvent.currency
  ) {
    return NextResponse.json({ message: "Unexpected livestream payment." }, { status: 400 });
  }

  const email = (session.customer_details?.email || session.customer_email || "")
    .trim()
    .toLowerCase();
  if (!email) {
    return NextResponse.json({ message: "Checkout email is missing." }, { status: 400 });
  }

  const { error: entitlementError } = await supabase.from("live_entitlements").upsert(
    {
      event_id: liveEvent.id,
      user_id: session.metadata.user_id,
      email_normalized: email,
      source: "stripe",
      status: "active",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent || null,
      amount_paid: session.amount_total ?? null,
      currency: session.currency?.toLowerCase() || null,
      granted_at: new Date().toISOString(),
      revoked_at: null,
      metadata: { stripe_event_id: event.id },
    },
    { onConflict: "event_id,email_normalized" },
  );
  if (entitlementError) {
    return NextResponse.json({ message: "Livestream access could not be granted." }, { status: 500 });
  }

  const { data: contactId } = await supabase.rpc("upsert_audience_contact", {
    p_email: email,
    p_name: null,
    p_marketing_opt_in: false,
    p_consent_source: null,
  });
  if (contactId) {
    await supabase.from("audience_events").upsert(
      {
        contact_id: contactId,
        event_type: "filmshow_live_ticket_purchased",
        source: "stripe",
        source_record_id: session.id,
        campaign: session.metadata.event_slug || "vol-1",
        dedupe_key: `filmshow-live-purchase:${session.id}`,
        metadata: { event_id: liveEvent.id, amount_paid: session.amount_total, currency: session.currency },
      },
      { onConflict: "dedupe_key", ignoreDuplicates: true },
    );
  }

  return NextResponse.json({ received: true });
}
