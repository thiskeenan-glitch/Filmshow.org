import "server-only";

import type { OriginalsServerConfig } from "./originals-config";
import { sendBrevoEmail } from "./originals-email";
import {
  DEFAULT_GRANT_EMAIL_TEMPLATES,
  type GrantEmailType,
  type GrantSubmissionRecord,
  createGrantActivity,
  createGrantEmailLog,
  findGrantEmailLogByIdempotencyKey,
  renderGrantTemplate,
  updateGrantSubmission,
} from "./grant-admin";

function emailTypeToTemplateId(type: GrantEmailType) {
  if (type === "acceptance") return "accepted";
  if (type === "not_accepted") return "not_accepted";
  return "confirmation";
}

function emailTimestampUpdates(type: GrantEmailType) {
  const now = new Date().toISOString();

  if (type === "confirmation") {
    return {
      confirmation_email_sent_at: now,
      last_email_type: type,
      last_email_sent_at: now,
      email_error: null,
    };
  }

  if (type === "acceptance") {
    return {
      accepted_email_sent_at: now,
      last_email_type: type,
      last_email_sent_at: now,
      email_error: null,
    };
  }

  if (type === "not_accepted") {
    return {
      rejection_email_sent_at: now,
      last_email_type: type,
      last_email_sent_at: now,
      email_error: null,
    };
  }

  return {
    last_email_type: type,
    last_email_sent_at: now,
    email_error: null,
  };
}

function wasAlreadySent(type: GrantEmailType, submission: GrantSubmissionRecord) {
  if (type === "confirmation") return Boolean(submission.confirmation_email_sent_at);
  if (type === "acceptance") return Boolean(submission.accepted_email_sent_at);
  if (type === "not_accepted") return Boolean(submission.rejection_email_sent_at);
  return false;
}

export async function sendGrantEmail({
  config,
  submission,
  emailType,
  subject,
  body,
  adminEmail,
  idempotencyKey,
  allowResend = false,
}: {
  config: OriginalsServerConfig;
  submission: GrantSubmissionRecord;
  emailType: GrantEmailType;
  subject?: string;
  body?: string;
  adminEmail?: string | null;
  idempotencyKey?: string | null;
  allowResend?: boolean;
}) {
  if (idempotencyKey) {
    const existing = await findGrantEmailLogByIdempotencyKey(config, idempotencyKey);
    if (existing) {
      return { sent: false, skipped: true, reason: "Duplicate send blocked." };
    }
  }

  if (!allowResend && wasAlreadySent(emailType, submission)) {
    await createGrantEmailLog(config, {
      submission_id: submission.id,
      recipient: submission.email,
      email_type: emailType,
      subject:
        subject ||
        DEFAULT_GRANT_EMAIL_TEMPLATES[emailTypeToTemplateId(emailType)].subject,
      delivery_status: "skipped",
      initiating_admin_user: adminEmail,
      idempotency_key: idempotencyKey,
      metadata: { reason: "already_sent" },
    });
    return { sent: false, skipped: true, reason: "Already sent." };
  }

  const templateId = emailTypeToTemplateId(emailType);
  const renderedSubject = renderGrantTemplate(
    subject || DEFAULT_GRANT_EMAIL_TEMPLATES[templateId].subject,
    submission,
  );
  const renderedBody = renderGrantTemplate(
    body || DEFAULT_GRANT_EMAIL_TEMPLATES[templateId].body,
    submission,
  );

  try {
    const messageId = await sendBrevoEmail({
      config,
      to: submission.email,
      subject: renderedSubject,
      text: renderedBody,
    });

    await createGrantEmailLog(config, {
      submission_id: submission.id,
      recipient: submission.email,
      email_type: emailType,
      subject: renderedSubject,
      delivery_provider_id: messageId,
      delivery_status: "sent",
      initiating_admin_user: adminEmail,
      idempotency_key: idempotencyKey,
    });

    await updateGrantSubmission(config, submission.id, emailTimestampUpdates(emailType));
    await createGrantActivity(config, {
      submission_id: submission.id,
      action: `email_${emailType}_sent`,
      admin_email: adminEmail,
      notes: renderedSubject,
    });

    return { sent: true, skipped: false, providerId: messageId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Email delivery failed.";

    await createGrantEmailLog(config, {
      submission_id: submission.id,
      recipient: submission.email,
      email_type: emailType,
      subject: renderedSubject,
      delivery_status: "failed",
      error_message: message,
      initiating_admin_user: adminEmail,
      idempotency_key: idempotencyKey,
    });

    await updateGrantSubmission(config, submission.id, {
      email_error: message,
    });

    throw new Error(message);
  }
}
