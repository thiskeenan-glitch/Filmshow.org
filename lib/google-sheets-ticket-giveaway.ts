import "server-only";

import { createSign } from "node:crypto";
import type { TicketGiveawayRecord } from "@/lib/supabase-ticket-giveaway";

const DEFAULT_SPREADSHEET_ID = "1nMLJ6T_OYftVQ498qYB9-iM2ucm--FzoMyvaCP7b160";
const SHEET_NAME = "GIVEAWAY";
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

function base64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function getGoogleSheetsConfig() {
  const spreadsheetId =
    process.env.GOOGLE_SHEETS_GIVEAWAY_SPREADSHEET_ID?.trim() ||
    DEFAULT_SPREADSHEET_ID;
  const serviceAccountEmail =
    process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  ).trim();

  if (!serviceAccountEmail || !privateKey) {
    throw new Error("Google Sheets sync is not configured yet.");
  }

  return { spreadsheetId, serviceAccountEmail, privateKey };
}

async function getAccessToken() {
  const { serviceAccountEmail, privateKey } = getGoogleSheetsConfig();
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(
    JSON.stringify({
      iss: serviceAccountEmail,
      scope: SHEETS_SCOPE,
      aud: TOKEN_ENDPOINT,
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsignedToken = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const assertion = `${unsignedToken}.${signer.sign(privateKey, "base64url")}`;

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });
  const payload = (await response.json()) as {
    access_token?: string;
    error_description?: string;
  };

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || "Google authentication failed.");
  }

  return payload.access_token;
}

export async function syncTicketGiveawayToGoogleSheet(
  record: TicketGiveawayRecord,
) {
  const { spreadsheetId } = getGoogleSheetsConfig();
  const accessToken = await getAccessToken();
  const headers = { Authorization: `Bearer ${accessToken}` };
  const idRange = encodeURIComponent(`'${SHEET_NAME}'!E2:E`);
  const existingResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${idRange}`,
    { headers, cache: "no-store" },
  );

  if (!existingResponse.ok) {
    throw new Error("The ticket giveaway sheet could not be checked.");
  }

  const existing = (await existingResponse.json()) as { values?: string[][] };
  if (existing.values?.some((row) => row[0] === record.id)) return;

  const appendRange = encodeURIComponent(`'${SHEET_NAME}'!A:H`);
  const appendResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${appendRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        majorDimension: "ROWS",
        values: [
          [
            record.created_at,
            record.name,
            record.email,
            "Poster QR",
            record.id,
            "",
            "",
            record.heard_about_us,
          ],
        ],
      }),
      cache: "no-store",
    },
  );

  if (!appendResponse.ok) {
    const detail = await appendResponse.text();
    throw new Error(
      `The ticket giveaway row could not be added to Google Sheets. ${detail.slice(0, 300)}`,
    );
  }
}
