import { syncFilmmakerToGoogleSheet } from "@/lib/google-sheets-filmmakers";
import {
  listFilmmakerSheetSyncQueue,
  markFilmmakerSheetSync,
} from "@/lib/supabase-filmmakers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret =
    process.env.FILMMAKER_SYNC_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ message: "Sync is not configured." }, { status: 503 });
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const queue = await listFilmmakerSheetSyncQueue(25);
  let synced = 0;
  let failed = 0;

  for (const record of queue) {
    try {
      await syncFilmmakerToGoogleSheet(record);
      await markFilmmakerSheetSync(record, "synced");
      synced += 1;
    } catch (error) {
      failed += 1;
      try {
        await markFilmmakerSheetSync(record, "failed", error);
      } catch {
        // Leave the existing queue state available for the next retry.
      }
    }
  }

  return NextResponse.json({ checked: queue.length, synced, failed });
}
