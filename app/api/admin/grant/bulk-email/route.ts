import { getGrantAdminUser } from "@/lib/admin-auth";
import {
  type GrantEmailType,
  getGrantSubmission,
} from "@/lib/grant-admin";
import { sendGrantEmail } from "@/lib/grant-email";
import { getOriginalsServerConfig } from "@/lib/originals-config";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type BulkEmailPayload = {
  ids?: string[];
  emailType?: "acceptance" | "not_accepted";
  subject?: string;
  body?: string;
  idempotencyKey?: string;
};

function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  const admin = await getGrantAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as BulkEmailPayload | null;
  const ids = Array.isArray(payload?.ids)
    ? Array.from(new Set(payload.ids.filter(Boolean)))
    : [];
  const emailType = payload?.emailType as GrantEmailType;
  const subject = String(payload?.subject || "").trim();
  const body = String(payload?.body || "").trim();
  const idempotencyKey = String(payload?.idempotencyKey || "").trim();

  if (!ids.length || !["acceptance", "not_accepted"].includes(emailType)) {
    return NextResponse.json({ message: "Choose recipients and an email type." }, { status: 400 });
  }

  if (!subject || !body || !idempotencyKey) {
    return NextResponse.json({ message: "Subject, body, and confirmation are required." }, { status: 400 });
  }

  if (ids.length > 50) {
    return NextResponse.json(
      { message: "Send in batches of 50 or fewer to avoid timeouts." },
      { status: 400 },
    );
  }

  const config = getOriginalsServerConfig();
  const results: Array<{ id: string; sent: boolean; skipped?: boolean; error?: string }> = [];

  for (const id of ids) {
    const submission = await getGrantSubmission(config, id);
    if (!submission) {
      results.push({ id, sent: false, skipped: true, error: "Application not found." });
      continue;
    }

    try {
      const result = await sendGrantEmail({
        config,
        submission,
        emailType,
        subject,
        body,
        adminEmail: admin.email,
        idempotencyKey: `${idempotencyKey}:${emailType}:${id}`,
      });

      results.push({ id, sent: result.sent, skipped: result.skipped });
    } catch (error) {
      results.push({
        id,
        sent: false,
        error: error instanceof Error ? error.message : "Email failed.",
      });
    }

    await pause(250);
  }

  return NextResponse.json({
    total: results.length,
    sent: results.filter((result) => result.sent).length,
    skipped: results.filter((result) => result.skipped).length,
    failed: results.filter((result) => result.error).length,
    results,
  });
}
