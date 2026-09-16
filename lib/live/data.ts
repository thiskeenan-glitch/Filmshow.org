import "server-only";

import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { LIVE_EVENT_SLUG } from "./config";
import type {
  LiveAdminSnapshot,
  LiveEntitlement,
  LiveEvent,
  LiveEventState,
  LiveProgramItem,
  LiveViewerSnapshot,
  LiveVote,
} from "./types";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function throwIfError(error: { message: string } | null, context: string) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

export async function connectLiveAudienceUser(user: User) {
  const email = user.email ? normalizeEmail(user.email) : "";
  if (!email) return;

  const supabase = createSupabaseAdminClient();
  const { data: contactId, error: contactError } = await supabase.rpc(
    "upsert_audience_contact",
    {
      p_email: email,
      p_name: null,
      p_marketing_opt_in: false,
      p_consent_source: null,
    },
  );
  throwIfError(contactError, "Audience contact could not be connected");

  if (contactId) {
    const { error: linkError } = await supabase
      .from("audience_contacts")
      .update({
        auth_user_id: user.id,
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", contactId);
    throwIfError(linkError, "Audience account could not be linked");

    const { error: eventError } = await supabase.from("audience_events").upsert(
      {
        contact_id: contactId,
        event_type: "filmshow_live_account_authenticated",
        source: "filmshow_live",
        source_record_id: user.id,
        campaign: LIVE_EVENT_SLUG,
        dedupe_key: `filmshow-live-auth:${user.id}`,
        metadata: { marketing_consent: false },
      },
      { onConflict: "dedupe_key", ignoreDuplicates: true },
    );
    throwIfError(eventError, "Audience activity could not be recorded");
  }

  const { error: entitlementError } = await supabase
    .from("live_entitlements")
    .update({ user_id: user.id })
    .eq("email_normalized", email)
    .is("user_id", null);
  throwIfError(entitlementError, "Livestream access could not be linked");
}

export async function getLiveViewerSnapshot(
  user?: Pick<User, "id" | "email"> | null,
): Promise<LiveViewerSnapshot | null> {
  const supabase = createSupabaseAdminClient();
  const { data: event, error: eventError } = await supabase
    .from("live_events")
    .select("*")
    .eq("slug", LIVE_EVENT_SLUG)
    .maybeSingle();
  throwIfError(eventError, "Live event could not be loaded");
  if (!event) return null;

  const [{ data: state, error: stateError }, { data: program, error: programError }] =
    await Promise.all([
      supabase
        .from("live_event_state")
        .select("*")
        .eq("event_id", event.id)
        .single(),
      supabase
        .from("live_program_items")
        .select("*")
        .eq("event_id", event.id)
        .order("sort_order"),
    ]);

  throwIfError(stateError, "Live event state could not be loaded");
  throwIfError(programError, "Live program could not be loaded");

  let entitlement: LiveEntitlement | null = null;
  let vote: LiveVote | null = null;

  if (user?.id) {
    const [entitlementResult, voteResult] = await Promise.all([
      supabase
        .from("live_entitlements")
        .select("*")
        .eq("event_id", event.id)
        .eq("status", "active")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("live_online_votes")
        .select("*")
        .eq("event_id", event.id)
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);
    throwIfError(entitlementResult.error, "Livestream access could not be loaded");
    throwIfError(voteResult.error, "Vote status could not be loaded");
    entitlement = entitlementResult.data as LiveEntitlement | null;
    vote = voteResult.data as LiveVote | null;
  }

  return {
    event: event as LiveEvent,
    state: state as LiveEventState,
    program: (program || []) as LiveProgramItem[],
    entitlement,
    vote,
  };
}

export async function getLiveAdminSnapshot(): Promise<LiveAdminSnapshot | null> {
  const snapshot = await getLiveViewerSnapshot(null);
  if (!snapshot) return null;

  const supabase = createSupabaseAdminClient();
  const [{ data: entitlements, error: entitlementError }, { data: votes, error: voteError }] =
    await Promise.all([
      supabase
        .from("live_entitlements")
        .select("source,status")
        .eq("event_id", snapshot.event.id),
      supabase
        .from("live_online_votes")
        .select("program_item_id")
        .eq("event_id", snapshot.event.id),
    ]);

  throwIfError(entitlementError, "Livestream totals could not be loaded");
  throwIfError(voteError, "Vote totals could not be loaded");

  const activeEntitlements = (entitlements || []).filter(
    (entitlement) => entitlement.status === "active",
  );
  const counts = new Map<string, number>();
  (votes || []).forEach((vote) => {
    counts.set(vote.program_item_id, (counts.get(vote.program_item_id) || 0) + 1);
  });

  return {
    ...snapshot,
    purchasedCount: activeEntitlements.filter(
      (entitlement) => entitlement.source === "stripe",
    ).length,
    complimentaryCount: activeEntitlements.filter(
      (entitlement) => entitlement.source === "comp",
    ).length,
    voteCount: votes?.length || 0,
    voteTotals: snapshot.program
      .filter((item) => item.vote_eligible)
      .map((item) => ({ ...item, votes: counts.get(item.id) || 0 })),
  };
}
