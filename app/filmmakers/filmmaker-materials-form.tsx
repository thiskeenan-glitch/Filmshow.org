"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SubtitleStatus = "" | "no_subtitles" | "burned_in_master";

type Attendance = "" | "hell_yes" | "no" | "trying_to_figure_it_out";

type FormValues = {
  email: string;
  filmTitle: string;
  directorNames: string;
  runtime: string;
  synopsis: string;
  masterLink: string;
  subtitleStatus: SubtitleStatus;
  materialsLink: string;
  socialHandles: string;
  attendance: Attendance;
  additionalAttendees: string;
  filmmakerVideoUrl: string;
  showDayContact: string;
  notes: string;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const DRAFT_KEY = "filmshow-filmmaker-materials-draft-v1";
const IDEMPOTENCY_KEY = "filmshow-filmmaker-materials-idempotency-v1";

const initialValues: FormValues = {
  email: "",
  filmTitle: "",
  directorNames: "",
  runtime: "",
  synopsis: "",
  masterLink: "",
  subtitleStatus: "",
  materialsLink: "",
  socialHandles: "",
  attendance: "",
  additionalAttendees: "",
  filmmakerVideoUrl: "",
  showDayContact: "",
  notes: "",
};

const focusIds: Partial<Record<keyof FormValues, string>> = {
  subtitleStatus: "filmmakers-subtitles-none",
  attendance: "filmmakers-attendance-yes",
};

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function Question({
  number,
  title,
  helper,
  optional = false,
  error,
  children,
  className = "",
}: {
  number: string;
  title: string;
  helper?: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`filmmaker-question ${className}`} data-reveal="text">
      <div className="filmmaker-question-number" aria-hidden="true">
        {number}
      </div>
      <div className="filmmaker-question-body">
        <div className="filmmaker-question-heading">
          <h2>{title}</h2>
          {optional ? <span>Optional</span> : <span>Required</span>}
        </div>
        {helper ? <p className="filmmaker-helper">{helper}</p> : null}
        {children}
        {error ? (
          <p className="filmmaker-field-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function FilmmakerMaterialsForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const idempotencyKeyRef = useRef("");

  useEffect(() => {
    const restoreDraft = window.setTimeout(() => {
      try {
        const savedDraft = window.sessionStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          const draft = JSON.parse(savedDraft) as Partial<FormValues> & {
            subtitleStatus?: string;
          };
          setValues({
            ...initialValues,
            ...draft,
            subtitleStatus:
              draft.subtitleStatus === "no_subtitles" ||
              draft.subtitleStatus === "burned_in_master"
                ? draft.subtitleStatus
                : "",
          });
        }

        const savedKey = window.sessionStorage.getItem(IDEMPOTENCY_KEY);
        idempotencyKeyRef.current = savedKey || window.crypto.randomUUID();
        window.sessionStorage.setItem(IDEMPOTENCY_KEY, idempotencyKeyRef.current);
      } catch {
        idempotencyKeyRef.current = window.crypto.randomUUID();
      }

      setHasHydrated(true);
    }, 0);

    return () => window.clearTimeout(restoreDraft);
  }, []);

  useEffect(() => {
    if (!hasHydrated || isComplete) return;

    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    } catch {
      // The live form state still preserves the answers if storage is unavailable.
    }
  }, [hasHydrated, isComplete, values]);

  const setField = <Key extends keyof FormValues>(
    key: Key,
    value: FormValues[Key],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatusMessage("");
  };

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
      nextErrors.email = "Give us a real email address.";
    }
    if (!values.filmTitle.trim()) nextErrors.filmTitle = "What are we showing?";
    if (!values.directorNames.trim()) {
      nextErrors.directorNames = "Who made this thing?";
    }
    if (!values.runtime.trim()) nextErrors.runtime = "How long is it?";
    if (!values.synopsis.trim()) {
      nextErrors.synopsis = "Give us the one-sentence version.";
    }
    if (!isValidUrl(values.masterLink.trim())) {
      nextErrors.masterLink = "Paste a full downloadable link starting with http or https.";
    }
    if (!values.subtitleStatus) {
      nextErrors.subtitleStatus = "Pick the subtitle situation.";
    }
    if (!isValidUrl(values.materialsLink.trim())) {
      nextErrors.materialsLink = "Paste a full folder link starting with http or https.";
    }
    if (!values.socialHandles.trim()) {
      nextErrors.socialHandles = "Tell us who to tag.";
    }
    if (!values.attendance) {
      nextErrors.attendance = "Tell us if you are coming.";
    }
    if (
      values.filmmakerVideoUrl.trim() &&
      !isValidUrl(values.filmmakerVideoUrl.trim())
    ) {
      nextErrors.filmmakerVideoUrl = "That optional video still needs a full URL.";
    }
    if (!values.showDayContact.trim()) {
      nextErrors.showDayContact = "Give us a show-day name and cell number.";
    }

    setErrors(nextErrors);

    const firstError = Object.keys(nextErrors)[0] as keyof FormValues | undefined;
    if (firstError) {
      window.setTimeout(() => {
        document
          .getElementById(focusIds[firstError] || `filmmakers-${firstError}`)
          ?.focus();
      }, 0);
    }

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("");
    if (isSubmitting || !validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/filmmakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotency_key:
            idempotencyKeyRef.current || window.crypto.randomUUID(),
          film_title: values.filmTitle,
          director_names: values.directorNames,
          email: values.email,
          runtime: values.runtime,
          synopsis: values.synopsis,
          master_link: values.masterLink,
          subtitle_status: values.subtitleStatus,
          materials_link: values.materialsLink,
          social_handles: values.socialHandles,
          attendance: values.attendance,
          additional_attendees: values.additionalAttendees,
          filmmaker_video_url: values.filmmakerVideoUrl,
          show_day_contact: values.showDayContact,
          notes: values.notes,
          company: "",
        }),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setStatusMessage(
          result.message ||
            "Something went sideways. Your answers are still here—try SEND IT again.",
        );
        return;
      }

      try {
        window.sessionStorage.removeItem(DRAFT_KEY);
        window.sessionStorage.removeItem(IDEMPOTENCY_KEY);
      } catch {
        // Submission succeeded even if local draft cleanup is unavailable.
      }

      setIsComplete(true);
      router.replace("/filmmakers/sent");
    } catch {
      setStatusMessage(
        "The internet did something weird. Your answers are still here—try SEND IT again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <section className="filmmakers-success" aria-live="polite">
        <div className="filmmakers-container">
          <h1>
            It&apos;s <em>sent.</em>
          </h1>
          <p className="filmmakers-success-lede">See you October 3.</p>
          <div className="filmmakers-success-details">
            <span>Filmshow Vol. 1</span>
            <span>Rollin Studios</span>
            <span>Brooklyn</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <form className="filmmakers-form" onSubmit={handleSubmit} noValidate>
      <div className="filmmakers-container">
        <input
          className="filmmakers-honeypot"
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <Question number="01" title="What's your email?" error={errors.email}>
          <input
            id="filmmakers-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={values.email}
            onChange={(event) => setField("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            placeholder="you@somewhere.com"
          />
        </Question>

        <Question number="02" title="What are we showing?" error={errors.filmTitle}>
          <input
            id="filmmakers-filmTitle"
            type="text"
            value={values.filmTitle}
            onChange={(event) => setField("filmTitle", event.target.value)}
            aria-invalid={Boolean(errors.filmTitle)}
            placeholder="Film title"
          />
        </Question>

        <Question number="03" title="Who made this thing?" error={errors.directorNames}>
          <input
            id="filmmakers-directorNames"
            type="text"
            autoComplete="name"
            value={values.directorNames}
            onChange={(event) => setField("directorNames", event.target.value)}
            aria-invalid={Boolean(errors.directorNames)}
            placeholder="Director name(s)"
          />
        </Question>

        <Question number="04" title="How long is it?" error={errors.runtime}>
          <input
            id="filmmakers-runtime"
            type="text"
            value={values.runtime}
            onChange={(event) => setField("runtime", event.target.value)}
            aria-invalid={Boolean(errors.runtime)}
            placeholder="8 minutes 42 seconds"
          />
        </Question>

        <Question
          number="05"
          title="Describe it in one sentence."
          helper="The version you'd want us to tell people."
          error={errors.synopsis}
        >
          <textarea
            id="filmmakers-synopsis"
            rows={3}
            maxLength={1200}
            value={values.synopsis}
            onChange={(event) => setField("synopsis", event.target.value)}
            aria-invalid={Boolean(errors.synopsis)}
            placeholder="One beautiful sentence."
          />
        </Question>

        <Question
          number="06"
          title="Where's the movie?"
          helper="Drop us a downloadable ProRes link. ProRes 422 preferred, 1080p or 4K at the film's native frame rate. Google Drive, Dropbox, Frame.io, etc. Make sure downloading is enabled. No giant uploads here—we only need the link."
          error={errors.masterLink}
        >
          <input
            id="filmmakers-masterLink"
            type="url"
            inputMode="url"
            value={values.masterLink}
            onChange={(event) => setField("masterLink", event.target.value)}
            aria-invalid={Boolean(errors.masterLink)}
            placeholder="https://"
          />
        </Question>

        <Question
          number="07"
          title="What's the subtitle situation?"
          helper="If your film is in another language other than English, we require English subtitles."
          error={errors.subtitleStatus}
        >
          <fieldset className="filmmaker-choices">
            <legend className="sr-only">Subtitle status</legend>
            {[
              ["no_subtitles", "No subtitles"],
              ["burned_in_master", "Burned into the master"],
            ].map(([value, label], index) => (
              <label className="filmmaker-choice" key={value}>
                <input
                  id={index === 0 ? "filmmakers-subtitles-none" : undefined}
                  type="radio"
                  name="subtitle_status"
                  value={value}
                  checked={values.subtitleStatus === value}
                  onChange={() =>
                    setField("subtitleStatus", value as SubtitleStatus)
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>
        </Question>

        <Question
          number="08"
          title="Give us the good stuff."
          helper="Drop us one folder with 3–5 high-res stills. Poster/key art and trailer/teaser too, if you have them."
          error={errors.materialsLink}
        >
          <input
            id="filmmakers-materialsLink"
            type="url"
            inputMode="url"
            value={values.materialsLink}
            onChange={(event) => setField("materialsLink", event.target.value)}
            aria-invalid={Boolean(errors.materialsLink)}
            placeholder="https://"
          />
        </Question>

        <Question
          number="09"
          title="Who do we tag?"
          helper="Director, film, production company, cast—whoever should be part of the announcement."
          error={errors.socialHandles}
        >
          <textarea
            id="filmmakers-socialHandles"
            rows={3}
            maxLength={1200}
            value={values.socialHandles}
            onChange={(event) => setField("socialHandles", event.target.value)}
            aria-invalid={Boolean(errors.socialHandles)}
            placeholder="@director, @film, @everyone"
          />
        </Question>

        <Question
          number="10"
          title="Are you coming October 3?"
          error={errors.attendance}
        >
          <fieldset className="filmmaker-choices filmmaker-choices--attendance">
            <legend className="sr-only">Attendance</legend>
            {[
              ["hell_yes", "Hell yes"],
              ["no", "No"],
              ["trying_to_figure_it_out", "Trying to figure it out"],
            ].map(([value, label], index) => (
              <label className="filmmaker-choice" key={value}>
                <input
                  id={index === 0 ? "filmmakers-attendance-yes" : undefined}
                  type="radio"
                  name="attendance"
                  value={value}
                  checked={values.attendance === value}
                  onChange={() => setField("attendance", value as Attendance)}
                />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>
        </Question>

        <Question
          number="11"
          title="Who else is coming?"
          helper="Cast, crew, friends, whoever. Estimates are completely fine."
          optional
        >
          <textarea
            id="filmmakers-additionalAttendees"
            rows={3}
            maxLength={2000}
            value={values.additionalAttendees}
            onChange={(event) => setField("additionalAttendees", event.target.value)}
            placeholder="Names, numbers, educated guesses."
          />
        </Question>

        <Question
          number="12"
          title="One weird request."
          helper="If you're up for it, send us a casual 10–15 second vertical phone video introducing yourself and your film. Tell us your name, what you made, or one thing people should know before seeing it. Phone is perfect. Don't make it good."
          optional
          error={errors.filmmakerVideoUrl}
          className="filmmaker-question--weird"
        >
          <input
            id="filmmakers-filmmakerVideoUrl"
            type="url"
            inputMode="url"
            value={values.filmmakerVideoUrl}
            onChange={(event) => setField("filmmakerVideoUrl", event.target.value)}
            aria-invalid={Boolean(errors.filmmakerVideoUrl)}
            placeholder="Optional Drive / Dropbox link"
          />
          <p className="filmmaker-skip-note">Completely optional. Skip it guilt-free.</p>
        </Question>

        <Question
          number="13"
          title="If the projector catches fire, who do we call?"
          helper="Name + cell number. Show-day emergencies only."
          error={errors.showDayContact}
        >
          <input
            id="filmmakers-showDayContact"
            type="text"
            autoComplete="tel"
            value={values.showDayContact}
            onChange={(event) => setField("showDayContact", event.target.value)}
            aria-invalid={Boolean(errors.showDayContact)}
            placeholder="Name · (555) 555-5555"
          />
        </Question>

        <Question number="14" title="Anything we should know?" optional>
          <textarea
            id="filmmakers-notes"
            rows={5}
            maxLength={5000}
            value={values.notes}
            onChange={(event) => setField("notes", event.target.value)}
            placeholder="Anything at all."
          />
        </Question>

        <section className="filmmakers-submit" data-reveal="text">
          {statusMessage ? (
            <p className="filmmakers-status" role="alert">
              {statusMessage}
            </p>
          ) : null}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send it →"}
          </button>
          <p>Your answers stay on this device if anything goes wrong.</p>
        </section>
      </div>
    </form>
  );
}
