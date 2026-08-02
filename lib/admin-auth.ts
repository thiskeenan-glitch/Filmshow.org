import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_ACCESS_COOKIE = "filmshow_admin_access";
const ADMIN_REFRESH_COOKIE = "filmshow_admin_refresh";
const ONE_WEEK = 60 * 60 * 24 * 7;

type SupabaseAuthUser = {
  id: string;
  email?: string;
};

type SupabaseAuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user?: SupabaseAuthUser;
};

export type GrantAdminUser = {
  id: string;
  email: string;
};

function getAdminEmails() {
  return (process.env.FILMSHOW_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getAuthConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const adminEmails = getAdminEmails();

  return {
    supabaseUrl,
    supabaseAnonKey,
    adminEmails,
    ready: Boolean(supabaseUrl && supabaseAnonKey && adminEmails.length),
  };
}

export function getAdminAuthStatus() {
  const config = getAuthConfig();
  const missing = [
    !config.supabaseUrl ? "SUPABASE_URL" : null,
    !config.supabaseAnonKey ? "SUPABASE_ANON_KEY" : null,
    !config.adminEmails.length ? "FILMSHOW_ADMIN_EMAILS" : null,
  ].filter((value): value is string => Boolean(value));

  return {
    ready: config.ready,
    missing,
  };
}

function isAllowedAdmin(email: string) {
  return getAdminEmails().includes(email.trim().toLowerCase());
}

function authEndpoint(path: string) {
  const { supabaseUrl } = getAuthConfig();
  if (!supabaseUrl) throw new Error("Missing SUPABASE_URL.");
  return `${supabaseUrl.replace(/\/$/, "")}${path}`;
}

function authHeaders(accessToken?: string) {
  const { supabaseAnonKey } = getAuthConfig();
  if (!supabaseAnonKey) throw new Error("Missing SUPABASE_ANON_KEY.");

  return {
    apikey: supabaseAnonKey,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

export async function signInGrantAdmin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const status = getAdminAuthStatus();
  if (!status.ready) {
    throw new Error(`Admin auth is missing: ${status.missing.join(", ")}`);
  }

  if (!isAllowedAdmin(email)) {
    throw new Error("This email is not approved for Filmshow Grant admin.");
  }

  const response = await fetch(authEndpoint("/auth/v1/token?grant_type=password"), {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | SupabaseAuthSession
    | { error_description?: string; msg?: string; message?: string }
    | null;

  if (!response.ok || !payload || !("access_token" in payload)) {
    const errorPayload = payload as
      | { error_description?: string; msg?: string; message?: string }
      | null;
    throw new Error(
      errorPayload?.error_description ||
        errorPayload?.message ||
        errorPayload?.msg ||
        "Unable to sign in.",
    );
  }

  const userEmail = payload.user?.email?.toLowerCase();
  if (!userEmail || !isAllowedAdmin(userEmail)) {
    throw new Error("This Supabase user is not approved for Filmshow Grant admin.");
  }

  return payload;
}

export async function setGrantAdminSession(session: SupabaseAuthSession) {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(ADMIN_ACCESS_COOKIE, session.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: session.expires_in || 60 * 60,
  });

  cookieStore.set(ADMIN_REFRESH_COOKIE, session.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: ONE_WEEK,
  });
}

export async function clearGrantAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_ACCESS_COOKIE);
  cookieStore.delete(ADMIN_REFRESH_COOKIE);
}

export async function getGrantAdminUser(): Promise<GrantAdminUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value;
  if (!accessToken) return null;

  try {
    const response = await fetch(authEndpoint("/auth/v1/user"), {
      headers: authHeaders(accessToken),
      cache: "no-store",
    });

    if (!response.ok) return null;

    const user = (await response.json()) as SupabaseAuthUser;
    const email = user.email?.toLowerCase();
    if (!user.id || !email || !isAllowedAdmin(email)) return null;

    return { id: user.id, email };
  } catch {
    return null;
  }
}

export async function requireGrantAdmin() {
  const user = await getGrantAdminUser();
  if (!user) redirect("/admin/grant/login");
  return user;
}
