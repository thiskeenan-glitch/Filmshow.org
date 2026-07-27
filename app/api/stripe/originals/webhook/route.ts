import { getOriginalsServerConfig } from "@/lib/originals-config";
import { sendOriginalsPaidEmails } from "@/lib/originals-email";
import {
  createOriginalsPitchSignedUrl,
  getOriginalsSubmission,
  updateOriginalsSubmission,
} from "@/lib/supabase-originals";
import {
  type StripeCheckoutSession,
  verifyStripeWebhookSignature,
} from "@/lib/stripe-originals";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type StripeEvent = {
  id: string;
  type: string;
  data?: {
    object?: StripeCheckoutSession;
  };
};

export async function POST(request: Request) {
  const config = getOriginalsServerConfig();
  const payload = await request.text();
  const signatureHeader = request.headers.get("stripe-signature");

  if (
    !signatureHeader ||
    !verifyStripeWebhookSignature({
      payload,
      signatureHeader,
      secret: config.stripeWebhookSecret,
    })
  ) {
    return NextResponse.json(
      { message: "Invalid Stripe signature." },
      { status: 400 },
    );
  }

  const event = JSON.parse(payload) as StripeEvent;

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    return NextResponse.json({ received: true });
  }

  const session = event.data?.object;
  const submissionId =
    session?.metadata?.submission_id || session?.client_reference_id || "";

  if (!session || !submissionId) {
    return NextResponse.json(
      { message: "Missing submission metadata." },
      { status: 400 },
    );
  }

  const existing = await getOriginalsSubmission(config, submissionId);
  if (!existing) {
    return NextResponse.json(
      { message: "Submission not found." },
      { status: 404 },
    );
  }

  const paidSubmission =
    existing.status === "paid"
      ? existing
      : await updateOriginalsSubmission(config, submissionId, {
          status: "paid",
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent || null,
          amount_paid: session.amount_total ?? null,
          currency: session.currency ?? null,
          paid_at: new Date().toISOString(),
        });

  const pitchPdfUrl = paidSubmission.pitch_file_path
    ? await createOriginalsPitchSignedUrl(config, paidSubmission.pitch_file_path)
    : null;

  const emailResult = await sendOriginalsPaidEmails({
    config,
    submission: paidSubmission,
    pitchPdfUrl,
  });

  await updateOriginalsSubmission(config, submissionId, {
    notification_email_sent_at: emailResult.teamSent
      ? paidSubmission.notification_email_sent_at || new Date().toISOString()
      : paidSubmission.notification_email_sent_at,
    applicant_confirmation_email_sent_at: emailResult.applicantSent
      ? paidSubmission.applicant_confirmation_email_sent_at ||
        new Date().toISOString()
      : paidSubmission.applicant_confirmation_email_sent_at,
    email_error: emailResult.error ?? null,
  });

  if (emailResult.error) {
    return NextResponse.json(
      { message: emailResult.error },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
