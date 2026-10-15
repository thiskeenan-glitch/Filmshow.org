import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = path.resolve("payhip-kit/output");
const previewDir = path.join(root, "previews");
await fs.mkdir(previewDir, { recursive: true });

const FONT = "Arial";
const INK = "#2D2438";
const CHEESE = "#F5B942";
const CREAM = "#FFF8E7";
const PALE = "#F7F3EC";
const GREEN = "#DDF3E4";
const RED = "#FCE4E4";
const BLUE = "#DDECF8";

function baseSheet(workbook, name, title, subtitle, lastCol) {
  const sheet = workbook.worksheets.add(name);
  sheet.showGridLines = false;
  sheet.tabColor = INK;
  sheet.getRange(`A2:${lastCol}2`).merge();
  sheet.getRange("A2").values = [[title]];
  sheet.getRange("A2").format = { font: { name: FONT, size: 16, bold: true, color: INK }, rowHeight: 25 };
  sheet.getRange(`A3:${lastCol}3`).merge();
  sheet.getRange("A3").values = [[subtitle]];
  sheet.getRange("A3").format = { font: { name: FONT, size: 10, italic: true, color: "#655B70" }, rowHeight: 20 };
  sheet.getRange(`A4:${lastCol}4`).format.borders = { bottom: { style: "medium", color: CHEESE } };
  sheet.getRange(`A1:${lastCol}60`).format.font = { name: FONT, size: 10, color: INK };
  sheet.getRange(`A1:${lastCol}60`).format.verticalAlignment = "center";
  return sheet;
}

function styleHeader(range) {
  range.format = {
    fill: INK,
    font: { name: FONT, size: 10, bold: true, color: "#FFFFFF" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    rowHeight: 30,
    wrapText: true,
    borders: { insideVertical: { style: "thin", color: "#FFFFFF" }, bottom: { style: "medium", color: CHEESE } },
  };
}

function styleKpis(sheet, ranges) {
  ranges.forEach((r) => {
    sheet.getRange(r).format = {
      fill: PALE,
      font: { name: FONT, size: 10, bold: true, color: INK },
      borders: { preset: "outside", style: "thin", color: "#D9D0C4" },
    };
  });
}

function styleTable(sheet, inputRange, fullRange) {
  sheet.getRange(fullRange).format.borders = { bottom: { style: "thin", color: "#E6E0D8" } };
  sheet.getRange(inputRange).format.fill = CREAM;
}

function addNote(sheet, range, text) {
  sheet.getRange(range).merge();
  sheet.getRange(range.split(":")[0]).values = [[text]];
  sheet.getRange(range.split(":")[0]).format = {
    fill: CREAM,
    font: { name: FONT, size: 10, italic: true, color: INK },
    wrapText: true,
    rowHeight: 38,
  };
}

async function exportWorkbook(workbook, filename, sheetName, range) {
  workbook.recalculate();
  const preview = await workbook.render({ sheetName, range, scale: 1.25, format: "png" });
  await fs.writeFile(path.join(previewDir, `${path.basename(filename, ".xlsx")}.png`), new Uint8Array(await preview.arrayBuffer()));
  const out = await SpreadsheetFile.exportXlsx(workbook);
  const filePath = path.join(root, filename);
  await out.save(filePath);
  return filePath;
}

async function buildSponsorPipeline() {
  const wb = Workbook.create();
  const s = baseSheet(wb, "Sponsor Pipeline", "Sponsor Pipeline", "Turn sponsor conversations into a visible forecast, payment plan and delivery checklist.", "M");

  s.getRange("A6:B6").values = [["Pipeline value", null]];
  s.getRange("D6:E6").values = [["Weighted forecast", null]];
  s.getRange("G6:H6").values = [["Contracted", null]];
  s.getRange("J6:K6").values = [["Outstanding", null]];
  s.getRange("B6").formulas = [["=SUM(D11:D35)"]];
  s.getRange("E6").formulas = [["=SUM(F11:F35)"]];
  s.getRange("H6").formulas = [["=SUMIFS(H11:H35,G11:G35,\"Yes\")"]];
  s.getRange("K6").formulas = [["=SUM(J11:J35)"]];
  styleKpis(s, ["A6:B6", "D6:E6", "G6:H6", "J6:K6"]);
  s.getRange("B6:K6").format.numberFormat = "$#,##0";

  s.getRange("A10:M10").values = [["Sponsor", "Contact", "Stage", "Package value", "Probability", "Weighted value", "Contracted?", "Invoice total", "Amount paid", "Outstanding", "Deliverables due", "Owner", "Notes"]];
  styleHeader(s.getRange("A10:M10"));
  styleTable(s, "A11:E35", "A11:M35");
  s.getRange("G11:I35").format.fill = CREAM;
  s.getRange("K11:M35").format.fill = CREAM;
  s.getRange("A11:M13").values = [
    ["Northstar Coffee", "Avery Chen", "Proposal", 5000, 0.5, null, "No", 0, 0, null, new Date("2026-11-20"), "Producer", "Fictional example — replace"],
    ["Harbor Audio", "Jordan Ellis", "Negotiation", 8500, 0.75, null, "No", 0, 0, null, new Date("2026-11-14"), "Producer", "Fictional example — replace"],
    ["Civic Arts Fund", "Morgan Lee", "Won", 12000, 1, null, "Yes", 12000, 6000, null, new Date("2026-12-01"), "Producer", "Fictional example — replace"],
  ];
  s.getRange("F11").formulas = [["=IF(OR(D11=\"\",E11=\"\"),\"\",D11*E11)"]];
  s.getRange("F11:F35").fillDown();
  s.getRange("J11").formulas = [["=IF(H11=\"\",\"\",MAX(0,H11-I11))"]];
  s.getRange("J11:J35").fillDown();
  s.getRange("C11:C35").dataValidation = { rule: { type: "list", values: ["Prospect", "Contacted", "Proposal", "Negotiation", "Won", "Lost"] } };
  s.getRange("G11:G35").dataValidation = { rule: { type: "list", values: ["No", "Yes"] } };
  s.getRange("D11:D35").format.numberFormat = "$#,##0";
  s.getRange("E11:E35").format.numberFormat = "0%";
  s.getRange("F11:J35").format.numberFormat = "$#,##0";
  s.getRange("K11:K35").format.numberFormat = "mm/dd/yy";
  s.getRange("C11:C35").conditionalFormats.addCustom("=$C11=\"Won\"", { fill: GREEN, font: { color: "#166534", bold: true } });
  s.getRange("C11:C35").conditionalFormats.addCustom("=$C11=\"Lost\"", { fill: RED, font: { color: "#991B1B" } });
  s.getRange("C11:C35").conditionalFormats.addCustom("=$C11=\"Negotiation\"", { fill: BLUE, font: { color: "#1E4E79", bold: true } });
  addNote(s, "A38:M38", "Quick start: replace the fictional examples, choose a stage and enter package value and probability. Weighted forecast and outstanding payment update automatically.");
  s.freezePanes.freezeRows(10);
  [20, 20, 14, 13, 11, 14, 12, 13, 13, 13, 15, 15, 24].forEach((w, i) => s.getRangeByIndexes(0, i, 40, 1).format.columnWidth = w);
  return exportWorkbook(wb, "sponsor-pipeline.xlsx", "Sponsor Pipeline", "A1:M38");
}

async function buildGuestList() {
  const wb = Workbook.create();
  const s = baseSheet(wb, "Guest List", "Guest List & Check-In", "Manage RSVPs, party size, accessibility needs and arrivals without an event-platform subscription.", "L");

  s.getRange("A6:B6").values = [["Invited guests", null]];
  s.getRange("D6:E6").values = [["Confirmed seats", null]];
  s.getRange("G6:H6").values = [["Checked in", null]];
  s.getRange("J6:K6").values = [["Capacity used", null]];
  s.getRange("B6").formulas = [["=COUNTIF(B11:B45,\"<>\")"]];
  s.getRange("E6").formulas = [["=SUMIFS(G11:G45,E11:E45,\"Yes\")"]];
  s.getRange("H6").formulas = [["=COUNTIF(H11:H45,\"Yes\")"]];
  s.getRange("K6").formulas = [["=IF(B8=0,\"n.a.\",E6/B8)"]];
  styleKpis(s, ["A6:B6", "D6:E6", "G6:H6", "J6:K6"]);
  s.getRange("A8:B8").values = [["Venue capacity", 150]];
  s.getRange("A8:B8").format = { fill: PALE, font: { name: FONT, size: 10, bold: true, color: INK }, borders: { preset: "outside", style: "thin", color: "#D9D0C4" } };
  s.getRange("B8").format.fill = CREAM;
  s.getRange("K6").format.numberFormat = "0.0%";

  s.getRange("A10:L10").values = [["Guest ID", "First name", "Last name", "Email", "RSVP yes?", "Plus ones", "Party size", "Checked in?", "Arrival time", "Dietary / accessibility", "Table / zone", "Notes"]];
  styleHeader(s.getRange("A10:L10"));
  styleTable(s, "A11:F45", "A11:L45");
  s.getRange("H11:L45").format.fill = CREAM;
  s.getRange("A11:L13").values = [
    ["G-001", "Avery", "Chen", "avery@example.com", "Yes", 1, null, "No", null, "Vegetarian", "A", "Fictional example — replace"],
    ["G-002", "Jordan", "Ellis", "jordan@example.com", "Yes", 0, null, "Yes", new Date("1899-12-30T18:42:00Z"), "Step-free access", "A", "Fictional example — replace"],
    ["G-003", "Morgan", "Lee", "morgan@example.com", "No", 0, null, "No", null, "", "Waitlist", "Fictional example — replace"],
  ];
  s.getRange("G11").formulas = [["=IF(B11=\"\",\"\",IF(E11=\"Yes\",1+F11,0))"]];
  s.getRange("G11:G45").fillDown();
  s.getRange("E11:E45").dataValidation = { rule: { type: "list", values: ["Pending", "Yes", "No", "Waitlist"] } };
  s.getRange("H11:H45").dataValidation = { rule: { type: "list", values: ["No", "Yes"] } };
  s.getRange("F11:G45").format.numberFormat = "0";
  s.getRange("I11:I45").format.numberFormat = "h:mm AM/PM";
  s.getRange("E11:E45").conditionalFormats.addCustom("=$E11=\"Yes\"", { fill: GREEN, font: { color: "#166534", bold: true } });
  s.getRange("E11:E45").conditionalFormats.addCustom("=$E11=\"No\"", { fill: RED, font: { color: "#991B1B" } });
  s.getRange("H11:H45").conditionalFormats.addCustom("=$H11=\"Yes\"", { fill: BLUE, font: { color: "#1E4E79", bold: true } });
  addNote(s, "A48:L48", "Quick start: set venue capacity, replace the fictional guests and update RSVP and check-in status. Confirmed seats and capacity used update automatically.");
  s.freezePanes.freezeRows(10);
  [11, 15, 15, 25, 12, 10, 11, 13, 14, 24, 14, 24].forEach((w, i) => s.getRangeByIndexes(0, i, 50, 1).format.columnWidth = w);
  return exportWorkbook(wb, "guest-list-check-in.xlsx", "Guest List", "A1:L48");
}

async function buildProductionBudget() {
  const wb = Workbook.create();
  const s = baseSheet(wb, "Production Budget", "Production Budget", "See budget, commitments, cash paid and variance before costs become surprises.", "K");

  s.getRange("A6:B6").values = [["Total budget", null]];
  s.getRange("D6:E6").values = [["Committed", null]];
  s.getRange("G6:H6").values = [["Actual paid", null]];
  s.getRange("J6:K6").values = [["Remaining", null]];
  s.getRange("B6").formulas = [["=SUM(D11:D40)"]];
  s.getRange("E6").formulas = [["=SUM(E11:E40)"]];
  s.getRange("H6").formulas = [["=SUM(F11:F40)"]];
  s.getRange("K6").formulas = [["=B6-H6"]];
  styleKpis(s, ["A6:B6", "D6:E6", "G6:H6", "J6:K6"]);
  s.getRange("B6:K6").format.numberFormat = "$#,##0";

  s.getRange("A10:K10").values = [["Category", "Line item", "Vendor", "Budget", "Committed", "Actual paid", "Variance", "Status", "Due date", "Payment ref", "Notes"]];
  styleHeader(s.getRange("A10:K10"));
  styleTable(s, "A11:F40", "A11:K40");
  s.getRange("H11:K40").format.fill = CREAM;
  s.getRange("A11:K15").values = [
    ["Venue", "Room rental", "Example venue", 3500, 3500, 1750, null, "Part Paid", new Date("2026-11-10"), "DEP-001", "Example row — replace"],
    ["Talent", "Featured artist", "Example artist", 2200, 2200, 0, null, "Contracted", new Date("2026-11-15"), "", "Example row — replace"],
    ["Production", "Audio package", "Example vendor", 1800, 1650, 0, null, "Quoted", new Date("2026-11-12"), "", "Example row — replace"],
    ["Staffing", "Event crew", "Example crew", 1200, 900, 0, null, "Quoted", new Date("2026-11-15"), "", "Example row — replace"],
    ["Marketing", "Paid media", "", 750, 0, 0, null, "Planned", new Date("2026-11-01"), "", "Example row — replace"],
  ];
  s.getRange("G11").formulas = [["=IF(D11=\"\",\"\",D11-F11)"]];
  s.getRange("G11:G40").fillDown();
  s.getRange("H11:H40").dataValidation = { rule: { type: "list", values: ["Planned", "Quoted", "Contracted", "Part Paid", "Paid", "At Risk"] } };
  s.getRange("D11:G40").format.numberFormat = "$#,##0";
  s.getRange("I11:I40").format.numberFormat = "mm/dd/yy";
  s.getRange("G11:G40").conditionalFormats.add("cellIs", { operator: "lessThan", formula: 0, format: { fill: RED, font: { color: "#991B1B", bold: true } } });
  s.getRange("H11:H40").conditionalFormats.addCustom("=$H11=\"Paid\"", { fill: GREEN, font: { color: "#166534", bold: true } });
  s.getRange("H11:H40").conditionalFormats.addCustom("=$H11=\"At Risk\"", { fill: RED, font: { color: "#991B1B", bold: true } });
  s.getRange("H11:H40").conditionalFormats.addCustom("=$H11=\"Part Paid\"", { fill: BLUE, font: { color: "#1E4E79", bold: true } });
  addNote(s, "A43:K43", "Quick start: replace the examples and enter budget, committed and actual amounts. Variance and remaining budget update automatically; negative variance flags overspend.");
  s.freezePanes.freezeRows(10);
  [15, 22, 20, 12, 12, 12, 12, 13, 13, 15, 24].forEach((w, i) => s.getRangeByIndexes(0, i, 45, 1).format.columnWidth = w);
  return exportWorkbook(wb, "production-budget.xlsx", "Production Budget", "A1:K43");
}

const files = [await buildSponsorPipeline(), await buildGuestList(), await buildProductionBudget()];

const copy = `SPONSOR PIPELINE — $19\nTrack sponsor prospects from first contact through proposal, contract, payment and deliverables. The workbook calculates weighted forecast and outstanding balances automatically.\n\nGUEST LIST & CHECK-IN — $15\nA clean RSVP and arrival desk for private events, screenings and live programs. Track party size, accessibility needs, zones and check-in status with automatic confirmed-seat and capacity calculations.\n\nPRODUCTION BUDGET — $24\nControl budget, commitments and cash paid in one practical production ledger. Remaining budget and line-level variance update automatically, with clear flags for risk and overspend.\n\nPRODUCER TOOLKIT BUNDLE — $45\nSponsor Pipeline, Guest List & Check-In and Production Budget together in one coordinated set.\n\nCOMPLETE CREATIVE OPERATIONS SUITE — $69\nAll six Cheese Maker tools: Booking Desk, Venue Margin, Runboard, Sponsor Pipeline, Guest List & Check-In and Production Budget.\n`;
await fs.writeFile(path.join(root, "payhip-expansion-listing-copy.txt"), copy, "utf8");

console.log(JSON.stringify({ root, files }, null, 2));
