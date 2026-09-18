import { recordAudienceTouch } from "@/lib/audience";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanSourceContext(value: unknown) {
  const cleaned = cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
  return cleaned || null;
}

function invalid(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(getRateLimitKey(request, "audience-subscribe"), {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many attempts from here. Try again in a few minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      },
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return invalid("That signup did not come through cleanly. Try again.");
  }

  if (cleanText(payload.company)) {
    return invalid("That signup did not come through cleanly. Try again.");
  }

  const email = cleanText(payload.email).toLowerCase();
  const placement = cleanText(payload.placement) === "submit" ? "submit" : "footer";
  const sourceContext = cleanSourceContext(payload.source_context);

  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    return invalid("Add a valid email to join the list.");
  }

  const tags = ["newsletter", "website_signup"];
  if (sourceContext) tags.push(sourceContext);

  if (sourceContext?.startsWith("filmfreeway")) {
    tags.push("filmmaker", "filmfreeway_submitter", "filmshow_vol_1");
  }

  try {
    const result = await recordAudienceTouch({
      email,
      source: "website_signup",
      eventType: "marketing_subscribed",
      tags,
      marketingOptIn: true,
      consentSource: sourceContext || `website_${placement}`,
      dedupeKey: `website-subscribe:${email}:${sourceContext || placement}`,
      metadata: {
        placement,
        source_context: sourceContext,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        marketing_sync: result.marketingSynced === true ? "synced" : "pending",
      },
      { status: 201 },
    );
  } catch {
    console.error("audience_subscribe_failure", { stage: "storage" });
    return NextResponse.json(
      { message: "The list is unavailable right now. Please try again." },
      { status: 503 },
    );
  }
}
