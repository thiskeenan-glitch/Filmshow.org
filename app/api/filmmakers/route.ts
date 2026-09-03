import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import {
  markFilmmakerSheetSync,
  type FilmmakerAttendance,
  saveFilmmakerMaterials,
  type SubtitleStatus,
} from "@/lib/supabase-filmmakers";
import { syncFilmmakerToGoogleSheet } from "@/lib/google-sheets-filmmakers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const subtitleStatuses = new Set<SubtitleStatus>([
  "no_subtitles",
  "burned_in_master",
]);

const attendanceOptions = new Set<FilmmakerAttendance>([
  "hell_yes",
  "no",
  "trying_to_figure_it_out",
]);

const limits = {
  film_title: 180,
  director_names: 240,
  email: 254,
  runtime: 80,
  synopsis: 1200,
  url: 1000,
  social_handles: 1200,
  additional_attendees: 2000,
  show_day_contact: 300,
  notes: 5000,
} as const;

function text(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" ? value.trim() : "";
}

function validUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function validationError(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(getRateLimitKey(request, "filmmaker-materials"), {
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Easy there. Give it a minute, then send it again." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      },
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return validationError("That did not come through cleanly. Try again.");
  }

  if (text(payload, "company")) {
    return validationError("That did not come through cleanly. Try again.");
  }

  const idempotency_key = text(payload, "idempotency_key");
  const film_title = text(payload, "film_title");
  const director_names = text(payload, "director_names");
  const email = text(payload, "email").toLowerCase();
  const runtime = text(payload, "runtime");
  const synopsis = text(payload, "synopsis");
  const master_link = text(payload, "master_link");
  const subtitle_status = text(payload, "subtitle_status") as SubtitleStatus;
  const materials_link = text(payload, "materials_link");
  const social_handles = text(payload, "social_handles");
  const attendance = text(payload, "attendance") as FilmmakerAttendance;
  const additional_attendees = text(payload, "additional_attendees");
  const filmmaker_video_url = text(payload, "filmmaker_video_url");
  const show_day_contact = text(payload, "show_day_contact");
  const notes = text(payload, "notes");

  if (!validUuid(idempotency_key)) {
    return validationError("Refresh the page and try that one more time.");
  }
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > limits.email) {
    return validationError("Give us a real email address.");
  }
  if (!film_title || film_title.length > limits.film_title) {
    return validationError("Tell us what we are showing.");
  }
  if (!director_names || director_names.length > limits.director_names) {
    return validationError("Tell us who made this thing.");
  }
  if (!runtime || runtime.length > limits.runtime) {
    return validationError("Tell us how long it is.");
  }
  if (!synopsis || synopsis.length > limits.synopsis) {
    return validationError("Give us the one-sentence version.");
  }
  if (!validUrl(master_link) || master_link.length > limits.url) {
    return validationError("The movie needs a full downloadable URL.");
  }
  if (!subtitleStatuses.has(subtitle_status)) {
    return validationError("Tell us what is happening with subtitles.");
  }
  if (!validUrl(materials_link) || materials_link.length > limits.url) {
    return validationError("The marketing materials need a full folder URL.");
  }
  if (!social_handles || social_handles.length > limits.social_handles) {
    return validationError("Tell us who to tag.");
  }
  if (!attendanceOptions.has(attendance)) {
    return validationError("Tell us if you are coming October 3.");
  }
  if (additional_attendees.length > limits.additional_attendees) {
    return validationError("Keep the guest list a little shorter for now.");
  }
  if (
    filmmaker_video_url &&
    (!validUrl(filmmaker_video_url) || filmmaker_video_url.length > limits.url)
  ) {
    return validationError("The optional video needs a full URL.");
  }
  if (!show_day_contact || show_day_contact.length > limits.show_day_contact) {
    return validationError("Give us a show-day name and cell number.");
  }
  if (notes.length > limits.notes) {
    return validationError("The final note is a little too long.");
  }

  try {
    const record = await saveFilmmakerMaterials({
      idempotency_key,
      film_title,
      director_names,
      email,
      runtime,
      synopsis,
      master_link,
      subtitle_status,
      subtitle_link: null,
      materials_link,
      social_handles,
      attendance,
      additional_attendees: additional_attendees || null,
      filmmaker_video_url: filmmaker_video_url || null,
      show_day_contact,
      notes: notes || null,
    });

    let sheetSync: "synced" | "pending" = "synced";
    try {
      await syncFilmmakerToGoogleSheet(record);
      await markFilmmakerSheetSync(record, "synced");
    } catch (sheetError) {
      sheetSync = "pending";
      try {
        await markFilmmakerSheetSync(record, "failed", sheetError);
      } catch {
        // The submission is already durable in Supabase. A retry can still find it.
      }
    }

    return NextResponse.json(
      { id: record.id, sheet_sync: sheetSync },
      { status: 201 },
    );
  } catch (error) {
    const isMissingConfig =
      error instanceof Error && error.message.includes("not configured");

    return NextResponse.json(
      {
        message: isMissingConfig
          ? "The receiving booth is not connected yet. Your answers are still here."
          : "Something went sideways. Your answers are still here—try SEND IT again.",
      },
      { status: isMissingConfig ? 503 : 500 },
    );
  }
}
