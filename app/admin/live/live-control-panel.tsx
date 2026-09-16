"use client";

import type { LiveAdminSnapshot, LiveEventStatus } from "@/lib/live/types";
import { useState, useTransition } from "react";

export function LiveControlPanel({ snapshot }: { snapshot: LiveAdminSnapshot }) {
  const [message, setMessage] = useState("");
  const [compEmail, setCompEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const sendControl = (
    payload: Record<string, string>,
    confirmation?: string,
  ) => {
    if (confirmation && !window.confirm(confirmation)) return;
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/admin/live/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(result?.message || "Show control update failed.");
        return;
      }
      window.location.reload();
    });
  };

  const setState = (status: LiveEventStatus) => {
    const confirmation = status === "ended" ? "End the Filmshow Live event?" : undefined;
    sendControl({ action: "set_state", status }, confirmation);
  };

  const grantComp = () => {
    const email = compEmail.trim().toLowerCase();
    if (!email) return;
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/admin/live/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(result?.message || "Complimentary access could not be granted.");
        return;
      }
      setCompEmail("");
      setMessage(`Access granted to ${email}.`);
      window.setTimeout(() => window.location.reload(), 500);
    });
  };

  return (
    <div className="live-admin-dashboard">
      <div className="admin-summary-grid live-admin-summary">
        <div><span>State</span><strong>{snapshot.state.status}</strong></div>
        <div><span>Purchased</span><strong>{snapshot.purchasedCount}</strong></div>
        <div><span>Complimentary</span><strong>{snapshot.complimentaryCount}</strong></div>
        <div><span>Votes</span><strong>{snapshot.voteCount}</strong></div>
      </div>

      {message ? <p className="admin-status-message" role="status">{message}</p> : null}

      <section className="admin-card live-control-card">
        <div className="live-control-heading">
          <div>
            <p className="admin-eyebrow">Event state</p>
            <h2>{snapshot.state.status.toUpperCase()}</h2>
          </div>
          <span className={`live-state-light is-${snapshot.state.status}`} aria-hidden="true" />
        </div>
        <div className="live-control-actions">
          <button className="admin-button admin-button--secondary" disabled={isPending} onClick={() => setState("preshow")}>Preshow</button>
          <button className="admin-button" disabled={isPending} onClick={() => setState("live")}>Go Live</button>
          <button className="admin-button" disabled={isPending || snapshot.state.voting_is_open} onClick={() => sendControl({ action: "open_voting" })}>Open Voting</button>
          <button className="admin-button admin-button--secondary" disabled={isPending || !snapshot.state.voting_is_open} onClick={() => sendControl({ action: "close_voting" }, "Close online voting now?")}>Close Voting</button>
          <button className="admin-button admin-button--secondary" disabled={isPending} onClick={() => setState("ended")}>End Event</button>
        </div>
      </section>

      <section className="admin-card live-control-card">
        <p className="admin-eyebrow">Now playing</p>
        <select
          value={snapshot.state.current_program_item_id || ""}
          disabled={isPending}
          onChange={(event) => sendControl({ action: "set_now_playing", programItemId: event.target.value })}
          aria-label="Now playing"
        >
          <option value="">Stand by</option>
          {snapshot.program.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
      </section>

      <section className="admin-card live-control-card">
        <p className="admin-eyebrow">Private vote count</p>
        <div className="live-vote-totals">
          {snapshot.voteTotals.map((item) => (
            <div key={item.id}>
              <span>{item.title}</span>
              <strong>{item.votes}</strong>
              <button
                type="button"
                disabled={isPending}
                onClick={() => sendControl({ action: "set_winner", programItemId: item.id })}
              >
                {snapshot.state.winner_program_item_id === item.id ? "Selected" : "Select winner"}
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-button"
          disabled={isPending || snapshot.state.voting_is_open || !snapshot.state.winner_program_item_id || snapshot.state.results_revealed}
          onClick={() => sendControl({ action: "reveal_results" }, "Reveal the selected winner to every viewer?")}
        >
          {snapshot.state.results_revealed ? "Results Revealed" : "Reveal Results"}
        </button>
      </section>

      <section className="admin-card live-control-card">
        <p className="admin-eyebrow">Complimentary access</p>
        <div className="live-comp-row">
          <input
            type="email"
            value={compEmail}
            onChange={(event) => setCompEmail(event.target.value)}
            placeholder="viewer@email.com"
            aria-label="Viewer email"
          />
          <button type="button" className="admin-button" disabled={isPending || !compEmail.trim()} onClick={grantComp}>Grant Access</button>
        </div>
      </section>
    </div>
  );
}
