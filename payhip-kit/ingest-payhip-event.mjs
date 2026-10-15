import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const inputPath = process.argv[2];
if (!inputPath) throw new Error("Provide the path to a saved Payhip webhook JSON payload.");
if (!process.env.PAYHIP_API_KEY) throw new Error("PAYHIP_API_KEY is required to verify the webhook signature.");

const payload = JSON.parse(await fs.readFile(path.resolve(inputPath), "utf8"));
if (!['paid', 'refunded'].includes(payload.type)) throw new Error(`Unsupported Payhip event type: ${payload.type}`);
const expected = crypto.createHash("sha256").update(process.env.PAYHIP_API_KEY).digest("hex");
const received = String(payload.signature || "");
const valid = received.length === expected.length && crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
if (!valid) throw new Error("Payhip webhook signature verification failed.");

const event = {
  id: String(payload.id),
  type: payload.type,
  date: Number(payload.date),
  currency: String(payload.currency),
  price: Number(payload.price),
  items: (payload.items || []).map((item) => ({
    product_id: String(item.product_id || ""),
    product_name: String(item.product_name || ""),
    quantity: Number(item.quantity || 1),
  })),
};

const destination = path.join(here, "data", "revenue-events.json");
const events = JSON.parse(await fs.readFile(destination, "utf8"));
const existing = events.findIndex((candidate) => candidate.id === event.id && candidate.type === event.type);
if (existing >= 0) events[existing] = event;
else events.push(event);
events.sort((a, b) => a.date - b.date || a.id.localeCompare(b.id));
await fs.writeFile(destination, JSON.stringify(events, null, 2) + "\n");
console.log(JSON.stringify({ingested: event.id, type: event.type, storedEvents: events.length, personalDataStored: false}, null, 2));
