"use client";

import { FormEvent, useRef, useState } from "react";

type SubmitState = "idle" | "sending" | "sent" | "error";

function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (value) => {
    const random = Math.floor(Math.random() * 16);
    const next = value === "x" ? random : (random & 0x3) | 0x8;
    return next.toString(16);
  });
}

export function TicketGiveawayForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const idempotencyKey = useRef(createIdempotencyKey());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setState("sending");
    setMessage("");

    try {
      const response = await fetch("/api/ticket-giveaway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotency_key: idempotencyKey.current,
          name: data.get("name"),
          email: data.get("email"),
          company: data.get("company"),
        }),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "That entry did not go through.");
      }

      form.reset();
      setState("sent");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "That entry did not go through. Try again.",
      );
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="ticket-giveaway-success" role="status">
        <p className="ticket-giveaway-success-label">You&apos;re entered.</p>
        <p>Keep an eye on your inbox. Good luck.</p>
      </div>
    );
  }

  return (
    <form className="ticket-giveaway-form" onSubmit={handleSubmit}>
      <div className="ticket-giveaway-fields">
        <label>
          <span>Your name</span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Name"
            maxLength={120}
            required
          />
        </label>
        <label>
          <span>Your email</span>
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Email"
            maxLength={254}
            required
          />
        </label>
      </div>
      <label className="ticket-giveaway-honeypot" aria-hidden="true">
        Company
        <input name="company" type="text" tabIndex={-1} autoComplete="off" />
      </label>
      <button type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Entering…" : "Enter to win"}
      </button>
      {state === "error" ? (
        <p className="ticket-giveaway-error" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
