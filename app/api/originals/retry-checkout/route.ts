import {
  areOriginalsSubmissionsReady,
  getOriginalsServerConfig,
  getRequestOrigin,
} from "@/lib/originals-config";
import { ORIGINALS_SUBMISSION_COOKIE } from "@/lib/originals";
import { getRateLimitKey, checkRateLimit } from "@/lib/rate-limit";
import {
  getOriginalsSubmission,
  updateOriginalsSubmission,
} from "@/lib/supabase-originals";
import { createOriginalsCheckoutSession } from "@/lib/stripe-originals";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function withSubmissionCookie(response: NextResponse, submissionId: string) {
  response.cookies.set(ORIGINALS_SUBMISSION_COOKIE, submissionId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 14,
    path: "/originals",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

export async function POST(request: Request) {
  const limit = checkRateLimit(getRateLimitKey(request, "originals-retry"), {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { message: "Too many attempts. Please try again soon." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter) },
      },
    );
  }

  if (!areOriginalsSubmissionsReady()) {
    return NextResponse.json(
      { message: "Filmshow Originals submissions are opening soon." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    submission_id?: string;
  } | null;
  const submissionId = body?.submission_id?.trim();

  if (!submissionId) {
    return NextResponse.json(
      { message: "Submission reference is missing." },
      { status: 400 },
    );
  }

  const config = getOriginalsServerConfig();
  const submission = await getOriginalsSubmission(config, submissionId);

  if (!submission) {
    return NextResponse.json(
      { message: "We could not find that saved pitch." },
      { status: 404 },
    );
  }

  if (submission.status === "paid") {
    return withSubmissionCookie(
      NextResponse.json({
        checkout_url: `${getRequestOrigin(request)}/originals/success`,
      }),
      submissionId,
    );
  }

  const checkout = await createOriginalsCheckoutSession({
    config,
    origin: getRequestOrigin(request),
    submissionId,
    applicantEmail: submission.email,
  });

  await updateOriginalsSubmission(config, submissionId, {
    status: "payment_pending",
    stripe_checkout_session_id: checkout.id,
  });

  return withSubmissionCookie(
    NextResponse.json({
      submission_id: submissionId,
      checkout_url: checkout.url,
    }),
    submissionId,
  );
}
