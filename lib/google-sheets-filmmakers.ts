import "server-only";

import { createSign } from "node:crypto";

export type SubtitleStatus =
  | "no_subtitles"
  | "burned_in_master"
  | "separate_subtitle_file";
export type FilmmakerAttendance = "hell_yes" | "no" | "trying_to_figure_it_out";

export type FilmmakerMaterialsRecord = {
  id: string;
  created_at: string;
  idempotency_key: string;
  film_title: string;
  director_names: string;
  key_crew?: string | null;
  email: string;
  runtime: string;
  synopsis: string;
  master_link: string;
  subtitle_status: SubtitleStatus;
  subtitle_link: string | null;
  materials_link: string;
  social_handles: string;
  attendance: FilmmakerAttendance;
  additional_attendees: string | null;
  filmmaker_video_url: string | null;
  show_day_contact: string;
  notes: string | null;
  pass_holder_one?: string;
  pass_holder_two?: string;
  prize_representative?: string;
};

const SHEET_NAME = "FILMMAKER MASTER";
const SHEET_HEADERS = [
  "Timestamp", "Film", "Director", "Email", "Runtime", "Synopsis",
  "Master Link", "Subtitle Status", "Subtitle Link", "Materials Link",
  "Social Handles", "Director Attending", "Additional Attendees",
  "Filmmaker Video", "Show-Day Contact", "Notes", "Submission ID",
  "Pass 1", "Pass 2", "Prize Representative", "Key Crew",
] as const;
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const SERVICE_ACCOUNT_EMAIL =
  "filmshow-filmmaker-sync@filmshow-production.iam.gserviceaccount.com";

function base64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function getGoogleSheetsConfig() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();

  if (!spreadsheetId || !privateKey) {
    throw new Error("Google Sheets sync is not configured yet.");
  }

  return {
    spreadsheetId,
    serviceAccountEmail: SERVICE_ACCOUNT_EMAIL,
    privateKey,
  };
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

function subtitleLabel(record: FilmmakerMaterialsRecord) {
  return {
    no_subtitles: "No subtitles",
    burned_in_master: "Burned into the master",
    separate_subtitle_file: "Separate subtitle file",
  }[record.subtitle_status];
}

function attendanceLabel(record: FilmmakerMaterialsRecord) {
  return {
    hell_yes: "HELL YES",
    no: "NO",
    trying_to_figure_it_out: "TRYING TO FIGURE IT OUT",
  }[record.attendance];
}

async function getVerifiedSheetId(
  spreadsheetId: string,
  headers: { Authorization: string },
) {
  const range = encodeURIComponent(`'${SHEET_NAME}'!A1:U1`);
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?ranges=${range}&fields=sheets(properties(sheetId,title),data(rowData(values(formattedValue))))`,
    { headers, cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error("The filmmaker master sheet header could not be checked.");
  }

  const payload = (await response.json()) as {
    sheets?: Array<{
      properties?: { sheetId?: number; title?: string };
      data?: Array<{ rowData?: Array<{ values?: Array<{ formattedValue?: string }> }> }>;
    }>;
  };
  const sheet = payload.sheets?.find((item) => item.properties?.title === SHEET_NAME);
  const sheetId = sheet?.properties?.sheetId;
  const cells = sheet?.data?.[0]?.rowData?.[0]?.values;
  if (
    sheetId === undefined ||
    SHEET_HEADERS.some((header, index) => cells?.[index]?.formattedValue !== header)
  ) {
    throw new Error("The filmmaker master sheet columns do not match the submission fields.");
  }
  return sheetId;
}

export async function syncFilmmakerToGoogleSheet(record: FilmmakerMaterialsRecord) {
  const { spreadsheetId } = getGoogleSheetsConfig();
  const accessToken = await getAccessToken();
  const headers = { Authorization: `Bearer ${accessToken}` };
  const sheetId = await getVerifiedSheetId(spreadsheetId, headers);
  const idRange = encodeURIComponent(`'${SHEET_NAME}'!Q2:Q`);
  const existingResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${idRange}`,
    { headers, cache: "no-store" },
  );

  if (!existingResponse.ok) {
    throw new Error("The filmmaker master sheet could not be checked.");
  }

  const existing = (await existingResponse.json()) as { values?: string[][] };
  if (existing.values?.some((row) => row[0] === record.id)) return;

  // values.append guesses a logical table and can start at column B when
  // optional cells are blank. appendCells always starts at column A and does
  // not insert rows that shift the separate tracker's formula references.
  const appendResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [{ appendCells: {
          sheetId,
          fields: "userEnteredValue",
          rows: [{ values: [
            record.created_at,
            record.film_title,
            record.director_names,
            record.email,
            record.runtime,
            record.synopsis,
            record.master_link,
            subtitleLabel(record),
            record.subtitle_link ?? "",
            record.materials_link,
            record.social_handles,
            attendanceLabel(record),
            record.additional_attendees ?? "",
            record.filmmaker_video_url ?? "",
            record.show_day_contact,
            record.notes ?? "",
            record.id,
            record.pass_holder_one ?? "",
            record.pass_holder_two ?? "",
            record.prize_representative ?? "",
            record.key_crew ?? "",
          ].map((value) => ({ userEnteredValue: { stringValue: value } })) }],
        } }],
      }),
      cache: "no-store",
    },
  );

  if (!appendResponse.ok) {
    const detail = await appendResponse.text();
    throw new Error(
      `The filmmaker row could not be added to Google Sheets. ${detail.slice(0, 300)}`,
    );
  }
}
