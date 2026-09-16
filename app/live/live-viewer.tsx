"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type {
  LiveEvent,
  LiveEventState,
  LiveProgramItem,
  LiveVote,
} from "@/lib/live/types";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { LiveCountdown } from "./live-countdown";

type LiveViewerProps = {
  event: LiveEvent;
  initialState: LiveEventState;
  program: LiveProgramItem[];
  initialVote: LiveVote | null;
  stream: { provider: "none" | "hls" | "mux"; configured: boolean };
};

function statusLabel(state: LiveEventState) {
  if (state.status === "voting" && !state.voting_is_open) return "Voting closed";
  return state.status.charAt(0).toUpperCase() + state.status.slice(1);
}

export function LiveViewer({
  event,
  initialState,
  program,
  initialVote,
  stream,
}: LiveViewerProps) {
  const [state, setState] = useState(initialState);
  const [vote, setVote] = useState(initialVote);
  const [message, setMessage] = useState("");
  const [streamSrc, setStreamSrc] = useState<string | null>(null);
  const [streamMessage, setStreamMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`filmshow-live:${event.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "live_event_state",
          filter: `event_id=eq.${event.id}`,
        },
        (payload: { new: Record<string, unknown> }) =>
          setState(payload.new as LiveEventState),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [event.id]);

  useEffect(() => {
    if (!stream.configured) return;
    const controller = new AbortController();

    void fetch("/api/live/stream", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as
          | { src?: string; message?: string }
          | null;
        if (!response.ok || !payload?.src) {
          throw new Error(payload?.message || "The stream could not be opened.");
        }
        setStreamSrc(payload.src);
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setStreamMessage(error.message);
      });

    return () => controller.abort();
  }, [stream.configured]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamSrc) return;
    let active = true;
    let destroyPlayer: (() => void) | undefined;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamSrc;
      return () => {
        video.removeAttribute("src");
        video.load();
      };
    }

    void import("hls.js").then(({ default: Hls }) => {
      if (!active) return;
      if (!Hls.isSupported()) {
        setStreamMessage("This browser cannot play the livestream.");
        return;
      }
      const player = new Hls({ enableWorker: true });
      player.loadSource(streamSrc);
      player.attachMedia(video);
      destroyPlayer = () => player.destroy();
    });

    return () => {
      active = false;
      destroyPlayer?.();
    };
  }, [streamSrc]);

  const currentItem = useMemo(
    () => program.find((item) => item.id === state.current_program_item_id),
    [program, state.current_program_item_id],
  );
  const winner = useMemo(
    () => program.find((item) => item.id === state.winner_program_item_id),
    [program, state.winner_program_item_id],
  );
  const eligibleFilms = program.filter((item) => item.vote_eligible);

  const castVote = (programItemId: string) => {
    if (vote || isPending) return;
    setMessage("");
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        setMessage("Your session expired. Refresh and sign in again.");
        return;
      }

      const { data, error } = await supabase
        .from("live_online_votes")
        .insert({
          event_id: event.id,
          program_item_id: programItemId,
          user_id: user.id,
          source: "online",
        })
        .select("*")
        .single();

      if (error) {
        setMessage(
          error.code === "23505"
            ? "Your marble is already in."
            : "That marble could not be cast. Voting may have closed.",
        );
        return;
      }

      setVote(data as LiveVote);
    });
  };

  return (
    <div className="live-room">
      <div className="live-player-shell">
        {stream.configured ? (
          <div className="live-player-frame">
            <video ref={videoRef} className="live-player" controls autoPlay playsInline />
            {!streamSrc && !streamMessage ? (
              <p className="live-player-message">OPENING THE BROADCAST…</p>
            ) : null}
            {streamMessage ? (
              <p className="live-player-message" role="alert">{streamMessage}</p>
            ) : null}
          </div>
        ) : (
          <div className="live-player-placeholder">
            <p>THE BROADCAST IS NOT LIVE YET</p>
            <LiveCountdown startsAt={event.starts_at} />
          </div>
        )}
      </div>

      <div className="live-status-grid">
        <div><span>Event</span><strong>{statusLabel(state)}</strong></div>
        <div><span>Now playing</span><strong>{currentItem?.title || "Stand by"}</strong></div>
        <div><span>Voting</span><strong>{state.voting_is_open ? "Open" : "Closed"}</strong></div>
      </div>

      {state.status === "voting" ? (
        <section className="live-vote-panel" aria-labelledby="vote-title">
          {vote ? (
            <div className="live-vote-confirmation">
              <p className="live-eyebrow">Audience vote</p>
              <h2 id="vote-title">YOUR MARBLE IS IN.</h2>
            </div>
          ) : state.voting_is_open ? (
            <>
              <p className="live-eyebrow">Audience vote</p>
              <h2 id="vote-title">CAST YOUR MARBLE</h2>
              <div className="live-vote-grid">
                {eligibleFilms.map((film) => (
                  <button
                    key={film.id}
                    type="button"
                    disabled={isPending}
                    onClick={() => castVote(film.id)}
                  >
                    <span className="live-marble" aria-hidden="true" />
                    {film.title}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="live-vote-confirmation">
              <p className="live-eyebrow">Audience vote</p>
              <h2 id="vote-title">VOTING IS CLOSED.</h2>
            </div>
          )}
          {message ? <p className="live-form-message is-error" role="alert">{message}</p> : null}
        </section>
      ) : null}

      {state.results_revealed && winner ? (
        <section className="live-result" aria-live="polite">
          <p className="live-eyebrow">The audience chose</p>
          <h2>{winner.title}</h2>
          <p>The $1,000 audience-prize winner.</p>
        </section>
      ) : null}
    </div>
  );
}
