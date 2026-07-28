"use client";

import {
  ORIGINALS_MAX_PITCH_FILE_BYTES,
  ORIGINALS_MAX_PITCH_FILE_MB,
  ORIGINALS_PITCH_ACCEPT,
  ORIGINALS_SUBMISSION_FEE_LABEL,
} from "@/lib/originals";
import {
  getCurrentPagePath,
  trackGoogleAnalyticsEvent,
} from "@/lib/google-analytics-events";
import { useMemo, useRef, useState } from "react";

type OriginalsApplicationFormProps = {
  submissionsOpen: boolean;
  cancelledSubmissionId?: string;
};

type FieldErrors = Partial<Record<string, string>>;

const initialValues = {
  fullName: "",
  email: "",
  filmTitle: "",
  premise: "",
  productionApproach: "",
  previousWorkUrl: "",
  websiteOrInstagram: "",
  agreement: false,
};

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function OriginalsApplicationForm({
  submissionsOpen,
  cancelledSubmissionId = "",
}: OriginalsApplicationFormProps) {
  const [values, setValues] = useState(initialValues);
  const [pitchFile, setPitchFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [retrySubmissionId, setRetrySubmissionId] = useState(cancelledSubmissionId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasTrackedStart = useRef(false);

  const isDisabled = !submissionsOpen || isSubmitting;
  const fieldPrefix = "originals-application";

  const disabledMessage = useMemo(() => {
    if (submissionsOpen) return "";
    return "Submissions are opening soon. The application will open here when payment, storage, and notifications are ready.";
  }, [submissionsOpen]);

  const trackStarted = () => {
    if (hasTrackedStart.current || !submissionsOpen) return;
    hasTrackedStart.current = true;
    trackGoogleAnalyticsEvent("submission_form_start", {
      page_path: getCurrentPagePath(),
      form_id: "filmshow_originals_application",
      submission_type: "originals_pitch",
    });
  };

  const setFieldValue = (
    field: keyof typeof initialValues,
    value: string | boolean,
  ) => {
    trackStarted();
    setValues((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (values.fullName.trim().length < 2) {
      nextErrors.fullName = "Enter your full name.";
    }

    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!values.filmTitle.trim()) {
      nextErrors.filmTitle = "Enter the proposed film title.";
    }

    if (!values.premise.trim()) {
      nextErrors.premise = "Tell us the premise.";
    }

    if (!values.productionApproach.trim()) {
      nextErrors.productionApproach = "Tell us how you would make it.";
    }

    if (!isValidUrl(values.previousWorkUrl.trim())) {
      nextErrors.previousWorkUrl = "Paste a full URL starting with http or https.";
    }

    if (pitchFile) {
      const isPdf =
        pitchFile.type === ORIGINALS_PITCH_ACCEPT &&
        pitchFile.name.toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        nextErrors.pitchFile = "Upload a PDF file.";
      } else if (pitchFile.size > ORIGINALS_MAX_PITCH_FILE_BYTES) {
        nextErrors.pitchFile = `Keep the PDF under ${ORIGINALS_MAX_PITCH_FILE_MB} MB.`;
      }
    }

    if (!values.agreement) {
      nextErrors.agreement = "Confirm the Grant agreement.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("");

    if (!submissionsOpen) {
      setStatusMessage(disabledMessage);
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.set("full_name", values.fullName);
    formData.set("email", values.email);
    formData.set("film_title", values.filmTitle);
    formData.set("premise", values.premise);
    formData.set("production_approach", values.productionApproach);
    formData.set("previous_work_url", values.previousWorkUrl);
    formData.set("website_or_instagram", values.websiteOrInstagram);
    formData.set("terms_accepted", values.agreement ? "true" : "false");
    formData.set("company", "");

    if (pitchFile) {
      formData.set("pitch_pdf", pitchFile);
    }

    try {
      const response = await fetch("/api/originals/checkout", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as {
        checkout_url?: string;
        message?: string;
        submission_id?: string;
      };

      if (!response.ok || !result.checkout_url) {
        if (result.submission_id) setRetrySubmissionId(result.submission_id);
        setStatusMessage(
          result.message ||
            "Something went wrong before checkout. Your pitch was not charged.",
        );
        return;
      }

      trackGoogleAnalyticsEvent("outbound_link_click", {
        page_path: getCurrentPagePath(),
        link_url: result.checkout_url,
        link_text: "Stripe Checkout",
        link_context: "originals_pitch_submission",
      });
      window.location.assign(result.checkout_url);
    } catch {
      setStatusMessage(
        "Something went wrong before checkout. Your pitch was not charged.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!retrySubmissionId || !submissionsOpen) {
      setStatusMessage(disabledMessage);
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const response = await fetch("/api/originals/retry-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_id: retrySubmissionId }),
      });
      const result = (await response.json()) as {
        checkout_url?: string;
        message?: string;
      };

      if (!response.ok || !result.checkout_url) {
        setStatusMessage(
          result.message ||
            "We could not restart checkout. Your saved pitch was not charged.",
        );
        return;
      }

      trackGoogleAnalyticsEvent("outbound_link_click", {
        page_path: getCurrentPagePath(),
        link_url: result.checkout_url,
        link_text: "Stripe Checkout",
        link_context: "originals_pitch_payment_retry",
      });
      window.location.assign(result.checkout_url);
    } catch {
      setStatusMessage(
        "We could not restart checkout. Your saved pitch was not charged.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="application" className="section-pad originals-form-section">
      <div className="container-page">
        <div className="originals-form-grid">
          <div data-reveal="text">
            <p className="copy-wide small-label text-red-300">Application</p>
            <h2 className="section-kicker mt-5 text-stone-100">
              Submit a pitch.
            </h2>
            <p className="body-large mt-6 max-w-xl text-stone-300">
              The fee is {ORIGINALS_SUBMISSION_FEE_LABEL} per pitch. Your
              application is saved before Stripe Checkout opens.
            </p>
          </div>

          <div className="originals-form-wrap" data-reveal="text">
            <div className="originals-form-notice" role="status">
              <p className="copy-wide small-label text-red-300">
                {submissionsOpen
                  ? "Submissions open"
                  : "Submissions opening soon"}
              </p>
              <p>
                {submissionsOpen
                  ? "Pitch an original short film for the chance to receive $2,000 in production funding, support from Bluebird, and a premiere at Filmshow."
                  : disabledMessage}
              </p>
            </div>

            {retrySubmissionId ? (
              <div className="originals-form-notice" role="status">
                <p className="copy-wide small-label text-red-300">
                  Your pitch has been saved, but it has not been submitted.
                </p>
                <p>
                  Complete the {ORIGINALS_SUBMISSION_FEE_LABEL} payment to
                  finish your application.
                </p>
                <button
                  type="button"
                  className="button-shift originals-form-button originals-form-button--secondary"
                  disabled={isDisabled}
                  onClick={handleRetryPayment}
                >
                  Continue to Payment
                </button>
              </div>
            ) : null}

            <form
              className="originals-application-form"
              onSubmit={handleSubmit}
              noValidate
            >
              <input
                className="originals-honeypot"
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div className="originals-form-row originals-form-row--split">
                <div className="originals-field">
                  <label htmlFor={`${fieldPrefix}-full-name`}>Full name</label>
                  <input
                    id={`${fieldPrefix}-full-name`}
                    name="full_name"
                    type="text"
                    autoComplete="name"
                    disabled={isDisabled}
                    value={values.fullName}
                    onChange={(event) =>
                      setFieldValue("fullName", event.target.value)
                    }
                    aria-invalid={Boolean(errors.fullName)}
                  />
                  {errors.fullName ? <span>{errors.fullName}</span> : null}
                </div>

                <div className="originals-field">
                  <label htmlFor={`${fieldPrefix}-email`}>Email address</label>
                  <input
                    id={`${fieldPrefix}-email`}
                    name="email"
                    type="email"
                    autoComplete="email"
                    disabled={isDisabled}
                    value={values.email}
                    onChange={(event) =>
                      setFieldValue("email", event.target.value)
                    }
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email ? <span>{errors.email}</span> : null}
                </div>
              </div>

              <div className="originals-field">
                <label htmlFor={`${fieldPrefix}-film-title`}>
                  Proposed film title
                </label>
                <input
                  id={`${fieldPrefix}-film-title`}
                  name="film_title"
                  type="text"
                  disabled={isDisabled}
                  value={values.filmTitle}
                  onChange={(event) =>
                    setFieldValue("filmTitle", event.target.value)
                  }
                  aria-invalid={Boolean(errors.filmTitle)}
                />
                {errors.filmTitle ? <span>{errors.filmTitle}</span> : null}
              </div>

              <div className="originals-field">
                <label htmlFor={`${fieldPrefix}-premise`}>Premise</label>
                <p>
                  Describe the proposed film in no more than three short
                  paragraphs.
                </p>
                <textarea
                  id={`${fieldPrefix}-premise`}
                  name="premise"
                  rows={6}
                  disabled={isDisabled}
                  value={values.premise}
                  onChange={(event) =>
                    setFieldValue("premise", event.target.value)
                  }
                  aria-invalid={Boolean(errors.premise)}
                />
                {errors.premise ? <span>{errors.premise}</span> : null}
              </div>

              <div className="originals-field">
                <label htmlFor={`${fieldPrefix}-production-approach`}>
                  How would you make it?
                </label>
                <p>
                  Briefly explain how you would make the film for approximately
                  $2,000 and complete it within 30 days.
                </p>
                <textarea
                  id={`${fieldPrefix}-production-approach`}
                  name="production_approach"
                  rows={6}
                  disabled={isDisabled}
                  value={values.productionApproach}
                  onChange={(event) =>
                    setFieldValue("productionApproach", event.target.value)
                  }
                  aria-invalid={Boolean(errors.productionApproach)}
                />
                {errors.productionApproach ? (
                  <span>{errors.productionApproach}</span>
                ) : null}
              </div>

              <div className="originals-form-row originals-form-row--split">
                <div className="originals-field">
                  <label htmlFor={`${fieldPrefix}-previous-work`}>
                    Previous work
                  </label>
                  <p>Paste a link to your reel, website, or one previous film.</p>
                  <input
                    id={`${fieldPrefix}-previous-work`}
                    name="previous_work_url"
                    type="url"
                    placeholder="https://"
                    disabled={isDisabled}
                    value={values.previousWorkUrl}
                    onChange={(event) =>
                      setFieldValue("previousWorkUrl", event.target.value)
                    }
                    aria-invalid={Boolean(errors.previousWorkUrl)}
                  />
                  {errors.previousWorkUrl ? (
                    <span>{errors.previousWorkUrl}</span>
                  ) : null}
                </div>

                <div className="originals-field">
                  <label htmlFor={`${fieldPrefix}-website`}>
                    Instagram or website
                  </label>
                  <input
                    id={`${fieldPrefix}-website`}
                    name="website_or_instagram"
                    type="text"
                    disabled={isDisabled}
                    value={values.websiteOrInstagram}
                    onChange={(event) =>
                      setFieldValue("websiteOrInstagram", event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="originals-field originals-file-field">
                <label htmlFor={`${fieldPrefix}-pitch-pdf`}>
                  Pitch document — optional
                </label>
                <p>
                  Upload an optional one- to three-page PDF containing images,
                  references, or additional context. Do not upload a full
                  screenplay.
                </p>
                <input
                  id={`${fieldPrefix}-pitch-pdf`}
                  name="pitch_pdf"
                  type="file"
                  accept=".pdf,application/pdf"
                  disabled={isDisabled}
                  onChange={(event) => {
                    trackStarted();
                    setPitchFile(event.target.files?.[0] ?? null);
                  }}
                  aria-invalid={Boolean(errors.pitchFile)}
                />
                {errors.pitchFile ? <span>{errors.pitchFile}</span> : null}
              </div>

              <label className="originals-checkbox">
                <input
                  type="checkbox"
                  name="terms_accepted"
                  disabled={isDisabled}
                  checked={values.agreement}
                  onChange={(event) =>
                    setFieldValue("agreement", event.target.checked)
                  }
                  aria-invalid={Boolean(errors.agreement)}
                />
                <span>
                  I understand that Filmshow Grant is for an unproduced
                  short-film idea, not a completed film or full screenplay. I
                  confirm that the proposed film can be completed within 30 days
                  and produced for approximately $2,000.
                </span>
              </label>
              {errors.agreement ? (
                <p className="originals-form-error">{errors.agreement}</p>
              ) : null}

              {statusMessage ? (
                <p className="originals-form-status" role="status">
                  {statusMessage}
                </p>
              ) : null}

              <button
                type="submit"
                className="button-shift originals-form-button"
                disabled={isDisabled}
              >
                {submissionsOpen
                  ? isSubmitting
                    ? "Opening Checkout"
                    : `Continue to ${ORIGINALS_SUBMISSION_FEE_LABEL} Payment`
                  : "Submissions Opening Soon"}
              </button>
              {submissionsOpen ? (
                <p className="originals-form-helper">
                  Your application is saved before Stripe Checkout opens.
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
