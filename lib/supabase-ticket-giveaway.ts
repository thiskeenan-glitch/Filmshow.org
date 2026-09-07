import "server-only";

export type TicketGiveawayInput = {
  idempotency_key: string;
  name: string;
  email: string;
  heard_about_us: string;
  source: "poster_qr";
};

export type TicketGiveawaySyncStatus = "pending" | "synced" | "failed";

export type TicketGiveawayRecord = TicketGiveawayInput & {
  id: string;
  created_at: string;
  google_sheets_sync_status?: TicketGiveawaySyncStatus;
  google_sheets_synced_at?: string | null;
  google_sheets_sync_attempts?: number;
  google_sheets_last_error?: string | null;
};

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const secretKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !secretKey) {
    throw new Error("Ticket giveaway storage is not configured.");
  }

  return { supabaseUrl: supabaseUrl.replace(/\/$/, ""), secretKey };
}

export async function saveTicketGiveawayEntry(input: TicketGiveawayInput) {
  const { supabaseUrl, secretKey } = getSupabaseConfig();
  const response = await fetch(
    `${supabaseUrl}/rest/v1/ticket_giveaway_entries?on_conflict=idempotency_key`,
    {
      method: "POST",
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(input),
      cache: "no-store",
    },
  );

  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) : null;

  if (!response.ok) {
    throw new Error("The giveaway entry could not be saved.");
  }

  const entry = (payload as TicketGiveawayRecord[] | null)?.[0];
  if (!entry) throw new Error("The giveaway entry could not be saved.");

  return entry;
}

export async function markTicketGiveawaySheetSync(
  record: TicketGiveawayRecord,
  status: TicketGiveawaySyncStatus,
  error?: unknown,
) {
  const { supabaseUrl, secretKey } = getSupabaseConfig();
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : null;

  const response = await fetch(
    `${supabaseUrl}/rest/v1/ticket_giveaway_entries?id=eq.${encodeURIComponent(record.id)}`,
    {
      method: "PATCH",
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        google_sheets_sync_status: status,
        google_sheets_synced_at:
          status === "synced" ? new Date().toISOString() : null,
        google_sheets_sync_attempts:
          (record.google_sheets_sync_attempts ?? 0) + 1,
        google_sheets_last_error:
          status === "synced" ? null : errorMessage?.slice(0, 1000) ?? null,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("The ticket giveaway Sheet sync status could not be recorded.");
  }
}

export async function listTicketGiveawaySheetSyncQueue(limit = 25) {
  const { supabaseUrl, secretKey } = getSupabaseConfig();
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 100);
  const query = new URLSearchParams({
    select: "*",
    google_sheets_sync_status: "in.(pending,failed)",
    order: "created_at.asc",
    limit: String(safeLimit),
  });
  const response = await fetch(
    `${supabaseUrl}/rest/v1/ticket_giveaway_entries?${query.toString()}`,
    {
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
      },
      cache: "no-store",
    },
  );

  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) : null;
  if (!response.ok || !Array.isArray(payload)) {
    throw new Error("The ticket giveaway Sheet sync queue could not be loaded.");
  }

  return payload as TicketGiveawayRecord[];
}
