import { getRequestOrigin } from "@/lib/originals-config";
import {
  getLiveCheckoutStatus,
  isFilmshowLiveEnabled,
} from "@/lib/live/config";
import { connectLiveAudienceUser, getLiveViewerSnapshot } from "@/lib/live/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limit = checkRateLimit(getRateLimitKey(request, "live-checkout"), {
    limit: 6,
    windowMs: 15 * 60 * 1000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { message: "Too many checkout attempts. Please try again soon." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  if (!isFilmshowLiveEnabled()) {
    return NextResponse.json({ message: "Filmshow Live is not on sale yet." }, { status: 404 });
  }

  const checkoutStatus = getLiveCheckoutStatus();
  if (!checkoutStatus.ready) {
    return NextResponse.json({ message: "Checkout is not configured yet." }, { status: 503 });
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user?.email) {
    return NextResponse.json({ message: "Sign in before purchasing access." }, { status: 401 });
  }

  await connectLiveAudienceUser(user).catch(() => {});
  const snapshot = await getLiveViewerSnapshot(user);
  if (!snapshot?.event.is_enabled || !snapshot.event.ticket_sales_enabled) {
    return NextResponse.json({ message: "Livestream tickets are not on sale yet." }, { status: 409 });
  }
  if (snapshot.entitlement) {
    return NextResponse.json({ message: "This account already has livestream access." }, { status: 409 });
  }

  const origin = getRequestOrigin(request);
  const body = new URLSearchParams({
    mode: "payment",
    success_url: `${origin}/live?checkout=success`,
    cancel_url: `${origin}/live?checkout=cancelled`,
    client_reference_id: user.id,
    customer_email: user.email,
    "line_items[0][price]": process.env.STRIPE_LIVE_PRICE_ID!,
    "line_items[0][quantity]": "1",
    "metadata[program]": "filmshow_live",
    "metadata[event_id]": snapshot.event.id,
    "metadata[event_slug]": snapshot.event.slug,
    "metadata[entitlement_key]": snapshot.event.entitlement_key,
    "metadata[user_id]": user.id,
    "payment_intent_data[metadata][program]": "filmshow_live",
    "payment_intent_data[metadata][event_id]": snapshot.event.id,
    "payment_intent_data[metadata][user_id]": user.id,
  });

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const checkout = (await stripeResponse.json()) as {
    id?: string;
    url?: string;
    error?: { message?: string };
  };

  if (!stripeResponse.ok || !checkout.url) {
    return NextResponse.json(
      { message: checkout.error?.message || "Stripe Checkout could not be opened." },
      { status: 502 },
    );
  }

  return NextResponse.json({ url: checkout.url });
}
