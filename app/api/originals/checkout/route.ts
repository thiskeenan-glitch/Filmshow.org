import {
  ORIGINALS_MAX_PITCH_FILE_BYTES,
  ORIGINALS_MAX_PITCH_FILE_MB,
  ORIGINALS_PITCH_ACCEPT,
  ORIGINALS_SUBMISSION_COOKIE,
} from "@/lib/originals";
import {
  areOriginalsSubmissionsReady,
  getOriginalsServerConfig,
  getRequestOrigin,
} from "@/lib/originals-config";
import { getRateLimitKey, checkRateLimit } from "@/lib/rate-limit";
import {
  createOriginalsDraft,
  updateOriginalsSubmission,
  uploadOriginalsPitchPdf,
} from "@/lib/supabase-originals";
import { createOriginalsCheckoutSession } from "@/lib/stripe-originals";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const FIELD_LIMITS = {
  full_name: 120,
  email: 254,
  film_title: 180,
  premise: 5000,
  production_approach: 5000,
  previous_work_url: 500,
  website_or_instagram: 500,
};

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isTooLong(value: string, maxLength: number) {
  return value.length > maxLength;
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validatePitchPdf(file: File | null) {
  if (!file || file.size === 0) return null;

  const isPdf =
    file.type === ORIGINALS_PITCH_ACCEPT &&
    file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) return "Upload a PDF file.";
  if (file.size > ORIGINALS_MAX_PITCH_FILE_BYTES) {
    return `Keep the PDF under ${ORIGINALS_MAX_PITCH_FILE_MB} MB.`;
  }

  return null;
}

function validationError(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export async function POST(request: Request) {
  const limit = checkRateLimit(getRateLimitKey(request, "originals-checkout"), {
    limit: 6,
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
      { message: "Filmshow Grant submissions are opening soon." },
      { status: 503 },
    );
  }

  const formData = await request.formData();

  if (text(formData, "company")) {
    return validationError("Unable to submit this application.");
  }

  const full_name = text(formData, "full_name");
  const email = text(formData, "email").toLowerCase();
  const film_title = text(formData, "film_title");
  const premise = text(formData, "premise");
  const production_approach = text(formData, "production_approach");
  const previous_work_url = text(formData, "previous_work_url");
  const website_or_instagram = text(formData, "website_or_instagram");
  const terms_accepted = text(formData, "terms_accepted") === "true";
  const pitchPdfValue = formData.get("pitch_pdf");
  const pitchPdf = pitchPdfValue instanceof File ? pitchPdfValue : null;

  if (full_name.length < 2) return validationError("Enter your full name.");
  if (isTooLong(full_name, FIELD_LIMITS.full_name)) {
    return validationError("Full name is too long.");
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return validationError("Enter a valid email address.");
  }
  if (isTooLong(email, FIELD_LIMITS.email)) {
    return validationError("Email address is too long.");
  }
  if (!film_title) return validationError("Enter the proposed film title.");
  if (isTooLong(film_title, FIELD_LIMITS.film_title)) {
    return validationError("Film title is too long.");
  }
  if (!premise) return validationError("Tell us the premise.");
  if (isTooLong(premise, FIELD_LIMITS.premise)) {
    return validationError("Premise is too long.");
  }
  if (!production_approach) {
    return validationError("Tell us how you would make it.");
  }
  if (isTooLong(production_approach, FIELD_LIMITS.production_approach)) {
    return validationError("Production approach is too long.");
  }
  if (!isValidUrl(previous_work_url)) {
    return validationError("Previous work must be a valid URL.");
  }
  if (isTooLong(previous_work_url, FIELD_LIMITS.previous_work_url)) {
    return validationError("Previous work URL is too long.");
  }
  if (isTooLong(website_or_instagram, FIELD_LIMITS.website_or_instagram)) {
    return validationError("Instagram or website is too long.");
  }
  if (!terms_accepted) return validationError("Confirm the Grant agreement.");

  const pitchPdfError = validatePitchPdf(pitchPdf);
  if (pitchPdfError) return validationError(pitchPdfError);

  const config = getOriginalsServerConfig();
  const origin = getRequestOrigin(request);
  const submissionId = randomUUID();
  let draftSaved = false;

  try {
    await createOriginalsDraft(config, {
      id: submissionId,
      full_name,
      email,
      film_title,
      premise,
      production_approach,
      previous_work_url,
      website_or_instagram: website_or_instagram || null,
    });
    draftSaved = true;

    if (pitchPdf) {
      const pitchFilePath = await uploadOriginalsPitchPdf(
        config,
        submissionId,
        pitchPdf,
      );
      await updateOriginalsSubmission(config, submissionId, {
        pitch_file_path: pitchFilePath,
      });
    }

    const checkout = await createOriginalsCheckoutSession({
      config,
      origin,
      submissionId,
      applicantEmail: email,
    });

    await updateOriginalsSubmission(config, submissionId, {
      status: "payment_pending",
      stripe_checkout_session_id: checkout.id,
    });

    const response = NextResponse.json({
      submission_id: submissionId,
      checkout_url: checkout.url,
    });
    response.cookies.set(ORIGINALS_SUBMISSION_COOKIE, submissionId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 14,
      path: "/originals",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong before checkout. Your pitch was not charged.",
        submission_id: draftSaved ? submissionId : undefined,
      },
      { status: 500 },
    );
  }
}
