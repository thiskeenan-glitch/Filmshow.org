export const DEFAULT_GA_MEASUREMENT_ID = "G-NPX863DEQL";

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || DEFAULT_GA_MEASUREMENT_ID;

export const IS_GA_ENABLED =
  process.env.NODE_ENV === "production" && Boolean(GA_MEASUREMENT_ID);
