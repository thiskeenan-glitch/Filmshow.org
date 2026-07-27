import "server-only";

import type { OriginalsServerConfig } from "./originals-config";
import { ORIGINALS_TERMS_VERSION } from "./originals";

export type OriginalsSubmissionStatus =
  | "draft"
  | "payment_pending"
  | "paid"
  | "payment_failed"
  | "withdrawn";

export type OriginalsSubmissionRecord = {
  id: string;
  created_at?: string;
  updated_at?: string;
  full_name: string;
  email: string;
  film_title: string;
  premise: string;
  production_approach: string;
  previous_work_url: string;
  website_or_instagram: string | null;
  pitch_file_path: string | null;
  status: OriginalsSubmissionStatus;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_paid: number | null;
  currency: string | null;
  paid_at: string | null;
  terms_accepted: boolean;
  terms_version: string;
  notification_email_sent_at: string | null;
  applicant_confirmation_email_sent_at: string | null;
  email_error: string | null;
};

export type OriginalsDraftInput = {
  id: string;
  full_name: string;
  email: string;
  film_title: string;
  premise: string;
  production_approach: string;
  previous_work_url: string;
  website_or_instagram?: string | null;
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

function encodeStoragePath(path: string) {
  return path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
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

export async function createOriginalsDraft(
  config: OriginalsServerConfig,
  input: OriginalsDraftInput,
) {
  const response = await fetch(endpoint(config, "/rest/v1/originals_submissions"), {
    method: "POST",
    headers: {
      ...apiHeaders(config),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      ...input,
      website_or_instagram: input.website_or_instagram || null,
      status: "draft",
      terms_accepted: true,
      terms_version: ORIGINALS_TERMS_VERSION,
    }),
  });

  const rows = await parseSupabaseResponse<OriginalsSubmissionRecord[]>(response);
  const record = rows[0];
  if (!record) throw new Error("Draft was not created.");

  return record;
}

export async function updateOriginalsSubmission(
  config: OriginalsServerConfig,
  id: string,
  updates: Partial<OriginalsSubmissionRecord>,
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
    },
  );

  const rows = await parseSupabaseResponse<OriginalsSubmissionRecord[]>(response);
  const record = rows[0];
  if (!record) throw new Error("Submission was not updated.");

  return record;
}

export async function getOriginalsSubmission(
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
    },
  );

  const rows = await parseSupabaseResponse<OriginalsSubmissionRecord[]>(response);
  return rows[0] ?? null;
}

export async function uploadOriginalsPitchPdf(
  config: OriginalsServerConfig,
  submissionId: string,
  file: File,
) {
  const fileName = file.name.replace(/[^\w.-]+/g, "-").toLowerCase();
  const path = `originals/${submissionId}/${Date.now()}-${fileName || "pitch.pdf"}`;
  const response = await fetch(
    endpoint(
      config,
      `/storage/v1/object/${encodeURIComponent(config.supabaseBucket)}/${encodeStoragePath(path)}`,
    ),
    {
      method: "POST",
      headers: {
        ...apiHeaders(config),
        "Content-Type": "application/pdf",
        "x-upsert": "false",
      },
      body: await file.arrayBuffer(),
    },
  );

  await parseSupabaseResponse<unknown>(response);
  return path;
}

export async function createOriginalsPitchSignedUrl(
  config: OriginalsServerConfig,
  path: string,
) {
  const response = await fetch(
    endpoint(
      config,
      `/storage/v1/object/sign/${encodeURIComponent(config.supabaseBucket)}/${encodeStoragePath(path)}`,
    ),
    {
      method: "POST",
      headers: {
        ...apiHeaders(config),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn: 60 * 60 * 24 * 7 }),
    },
  );

  const payload = await parseSupabaseResponse<{ signedURL?: string }>(response);
  if (!payload.signedURL) return null;

  if (payload.signedURL.startsWith("http")) return payload.signedURL;

  return endpoint(config, `/storage/v1${payload.signedURL}`);
}
