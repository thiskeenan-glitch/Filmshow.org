import "server-only";

import { createSign } from "node:crypto";

const SPREADSHEET_ID = "1nMLJ6T_OYftVQ498qYB9-iM2ucm--FzoMyvaCP7b160";
const SHEET_NAME = "GIVEAWAY";
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const SERVICE_ACCOUNT_EMAIL = "filmshow-filmmaker-sync@filmshow-production.iam.gserviceaccount.com";

export type GiveawayEntry = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  source: string;
};

function base64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

async function getAccessToken() {
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  if (!privateKey) throw new Error("Google Sheets sync is not configured.");
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(JSON.stringify({ iss: SERVICE_ACCOUNT_EMAIL, scope: SHEETS_SCOPE, aud: TOKEN_ENDPOINT, iat: now, exp: now + 3600 }));
  const unsigned = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${signer.sign(privateKey, "base64url")}`;
  const response = await fetch(TOKEN_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }), cache: "no-store" });
  const data = (await response.json()) as { access_token?: string };
  if (!response.ok || !data.access_token) throw new Error("Google authentication failed.");
  return data.access_token;
}

export async function addGiveawayEntry(entry: GiveawayEntry) {
  const token = await getAccessToken();
  const headers = { Authorization: `Bearer ${token}` };
  const emailRange = encodeURIComponent(`'${SHEET_NAME}'!C2:C`);
  const existingResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${emailRange}`, { headers, cache: "no-store" });
  if (!existingResponse.ok) throw new Error("Could not check giveaway entries.");
  const existing = (await existingResponse.json()) as { values?: string[][] };
  if (existing.values?.some((row) => row[0]?.toLowerCase() === entry.email.toLowerCase())) return "duplicate" as const;

  const appendRange = encodeURIComponent(`'${SHEET_NAME}'!A:G`);
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${appendRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ majorDimension: "ROWS", values: [[entry.createdAt, entry.name, entry.email, entry.source, entry.id, "", ""]] }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not add giveaway entry.");
  return "created" as const;
}
