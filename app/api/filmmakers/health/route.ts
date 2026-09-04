import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const required = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "GOOGLE_SHEETS_SPREADSHEET_ID",
    "GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_SHEETS_PRIVATE_KEY",
  ] as const;

  const configured = Object.fromEntries(
    required.map((key) => [key, Boolean(process.env[key]?.trim())]),
  );

  return NextResponse.json({ configured });
}
