import "server-only";

import { ORIGINALS_SUBMISSIONS_OPEN } from "./originals";
import { SITE_URL } from "./seo";

export const SUPABASE_ORIGINALS_BUCKET =
  process.env.SUPABASE_ORIGINALS_BUCKET || "filmshow-originals-pitches";

const REQUIRED_ENV = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_ORIGINALS_PRICE_ID: process.env.STRIPE_ORIGINALS_PRICE_ID,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  ORIGINALS_NOTIFICATION_EMAIL: process.env.ORIGINALS_NOTIFICATION_EMAIL,
  EMAIL_FROM: process.env.EMAIL_FROM || process.env.ORIGINALS_EMAIL_FROM,
} as const;

export type OriginalsServerConfig = {
  siteUrl: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  supabaseBucket: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  stripeOriginalsPriceId: string;
  brevoApiKey: string;
  notificationEmail: string;
  emailFrom: string;
};

export function getMissingOriginalsConfig() {
  return Object.entries(REQUIRED_ENV)
    .filter(([, value]) => !value)
    .map(([key]) => key);
}

export function areOriginalsSubmissionsReady() {
  return ORIGINALS_SUBMISSIONS_OPEN && getMissingOriginalsConfig().length === 0;
}

export function getOriginalsServerConfig(): OriginalsServerConfig {
  const missing = getMissingOriginalsConfig();

  if (missing.length > 0) {
    throw new Error(`Missing Originals configuration: ${missing.join(", ")}`);
  }

  return {
    siteUrl: SITE_URL,
    supabaseUrl: REQUIRED_ENV.SUPABASE_URL!,
    supabaseServiceRoleKey: REQUIRED_ENV.SUPABASE_SERVICE_ROLE_KEY!,
    supabaseBucket: SUPABASE_ORIGINALS_BUCKET,
    stripeSecretKey: REQUIRED_ENV.STRIPE_SECRET_KEY!,
    stripeWebhookSecret: REQUIRED_ENV.STRIPE_WEBHOOK_SECRET!,
    stripeOriginalsPriceId: REQUIRED_ENV.STRIPE_ORIGINALS_PRICE_ID!,
    brevoApiKey: REQUIRED_ENV.BREVO_API_KEY!,
    notificationEmail: REQUIRED_ENV.ORIGINALS_NOTIFICATION_EMAIL!,
    emailFrom: REQUIRED_ENV.EMAIL_FROM!,
  };
}

export function getRequestOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) return origin;

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";

  if (host) return `${proto}://${host}`;

  return SITE_URL;
}
