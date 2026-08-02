import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireGrantAdmin } from "@/lib/admin-auth";
import {
  GRANT_APPLICATION_STATUSES,
  adminStatusLabel,
  getGrantSubmission,
  listGrantActivity,
  listGrantEmailLogs,
} from "@/lib/grant-admin";
import { getOriginalsServerConfig } from "@/lib/originals-config";
import { createOriginalsPitchSignedUrl } from "@/lib/supabase-originals";
import {
  resendGrantConfirmationAction,
  sendIndividualGrantDecisionAction,
  updateGrantApplicationAction,
} from "../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Grant Application | Filmshow Admin",
  robots: {
    index: false,
    follow: false,
  },
};

function formatDate(value?: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMoney(cents?: number | null, currency = "usd") {
  if (typeof cents !== "number") return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default async function GrantApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireGrantAdmin();
  const { id } = await params;
  const config = getOriginalsServerConfig();
  const submission = await getGrantSubmission(config, id);
  if (!submission) notFound();

  const [emailLogs, activityLogs, pitchUrl] = await Promise.all([
    listGrantEmailLogs(config, id),
    listGrantActivity(config, id),
    submission.pitch_file_path
      ? createOriginalsPitchSignedUrl(config, submission.pitch_file_path)
      : Promise.resolve(null),
  ]);

  return (
    <main className="admin-shell">
      <header className="admin-page-header">
        <div>
          <Link href="/admin/grant" className="admin-back-link">
            Back to applications
          </Link>
          <p className="admin-eyebrow">Filmshow Grant</p>
          <h1>{submission.film_title}</h1>
          <p>
            {submission.full_name} · {submission.email} ·{" "}
            {submission.application_reference || submission.id}
          </p>
        </div>
        <p className="admin-signed-in">Signed in as {admin.email}</p>
      </header>

      <section className="admin-detail-grid">
        <div className="admin-card admin-detail-main">
          <h2>Submitted information</h2>
          <dl className="admin-definition-list">
            <div>
              <dt>Applicant</dt>
              <dd>{submission.full_name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{submission.email}</dd>
            </div>
            <div>
              <dt>Project title</dt>
              <dd>{submission.film_title}</dd>
            </div>
            <div>
              <dt>Submitted</dt>
              <dd>{formatDate(submission.created_at)}</dd>
            </div>
            <div>
              <dt>Payment status</dt>
              <dd>{submission.status}</dd>
            </div>
            <div>
              <dt>Amount paid</dt>
              <dd>{formatMoney(submission.amount_paid, submission.currency || "usd")}</dd>
            </div>
            <div>
              <dt>Paid at</dt>
              <dd>{formatDate(submission.paid_at)}</dd>
            </div>
            <div>
              <dt>Previous work</dt>
              <dd>
                <a href={submission.previous_work_url} target="_blank" rel="noreferrer">
                  {submission.previous_work_url}
                </a>
              </dd>
            </div>
            <div>
              <dt>Website / Instagram</dt>
              <dd>{submission.website_or_instagram || "Not provided"}</dd>
            </div>
            <div>
              <dt>Pitch PDF</dt>
              <dd>
                {pitchUrl ? (
                  <a href={pitchUrl} target="_blank" rel="noreferrer">
                    Open secure signed link
                  </a>
                ) : (
                  "No PDF uploaded"
                )}
              </dd>
            </div>
          </dl>

          <h3>Premise</h3>
          <p className="admin-long-copy">{submission.premise}</p>

          <h3>Production approach</h3>
          <p className="admin-long-copy">{submission.production_approach}</p>
        </div>

        <aside className="admin-card admin-detail-side">
          <h2>Review</h2>
          <form action={updateGrantApplicationAction} className="admin-form-stack">
            <input type="hidden" name="id" value={submission.id} />
            <label>
              <span>Application status</span>
              <select
                name="application_status"
                defaultValue={submission.application_status}
              >
                {GRANT_APPLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {adminStatusLabel(status)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Internal notes</span>
              <textarea
                name="internal_notes"
                rows={8}
                defaultValue={submission.internal_notes || ""}
              />
            </label>
            <button type="submit" className="admin-button">
              Save Review
            </button>
          </form>

          <div className="admin-action-stack">
            <form action={resendGrantConfirmationAction}>
              <input type="hidden" name="id" value={submission.id} />
              <button type="submit" className="admin-button admin-button--secondary">
                Resend Confirmation
              </button>
            </form>
            <form action={sendIndividualGrantDecisionAction}>
              <input type="hidden" name="id" value={submission.id} />
              <input type="hidden" name="type" value="acceptance" />
              <button type="submit" className="admin-button admin-button--secondary">
                Send Acceptance Email
              </button>
            </form>
            <form action={sendIndividualGrantDecisionAction}>
              <input type="hidden" name="id" value={submission.id} />
              <input type="hidden" name="type" value="not_accepted" />
              <button type="submit" className="admin-button admin-button--secondary">
                Send Not-Accepted Email
              </button>
            </form>
          </div>
        </aside>
      </section>

      <section className="admin-detail-grid">
        <div className="admin-card">
          <h2>Email history</h2>
          <div className="admin-log-list">
            {emailLogs.length ? (
              emailLogs.map((log) => (
                <article key={log.id}>
                  <strong>{log.email_type}</strong>
                  <span>{formatDate(log.sent_at)}</span>
                  <p>{log.subject}</p>
                  <p>
                    {log.delivery_status}
                    {log.error_message ? ` · ${log.error_message}` : ""}
                  </p>
                </article>
              ))
            ) : (
              <p>No emails logged yet.</p>
            )}
          </div>
        </div>

        <div className="admin-card">
          <h2>Activity</h2>
          <div className="admin-log-list">
            {activityLogs.length ? (
              activityLogs.map((log) => (
                <article key={log.id}>
                  <strong>{log.action}</strong>
                  <span>{formatDate(log.created_at)}</span>
                  <p>{log.notes || "No note."}</p>
                  <p>{log.admin_email || "System"}</p>
                </article>
              ))
            ) : (
              <p>No activity yet.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
