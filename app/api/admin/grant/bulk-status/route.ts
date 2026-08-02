import { getGrantAdminUser } from "@/lib/admin-auth";
import {
  GRANT_APPLICATION_STATUSES,
  type GrantApplicationStatus,
  createGrantActivity,
  getGrantSubmission,
  updateGrantSubmission,
} from "@/lib/grant-admin";
import { getOriginalsServerConfig } from "@/lib/originals-config";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type BulkStatusPayload = {
  ids?: string[];
  status?: string;
};

export async function POST(request: Request) {
  const admin = await getGrantAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as BulkStatusPayload | null;
  const ids = Array.isArray(payload?.ids) ? payload.ids.filter(Boolean) : [];
  const status = payload?.status as GrantApplicationStatus;

  if (!ids.length || !GRANT_APPLICATION_STATUSES.includes(status)) {
    return NextResponse.json({ message: "Choose applications and a status." }, { status: 400 });
  }

  const config = getOriginalsServerConfig();

  for (const id of ids) {
    const existing = await getGrantSubmission(config, id);
    if (!existing) continue;

    await updateGrantSubmission(config, id, {
      application_status: status,
      last_reviewed_by: admin.email,
      last_reviewed_at: new Date().toISOString(),
    });

    await createGrantActivity(config, {
      submission_id: id,
      action: "bulk_status_update",
      from_status: existing.application_status,
      to_status: status,
      admin_email: admin.email,
    });
  }

  return NextResponse.json({ updated: ids.length });
}
