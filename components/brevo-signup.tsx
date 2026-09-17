"use client";

import { FormEvent, useState } from "react";

type SubmitState = "idle" | "sending" | "success" | "error";

type BrevoSignupProps = {
  placement: "submit" | "footer";
  sourceContext?: string;
};

export function BrevoSignup({ placement, sourceContext }: BrevoSignupProps) {
  const inputId = `brevo-email-${placement}`;
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const urlSource =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("source")
        : null;

    setState("sending");
    setMessage("");

    try {
      const response = await fetch("/api/audience/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("EMAIL"),
          company: data.get("company"),
          placement,
          source_context: sourceContext || urlSource,
        }),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "That signup did not go through.");
      }

      form.reset();
      setState("success");
      setMessage("You're in. We'll only send the important stuff.");
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "That signup did not go through. Try again.",
      );
    }
  }

  return (
    <section className={`brevo-signup brevo-signup--${placement}`}>
      <div className="brevo-signup-copy">
        <h2>Stay in the room</h2>
        <p>
          just the important stuff. Behind the scenes, when seats open up, and film submission windows
        </p>
      </div>
      <form
        id={`filmshow-list-${placement}`}
        className="brevo-signup-form"
        onSubmit={handleSubmit}
      >
        <label className="sr-only" htmlFor={inputId}>
          Email address
        </label>
        <input
          id={inputId}
          className="brevo-signup-input"
          type="email"
          name="EMAIL"
          autoComplete="email"
          placeholder="Email address"
          required
          disabled={state === "sending"}
        />
        <button
          className="brevo-signup-submit"
          type="submit"
          disabled={state === "sending"}
        >
          {state === "sending" ? "Joining…" : "Join the List"}
        </button>
        <input
          className="brevo-signup-honeypot"
          type="text"
          name="company"
          defaultValue=""
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
      </form>
      {message ? (
        <p
          className={`brevo-signup-status brevo-signup-status--${state}`}
          role={state === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
