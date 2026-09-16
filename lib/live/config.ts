import "server-only";

export const LIVE_EVENT_SLUG =
  process.env.FILMSHOW_LIVE_EVENT_SLUG?.trim() || "vol-1";
export const LIVE_EVENT_TITLE = "FILMSHOW VOL. 1";
export const LIVE_EVENT_SUBTITLE = "LIVE FROM BROOKLYN";
export const LIVE_EVENT_START = "2026-10-03T19:00:00-04:00";
export const LIVE_EVENT_DATE_LABEL = "October 3, 2026";
export const LIVE_ENTITLEMENT_KEY = "filmshow_vol_1_live";
export const LIVE_PRICE_CENTS = 800;
export const LIVE_CURRENCY = "usd";

export function isFilmshowLiveEnabled() {
  return process.env.FILMSHOW_LIVE_ENABLED === "true";
}

export function getLiveConfigStatus() {
  const missing = [
    !process.env.SUPABASE_URL ? "SUPABASE_URL" : null,
    !(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
      ? "SUPABASE_SECRET_KEY"
      : null,
    !process.env.NEXT_PUBLIC_SUPABASE_URL ? "NEXT_PUBLIC_SUPABASE_URL" : null,
    !(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
      ? "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
      : null,
  ].filter((value): value is string => Boolean(value));

  return { ready: missing.length === 0, missing };
}

export function getLiveCheckoutStatus() {
  const missing = [
    !process.env.STRIPE_SECRET_KEY ? "STRIPE_SECRET_KEY" : null,
    !process.env.STRIPE_LIVE_PRICE_ID ? "STRIPE_LIVE_PRICE_ID" : null,
    !process.env.STRIPE_LIVE_WEBHOOK_SECRET
      ? "STRIPE_LIVE_WEBHOOK_SECRET"
      : null,
  ].filter((value): value is string => Boolean(value));

  return { ready: missing.length === 0, missing };
}

export function getLiveStreamConfig() {
  const provider = process.env.FILMSHOW_LIVE_STREAM_PROVIDER?.trim() || "none";

  if (provider === "hls" && process.env.FILMSHOW_LIVE_HLS_URL) {
    return {
      provider: "hls" as const,
      configured: true,
    };
  }

  if (
    provider === "mux" &&
    process.env.MUX_PLAYBACK_ID &&
    process.env.MUX_SIGNING_KEY_ID &&
    process.env.MUX_SIGNING_PRIVATE_KEY
  ) {
    return { provider: "mux" as const, configured: true };
  }

  return { provider: "none" as const, configured: false };
}
