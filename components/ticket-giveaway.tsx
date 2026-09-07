"use client";

import { FormEvent, useState } from "react";

export function TicketGiveaway() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/giveaway", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), company: form.get("company"), source: "ticket-page" }) });
    const data = (await response.json()) as { message?: string; duplicate?: boolean };
    if (!response.ok) { setStatus("error"); setMessage(data.message || "Try again."); return; }
    setStatus("done");
    setMessage(data.duplicate ? "You're already in. Good luck." : "You're in. We'll email the winner.");
  }

  if (status === "done") return <p className="body-copy text-stone-100">{message}</p>;

  return (
    <form onSubmit={submit} className="mt-6 grid max-w-xl gap-3 sm:grid-cols-2">
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <input required name="name" maxLength={120} placeholder="Your name" className="rounded-full border border-stone-100/20 bg-transparent px-5 py-3 text-stone-100 outline-none placeholder:text-stone-600 focus:border-red-300" />
      <input required name="email" type="email" maxLength={254} placeholder="Your email" className="rounded-full border border-stone-100/20 bg-transparent px-5 py-3 text-stone-100 outline-none placeholder:text-stone-600 focus:border-red-300" />
      <button disabled={status === "sending"} className="rounded-full bg-stone-100 px-6 py-3 text-sm font-semibold text-stone-950 disabled:opacity-50 sm:col-span-2 sm:w-fit">
        {status === "sending" ? "Entering..." : "Enter to win 2 tickets"}
      </button>
      {status === "error" && <p className="body-copy text-red-300 sm:col-span-2">{message}</p>}
      <p className="text-xs text-stone-600 sm:col-span-2">One entry per email. Winner contacted by email. No purchase necessary.</p>
    </form>
  );
}
