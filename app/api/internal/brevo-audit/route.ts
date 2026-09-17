import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPECTED_TOKEN_HASH =
  "6422ed17860be6db000b7503e8d4bfa580e4081a5ae1b6ff37d8d295dbb1113d";

function authorized(token: string | null) {
  if (!token) return false;
  const actual = Buffer.from(createHash("sha256").update(token).digest("hex"));
  const expected = Buffer.from(EXPECTED_TOKEN_HASH);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function GET(request: Request) {
  if (process.env.VERCEL_ENV !== "production") {
    return NextResponse.json({ message: "Not available." }, { status: 404 });
  }

  const url = new URL(request.url);
  if (!authorized(url.searchParams.get("token"))) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ configured: false, lists: [] });
  }

  const response = await fetch(
    "https://api.brevo.com/v3/contacts/lists?limit=50&offset=0&sort=desc",
    {
      headers: { accept: "application/json", "api-key": apiKey },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { configured: true, upstream_status: response.status, lists: [] },
      { status: 502 },
    );
  }

  const payload = (await response.json()) as {
    count?: number;
    lists?: Array<{
      id: number;
      name: string;
      folderId?: number;
      totalSubscribers?: number;
      uniqueSubscribers?: number;
      totalBlacklisted?: number;
    }>;
  };

  return NextResponse.json({
    configured: true,
    count: payload.count ?? 0,
    lists: (payload.lists ?? []).map((list) => ({
      id: list.id,
      name: list.name,
      folderId: list.folderId ?? null,
      totalSubscribers: list.totalSubscribers ?? null,
      uniqueSubscribers: list.uniqueSubscribers ?? null,
      totalBlacklisted: list.totalBlacklisted ?? null,
    })),
  });
}
