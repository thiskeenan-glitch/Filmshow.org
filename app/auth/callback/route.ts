import { connectLiveAudienceUser } from "@/lib/live/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/live";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/live?auth=invalid", url.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/live?auth=invalid", url.origin));
  }

  const { data } = await supabase.auth.getUser();
  if (data.user) {
    await connectLiveAudienceUser(data.user).catch(() => {});
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
