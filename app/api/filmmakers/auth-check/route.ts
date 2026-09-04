import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const secret =
    process.env.FILMMAKER_SYNC_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim();

  if (!secret) {
    console.log("FILMMAKER_SYNC_SECRET_PRESENT:false");
    return NextResponse.json({ present: false });
  }

  const fingerprint = createHash("sha256").update(secret).digest("hex");
  console.log(`FILMMAKER_SYNC_SECRET_PRESENT:true HASH:${fingerprint}`);
  return NextResponse.json({ present: true });
}
