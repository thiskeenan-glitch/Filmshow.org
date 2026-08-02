import "server-only";

import type { OriginalsServerConfig } from "./originals-config";
import type { OriginalsSubmissionRecord } from "./supabase-originals";

export const GRANT_APPLICATION_STATUSES = [
  "new",
  "under_review",
  "shortlisted",
  "accepted",
  "not_accepted",
  "final_recipient",
] as const;

export type GrantApplicationStatus = (typeof GRANT_APPLICATION_STATUSES)[number];

export type GrantEmailType =
  | "admin_notification"
  | "confirmation"
  | "acceptance"
  | "not_accepted";

export type GrantSubmissionRecord = OriginalsSubmissionRecord & {
  application_status: GrantApplicationStatus;
  internal_notes: string | null;
  accepted_email_sent_at: string | null;
  rejection_email_sent_at: string | null;
  last_email_type: GrantEmailType | null;
  last_email_sent_at: string | null;
  application_reference: string | null;
  last_reviewed_by: string | null;
  last_reviewed_at: string | null;
};

export type GrantEmailTemplate = {
  id: "accepted" | "not_accepted" | "confirmation";
  subject: string;
  body: string;
  updated_at?: string;
  updated_by?: string | null;
};

export type GrantEmailLog = {
  id: string;
  submission_id: string | null;
  recipient: string;
  email_type: GrantEmailType;
  subject: string;
  delivery_provider_id: string | null;
  sent_at: string;
  delivery_status: "queued" | "sent" | "failed" | "skipped";
  error_message: string | null;
  initiating_admin_user: string | null;
  idempotency_key: string | null;
};

export type GrantActivityLog = {
  id: string;
  submission_id: string;
  action: string;
  from_status: string | null;
  to_status: string | null;
  notes: string | null;
  admin_email: string | null;
  created_at: string;
};

export const DEFAULT_GRANT_EMAIL_TEMPLATES: Record<
  GrantEmailTemplate["id"],
  GrantEmailTemplate
> = {
  confirmation: {
    id: "confirmation",
    subject: "We received your Filmshow Grant application",
    body: `Hi {{first_name}},

Your Filmshow Grant application for "{{project_title}}" has been received.

Your submission is complete, and no further action is required right now. We'll contact you at this email address when decisions are announced.

Project title: {{project_title}}
Submission date: {{submission_date}}
Payment confirmation: {{payment_confirmation}}
Application reference: {{application_reference}}

Thank you for sharing your work with us.

Filmshow
It's in the name.`,
  },
  not_accepted: {
    id: "not_accepted",
    subject: "An update on your Filmshow Grant application",
    body: `Hi {{first_name}},

Thank you for submitting "{{project_title}}" to the Filmshow Grant.

We received a strong group of applications and unfortunately won't be moving forward with this project in the current round.

We're grateful that you trusted us with your work, and we hope you'll stay connected with Filmshow.

Filmshow
It's in the name.`,
  },
  accepted: {
    id: "accepted",
    subject: "Filmshow Grant - we'd like to speak with you",
    body: `Hi {{first_name}},

We're excited to let you know that "{{project_title}}" has been selected to move forward in the Filmshow Grant process.

This is not yet a final funding agreement. We'd like to schedule a conversation to learn more about the project and discuss the next steps.

Please reply to this email with your availability.

Filmshow
It's in the name.`,
  },
};

function endpoint(config: OriginalsServerConfig, path: string) {
  return `${config.supabaseUrl.replace(/\/$/, "")}${path}`;
}

function apiHeaders(config: OriginalsServerConfig) {
  return {
    apikey: config.supabaseServiceRoleKey,
    Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
  };
}

async function parseSupabaseResponse<T>(response: Response) {
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : "Supabase request failed.";
    throw new Error(message);
  }

  return payload as T;
}

function encodeFilterValue(value: string) {
  return encodeURIComponent(value.replaceAll('"', '\\"'));
}

export function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

export function formatDateForEmail(value: string | null | undefined) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function renderGrantTemplate(
  template: string,
  submission: GrantSubmissionRecord,
) {
  const replacements: Record<string, string> = {
    first_name: firstName(submission.full_name),
    full_name: submission.full_name,
    project_title: submission.film_title,
    application_reference: submission.application_reference || submission.id,
    submission_date: formatDateForEmail(submission.created_at),
    payment_confirmation: submission.paid_at
      ? `Paid ${formatDateForEmail(submission.paid_at)}`
      : submission.status === "paid"
        ? "Paid"
        : "Not paid",
  };

  return template.replace(/\{\{\s*([\w_]+)\s*\}\}/g, (_match, key: string) => {
    return replacements[key] ?? "";
  });
}

export async function listGrantSubmissions(config: OriginalsServerConfig) {
  const response = await fetch(
    endpoint(
      config,
      "/rest/v1/originals_submissions?select=*&order=created_at.desc",
    ),
    {
      headers: apiHeaders(config),
      cache: "no-store",
    },
  );

  return parseSupabaseResponse<GrantSubmissionRecord[]>(response);
}

export async function getGrantSubmission(
  config: OriginalsServerConfig,
  id: string,
) {
  const response = await fetch(
    endpoint(
      config,
      `/rest/v1/originals_submissions?id=eq.${encodeURIComponent(id)}&select=*`,
    ),
    {
      headers: apiHeaders(config),
      cache: "no-store",
    },
  );

  const rows = await parseSupabaseResponse<GrantSubmissionRecord[]>(response);
  return rows[0] ?? null;
}

export async function updateGrantSubmission(
  config: OriginalsServerConfig,
  id: string,
  updates: Partial<GrantSubmissionRecord>,
) {
  const response = await fetch(
    endpoint(config, `/rest/v1/originals_submissions?id=eq.${encodeURIComponent(id)}`),
    {
      method: "PATCH",
      headers: {
        ...apiHeaders(config),
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(updates),
      cache: "no-store",
    },
  );

  const rows = await parseSupabaseResponse<GrantSubmissionRecord[]>(response);
  const record = rows[0];
  if (!record) throw new Error("Application was not updated.");
  return record;
}

export async function listGrantEmailLogs(
  config: OriginalsServerConfig,
  submissionId: string,
) {
  const response = await fetch(
    endpoint(
      config,
      `/rest/v1/originals_email_logs?submission_id=eq.${encodeURIComponent(submissionId)}&select=*&order=sent_at.desc`,
    ),
    {
      headers: apiHeaders(config),
      cache: "no-store",
    },
  );

  return parseSupabaseResponse<GrantEmailLog[]>(response);
}

export async function findGrantEmailLogByIdempotencyKey(
  config: OriginalsServerConfig,
  idempotencyKey: string,
) {
  const response = await fetch(
    endpoint(
      config,
      `/rest/v1/originals_email_logs?idempotency_key=eq.${encodeFilterValue(idempotencyKey)}&select=*`,
    ),
    {
      headers: apiHeaders(config),
      cache: "no-store",
    },
  );

  const rows = await parseSupabaseResponse<GrantEmailLog[]>(response);
  return rows[0] ?? null;
}

export async function createGrantEmailLog(
  config: OriginalsServerConfig,
  input: {
    submission_id?: string | null;
    recipient: string;
    email_type: GrantEmailType;
    subject: string;
    delivery_provider_id?: string | null;
    delivery_status?: GrantEmailLog["delivery_status"];
    error_message?: string | null;
    initiating_admin_user?: string | null;
    idempotency_key?: string | null;
    metadata?: Record<string, unknown>;
  },
) {
  const response = await fetch(endpoint(config, "/rest/v1/originals_email_logs"), {
    method: "POST",
    headers: {
      ...apiHeaders(config),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  const rows = await parseSupabaseResponse<GrantEmailLog[]>(response);
  return rows[0] ?? null;
}

export async function listGrantActivity(
  config: OriginalsServerConfig,
  submissionId: string,
) {
  const response = await fetch(
    endpoint(
      config,
      `/rest/v1/originals_application_activity?submission_id=eq.${encodeURIComponent(submissionId)}&select=*&order=created_at.desc`,
    ),
    {
      headers: apiHeaders(config),
      cache: "no-store",
    },
  );

  return parseSupabaseResponse<GrantActivityLog[]>(response);
}

export async function createGrantActivity(
  config: OriginalsServerConfig,
  input: {
    submission_id: string;
    action: string;
    from_status?: string | null;
    to_status?: string | null;
    notes?: string | null;
    admin_email?: string | null;
    metadata?: Record<string, unknown>;
  },
) {
  const response = await fetch(
    endpoint(config, "/rest/v1/originals_application_activity"),
    {
      method: "POST",
      headers: {
        ...apiHeaders(config),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      cache: "no-store",
    },
  );

  await parseSupabaseResponse<unknown>(response);
}

export async function listGrantEmailTemplates(config: OriginalsServerConfig) {
  const response = await fetch(
    endpoint(config, "/rest/v1/originals_email_templates?select=*"),
    {
      headers: apiHeaders(config),
      cache: "no-store",
    },
  );

  const rows = await parseSupabaseResponse<GrantEmailTemplate[]>(response);
  return {
    ...DEFAULT_GRANT_EMAIL_TEMPLATES,
    ...Object.fromEntries(rows.map((template) => [template.id, template])),
  } as Record<GrantEmailTemplate["id"], GrantEmailTemplate>;
}

export async function saveGrantEmailTemplate(
  config: OriginalsServerConfig,
  template: GrantEmailTemplate,
  adminEmail: string,
) {
  const response = await fetch(
    endpoint(config, "/rest/v1/originals_email_templates?on_conflict=id"),
    {
      method: "POST",
      headers: {
        ...apiHeaders(config),
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        ...template,
        updated_by: adminEmail,
        updated_at: new Date().toISOString(),
      }),
      cache: "no-store",
    },
  );

  const rows = await parseSupabaseResponse<GrantEmailTemplate[]>(response);
  return rows[0] ?? template;
}

export function adminStatusLabel(status: GrantApplicationStatus) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
