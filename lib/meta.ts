export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";

export const IS_META_PIXEL_ENABLED = /^\d+$/.test(META_PIXEL_ID);
