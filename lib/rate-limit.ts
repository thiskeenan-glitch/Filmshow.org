import "server-only";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __filmshowRateLimit?: Map<string, RateLimitEntry>;
};

const buckets =
  globalForRateLimit.__filmshowRateLimit ??
  (globalForRateLimit.__filmshowRateLimit = new Map());

export function checkRateLimit(key: string, options: RateLimitOptions) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + options.windowMs;
    buckets.set(key, { count: 1, resetAt });

    return { allowed: true, remaining: options.limit - 1, retryAfter: 0 };
  }

  if (current.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  buckets.set(key, current);

  return {
    allowed: true,
    remaining: options.limit - current.count,
    retryAfter: Math.ceil((current.resetAt - now) / 1000),
  };
}

export function getRateLimitKey(request: Request, scope: string) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  return `${scope}:${ip}`;
}
