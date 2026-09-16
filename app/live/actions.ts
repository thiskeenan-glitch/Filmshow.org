"use server";

import { isFilmshowLiveEnabled } from "@/lib/live/config";
import { connectLiveAudienceUser } from "@/lib/live/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type LiveAuthState = {
  status?: "sent" | "error";
  message?: string;
};

export async function sendLiveMagicLink(
  _state: LiveAuthState,
  formData: FormData,
): Promise<LiveAuthState> {
  if (!isFilmshowLiveEnabled()) {
    return { status: "error", message: "Filmshow Live is not on sale yet." };
  }

  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const requestHeaders = await headers();
  const forwardedHost =
    requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  const forwardedProtocol =
    requestHeaders.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "development" ? "http" : "https");
  const origin =
    requestHeaders.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (forwardedHost ? `${forwardedProtocol}://${forwardedHost}` : "");
  if (!origin) {
    return {
      status: "error",
      message: "We could not send that sign-in link. Please try again.",
    };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin.replace(/\/$/, "")}/auth/callback?next=/live`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return {
      status: "error",
      message: "We could not send that sign-in link. Please try again.",
    };
  }

  return {
    status: "sent",
    message: "Check your email. Your private sign-in link is on its way.",
  };
}

export async function signOutLive() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) await connectLiveAudienceUser(data.user).catch(() => {});
  await supabase.auth.signOut();
  redirect("/live");
}
