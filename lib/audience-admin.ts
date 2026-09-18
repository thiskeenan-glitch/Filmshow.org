import "server-only";

type AudienceContactRow = {
  id: string;
  email: string;
  name: string | null;
  marketing_status: "not_subscribed" | "subscribed" | "unsubscribed";
  marketing_consent_source: string | null;
  marketing_sync_status: "not_applicable" | "pending" | "synced" | "failed";
  first_seen_at: string;
  last_seen_at: string;
};

type AudienceTagRow = {
  contact_id: string;
  tag: string;
};

export type AudienceAdminContact = AudienceContactRow & {
  tags: string[];
};

export type AudienceAdminSnapshot = {
  counts: {
    total: number;
    subscribed: number;
    notSubscribed: number;
    unsubscribed: number;
  };
  contacts: AudienceAdminContact[];
};

function getConfig() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const secretKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !secretKey) {
    throw new Error("Audience admin storage is not configured.");
  }

  return {
    supabaseUrl: supabaseUrl.replace(/\/$/, ""),
    secretKey,
  };
}

async function request(path: string, init?: RequestInit) {
  const { supabaseUrl, secretKey } = getConfig();
  return fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
}

async function countContacts(filter?: string) {
  const suffix = filter ? `&${filter}` : "";
  const response = await request(`audience_contacts?select=id&limit=1${suffix}`, {
    headers: {
      Prefer: "count=exact",
      Range: "0-0",
    },
  });

  if (!response.ok) {
    throw new Error("Audience count could not be loaded.");
  }

  const contentRange = response.headers.get("content-range") || "";
  const total = Number(contentRange.split("/")[1]);
  return Number.isFinite(total) ? total : 0;
}

async function getRecentContacts(limit = 250) {
  const response = await request(
    `audience_contacts?select=id,email,name,marketing_status,marketing_consent_source,marketing_sync_status,first_seen_at,last_seen_at&order=last_seen_at.desc&limit=${limit}`,
  );

  if (!response.ok) {
    throw new Error("Audience contacts could not be loaded.");
  }

  return (await response.json()) as AudienceContactRow[];
}

async function getTags(contactIds: string[]) {
  if (contactIds.length === 0) return [] as AudienceTagRow[];

  const ids = contactIds.map(encodeURIComponent).join(",");
  const response = await request(
    `audience_contact_tags?select=contact_id,tag&contact_id=in.(${ids})&order=tag.asc`,
  );

  if (!response.ok) {
    throw new Error("Audience tags could not be loaded.");
  }

  return (await response.json()) as AudienceTagRow[];
}

export async function getAudienceAdminSnapshot(): Promise<AudienceAdminSnapshot> {
  const [total, subscribed, notSubscribed, unsubscribed, contacts] =
    await Promise.all([
      countContacts(),
      countContacts("marketing_status=eq.subscribed"),
      countContacts("marketing_status=eq.not_subscribed"),
      countContacts("marketing_status=eq.unsubscribed"),
      getRecentContacts(),
    ]);

  const tags = await getTags(contacts.map((contact) => contact.id));
  const tagsByContact = new Map<string, string[]>();
  for (const row of tags) {
    const current = tagsByContact.get(row.contact_id) || [];
    current.push(row.tag);
    tagsByContact.set(row.contact_id, current);
  }

  return {
    counts: { total, subscribed, notSubscribed, unsubscribed },
    contacts: contacts.map((contact) => ({
      ...contact,
      tags: tagsByContact.get(contact.id) || [],
    })),
  };
}
