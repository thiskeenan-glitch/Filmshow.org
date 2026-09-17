import "server-only";

type AudienceMetadata = Record<string, string | number | boolean | null>;

type AudienceTouchInput = {
  email: string;
  name?: string | null;
  source: string;
  eventType: string;
  tags?: string[];
  marketingOptIn?: boolean;
  consentSource?: string | null;
  sourceRecordId?: string | null;
  campaign?: string | null;
  occurredAt?: string | null;
  dedupeKey?: string | null;
  metadata?: AudienceMetadata;
};

type AudienceConfig = {
  supabaseUrl: string;
  secretKey: string;
  resendApiKey: string | null;
  resendSegmentId: string | null;
  brevoApiKey: string | null;
  brevoListId: number | null;
  brevoFormAction: string;
};

const DEFAULT_BREVO_FORM_ACTION =
  "https://5f97f476.sibforms.com/v2/serve/MUIFACa5WCz3YIdoebcEbBotBCCFwZiSOGXVyXnzqsT-zrrPU5jPRccb9FN26BBOQAAVWRmhHbI2ikVfcPISsnrBNeXxrlHs29ywW3Ve5cgKMQcitms4QKQxeB8JXYZOsgP6EORU8n5_q71WJ0F-DW50QlECxR52p1XYXF0ajLZlno7AlCWt5qXJBPg-2nnMvf-mKehO2cVSz8tVKA==";

function getAudienceConfig(): AudienceConfig {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const secretKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const resendApiKey = process.env.RESEND_API_KEY?.trim() || null;
  const resendSegmentId =
    process.env.RESEND_MARKETING_SEGMENT_ID?.trim() || null;
  const brevoApiKey = process.env.BREVO_API_KEY?.trim() || null;
  const rawListId = process.env.BREVO_MASTER_LIST_ID?.trim();
  const parsedListId = rawListId ? Number(rawListId) : Number.NaN;
  const brevoFormAction =
    process.env.BREVO_FORM_ACTION?.trim() || DEFAULT_BREVO_FORM_ACTION;

  if (!supabaseUrl || !secretKey) {
    throw new Error("Audience storage is not configured.");
  }

  return {
    supabaseUrl: supabaseUrl.replace(/\/$/, ""),
    secretKey,
    resendApiKey,
    resendSegmentId,
    brevoApiKey,
    brevoListId:
      Number.isInteger(parsedListId) && parsedListId > 0 ? parsedListId : null,
    brevoFormAction,
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "_").slice(0, 80);
}

function splitName(name?: string | null) {
  const normalized = name?.trim().replace(/\s+/g, " ") || "";
  if (!normalized) return { firstName: null, lastName: null };

  const parts = normalized.split(" ");
  return {
    firstName: parts[0] || null,
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : null,
  };
}

async function supabaseRequest(
  config: AudienceConfig,
  path: string,
  init: RequestInit,
) {
  return fetch(`${config.supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.secretKey,
      Authorization: `Bearer ${config.secretKey}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
}

async function upsertContact(
  config: AudienceConfig,
  input: AudienceTouchInput,
) {
  const response = await supabaseRequest(config, "rpc/upsert_audience_contact", {
    method: "POST",
    body: JSON.stringify({
      p_email: normalizeEmail(input.email),
      p_name: input.name?.trim() || null,
      p_marketing_opt_in: input.marketingOptIn === true,
      p_consent_source:
        input.marketingOptIn === true
          ? input.consentSource?.trim() || input.source
          : null,
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error("The audience contact could not be saved.");
  }

  const contactId = raw ? (JSON.parse(raw) as string) : "";
  if (!contactId) {
    throw new Error("The audience contact could not be saved.");
  }

  return contactId;
}

async function saveTags(
  config: AudienceConfig,
  contactId: string,
  tags: string[],
) {
  const normalizedTags = Array.from(
    new Set(tags.map(normalizeTag).filter(Boolean)),
  );
  if (normalizedTags.length === 0) return;

  const response = await supabaseRequest(
    config,
    "audience_contact_tags?on_conflict=contact_id,tag",
    {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
      body: JSON.stringify(
        normalizedTags.map((tag) => ({ contact_id: contactId, tag })),
      ),
    },
  );

  if (!response.ok) {
    throw new Error("The audience tags could not be saved.");
  }
}

async function saveAudienceEvent(
  config: AudienceConfig,
  contactId: string,
  input: AudienceTouchInput,
) {
  const path = input.dedupeKey
    ? "audience_events?on_conflict=dedupe_key"
    : "audience_events";
  const response = await supabaseRequest(config, path, {
    method: "POST",
    headers: {
      Prefer: input.dedupeKey
        ? "resolution=ignore-duplicates,return=minimal"
        : "return=minimal",
    },
    body: JSON.stringify({
      contact_id: contactId,
      event_type: input.eventType,
      source: input.source,
      source_record_id: input.sourceRecordId || null,
      campaign: input.campaign || null,
      occurred_at: input.occurredAt || new Date().toISOString(),
      dedupe_key: input.dedupeKey || null,
      metadata: input.metadata || {},
    }),
  });

  if (!response.ok) {
    throw new Error("The audience event could not be saved.");
  }
}

async function markMarketingSync(
  config: AudienceConfig,
  contactId: string,
  provider: "resend" | "brevo",
  status: "synced" | "failed",
  providerContactId?: string | null,
  error?: unknown,
) {
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : null;
  const response = await supabaseRequest(
    config,
    `audience_contacts?id=eq.${encodeURIComponent(contactId)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        marketing_provider: provider,
        marketing_sync_status: status,
        marketing_synced_at: status === "synced" ? new Date().toISOString() : null,
        marketing_provider_contact_id: providerContactId || null,
        marketing_last_error:
          status === "failed" ? errorMessage?.slice(0, 1000) || "sync_failed" : null,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("The audience marketing sync status could not be saved.");
  }
}

async function syncViaResendApi(
  config: AudienceConfig,
  email: string,
  name?: string | null,
): Promise<string | null> {
  if (!config.resendApiKey) return null;

  const { firstName, lastName } = splitName(name);
  const createBody: Record<string, unknown> = {
    email,
    unsubscribed: false,
  };
  if (firstName) createBody.first_name = firstName;
  if (lastName) createBody.last_name = lastName;
  if (config.resendSegmentId) {
    createBody.segments = [{ id: config.resendSegmentId }];
  }

  let response = await fetch("https://api.resend.com/contacts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(createBody),
    cache: "no-store",
  });

  if (response.status === 409) {
    const updateBody: Record<string, unknown> = { unsubscribed: false };
    if (firstName) updateBody.first_name = firstName;
    if (lastName) updateBody.last_name = lastName;

    response = await fetch(
      `https://api.resend.com/contacts/${encodeURIComponent(email)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${config.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateBody),
        cache: "no-store",
      },
    );
  }

  const raw = await response.text();
  const payload = raw ? (JSON.parse(raw) as { id?: string }) : null;

  if (!response.ok) {
    throw new Error(`Resend contact sync returned ${response.status}.`);
  }

  return payload?.id || null;
}

async function syncViaBrevoApi(
  config: AudienceConfig,
  email: string,
): Promise<string | null> {
  if (!config.brevoApiKey) return null;

  const body: Record<string, unknown> = {
    email,
    updateEnabled: true,
    getId: true,
  };
  if (config.brevoListId) {
    body.listIds = [config.brevoListId];
  }

  const response = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": config.brevoApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const raw = await response.text();
  const payload = raw ? (JSON.parse(raw) as { id?: number }) : null;

  if (!response.ok) {
    throw new Error(`Brevo contact sync returned ${response.status}.`);
  }

  return payload?.id ? String(payload.id) : null;
}

async function syncViaBrevoHostedForm(config: AudienceConfig, email: string) {
  const form = new URLSearchParams({
    EMAIL: email,
    email_address_check: "",
    locale: "en",
    html_type: "simple",
  });

  const response = await fetch(config.brevoFormAction, {
    method: "POST",
    headers: {
      accept: "text/html,application/xhtml+xml",
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: form.toString(),
    redirect: "follow",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Brevo hosted-form sync returned ${response.status}.`);
  }
}

async function syncMarketingContact(
  config: AudienceConfig,
  contactId: string,
  email: string,
  name?: string | null,
) {
  const provider: "resend" | "brevo" = config.resendApiKey
    ? "resend"
    : "brevo";

  try {
    let providerContactId: string | null = null;

    if (config.resendApiKey) {
      providerContactId = await syncViaResendApi(config, email, name);
    } else if (config.brevoApiKey) {
      providerContactId = await syncViaBrevoApi(config, email);
    } else {
      await syncViaBrevoHostedForm(config, email);
    }

    await markMarketingSync(
      config,
      contactId,
      provider,
      "synced",
      providerContactId,
    );
    return true;
  } catch (error) {
    try {
      await markMarketingSync(
        config,
        contactId,
        provider,
        "failed",
        null,
        error,
      );
    } catch {
      // The durable Filmshow contact is still saved even if sync status recording fails.
    }
    return false;
  }
}

export async function recordAudienceTouch(input: AudienceTouchInput) {
  const config = getAudienceConfig();
  const email = normalizeEmail(input.email);
  const contactId = await upsertContact(config, { ...input, email });

  await Promise.all([
    saveTags(config, contactId, input.tags || []),
    saveAudienceEvent(config, contactId, { ...input, email }),
  ]);

  const marketingSynced =
    input.marketingOptIn === true
      ? await syncMarketingContact(config, contactId, email, input.name)
      : null;

  return { contactId, marketingSynced };
}
