"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type {
  GrantApplicationStatus,
  GrantEmailTemplate,
  GrantSubmissionRecord,
} from "@/lib/grant-admin";

type FilterKey =
  | "all"
  | GrantApplicationStatus
  | "paid"
  | "unpaid"
  | "email_sent"
  | "email_not_sent";

type DashboardProps = {
  submissions: GrantSubmissionRecord[];
  templates: Record<GrantEmailTemplate["id"], GrantEmailTemplate>;
};

const filterOptions: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "under_review", label: "Under review" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "accepted", label: "Accepted" },
  { key: "not_accepted", label: "Not accepted" },
  { key: "paid", label: "Paid" },
  { key: "unpaid", label: "Unpaid" },
  { key: "email_sent", label: "Email sent" },
  { key: "email_not_sent", label: "Email not sent" },
];

const statusOptions: Array<{ value: GrantApplicationStatus; label: string }> = [
  { value: "new", label: "New" },
  { value: "under_review", label: "Under review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "accepted", label: "Accepted" },
  { value: "not_accepted", label: "Not accepted" },
  { value: "final_recipient", label: "Final recipient" },
];

function formatDate(value?: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatMoney(cents?: number | null, currency = "usd") {
  if (typeof cents !== "number") return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function statusLabel(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

function renderTemplate(template: string, submission: GrantSubmissionRecord) {
  const replacements: Record<string, string> = {
    first_name: firstName(submission.full_name),
    full_name: submission.full_name,
    project_title: submission.film_title,
    application_reference: submission.application_reference || submission.id,
    submission_date: formatDate(submission.created_at),
    payment_confirmation:
      submission.status === "paid"
        ? `Paid ${formatDate(submission.paid_at)}`
        : "Not paid",
  };

  return template.replace(/\{\{\s*([\w_]+)\s*\}\}/g, (_match, key: string) => {
    return replacements[key] ?? "";
  });
}

function csvCell(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export function GrantDashboardClient({
  submissions,
  templates,
}: DashboardProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<GrantApplicationStatus>("under_review");
  const [emailType, setEmailType] = useState<"acceptance" | "not_accepted">("acceptance");
  const [subject, setSubject] = useState(templates.accepted.subject);
  const [body, setBody] = useState(templates.accepted.body);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return submissions.filter((submission) => {
      const matchesSearch =
        !q ||
        [
          submission.full_name,
          submission.email,
          submission.film_title,
          submission.application_reference,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));

      const matchesFilter =
        filter === "all" ||
        submission.application_status === filter ||
        (filter === "paid" && submission.status === "paid") ||
        (filter === "unpaid" && submission.status !== "paid") ||
        (filter === "email_sent" && Boolean(submission.confirmation_email_sent_at)) ||
        (filter === "email_not_sent" && !submission.confirmation_email_sent_at);

      return matchesSearch && matchesFilter;
    });
  }, [submissions, search, filter]);

  const selected = filtered.filter((submission) => selectedIds.includes(submission.id));
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((submission) => selectedIds.includes(submission.id));
  const firstSelected = selected[0];

  const totals = useMemo(() => {
    const paid = submissions.filter((submission) => submission.status === "paid");
    return {
      applications: submissions.length,
      paid: paid.length,
      revenue: paid.reduce((sum, submission) => sum + (submission.amount_paid || 0), 0),
      newCount: submissions.filter((submission) => submission.application_status === "new").length,
      underReview: submissions.filter((submission) => submission.application_status === "under_review").length,
      shortlisted: submissions.filter((submission) => submission.application_status === "shortlisted").length,
      accepted: submissions.filter((submission) => submission.application_status === "accepted").length,
      notAccepted: submissions.filter((submission) => submission.application_status === "not_accepted").length,
      confirmations: submissions.filter((submission) => submission.confirmation_email_sent_at).length,
      needsAttention: submissions.filter(
        (submission) => submission.status === "paid" && !submission.confirmation_email_sent_at,
      ).length,
    };
  }, [submissions]);

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const toggleAllFiltered = () => {
    setSelectedIds((current) => {
      const filteredIds = filtered.map((submission) => submission.id);
      if (filteredIds.every((id) => current.includes(id))) {
        return current.filter((id) => !filteredIds.includes(id));
      }
      return Array.from(new Set([...current, ...filteredIds]));
    });
  };

  const changeEmailType = (nextType: "acceptance" | "not_accepted") => {
    setEmailType(nextType);
    const template = nextType === "acceptance" ? templates.accepted : templates.not_accepted;
    setSubject(template.subject);
    setBody(template.body);
  };

  const applyBulkStatus = () => {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/admin/grant/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, status: bulkStatus }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(payload?.message || "Status update failed.");
        return;
      }
      setMessage(`Updated ${payload.updated} application${payload.updated === 1 ? "" : "s"}.`);
      window.location.reload();
    });
  };

  const sendBulkEmail = () => {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/admin/grant/bulk-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          emailType,
          subject,
          body,
          idempotencyKey: window.crypto.randomUUID(),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(payload?.message || "Bulk email failed.");
        return;
      }
      setShowEmailPreview(false);
      setMessage(
        `Sent ${payload.sent}, skipped ${payload.skipped}, failed ${payload.failed}.`,
      );
      window.location.reload();
    });
  };

  const exportCsv = () => {
    const rows = [
      [
        "Name",
        "Email",
        "Project title",
        "Date",
        "Status",
        "Payment amount",
        "Payment status",
        "Confirmation email",
        "Accepted email",
        "Not accepted email",
      ],
      ...filtered.map((submission) => [
        submission.full_name,
        submission.email,
        submission.film_title,
        formatDate(submission.created_at),
        statusLabel(submission.application_status),
        formatMoney(submission.amount_paid, submission.currency || "usd"),
        submission.status,
        submission.confirmation_email_sent_at ? "sent" : "not sent",
        submission.accepted_email_sent_at ? "sent" : "not sent",
        submission.rejection_email_sent_at ? "sent" : "not sent",
      ]),
    ];

    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "filmshow-grant-applications.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-summary-grid">
        <div><span>Total</span><strong>{totals.applications}</strong></div>
        <div><span>Paid</span><strong>{totals.paid}</strong></div>
        <div><span>Revenue</span><strong>{formatMoney(totals.revenue)}</strong></div>
        <div><span>New</span><strong>{totals.newCount}</strong></div>
        <div><span>Review</span><strong>{totals.underReview}</strong></div>
        <div><span>Shortlisted</span><strong>{totals.shortlisted}</strong></div>
        <div><span>Accepted</span><strong>{totals.accepted}</strong></div>
        <div><span>Not accepted</span><strong>{totals.notAccepted}</strong></div>
        <div><span>Confirmations</span><strong>{totals.confirmations}</strong></div>
        <div><span>Needs attention</span><strong>{totals.needsAttention}</strong></div>
      </div>

      <div className="admin-toolbar">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email, project, reference"
          aria-label="Search applications"
        />
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as FilterKey)}
          aria-label="Filter applications"
        >
          {filterOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
        <button type="button" className="admin-button admin-button--secondary" onClick={exportCsv}>
          Export CSV
        </button>
        <Link href="/admin/grant/templates" className="admin-button admin-button--secondary">
          Email Templates
        </Link>
      </div>

      <div className="admin-bulk-bar">
        <p>{selected.length} selected</p>
        <button type="button" onClick={toggleAllFiltered}>
          {allFilteredSelected ? "Clear filtered" : "Select all filtered"}
        </button>
        <select
          value={bulkStatus}
          onChange={(event) => setBulkStatus(event.target.value as GrantApplicationStatus)}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              Mark {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="admin-button"
          disabled={!selected.length || isPending}
          onClick={applyBulkStatus}
        >
          Apply Status
        </button>
        <select
          value={emailType}
          onChange={(event) => changeEmailType(event.target.value as "acceptance" | "not_accepted")}
        >
          <option value="acceptance">Acceptance email</option>
          <option value="not_accepted">Not accepted email</option>
        </select>
        <button
          type="button"
          className="admin-button"
          disabled={!selected.length || isPending}
          onClick={() => setShowEmailPreview(true)}
        >
          Preview Email
        </button>
      </div>

      {message ? <p className="admin-status-message">{message}</p> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th aria-label="Select applications" />
              <th>Applicant</th>
              <th>Project</th>
              <th>Submitted</th>
              <th>Payment</th>
              <th>Paid</th>
              <th>Status</th>
              <th>Confirm</th>
              <th>PDF</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((submission) => (
              <tr key={submission.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(submission.id)}
                    onChange={() => toggleSelected(submission.id)}
                    aria-label={`Select ${submission.film_title}`}
                  />
                </td>
                <td>
                  <Link href={`/admin/grant/${submission.id}`}>
                    <strong>{submission.full_name}</strong>
                    <span>{submission.email}</span>
                  </Link>
                </td>
                <td>
                  <strong>{submission.film_title}</strong>
                  <span>{submission.application_reference || submission.id}</span>
                </td>
                <td>{formatDate(submission.created_at)}</td>
                <td>{submission.status}</td>
                <td>{formatMoney(submission.amount_paid, submission.currency || "usd")}</td>
                <td>{statusLabel(submission.application_status)}</td>
                <td>{submission.confirmation_email_sent_at ? "Sent" : "Not sent"}</td>
                <td>{submission.pitch_file_path ? "Uploaded" : "None"}</td>
                <td>{submission.internal_notes ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEmailPreview ? (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal admin-card">
            <h2>Review before sending.</h2>
            <p>
              {selected.length} recipient{selected.length === 1 ? "" : "s"}. Each email will be
              sent individually.
            </p>
            <label>
              <span>Subject</span>
              <input value={subject} onChange={(event) => setSubject(event.target.value)} />
            </label>
            <label>
              <span>Body</span>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={12}
              />
            </label>
            {firstSelected ? (
              <div className="admin-preview-box">
                <p>Preview for {firstSelected.full_name}</p>
                <strong>{renderTemplate(subject, firstSelected)}</strong>
                <pre>{renderTemplate(body, firstSelected)}</pre>
              </div>
            ) : null}
            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-button admin-button--secondary"
                onClick={() => setShowEmailPreview(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-button"
                disabled={isPending}
                onClick={sendBulkEmail}
              >
                Confirm And Send
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
