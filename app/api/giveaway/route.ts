import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { addGiveawayEntry } from "@/lib/google-sheets-giveaway";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(getRateLimitKey(request, "ticket-giveaway"), { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!rateLimit.allowed) return NextResponse.json({ message: "Give it a minute and try again." }, { status: 429 });

  let payload: Record<string, unknown>;
  try { payload = (await request.json()) as Record<string, unknown>; }
  catch { return NextResponse.json({ message: "Try that again." }, { status: 400 }); }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const source = typeof payload.source === "string" ? payload.source.trim().slice(0, 100) : "ticket-page";
  const company = typeof payload.company === "string" ? payload.company.trim() : "";
  if (company) return NextResponse.json({ message: "Try that again." }, { status: 400 });
  if (!name || name.length > 120) return NextResponse.json({ message: "Add your name." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) return NextResponse.json({ message: "Add a real email." }, { status: 400 });

  try {
    const result = await addGiveawayEntry({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), name, email, source });
    return NextResponse.json({ ok: true, duplicate: result === "duplicate" }, { status: result === "created" ? 201 : 200 });
  } catch {
    return NextResponse.json({ message: "Something broke. Try again." }, { status: 500 });
  }
}
