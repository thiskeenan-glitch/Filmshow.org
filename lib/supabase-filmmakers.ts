import "server-only";

export type SubtitleStatus =
  | "no_subtitles"
  | "burned_in_master"
  | "separate_subtitle_file";

export type FilmmakerAttendance =
  | "hell_yes"
  | "no"
  | "trying_to_figure_it_out";

export type FilmmakerMaterialsInput = {
  idempotency_key: string;
  film_title: string;
  director_names: string;
  email: string;
  runtime: string;
  synopsis: string;
  master_link: string;
  subtitle_status: SubtitleStatus;
  subtitle_link: string | null;
  materials_link: string;
  social_handles: string;
  attendance: FilmmakerAttendance;
  additional_attendees: string | null;
  filmmaker_video_url: string | null;
  show_day_contact: string;
  notes: string | null;
};

export type FilmmakerSheetSyncStatus = "pending" | "synced" | "failed";

export type FilmmakerMaterialsRecord = FilmmakerMaterialsInput & {
  id: string;
  created_at: string;
  google_sheets_sync_status?: FilmmakerSheetSyncStatus;
  google_sheets_synced_at?: string | null;
  google_sheets_sync_attempts?: number;
  google_sheets_last_error?: string | null;
};

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Filmmaker materials storage is not configured yet.");
  }

  return { supabaseUrl: supabaseUrl.replace(/\/$/, ""), serviceRoleKey };
}

export async function saveFilmmakerMaterials(input: FilmmakerMaterialsInput) {
  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(
    `${supabaseUrl}/rest/v1/filmmaker_materials_submissions?on_conflict=idempotency_key`,
    {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
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
    const detail =
      typeof payload?.message === "string"
        ? payload.message
        : "Supabase request failed.";
    throw new Error(detail);
  }

  const record = (payload as FilmmakerMaterialsRecord[] | null)?.[0];
  if (!record) throw new Error("The filmmaker materials were not saved.");

  return record;
}

export async function markFilmmakerSheetSync(
  record: FilmmakerMaterialsRecord,
  status: FilmmakerSheetSyncStatus,
  error?: unknown,
) {
  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : null;

  const response = await fetch(
    `${supabaseUrl}/rest/v1/filmmaker_materials_submissions?id=eq.${encodeURIComponent(record.id)}`,
    {
      method: "PATCH",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
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
    throw new Error("The Google Sheets sync status could not be recorded.");
  }
}

export async function listFilmmakerSheetSyncQueue(limit = 25) {
  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 100);
  const query = new URLSearchParams({
    select: "*",
    google_sheets_sync_status: "in.(pending,failed)",
    order: "created_at.asc",
    limit: String(safeLimit),
  });
  const response = await fetch(
    `${supabaseUrl}/rest/v1/filmmaker_materials_submissions?${query.toString()}`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: "no-store",
    },
  );

  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) : null;
  if (!response.ok || !Array.isArray(payload)) {
    throw new Error("The filmmaker sync queue could not be loaded.");
  }

  return payload as FilmmakerMaterialsRecord[];
}
