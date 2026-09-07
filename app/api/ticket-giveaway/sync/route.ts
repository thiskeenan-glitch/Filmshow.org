import { syncTicketGiveawayToGoogleSheet } from "@/lib/google-sheets-ticket-giveaway";
import {
  listTicketGiveawaySheetSyncQueue,
  markTicketGiveawaySheetSync,
} from "@/lib/supabase-ticket-giveaway";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret =
    process.env.TICKET_GIVEAWAY_SYNC_SECRET?.trim() ||
    process.env.FILMMAKER_SYNC_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim();

  if (!secret) {
    return NextResponse.json({ message: "Sync is not configured." }, { status: 503 });
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const queue = await listTicketGiveawaySheetSyncQueue(50);
  let synced = 0;
  let failed = 0;

  for (const record of queue) {
    try {
      await syncTicketGiveawayToGoogleSheet(record);
      await markTicketGiveawaySheetSync(record, "synced");
      synced += 1;
    } catch (error) {
      failed += 1;
      try {
        await markTicketGiveawaySheetSync(record, "failed", error);
      } catch {
        // Leave the entry queued for a later retry.
      }
    }
  }

  return NextResponse.json({ checked: queue.length, synced, failed });
}
