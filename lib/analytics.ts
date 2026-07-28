export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";

const isProductionDeployment =
  process.env.NODE_ENV === "production" &&
  (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production");

export const IS_GA_ENABLED =
  isProductionDeployment && Boolean(GA_MEASUREMENT_ID);
