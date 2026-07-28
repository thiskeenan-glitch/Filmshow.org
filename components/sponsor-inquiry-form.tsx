"use client";

import { FormEvent, useState } from "react";

export function SponsorInquiryForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  const fieldClass =
    "texture-input w-full border border-stone-100/15 bg-transparent px-4 py-4 text-base text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-red-600";

  return (
    <form
      onSubmit={handleSubmit}
      className="texture-form border border-stone-100/10 bg-stone-950/20 p-5 sm:p-6 md:p-8"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="sr-only" htmlFor="sponsor-name">
          Name
        </label>
        <input
          id="sponsor-name"
          name="name"
          required
          autoComplete="name"
          className={fieldClass}
          placeholder="Name"
        />
        <label className="sr-only" htmlFor="sponsor-email">
          Email
        </label>
        <input
          id="sponsor-email"
          name="email"
          required
          type="email"
          autoComplete="email"
          className={fieldClass}
          placeholder="Email"
        />
        <label className="sr-only" htmlFor="sponsor-company">
          Company
        </label>
        <input
          id="sponsor-company"
          name="company"
          autoComplete="organization"
          className={fieldClass}
          placeholder="Company"
        />
        <label className="sr-only" htmlFor="sponsor-budget">
          Budget range
        </label>
        <select
          id="sponsor-budget"
          name="budget"
          required
          className={fieldClass}
          defaultValue=""
        >
          <option value="" disabled>
            Budget range
          </option>
          <option>$500</option>
          <option>$1,000</option>
          <option>$2,500+</option>
          <option>Custom</option>
        </select>
      </div>
      <label className="sr-only" htmlFor="sponsor-message">
        Tell us what you would like to support.
      </label>
      <textarea
        id="sponsor-message"
        name="message"
        required
        className={`${fieldClass} mt-4 min-h-36 resize-none`}
        placeholder="Tell us what you would like to support."
      />
      <button
        type="submit"
        className="button-shift relative mt-4 w-full overflow-hidden border border-stone-100/25 bg-stone-100 px-5 py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.1em] text-stone-950 transition hover:border-stone-100/60 hover:bg-transparent hover:text-stone-100 sm:w-auto"
      >
        <span>Submit inquiry</span>
      </button>
      {sent ? (
        <p className="mt-4 text-sm text-red-100">
          Thanks. We will be in touch.
        </p>
      ) : null}
    </form>
  );
}
