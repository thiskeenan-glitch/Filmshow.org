import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getServerAuthConfig() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";

  if (!url || !key) {
    throw new Error("Supabase authentication is not configured.");
  }

  return { url, key };
}

export async function createSupabaseServerClient() {
  const { url, key } = getServerAuthConfig();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Session refresh is handled by proxy.ts when a Server Component
          // cannot write response cookies.
        }
      },
    },
  });
}
