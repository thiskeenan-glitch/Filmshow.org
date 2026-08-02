import {
  ORIGINALS_CURRENCY,
  ORIGINALS_SUBMISSION_FEE_CENTS,
} from "@/lib/originals";
import type { GrantSubmissionRecord } from "@/lib/grant-admin";
import { getOriginalsServerConfig } from "@/lib/originals-config";
import { sendGrantEmail } from "@/lib/grant-email";
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

const SUCCESS_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);

const FAILURE_EVENTS = new Set([
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
]);

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

  if (!SUCCESS_EVENTS.has(event.type) && !FAILURE_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  const session = event.data?.object;
  const submissionId =
    session?.metadata?.submission_id || session?.client_reference_id || "";

  if (
    !session ||
    !submissionId ||
    session.metadata?.program !== "filmshow_originals"
  ) {
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

  if (FAILURE_EVENTS.has(event.type)) {
    if (
      existing.status !== "paid" &&
      existing.stripe_checkout_session_id === session.id
    ) {
      await updateOriginalsSubmission(config, submissionId, {
        status: "payment_failed",
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent || null,
      });
    }

    return NextResponse.json({ received: true });
  }

  if (
    event.type === "checkout.session.completed" &&
    session.payment_status !== "paid"
  ) {
    return NextResponse.json({ received: true });
  }

  if (
    session.amount_total !== ORIGINALS_SUBMISSION_FEE_CENTS ||
    session.currency?.toLowerCase() !== ORIGINALS_CURRENCY
  ) {
    return NextResponse.json(
      { message: "Unexpected Stripe payment amount." },
      { status: 400 },
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
    sendApplicantConfirmation: false,
  });

  let applicantEmailError: string | null = null;

  try {
    await sendGrantEmail({
      config,
      submission: paidSubmission as GrantSubmissionRecord,
      emailType: "confirmation",
      idempotencyKey: `stripe-confirmation-${session.id}-${submissionId}`,
    });
  } catch (error) {
    applicantEmailError =
      error instanceof Error ? error.message : "Confirmation email failed.";
  }

  await updateOriginalsSubmission(config, submissionId, {
    notification_email_sent_at: emailResult.teamSent
      ? paidSubmission.notification_email_sent_at || new Date().toISOString()
      : paidSubmission.notification_email_sent_at,
    email_error: emailResult.error ?? applicantEmailError ?? null,
  });

  if (emailResult.error || applicantEmailError) {
    return NextResponse.json(
      { message: emailResult.error || applicantEmailError },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
