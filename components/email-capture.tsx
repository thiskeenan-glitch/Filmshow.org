"use client";

import { FormEvent, useState } from "react";

type EmailCaptureProps = {
  buttonLabel: string;
  placeholder?: string;
  successMessage?: string;
};

export function EmailCapture({
  buttonLabel,
  placeholder = "you@example.com",
  successMessage = "You are on the list.",
}: EmailCaptureProps) {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          required
          type="email"
          placeholder={placeholder}
          className="texture-input min-h-14 w-full flex-1 border border-stone-100/15 bg-transparent px-5 text-base text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-red-600"
        />
        <button
          type="submit"
          className="button-shift relative min-h-12 w-full overflow-hidden border border-stone-100/25 bg-stone-100 px-5 text-[0.72rem] font-medium uppercase tracking-[0.1em] text-stone-950 transition hover:border-stone-100/60 hover:bg-transparent hover:text-stone-100 sm:w-auto"
        >
          <span>{buttonLabel}</span>
        </button>
      </div>
      {sent ? (
        <p className="mt-3 text-sm text-red-100">
          {successMessage}
        </p>
      ) : null}
    </form>
  );
}
