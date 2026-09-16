"use client";

import { useActionState } from "react";
import { sendLiveMagicLink } from "./actions";

export function LiveAuthForm() {
  const [state, action, pending] = useActionState(sendLiveMagicLink, {});

  return (
    <form action={action} className="live-auth-form">
      <label htmlFor="live-email">Email address</label>
      <div className="live-auth-row">
        <input
          id="live-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          required
        />
        <button type="submit" className="live-primary-button" disabled={pending}>
          {pending ? "Sending…" : "Email Me a Sign-In Link"}
        </button>
      </div>
      {state.message ? (
        <p
          className={`live-form-message ${state.status === "error" ? "is-error" : ""}`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
