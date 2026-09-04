import { syncFilmmakerToGoogleSheet } from "@/lib/google-sheets-filmmakers";
import type { FilmmakerMaterialsRecord } from "@/lib/supabase-filmmakers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const record: FilmmakerMaterialsRecord = {
    id: "00000000-0000-4000-8000-000000000001",
    created_at: new Date().toISOString(),
    idempotency_key: "00000000-0000-4000-8000-000000000001",
    film_title: "CHATGPT TEST - DELETE ME",
    director_names: "Filmshow Test",
    email: "test@filmshow.org",
    runtime: "1 minute",
    synopsis: "Temporary end-to-end test submission.",
    master_link: "https://example.com/master.mov",
    subtitle_status: "no_subtitles",
    subtitle_link: null,
    materials_link: "https://example.com/materials",
    social_handles: "@filmshow",
    attendance: "no",
    additional_attendees: null,
    filmmaker_video_url: null,
    show_day_contact: "Test 555-555-5555",
    notes: "Delete after verification",
  };

  try {
    await syncFilmmakerToGoogleSheet(record);
    return NextResponse.json({ ok: true, id: record.id });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
