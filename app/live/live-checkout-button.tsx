"use client";

import { useState } from "react";

export function LiveCheckoutButton() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const beginCheckout = async () => {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/live/checkout", { method: "POST" });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.url) {
        setMessage(payload?.message || "Checkout is not available right now.");
        return;
      }
      window.location.assign(payload.url);
    } catch {
      setMessage("Checkout is not available right now.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="live-checkout-action">
      <button
        type="button"
        className="live-primary-button"
        onClick={beginCheckout}
        disabled={pending}
      >
        {pending ? "Opening Checkout…" : "WATCH LIVE — $8"}
      </button>
      {message ? <p className="live-form-message is-error" role="alert">{message}</p> : null}
    </div>
  );
}
