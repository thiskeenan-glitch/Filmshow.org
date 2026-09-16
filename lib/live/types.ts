export type LiveEventStatus =
  | "preshow"
  | "live"
  | "voting"
  | "results"
  | "ended";

export type LiveEvent = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  venue: string | null;
  city: string | null;
  starts_at: string;
  ends_at: string | null;
  entitlement_key: string;
  price_cents: number;
  currency: string;
  is_enabled: boolean;
  ticket_sales_enabled: boolean;
  stream_provider: "none" | "hls" | "mux";
  stream_config: Record<string, unknown>;
};

export type LiveProgramItem = {
  id: string;
  event_id: string;
  title: string;
  item_type: "stage" | "film" | "intermission" | "voting" | "other";
  sort_order: number;
  vote_eligible: boolean;
  metadata: Record<string, unknown>;
};

export type LiveEventState = {
  event_id: string;
  status: LiveEventStatus;
  current_program_item_id: string | null;
  voting_is_open: boolean;
  voting_opened_at: string | null;
  voting_closed_at: string | null;
  results_revealed: boolean;
  winner_program_item_id: string | null;
  updated_at: string;
};

export type LiveEntitlement = {
  id: string;
  event_id: string;
  user_id: string | null;
  email_normalized: string;
  source: "stripe" | "comp" | "other";
  status: "active" | "revoked" | "refunded";
};

export type LiveVote = {
  id: string;
  event_id: string;
  program_item_id: string;
  user_id: string;
  source: "online";
  cast_at: string;
};

export type LiveViewerSnapshot = {
  event: LiveEvent;
  state: LiveEventState;
  program: LiveProgramItem[];
  entitlement: LiveEntitlement | null;
  vote: LiveVote | null;
};

export type LiveAdminSnapshot = LiveViewerSnapshot & {
  purchasedCount: number;
  complimentaryCount: number;
  voteCount: number;
  voteTotals: Array<LiveProgramItem & { votes: number }>;
};
