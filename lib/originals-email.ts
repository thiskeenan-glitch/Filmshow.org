import "server-only";

import type {
  OriginalsSubmissionRecord,
} from "./supabase-originals";
import type { OriginalsServerConfig } from "./originals-config";
import {
  DEFAULT_GRANT_EMAIL_TEMPLATES,
  type GrantSubmissionRecord,
  renderGrantTemplate,
} from "./grant-admin";

type EmailResult = {
  teamSent: boolean;
  applicantSent: boolean;
  error?: string;
};

export function escapeHtml(value: string | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function nl2br(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

export async function sendBrevoEmail({
  config,
  to,
  subject,
  html,
  text,
}: {
  config: OriginalsServerConfig;
  to: string;
  subject: string;
  html?: string;
  text?: string;
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
      htmlContent: html || `<p>${nl2br(text || "")}</p>`,
      ...(text ? { textContent: text } : {}),
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | { messageId?: string; message?: string; code?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.message || payload?.code || "Email delivery failed.");
  }

  return payload?.messageId ?? null;
}

function field(label: string, value: string | null | undefined) {
  return `<p><strong>${escapeHtml(label)}:</strong><br>${escapeHtml(value) || "Not provided"}</p>`;
}

export async function sendOriginalsPaidEmails({
  config,
  submission,
  pitchPdfUrl,
  sendApplicantConfirmation = true,
}: {
  config: OriginalsServerConfig;
  submission: OriginalsSubmissionRecord;
  pitchPdfUrl: string | null;
  sendApplicantConfirmation?: boolean;
}): Promise<EmailResult> {
  const result: EmailResult = {
    teamSent: Boolean(submission.notification_email_sent_at),
    applicantSent: Boolean(submission.confirmation_email_sent_at),
  };

  try {
    if (!result.teamSent) {
      await sendBrevoEmail({
        config,
        to: config.notificationEmail,
        subject: `New Filmshow Grant submission: ${submission.film_title}`,
        html: `
          <h1>New Filmshow Grant submission</h1>
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

    if (sendApplicantConfirmation && !result.applicantSent) {
      const grantSubmission = submission as GrantSubmissionRecord;
      const body = renderGrantTemplate(
        DEFAULT_GRANT_EMAIL_TEMPLATES.confirmation.body,
        grantSubmission,
      );

      await sendBrevoEmail({
        config,
        to: submission.email,
        subject: DEFAULT_GRANT_EMAIL_TEMPLATES.confirmation.subject,
        text: body,
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
