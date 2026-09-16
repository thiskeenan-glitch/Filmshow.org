import "server-only";

import { createSign } from "node:crypto";

function encodeJson(value: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function muxPrivateKey() {
  const configured = process.env.MUX_SIGNING_PRIVATE_KEY?.trim() || "";
  if (!configured) throw new Error("Mux signing key is not configured.");

  if (configured.includes("BEGIN PRIVATE KEY")) {
    return configured.replace(/\\n/g, "\n");
  }

  return Buffer.from(configured, "base64").toString("utf8");
}

export function createMuxPlaybackUrl() {
  const playbackId = process.env.MUX_PLAYBACK_ID?.trim();
  const keyId = process.env.MUX_SIGNING_KEY_ID?.trim();
  if (!playbackId || !keyId) throw new Error("Mux playback is not configured.");

  const now = Math.floor(Date.now() / 1000);
  const header = encodeJson({ alg: "RS256", typ: "JWT", kid: keyId });
  const payload = encodeJson({
    sub: playbackId,
    aud: "v",
    exp: now + 6 * 60 * 60,
    kid: keyId,
  });
  const unsignedToken = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const token = `${unsignedToken}.${signer.sign(muxPrivateKey(), "base64url")}`;

  return `https://stream.mux.com/${encodeURIComponent(playbackId)}.m3u8?token=${encodeURIComponent(token)}`;
}

export function getEntitledStreamSource() {
  const provider = process.env.FILMSHOW_LIVE_STREAM_PROVIDER?.trim();

  if (provider === "mux") return createMuxPlaybackUrl();
  if (provider === "hls" && process.env.FILMSHOW_LIVE_HLS_URL) {
    return process.env.FILMSHOW_LIVE_HLS_URL;
  }

  return null;
}
