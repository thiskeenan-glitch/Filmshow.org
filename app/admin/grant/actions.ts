"use server";

import { requireGrantAdmin } from "@/lib/admin-auth";
import {
  GRANT_APPLICATION_STATUSES,
  type GrantApplicationStatus,
  type GrantEmailTemplate,
  adminStatusLabel,
  createGrantActivity,
  getGrantSubmission,
  listGrantEmailTemplates,
  saveGrantEmailTemplate,
  updateGrantSubmission,
} from "@/lib/grant-admin";
import { sendGrantEmail } from "@/lib/grant-email";
import { getOriginalsServerConfig } from "@/lib/originals-config";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function asStatus(value: FormDataEntryValue | null): GrantApplicationStatus {
  const status = String(value || "");
  if (
    GRANT_APPLICATION_STATUSES.includes(status as GrantApplicationStatus)
  ) {
    return status as GrantApplicationStatus;
  }

  throw new Error("Unknown application status.");
}

export async function updateGrantApplicationAction(formData: FormData) {
  const admin = await requireGrantAdmin();
  const config = getOriginalsServerConfig();
  const id = String(formData.get("id") || "");
  const application_status = asStatus(formData.get("application_status"));
  const internal_notes = String(formData.get("internal_notes") || "").trim();

  const existing = await getGrantSubmission(config, id);
  if (!existing) throw new Error("Application not found.");

  await updateGrantSubmission(config, id, {
    application_status,
    internal_notes: internal_notes || null,
    last_reviewed_by: admin.email,
    last_reviewed_at: new Date().toISOString(),
  });

  await createGrantActivity(config, {
    submission_id: id,
    action: "application_updated",
    from_status: existing.application_status,
    to_status: application_status,
    notes:
      existing.application_status === application_status
        ? "Internal notes updated."
        : `Status changed to ${adminStatusLabel(application_status)}.`,
    admin_email: admin.email,
  });

  revalidatePath("/admin/grant");
  revalidatePath(`/admin/grant/${id}`);
}

export async function resendGrantConfirmationAction(formData: FormData) {
  const admin = await requireGrantAdmin();
  const config = getOriginalsServerConfig();
  const id = String(formData.get("id") || "");
  const submission = await getGrantSubmission(config, id);
  if (!submission) throw new Error("Application not found.");

  await sendGrantEmail({
    config,
    submission,
    emailType: "confirmation",
    adminEmail: admin.email,
    idempotencyKey: `admin-confirmation-${id}-${Date.now()}`,
    allowResend: true,
  });

  revalidatePath(`/admin/grant/${id}`);
}

export async function sendIndividualGrantDecisionAction(formData: FormData) {
  const admin = await requireGrantAdmin();
  const config = getOriginalsServerConfig();
  const id = String(formData.get("id") || "");
  const type = String(formData.get("type") || "");
  const emailType = type === "acceptance" ? "acceptance" : "not_accepted";
  const submission = await getGrantSubmission(config, id);
  if (!submission) throw new Error("Application not found.");

  const templates = await listGrantEmailTemplates(config);
  const template = emailType === "acceptance" ? templates.accepted : templates.not_accepted;

  await sendGrantEmail({
    config,
    submission,
    emailType,
    subject: template.subject,
    body: template.body,
    adminEmail: admin.email,
    idempotencyKey: `individual-${emailType}-${id}`,
  });

  if (emailType === "acceptance" && submission.application_status !== "accepted") {
    await updateGrantSubmission(config, id, {
      application_status: "accepted",
      last_reviewed_by: admin.email,
      last_reviewed_at: new Date().toISOString(),
    });
  }

  if (emailType === "not_accepted" && submission.application_status !== "not_accepted") {
    await updateGrantSubmission(config, id, {
      application_status: "not_accepted",
      last_reviewed_by: admin.email,
      last_reviewed_at: new Date().toISOString(),
    });
  }

  revalidatePath("/admin/grant");
  revalidatePath(`/admin/grant/${id}`);
}

export async function saveGrantEmailTemplateAction(formData: FormData) {
  const admin = await requireGrantAdmin();
  const config = getOriginalsServerConfig();
  const id = String(formData.get("id") || "") as GrantEmailTemplate["id"];
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!["accepted", "not_accepted", "confirmation"].includes(id)) {
    throw new Error("Unknown email template.");
  }
  if (!subject || !body) throw new Error("Subject and body are required.");

  await saveGrantEmailTemplate(config, { id, subject, body }, admin.email);
  revalidatePath("/admin/grant/templates");
}

export async function logoutGrantAdminAction() {
  redirect("/admin/grant/logout");
}
