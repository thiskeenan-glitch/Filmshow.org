"use client";

import { useActionState } from "react";
import { grantLoginAction } from "./actions";

export function GrantLoginForm({ next = "/admin/grant" }: { next?: string }) {
  const [state, action, pending] = useActionState(grantLoginAction, {});

  return (
    <form action={action} className="admin-card admin-login-form">
      <input type="hidden" name="next" value={next} />
      <label>
        <span>Email</span>
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        <span>Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      {state.message ? (
        <p className="admin-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <button type="submit" className="admin-button" disabled={pending}>
        {pending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
