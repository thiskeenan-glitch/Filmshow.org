// Run with: node --test scripts/filmmaker-sheet-regression.mjs (Node 24).
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";

const source = readFileSync(new URL("../lib/google-sheets-filmmakers.ts", import.meta.url), "utf8");
const syncUrl = `data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source.replace('import "server-only";', ""))).toString("base64")}`;
const routeSource = readFileSync(new URL("../app/api/filmmakers/route.ts", import.meta.url), "utf8")
  .replace('import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";', 'const checkRateLimit = () => ({ allowed: true }); const getRateLimitKey = () => "test";')
  .replace('"@/lib/google-sheets-filmmakers"', JSON.stringify(syncUrl))
  .replace('import { NextResponse } from "next/server";', 'const NextResponse = { json: (body, init) => new Response(JSON.stringify(body), init) };');
const { POST } = await import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(routeSource)).toString("base64")}`);
const headers = ["Timestamp", "Film", "Director", "Email", "Runtime", "Synopsis", "Master Link", "Subtitle Status", "Subtitle Link", "Materials Link", "Social Handles", "Director Attending", "Additional Attendees", "Filmmaker Video", "Show-Day Contact", "Notes", "Submission ID", "Pass 1", "Pass 2", "Prize Representative", "Key Crew"];
const payload = {
  idempotency_key: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
  film_title: "=A1 (literal film title)", director_names: "Director One & Director Two",
  email: "film@example.com", key_crew: "Producer: One\nSound: Two",
  synopsis: "A sentence, with punctuation.", master_link: "https://example.com/master?download=1",
  subtitle_status: "burned_in_master", materials_link: "https://example.com/stills",
  social_handles: "@director, @film", attendance: "trying_to_figure_it_out",
  prize_representative: "Different Representative", filmmaker_video_url: "https://example.com/video",
  show_day_contact: "Contact +1 (212) 555-0100", notes: "=1+1\nKeep this literal.", company: "",
};

test("filmmaker API preserves every answer and anchors sheet writes", async (t) => {
  const originalFetch = globalThis.fetch;
  const oldId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const oldKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID = "test-sheet";
  process.env.GOOGLE_SHEETS_PRIVATE_KEY = generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey.export({ type: "pkcs8", format: "pem" });
  let writes = [], duplicate = false, wrongHeader = false, failedWrite = false;
  globalThis.fetch = async (url, init = {}) => {
    const address = String(url);
    if (address === "https://oauth2.googleapis.com/token") return Response.json({ access_token: "test" });
    if (address.includes("?ranges=")) return Response.json({ sheets: [{ properties: { title: "FILMMAKER MASTER", sheetId: 42 }, data: [{ rowData: [{ values: headers.map((h, i) => ({ formattedValue: wrongHeader && i === 2 ? "Email" : h })) }] }] }] });
    if (decodeURIComponent(address).endsWith("!Q2:Q")) return Response.json({ values: duplicate ? [[payload.idempotency_key]] : [] });
    assert.ok(address.endsWith(":batchUpdate"), "must not use inferred-table values.append");
    const body = JSON.parse(init.body);
    writes.push(body);
    return failedWrite ? new Response("write failed", { status: 500 }) : Response.json({ replies: [{}] });
  };
  const submit = (body = payload) => POST(new Request("https://example.com/api/filmmakers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
  const row = () => writes.at(-1).requests[0].appendCells;
  try {
    await t.test("all 14 form fields, independent crew and representative, and literal text", async () => {
      assert.equal((await submit()).status, 201);
      assert.equal(row().sheetId, 42);
      assert.equal(row().fields, "userEnteredValue");
      const cells = row().rows[0].values;
      assert.equal(cells.length, 21);
      assert.ok(cells.every(c => Object.keys(c.userEnteredValue).join() === "stringValue"));
      assert.ok(!Number.isNaN(Date.parse(cells[0].userEnteredValue.stringValue)));
      assert.deepEqual(cells.slice(1).map(c => c.userEnteredValue.stringValue), [payload.film_title, payload.director_names, payload.email, "", payload.synopsis, payload.master_link, "Burned into the master", "", payload.materials_link, payload.social_handles, "TRYING TO FIGURE IT OUT", "", payload.filmmaker_video_url, payload.show_day_contact, payload.notes, payload.idempotency_key, "", "", payload.prize_representative, payload.key_crew]);
    });
    await t.test("optional blanks never shift fields; subtitle and attendance choices survive", async () => {
      for (const [attendance, label] of [["hell_yes", "HELL YES"], ["no", "NO"]]) {
        assert.equal((await submit({ ...payload, attendance, subtitle_status: "no_subtitles", key_crew: "", filmmaker_video_url: "", notes: "" })).status, 201);
        const values = row().rows[0].values.map(c => c.userEnteredValue.stringValue);
        assert.equal(values[7], "No subtitles"); assert.equal(values[11], label);
        assert.equal(values[13], ""); assert.equal(values[15], ""); assert.equal(values[20], "");
        assert.equal(values[19], payload.prize_representative);
      }
    });
    await t.test("sequential retry does not append a duplicate", async () => {
      duplicate = true; const count = writes.length;
      assert.equal((await submit()).status, 201); assert.equal(writes.length, count); duplicate = false;
    });
    await t.test("mismatched headers stop the write", async () => {
      wrongHeader = true; const count = writes.length;
      assert.equal((await submit()).status, 500); assert.equal(writes.length, count); wrongHeader = false;
    });
    await t.test("failed sheet writes do not claim success", async () => {
      failedWrite = true; assert.equal((await submit()).status, 500);
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (oldId === undefined) delete process.env.GOOGLE_SHEETS_SPREADSHEET_ID; else process.env.GOOGLE_SHEETS_SPREADSHEET_ID = oldId;
    if (oldKey === undefined) delete process.env.GOOGLE_SHEETS_PRIVATE_KEY; else process.env.GOOGLE_SHEETS_PRIVATE_KEY = oldKey;
  }
});
