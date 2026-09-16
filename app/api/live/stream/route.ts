import { isFilmshowLiveEnabled } from "@/lib/live/config";
import { connectLiveAudienceUser, getLiveViewerSnapshot } from "@/lib/live/data";
import { getEntitledStreamSource } from "@/lib/live/stream";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const limit = checkRateLimit(getRateLimitKey(request, "live-stream"), {
    limit: 20,
    windowMs: 5 * 60 * 1000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { message: "Too many stream requests. Please try again soon." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  if (!isFilmshowLiveEnabled()) {
    return NextResponse.json({ message: "Filmshow Live is not available." }, { status: 404 });
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) {
    return NextResponse.json({ message: "Sign in to watch Filmshow Live." }, { status: 401 });
  }

  await connectLiveAudienceUser(data.user).catch(() => {});
  const snapshot = await getLiveViewerSnapshot(data.user).catch(() => null);
  if (!snapshot?.event.is_enabled || !snapshot.entitlement) {
    return NextResponse.json({ message: "Livestream access is required." }, { status: 403 });
  }

  try {
    const src = getEntitledStreamSource();
    if (!src) {
      return NextResponse.json({ message: "The broadcast is not live yet." }, { status: 409 });
    }
    return NextResponse.json(
      { src },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch {
    return NextResponse.json({ message: "The stream could not be opened." }, { status: 503 });
  }
}
