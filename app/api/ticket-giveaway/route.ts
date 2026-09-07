import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { syncTicketGiveawayToGoogleSheet } from "@/lib/google-sheets-ticket-giveaway";
import {
  markTicketGiveawaySheetSync,
  saveTicketGiveawayEntry,
  type TicketGiveawayRecord,
} from "@/lib/supabase-ticket-giveaway";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function invalid(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(getRateLimitKey(request, "ticket-giveaway"), {
    limit: 6,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many entries from here. Try again in a few minutes." },
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
    return invalid("That entry did not come through cleanly. Try again.");
  }

  if (cleanText(payload.company)) {
    return invalid("That entry did not come through cleanly. Try again.");
  }

  const idempotencyKey = cleanText(payload.idempotency_key);
  const name = cleanText(payload.name);
  const email = cleanText(payload.email).toLowerCase();

  if (!validUuid(idempotencyKey)) {
    return invalid("Refresh the page and try again.");
  }
  if (!name || name.length > 120) {
    return invalid("Add your name to enter.");
  }
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    return invalid("Add a valid email to enter.");
  }

  const input = {
    idempotency_key: idempotencyKey,
    name,
    email,
    source: "poster_qr" as const,
  };

  let entry: TicketGiveawayRecord;
  try {
    entry = await saveTicketGiveawayEntry(input);
  } catch {
    const sheetOnlyEntry: TicketGiveawayRecord = {
      ...input,
      id: idempotencyKey,
      created_at: new Date().toISOString(),
    };

    try {
      await syncTicketGiveawayToGoogleSheet(sheetOnlyEntry);
      return NextResponse.json(
        { id: sheetOnlyEntry.id, sheet_sync: "synced", backup_saved: false },
        { status: 201 },
      );
    } catch {
      return NextResponse.json(
        { message: "The entry booth is unavailable right now. Please try again." },
        { status: 503 },
      );
    }
  }

  try {
    let sheetSync: "synced" | "pending" = "synced";
    try {
      await syncTicketGiveawayToGoogleSheet(entry);
      await markTicketGiveawaySheetSync(entry, "synced");
    } catch (sheetError) {
      sheetSync = "pending";
      try {
        await markTicketGiveawaySheetSync(entry, "failed", sheetError);
      } catch {
        // The entry is already durable in Supabase and remains retryable.
      }
    }

    return NextResponse.json(
      { id: entry.id, sheet_sync: sheetSync, backup_saved: true },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ id: entry.id, sheet_sync: "pending" }, { status: 201 });
  }
}
