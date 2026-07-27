import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import {
  ORIGINALS_CURRENCY,
  ORIGINALS_SUBMISSION_FEE_CENTS,
  ORIGINALS_SUBMISSION_FEE_LABEL,
} from "./originals";
import type { OriginalsServerConfig } from "./originals-config";

type CheckoutSessionResponse = {
  id: string;
  url: string | null;
};

export type StripeCheckoutSession = {
  id: string;
  payment_status?: string;
  payment_intent?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  client_reference_id?: string | null;
  metadata?: {
    submission_id?: string;
  } | null;
};

export async function createOriginalsCheckoutSession({
  config,
  origin,
  submissionId,
  applicantEmail,
}: {
  config: OriginalsServerConfig;
  origin: string;
  submissionId: string;
  applicantEmail: string;
}) {
  const body = new URLSearchParams({
    mode: "payment",
    success_url: `${origin}/originals/success`,
    cancel_url: `${origin}/originals?payment=cancelled&submission=${submissionId}#application`,
    client_reference_id: submissionId,
    customer_email: applicantEmail,
    "line_items[0][price_data][currency]": ORIGINALS_CURRENCY,
    "line_items[0][price_data][product_data][name]":
      "Filmshow Originals submission fee",
    "line_items[0][price_data][product_data][description]":
      `${ORIGINALS_SUBMISSION_FEE_LABEL} pitch submission`,
    "line_items[0][price_data][unit_amount]": String(
      ORIGINALS_SUBMISSION_FEE_CENTS,
    ),
    "line_items[0][quantity]": "1",
    "metadata[submission_id]": submissionId,
    "payment_intent_data[metadata][submission_id]": submissionId,
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const payload = (await response.json()) as CheckoutSessionResponse & {
    error?: { message?: string };
  };

  if (!response.ok || !payload.url) {
    throw new Error(payload.error?.message || "Stripe Checkout failed.");
  }

  return payload;
}

export function verifyStripeWebhookSignature({
  payload,
  signatureHeader,
  secret,
  toleranceSeconds = 300,
}: {
  payload: string;
  signatureHeader: string;
  secret: string;
  toleranceSeconds?: number;
}) {
  const parts = signatureHeader.split(",");
  const timestamp = parts
    .find((part) => part.startsWith("t="))
    ?.slice(2);
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  if (!timestamp || signatures.length === 0) return false;

  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber)) return false;

  const age = Math.abs(Date.now() / 1000 - timestampNumber);
  if (age > toleranceSeconds) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return signatures.some((signature) => {
    const signatureBuffer = Buffer.from(signature, "hex");

    return (
      signatureBuffer.length === expectedBuffer.length &&
      timingSafeEqual(signatureBuffer, expectedBuffer)
    );
  });
}
