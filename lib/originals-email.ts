import "server-only";

import { ORIGINALS_SUBMISSION_FEE_LABEL } from "./originals";
import type {
  OriginalsSubmissionRecord,
} from "./supabase-originals";
import type { OriginalsServerConfig } from "./originals-config";

type EmailResult = {
  teamSent: boolean;
  applicantSent: boolean;
  error?: string;
};

function escapeHtml(value: string | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendEmail({
  config,
  to,
  subject,
  html,
}: {
  config: OriginalsServerConfig;
  to: string;
  subject: string;
  html: string;
}) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": config.brevoApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: config.emailFrom,
        name: "Filmshow",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string; code?: string }
      | null;
    throw new Error(payload?.message || payload?.code || "Email delivery failed.");
  }
}

function field(label: string, value: string | null | undefined) {
  return `<p><strong>${escapeHtml(label)}:</strong><br>${escapeHtml(value) || "Not provided"}</p>`;
}

export async function sendOriginalsPaidEmails({
  config,
  submission,
  pitchPdfUrl,
}: {
  config: OriginalsServerConfig;
  submission: OriginalsSubmissionRecord;
  pitchPdfUrl: string | null;
}): Promise<EmailResult> {
  const result: EmailResult = {
    teamSent: Boolean(submission.notification_email_sent_at),
    applicantSent: Boolean(submission.applicant_confirmation_email_sent_at),
  };

  try {
    if (!result.teamSent) {
      await sendEmail({
        config,
        to: config.notificationEmail,
        subject: `New Filmshow Originals submission: ${submission.film_title}`,
        html: `
          <h1>New Filmshow Originals submission</h1>
          ${field("Applicant", submission.full_name)}
          ${field("Email", submission.email)}
          ${field("Film title", submission.film_title)}
          ${field("Premise", submission.premise)}
          ${field("Production approach", submission.production_approach)}
          ${field("Previous work", submission.previous_work_url)}
          ${field("Website or Instagram", submission.website_or_instagram)}
          ${field("Submission ID", submission.id)}
          ${field("Payment status", submission.status)}
          ${
            pitchPdfUrl
              ? `<p><strong>Pitch PDF:</strong><br><a href="${escapeHtml(pitchPdfUrl)}">Open private signed link</a></p>`
              : "<p><strong>Pitch PDF:</strong><br>No PDF uploaded.</p>"
          }
        `,
      });
      result.teamSent = true;
    }

    if (!result.applicantSent) {
      await sendEmail({
        config,
        to: submission.email,
        subject: "Filmshow Originals submission received",
        html: `
          <p>Thank you for submitting your pitch to Filmshow Originals.</p>
          <p>We received your application for &ldquo;${escapeHtml(submission.film_title)}&rdquo; and your ${ORIGINALS_SUBMISSION_FEE_LABEL} submission payment.</p>
          <p>One selected filmmaker will receive $2,000 in production funding, support from Bluebird, and a guaranteed premiere at an upcoming Filmshow in New York City.</p>
          <p>We will contact applicants at the email address used in the submission.</p>
          <p><strong>Submission reference:</strong> ${escapeHtml(submission.id)}</p>
        `,
      });
      result.applicantSent = true;
    }

    return result;
  } catch (error) {
    return {
      ...result,
      error: error instanceof Error ? error.message : "Email delivery failed.",
    };
  }
}
