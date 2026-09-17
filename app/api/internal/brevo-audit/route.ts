import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview") {
    return NextResponse.json({ message: "Not available." }, { status: 404 });
  }

  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ configured: false, lists: [] });
  }

  const response = await fetch(
    "https://api.brevo.com/v3/contacts/lists?limit=50&offset=0&sort=desc",
    {
      headers: {
        accept: "application/json",
        "api-key": apiKey,
      },
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
