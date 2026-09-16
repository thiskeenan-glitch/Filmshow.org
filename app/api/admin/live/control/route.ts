import { getGrantAdminUser } from "@/lib/admin-auth";
import { LIVE_EVENT_SLUG } from "@/lib/live/config";
import type { LiveEventStatus } from "@/lib/live/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const directStates = new Set<LiveEventStatus>(["preshow", "live", "ended"]);

export async function POST(request: Request) {
  const admin = await getGrantAdminUser();
  if (!admin) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | { action?: string; status?: LiveEventStatus; programItemId?: string }
    | null;
  if (!body?.action) return NextResponse.json({ message: "Missing action." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: event, error: eventError } = await supabase
    .from("live_events")
    .select("id")
    .eq("slug", LIVE_EVENT_SLUG)
    .single();
  if (eventError || !event) return NextResponse.json({ message: "Live event not found." }, { status: 404 });

  const { data: currentState, error: stateError } = await supabase
    .from("live_event_state")
    .select("*")
    .eq("event_id", event.id)
    .single();
  if (stateError || !currentState) return NextResponse.json({ message: "Live state not found." }, { status: 404 });

  const updates: Record<string, unknown> = { updated_by: admin.id };

  if (body.action === "set_state") {
    if (!body.status || !directStates.has(body.status)) {
      return NextResponse.json({ message: "Invalid event state." }, { status: 400 });
    }
    updates.status = body.status;
    updates.voting_is_open = false;
    if (body.status === "preshow") {
      updates.results_revealed = false;
      updates.winner_program_item_id = null;
      updates.voting_opened_at = null;
      updates.voting_closed_at = null;
    }
  } else if (body.action === "set_now_playing") {
    if (body.programItemId) {
      const { data: item } = await supabase
        .from("live_program_items")
        .select("id")
        .eq("id", body.programItemId)
        .eq("event_id", event.id)
        .maybeSingle();
      if (!item) return NextResponse.json({ message: "Program item not found." }, { status: 400 });
    }
    updates.current_program_item_id = body.programItemId || null;
  } else if (body.action === "open_voting") {
    const { data: votingItem } = await supabase
      .from("live_program_items")
      .select("id")
      .eq("event_id", event.id)
      .eq("item_type", "voting")
      .maybeSingle();
    updates.status = "voting";
    updates.voting_is_open = true;
    updates.voting_opened_at = new Date().toISOString();
    updates.voting_closed_at = null;
    updates.results_revealed = false;
    updates.winner_program_item_id = null;
    if (votingItem) updates.current_program_item_id = votingItem.id;
  } else if (body.action === "close_voting") {
    if (!currentState.voting_is_open) {
      return NextResponse.json({ message: "Voting is already closed." }, { status: 409 });
    }
    updates.voting_is_open = false;
    updates.voting_closed_at = new Date().toISOString();
  } else if (body.action === "set_winner") {
    if (!body.programItemId) return NextResponse.json({ message: "Choose a winner." }, { status: 400 });
    const { data: item } = await supabase
      .from("live_program_items")
      .select("id")
      .eq("id", body.programItemId)
      .eq("event_id", event.id)
      .eq("vote_eligible", true)
      .maybeSingle();
    if (!item) return NextResponse.json({ message: "Winner must be an eligible film." }, { status: 400 });
    updates.winner_program_item_id = item.id;
    updates.results_revealed = false;
  } else if (body.action === "reveal_results") {
    if (currentState.voting_is_open) {
      return NextResponse.json({ message: "Close voting before revealing results." }, { status: 409 });
    }
    if (!currentState.winner_program_item_id) {
      return NextResponse.json({ message: "Select a winner first." }, { status: 409 });
    }
    updates.status = "results";
    updates.results_revealed = true;
  } else {
    return NextResponse.json({ message: "Unknown action." }, { status: 400 });
  }

  const { error } = await supabase
    .from("live_event_state")
    .update(updates)
    .eq("event_id", event.id);
  if (error) return NextResponse.json({ message: "Show control update failed." }, { status: 500 });

  return NextResponse.json({ updated: true });
}
