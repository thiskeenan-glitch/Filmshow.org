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

function baseSheet(workbook, name, title, subtitle, lastCol = "M") {
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
    rowHeight: 28,
    borders: { insideVertical: { style: "thin", color: "#FFFFFF" }, bottom: { style: "medium", color: CHEESE } },
  };
}

function styleInput(range) {
  range.format.fill = CREAM;
}

function addStatusFormatting(range, colLetter, firstRow) {
  range.conditionalFormats.addCustom(`=$${colLetter}${firstRow}="Confirmed"`, { fill: GREEN, font: { color: "#166534", bold: true } });
  range.conditionalFormats.addCustom(`=$${colLetter}${firstRow}="At Risk"`, { fill: RED, font: { color: "#991B1B", bold: true } });
  range.conditionalFormats.addCustom(`=$${colLetter}${firstRow}="In Progress"`, { fill: BLUE, font: { color: "#1E4E79", bold: true } });
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

async function buildBookingDesk() {
  const wb = Workbook.create();
  const s = baseSheet(wb, "Booking Desk", "Booking Desk", "A lightweight pipeline for inquiries, confirmed work, deposits and balances.");

  s.getRange("A6:B6").values = [["Pipeline value", null]];
  s.getRange("D6:E6").values = [["Confirmed value", null]];
  s.getRange("G6:H6").values = [["Deposits due", null]];
  s.getRange("J6:K6").values = [["Open bookings", null]];
  s.getRange("B6").formulas = [["=SUM(G11:G35)"]];
  s.getRange("E6").formulas = [["=SUMIFS(G11:G35,F11:F35,\"Confirmed\")"]];
  s.getRange("H6").formulas = [["=SUM(I11:I35)"]];
  s.getRange("K6").formulas = [["=COUNTIFS(F11:F35,\"<>Complete\",A11:A35,\"<>\")"]];
  ["A6:B6", "D6:E6", "G6:H6", "J6:K6"].forEach((r) => {
    s.getRange(r).format = { fill: PALE, font: { name: FONT, size: 10, bold: true, color: INK }, borders: { preset: "outside", style: "thin", color: "#D9D0C4" } };
  });
  s.getRange("B6:E6").format.numberFormat = "$#,##0";
  s.getRange("H6").format.numberFormat = "$#,##0";

  const headers = [["Booking ID", "Event", "Client", "Event date", "Venue", "Status", "Value", "Deposit %", "Deposit due", "Balance due", "Owner", "Next action", "Notes"]];
  s.getRange("A10:M10").values = headers;
  styleHeader(s.getRange("A10:M10"));
  s.getRange("A11:M35").format.borders = { bottom: { style: "thin", color: "#E6E0D8" } };
  styleInput(s.getRange("A11:H35"));
  styleInput(s.getRange("K11:M35"));
  s.getRange("A11:M13").values = [
    ["BK-001", "Opening night", "Sample client", new Date("2026-11-12"), "Main Hall", "Confirmed", 4200, 0.5, null, null, "Keenan", "Send final schedule", "Example row - replace"],
    ["BK-002", "Workshop series", "Sample partner", new Date("2026-11-18"), "Studio B", "In Progress", 1800, 0.25, null, null, "Keenan", "Confirm headcount", "Example row - replace"],
    ["BK-003", "Private screening", "Sample guest", new Date("2026-12-05"), "Screening Room", "Inquiry", 950, 0.5, null, null, "Keenan", "Follow up Friday", "Example row - replace"],
  ];
  s.getRange("I11").formulas = [["=IF(OR(G11=\"\",H11=\"\"),\"\",G11*H11)"]];
  s.getRange("I11:I35").fillDown();
  s.getRange("J11").formulas = [["=IF(G11=\"\",\"\",G11-I11)"]];
  s.getRange("J11:J35").fillDown();
  s.getRange("F11:F35").dataValidation = { rule: { type: "list", values: ["Inquiry", "In Progress", "Confirmed", "At Risk", "Complete"] } };
  s.getRange("D11:D35").format.numberFormat = "mm/dd/yy";
  s.getRange("G11:G35").format.numberFormat = "$#,##0";
  s.getRange("H11:H35").format.numberFormat = "0%";
  s.getRange("I11:J35").format.numberFormat = "$#,##0";
  addStatusFormatting(s.getRange("F11:F35"), "F", 11);
  s.getRange("A38:M38").merge();
  s.getRange("A38").values = [["Quick start: replace the three example rows, choose a status, and enter value and deposit percentage. Deposit and balance amounts update automatically."]];
  s.getRange("A38").format = { fill: CREAM, font: { name: FONT, size: 10, italic: true, color: INK }, wrapText: true, rowHeight: 35 };
  s.freezePanes.freezeRows(10);
  const widths = [13, 22, 20, 13, 20, 14, 12, 11, 13, 13, 15, 22, 24];
  widths.forEach((w, i) => s.getRangeByIndexes(0, i, 40, 1).format.columnWidth = w);
  return exportWorkbook(wb, "booking-desk.xlsx", "Booking Desk", "A1:M38");
}

async function buildVenueMargin() {
  const wb = Workbook.create();
  const s = baseSheet(wb, "Venue Margin", "Venue Margin", "Plan event income, costs and contribution margin in one clean view.", "O");

  s.getRange("A6:B6").values = [["Total revenue", null]];
  s.getRange("D6:E6").values = [["Total cost", null]];
  s.getRange("G6:H6").values = [["Net margin", null]];
  s.getRange("J6:K6").values = [["Margin %", null]];
  s.getRange("B6").formulas = [["=SUM(L11:L30)"]];
  s.getRange("E6").formulas = [["=SUM(M11:M30)"]];
  s.getRange("H6").formulas = [["=SUM(N11:N30)"]];
  s.getRange("K6").formulas = [["=IF(B6=0,\"n.a.\",H6/B6)"]];
  ["A6:B6", "D6:E6", "G6:H6", "J6:K6"].forEach((r) => {
    s.getRange(r).format = { fill: PALE, font: { name: FONT, size: 10, bold: true, color: INK }, borders: { preset: "outside", style: "thin", color: "#D9D0C4" } };
  });
  s.getRange("B6:H6").format.numberFormat = "$#,##0";
  s.getRange("K6").format.numberFormat = "0.0%";

  s.getRange("A10:O10").values = [["Event", "Date", "Ticket revenue", "Sponsorship", "Bar share", "Staffing", "Talent", "Production", "Marketing", "Venue", "Other", "Total revenue", "Total cost", "Margin", "Margin %"]];
  styleHeader(s.getRange("A10:O10"));
  s.getRange("A11:O30").format.borders = { bottom: { style: "thin", color: "#E6E0D8" } };
  styleInput(s.getRange("A11:K30"));
  s.getRange("A11:K12").values = [
    ["Sample showcase", new Date("2026-11-15"), 6800, 1500, 500, 1200, 1800, 900, 350, 1000, 250],
    ["Sample workshop", new Date("2026-11-21"), 2400, 0, 200, 450, 600, 300, 125, 350, 75],
  ];
  s.getRange("L11").formulas = [["=IF(A11=\"\",\"\",SUM(C11:E11))"]];
  s.getRange("L11:L30").fillDown();
  s.getRange("M11").formulas = [["=IF(A11=\"\",\"\",SUM(F11:K11))"]];
  s.getRange("M11:M30").fillDown();
  s.getRange("N11").formulas = [["=IF(A11=\"\",\"\",L11-M11)"]];
  s.getRange("N11:N30").fillDown();
  s.getRange("O11").formulas = [["=IF(OR(A11=\"\",L11=0),\"n.a.\",N11/L11)"]];
  s.getRange("O11:O30").fillDown();
  s.getRange("B11:B30").format.numberFormat = "mm/dd/yy";
  s.getRange("C11:N30").format.numberFormat = "$#,##0";
  s.getRange("O11:O30").format.numberFormat = "0.0%";
  s.getRange("N11:N30").conditionalFormats.add("cellIs", { operator: "lessThan", formula: 0, format: { fill: RED, font: { color: "#991B1B", bold: true } } });
  s.getRange("N11:N30").conditionalFormats.add("cellIs", { operator: "greaterThan", formula: 0, format: { fill: GREEN, font: { color: "#166534", bold: true } } });
  s.getRange("A33:O33").merge();
  s.getRange("A33").values = [["Quick start: replace the sample events and enter expected income and costs. Revenue, cost, margin and margin percentage calculate automatically."]];
  s.getRange("A33").format = { fill: CREAM, font: { name: FONT, size: 10, italic: true, color: INK }, wrapText: true, rowHeight: 35 };
  s.freezePanes.freezeRows(10);
  const widths = [22, 12, 14, 13, 11, 11, 11, 12, 11, 11, 11, 14, 14, 14, 11];
  widths.forEach((w, i) => s.getRangeByIndexes(0, i, 35, 1).format.columnWidth = w);
  return exportWorkbook(wb, "venue-margin.xlsx", "Venue Margin", "A1:O33");
}

async function buildRunboard() {
  const wb = Workbook.create();
  const s = baseSheet(wb, "Runboard", "Runboard", "A live production schedule for timing, ownership, cues and completion status.", "K");

  s.getRange("A6:B6").values = [["Production date", new Date("2026-11-15")]];
  s.getRange("D6:E6").values = [["Venue", "Main Hall"]];
  s.getRange("G6:H6").values = [["Call time", new Date("1899-12-30T15:00:00Z")]];
  s.getRange("J6:K6").values = [["Calculated wrap", null]];
  s.getRange("K6").formulas = [["=IF(COUNTA(B11:B40)=0,\"\",MAX(C11:C40))"]];
  ["A6:B6", "D6:E6", "G6:H6", "J6:K6"].forEach((r) => {
    s.getRange(r).format = { fill: PALE, font: { name: FONT, size: 10, bold: true, color: INK }, borders: { preset: "outside", style: "thin", color: "#D9D0C4" } };
  });
  styleInput(s.getRange("B6"));
  styleInput(s.getRange("E6"));
  styleInput(s.getRange("H6"));
  s.getRange("B6").format.numberFormat = "mm/dd/yy";
  s.getRange("H6").format.numberFormat = "h:mm AM/PM";
  s.getRange("K6").format.numberFormat = "h:mm AM/PM";

  s.getRange("A10:K10").values = [["Line", "Start", "End", "Minutes", "Segment or task", "Department", "Owner", "Location", "Cue or dependency", "Status", "Notes"]];
  styleHeader(s.getRange("A10:K10"));
  s.getRange("A11:K40").format.borders = { bottom: { style: "thin", color: "#E6E0D8" } };
  styleInput(s.getRange("A11:B40"));
  styleInput(s.getRange("D11:K40"));
  s.getRange("A11:K15").values = [
    [1, new Date("1899-12-30T15:00:00Z"), null, 30, "Crew call and safety check", "Production", "Sample owner", "Loading dock", "Access confirmed", "Ready", "Example row - replace"],
    [2, new Date("1899-12-30T15:30:00Z"), null, 45, "Load-in and line check", "Audio", "Sample owner", "Main Hall", "Power live", "In Progress", "Example row - replace"],
    [3, new Date("1899-12-30T16:15:00Z"), null, 30, "Lighting focus", "Lighting", "Sample owner", "Main Hall", "Stage clear", "Not Started", "Example row - replace"],
    [4, new Date("1899-12-30T16:45:00Z"), null, 45, "Talent soundcheck", "Stage", "Sample owner", "Main Hall", "Audio ready", "Not Started", "Example row - replace"],
    [5, new Date("1899-12-30T17:30:00Z"), null, 30, "Doors and guest arrival", "Front of House", "Sample owner", "Lobby", "House ready", "Not Started", "Example row - replace"],
  ];
  s.getRange("C11").formulas = [["=IF(OR(B11=\"\",D11=\"\"),\"\",B11+D11/1440)"]];
  s.getRange("C11:C40").fillDown();
  s.getRange("J11:J40").dataValidation = { rule: { type: "list", values: ["Not Started", "Ready", "In Progress", "At Risk", "Complete"] } };
  s.getRange("A11:A40").format.numberFormat = "0";
  s.getRange("B11:C40").format.numberFormat = "h:mm AM/PM";
  s.getRange("D11:D40").format.numberFormat = "0";
  addStatusFormatting(s.getRange("J11:J40"), "J", 11);
  s.getRange("A43:K43").merge();
  s.getRange("A43").values = [["Quick start: set the production date, venue and call time. Add each task in order with a start time and duration. End time updates automatically."]];
  s.getRange("A43").format = { fill: CREAM, font: { name: FONT, size: 10, italic: true, color: INK }, wrapText: true, rowHeight: 35 };
  s.freezePanes.freezeRows(10);
  const widths = [8, 12, 12, 10, 26, 17, 17, 18, 23, 14, 24];
  widths.forEach((w, i) => s.getRangeByIndexes(0, i, 45, 1).format.columnWidth = w);
  return exportWorkbook(wb, "runboard.xlsx", "Runboard", "A1:K43");
}

const files = [];
files.push(await buildBookingDesk());
files.push(await buildVenueMargin());
files.push(await buildRunboard());

const manifest = `CHEESE MAKER — QUICK START\n\nBooking Desk\nTrack inquiries, confirmations, deposit amounts and outstanding balances.\n\nVenue Margin\nModel event income, operating costs and contribution margin.\n\nRunboard\nCoordinate production timing, owners, cues and status in a single live schedule.\n\nOpen each workbook in Excel, Numbers or a compatible spreadsheet app. Replace the example rows with your own information. The files contain formulas and dropdowns; keep a clean master copy before use.\n`;
await fs.writeFile(path.join(root, "README.txt"), manifest, "utf8");

const listingCopy = `BOOKING DESK — $19\nA clean booking pipeline for inquiries, confirmed work, deposits and balances. Track event dates, clients, venues, owners, next actions and payment timing without wrestling with a heavyweight CRM. Includes sample rows, dropdown status controls and automatic deposit and balance calculations. Delivered as an editable Excel workbook.\n\nVENUE MARGIN — $15\nA fast event economics calculator for venues, producers and creative teams. Enter ticket income, sponsorship and bar share alongside staffing, talent, production, marketing and venue costs. Total revenue, total cost, margin and margin percentage update automatically. Delivered as an editable Excel workbook.\n\nRUNBOARD — $19\nA practical production runboard for event days, shoots, screenings and live programs. Manage start times, durations, departments, owners, locations, cues and status from one clean schedule. End times and calculated wrap update automatically. Delivered as an editable Excel workbook.\n\nCREATIVE OPERATIONS BUNDLE — $39\nThe complete Cheese Maker operations set: Booking Desk, Venue Margin and Runboard. Plan the work, understand the margin and run the day from three coordinated Excel templates.\n`;
await fs.writeFile(path.join(root, "payhip-listing-copy.txt"), listingCopy, "utf8");

console.log(JSON.stringify({ root, files }, null, 2));
