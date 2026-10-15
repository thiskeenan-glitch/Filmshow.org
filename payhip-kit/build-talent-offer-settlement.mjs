import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.resolve("payhip-kit/output");
const previewDir = path.join(outputDir, "previews");
await fs.mkdir(previewDir, {recursive: true});

const FONT = "Arial";
const INK = "#2D2438";
const CHEESE = "#F5B942";
const CREAM = "#FFF8E7";
const PAPER = "#F7F3EC";
const GREEN = "#DDF3E4";
const RED = "#FCE4E4";
const LINK = "#16803A";
const BLUE = "#1E4E79";

function title(sheet, text, subtitle, lastCol) {
  sheet.showGridLines = false;
  sheet.getRange(`A2:${lastCol}2`).merge();
  sheet.getRange("A2").values = [[text]];
  sheet.getRange("A2").format = {font: {name: FONT, size: 16, bold: true, color: INK}, rowHeight: 27};
  sheet.getRange(`A3:${lastCol}3`).merge();
  sheet.getRange("A3").values = [[subtitle]];
  sheet.getRange("A3").format = {font: {name: FONT, size: 10, italic: true, color: "#655B70"}, rowHeight: 20};
  sheet.getRange(`A4:${lastCol}4`).format.borders = {bottom: {style: "medium", color: CHEESE}};
}

function section(sheet, range, label) {
  sheet.getRange(range).merge();
  const anchor = range.split(":")[0];
  sheet.getRange(anchor).values = [[label]];
  sheet.getRange(anchor).format = {fill: INK, font: {name: FONT, size: 10, bold: true, color: "#FFFFFF"}, rowHeight: 25};
}

function tableHeader(range) {
  range.format = {
    fill: INK,
    font: {name: FONT, size: 10, bold: true, color: "#FFFFFF"},
    horizontalAlignment: "center",
    verticalAlignment: "center",
    rowHeight: 27,
    borders: {insideVertical: {style: "thin", color: "#FFFFFF"}, bottom: {style: "medium", color: CHEESE}},
  };
}

function metric(sheet, labelRange, valueRange, label, formula, format = '"$"#,##0;[Red]("$"#,##0);-') {
  sheet.getRange(labelRange).values = [[label]];
  sheet.getRange(valueRange).formulas = [[formula]];
  sheet.getRange(`${labelRange}:${valueRange}`).format = {fill: PAPER, font: {name: FONT, size: 10, bold: true, color: INK}, borders: {preset: "outside", style: "thin", color: "#D9D0C4"}};
  sheet.getRange(valueRange).format.numberFormat = format;
}

const workbook = Workbook.create();
const offer = workbook.worksheets.add("Offer");
const net = workbook.worksheets.add("Event Net");
offer.tabColor = INK;
net.tabColor = CHEESE;

title(offer, "Talent Offer", "A clean, agent-facing summary linked to the event economics model.", "H");
offer.getRange("A1:H42").format.font = {name: FONT, size: 10, color: INK};
offer.getRange("A1:H42").format.verticalAlignment = "center";

section(offer, "A6:H6", "EVENT");
offer.getRange("A8:A13").values = [["Artist"], ["Event"], ["Date"], ["Venue"], ["City"], ["Capacity"]];
[8, 9, 10, 11, 12, 13].forEach((row) => offer.getRange(`C${row}:F${row}`).merge());
offer.getRange("C8:C13").formulas = [["='Event Net'!B6"], ["='Event Net'!B7"], ["='Event Net'!B8"], ["='Event Net'!B9"], ["='Event Net'!B10"], ["='Event Net'!B11"]];
offer.getRange("C8:C13").format.font = {name: FONT, size: 10, bold: true, color: INK};
offer.getRange("C8:C13").format.borders = {bottom: {style: "thin", color: "#D9D0C4"}};
offer.getRange("C10").format.numberFormat = "mm/dd/yy";
offer.getRange("C13").format.numberFormat = "#,##0";

section(offer, "A16:H16", "DEAL TERMS");
offer.getRange("A18:A23").values = [["Deal type"], ["Guarantee"], ["Artist share"], ["Settlement basis"], ["Estimated artist payout"], ["Payment schedule"]];
[18, 19, 20, 21, 22, 23].forEach((row) => offer.getRange(`C${row}:F${row}`).merge());
offer.getRange("C18:C23").formulas = [["='Event Net'!B25"], ["='Event Net'!B26"], ["='Event Net'!B27"], ["=\"Net ticket revenue after taxes, venue share, and approved show costs\""], ["='Event Net'!H9"], ["=\"50% on signing; balance after settlement\""]];
offer.getRange("C18:C23").format.font = {name: FONT, size: 10, bold: true, color: INK};
offer.getRange("C18:C23").format.borders = {bottom: {style: "thin", color: "#D9D0C4"}};
offer.getRange("C19").format.numberFormat = '"$"#,##0';
offer.getRange("C20").format.numberFormat = "0%";
offer.getRange("C22").format.numberFormat = '"$"#,##0';

section(offer, "A26:H26", "CURRENT PROJECTION");
metric(offer, "A28", "B28", "Gross ticket sales", "='Event Net'!B14");
metric(offer, "D28", "E28", "Total show revenue", "='Event Net'!E14");
metric(offer, "G28", "H28", "Projected promoter net", "='Event Net'!H14");
offer.getRange("A31:H33").merge();
offer.getRange("A31").values = [["This offer is subject to contract, final ticket counts, documented expenses, taxes, and the settlement terms agreed by both parties. Replace all sample information before sharing."]];
offer.getRange("A31").format = {fill: CREAM, font: {name: FONT, size: 10, italic: true, color: INK}, wrapText: true, rowHeight: 42};
offer.getRange("A36:A38").values = [["Offered by"], ["Email"], ["Offer valid through"]];
[36, 37, 38].forEach((row) => offer.getRange(`C${row}:F${row}`).merge());
offer.getRange("C36:C38").formulas = [["='Event Net'!E6"], ["='Event Net'!E7"], ["='Event Net'!E8"]];
offer.getRange("C36:C38").format.borders = {bottom: {style: "thin", color: "#D9D0C4"}};
offer.getRange("C38").format.numberFormat = "mm/dd/yy";
["A8:A13", "A18:A23", "A36:A38"].forEach((range) => {
  offer.getRange(range).format.font = {name: FONT, size: 10, bold: true, color: INK};
  offer.getRange(range).format.verticalAlignment = "center";
});
offer.freezePanes.freezeRows(6);
[18, 15, 17, 17, 17, 17, 18, 17].forEach((width, index) => offer.getRangeByIndexes(0, index, 42, 1).format.columnWidth = width);

title(net, "Event Net", "Model ticket income, deal terms, operating costs, artist payout, and promoter net.", "H");
net.getRange("A1:H62").format.font = {name: FONT, size: 10, color: INK};
net.getRange("A1:H62").format.verticalAlignment = "center";
section(net, "A5:H5", "EVENT INPUTS");
net.getRange("A6:A11").values = [["Artist"], ["Event"], ["Date"], ["Venue"], ["City"], ["Capacity"]];
net.getRange("B6:B11").values = [["Example Artist"], ["Example Fall Show"], [new Date("2026-11-15T12:00:00Z")], ["Main Hall"], ["New York, NY"], [450]];
net.getRange("D6:D11").values = [["Promoter / buyer"], ["Contact email"], ["Offer valid through"], ["Tax rate"], ["Venue share"], ["Other revenue"]];
net.getRange("E6:E11").values = [["Example Producer"], ["producer@example.com"], [new Date("2026-10-20T12:00:00Z")], [.05], [.2], [1500]];
net.getRange("B6:B11").format.fill = CREAM;
net.getRange("E6:E11").format.fill = CREAM;
net.getRange("B8").format.numberFormat = "mm/dd/yy";
net.getRange("E8").format.numberFormat = "mm/dd/yy";
net.getRange("E9:E10").format.numberFormat = "0%";
net.getRange("E11").format.numberFormat = '"$"#,##0';

metric(net, "A14", "B14", "Gross ticket sales", "=SUM(F18:F22)");
metric(net, "D14", "E14", "Total show revenue", "=B14+E11");
metric(net, "G14", "H14", "Promoter net", "=E14-H9-E29-E41");
net.getRange("H14").conditionalFormats.add("cellIs", {operator: "lessThan", formula: 0, format: {fill: RED, font: {color: "#991B1B", bold: true}}});
net.getRange("H14").conditionalFormats.add("cellIs", {operator: "greaterThanOrEqual", formula: 0, format: {fill: GREEN, font: {color: "#166534", bold: true}}});

net.getRange("A17:F17").values = [["Ticket tier", "Price", "Inventory", "Comps", "Sales forecast", "Gross sales"]];
tableHeader(net.getRange("A17:F17"));
net.getRange("A18:E22").values = [
  ["General admission", 25, 250, 15, 200],
  ["Preferred", 40, 125, 5, 100],
  ["VIP", 65, 50, 0, 35],
  ["Door", 30, 25, 0, 10],
  ["Other", 0, 0, 0, 0]
];
net.getRange("A18:E22").format.fill = CREAM;
net.getRange("F18").formulas = [["=IF(OR(B18=\"\",E18=\"\"),\"\",B18*E18)"]];
net.getRange("F18:F22").fillDown();
net.getRange("B18:B22").format.numberFormat = '"$"#,##0';
net.getRange("C18:E22").format.numberFormat = "#,##0";
net.getRange("F18:F22").format.numberFormat = '"$"#,##0';
net.getRange("E18:E22").dataValidation = {rule: {type: "whole", operator: "between", formula1: 0, formula2: 100000}};

section(net, "A24:H24", "ARTIST DEAL");
net.getRange("A25:A29").values = [["Deal type"], ["Guarantee"], ["Artist share"], ["Backend basis"], ["Artist payout"]];
net.getRange("B25").values = [["Versus"]];
net.getRange("B26:B27").values = [[1800], [.8]];
net.getRange("B25:B27").format.fill = CREAM;
net.getRange("B25").dataValidation = {rule: {type: "list", values: ["Guarantee", "Versus"]}};
net.getRange("B26").format.numberFormat = '"$"#,##0';
net.getRange("B27").format.numberFormat = "0%";
net.getRange("B28").formulas = [["=MAX(0,B14-(B14*E9)-(B14*(1-E9)*E10)-E41)"]];
net.getRange("B29").formulas = [["=IF(B25=\"Versus\",MAX(B26,B28*B27),B26)"]];
net.getRange("B28:B29").format.numberFormat = '"$"#,##0;[Red]("$"#,##0);-';
net.getRange("B28:B29").format.font = {name: FONT, size: 10, color: LINK};
metric(net, "G6", "H6", "Ticket taxes", "=B14*E9");
metric(net, "G7", "H7", "Venue share", "=(B14-H6)*E10");
metric(net, "G8", "H8", "Operating costs", "=E41");
metric(net, "G9", "H9", "Artist payout", "=B29");

net.getRange("A32:E32").values = [["Cost category", "Vendor / detail", "Budget", "Actual", "Use in projection"]];
tableHeader(net.getRange("A32:E32"));
net.getRange("A33:D40").values = [
  ["Venue", "Room rental and house staff", 1200, null],
  ["Production", "Audio and lighting", 950, null],
  ["Labor", "Crew and security", 700, null],
  ["Marketing", "Creative and media", 350, null],
  ["Ticketing", "Platform and card fees", 500, null],
  ["Hospitality", "Artist hospitality", 250, null],
  ["Insurance", "Event coverage", 200, null],
  ["Other", "Contingency", 300, null]
];
net.getRange("A33:D40").format.fill = CREAM;
net.getRange("C33:D40").format.numberFormat = '"$"#,##0';
net.getRange("E33").formulas = [["=IF(D33=\"\",C33,D33)"]];
net.getRange("E33:E40").fillDown();
net.getRange("E33:E40").format.numberFormat = '"$"#,##0';
net.getRange("E33:E40").format.font = {name: FONT, size: 10, color: LINK};
net.getRange("A41:D41").merge();
net.getRange("A41").values = [["Total operating costs"]];
net.getRange("E41").formulas = [["=SUM(E33:E40)"]];
net.getRange("A41:E41").format = {fill: PAPER, font: {name: FONT, size: 10, bold: true, color: INK}, borders: {top: {style: "medium", color: CHEESE}}};
net.getRange("E41").format.numberFormat = '"$"#,##0';

section(net, "A44:H44", "SETTLEMENT");
net.getRange("A46:E46").values = [["Line", "Projected", "Actual", "Variance", "Notes"]];
tableHeader(net.getRange("A46:E46"));
net.getRange("A47:A53").values = [["Gross ticket sales"], ["Other revenue"], ["Ticket taxes"], ["Venue share"], ["Operating costs"], ["Artist payout"], ["Promoter net"]];
net.getRange("B47:B53").formulas = [["=B14"], ["=E11"], ["=H6"], ["=H7"], ["=H8"], ["=H9"], ["=H14"]];
net.getRange("C47:C52").format.fill = CREAM;
net.getRange("C53").formulas = [["=IF(COUNTA(C47:C52)<6,\"n.a.\",C47+C48-C49-C50-C51-C52)"]];
net.getRange("D47").formulas = [["=IF(C47=\"\",\"\",C47-B47)"]];
net.getRange("D47:D52").fillDown();
net.getRange("D53").formulas = [["=IF(C53=\"n.a.\",\"\",C53-B53)"]];
net.getRange("B47:D53").format.numberFormat = '"$"#,##0;[Red]("$"#,##0);-';
net.getRange("E47:E53").format.fill = CREAM;
net.getRange("A53:E53").format.font = {name: FONT, size: 10, bold: true, color: INK};
net.getRange("A53:E53").format.borders = {top: {style: "medium", color: CHEESE}};
net.getRange("A56:H58").merge();
net.getRange("A56").values = [["Quick start: replace the sample event information, ticket tiers, deal terms, and costs. Yellow cells are inputs. The Offer tab updates automatically. At settlement, enter all six actual amounts before relying on actual promoter net."]];
net.getRange("A56").format = {fill: CREAM, font: {name: FONT, size: 10, italic: true, color: INK}, wrapText: true, rowHeight: 44};
net.freezePanes.freezeRows(17);
[21, 28, 15, 15, 18, 15, 18, 18].forEach((width, index) => net.getRangeByIndexes(0, index, 62, 1).format.columnWidth = width);

workbook.recalculate();

const inspections = [];
for (const [sheetName, range] of [["Offer", "A1:H38"], ["Event Net", "A1:H58"]]) {
  const result = await workbook.inspect({kind: "table", range: `${sheetName}!${range}`, include: "values,formulas", tableMaxRows: 70, tableMaxCols: 10});
  inspections.push(result.ndjson);
  const preview = await workbook.render({sheetName, range, scale: 1.25, format: "png"});
  await fs.writeFile(path.join(previewDir, `talent-offer-settlement-${sheetName.toLowerCase().replaceAll(" ", "-")}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const errors = await workbook.inspect({kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!", options: {useRegex: true, maxResults: 300}, summary: "final formula error scan"});
if (errors.ndjson && !errors.ndjson.includes("matched 0 entries") && !errors.ndjson.includes('"matchCount":0') && !errors.ndjson.includes('"count":0')) {
  throw new Error(`Formula error scan returned matches:\n${errors.ndjson}`);
}

const file = await SpreadsheetFile.exportXlsx(workbook);
const outputPath = path.join(outputDir, "talent-offer-settlement.xlsx");
await file.save(outputPath);
await fs.writeFile(`${outputPath}.inspect.ndjson`, [...inspections, errors.ndjson].join("\n"));

const listing = `TALENT OFFER & EVENT SETTLEMENT — $29\nBuild a professional artist offer, model the event net, and settle the final deal from one auditable workbook. Track ticket tiers, taxes, venue share, approved show costs, guarantees, versus deals, projected artist payout, and final promoter net. The clean Offer tab stays linked to the working Event Net model, so updated assumptions flow into the agent-facing summary automatically. Delivered as an editable Excel workbook with sample data and quick-start guidance.\n`;
await fs.writeFile(path.join(outputDir, "talent-offer-settlement-listing-copy.txt"), listing);
await fs.writeFile(path.join(outputDir, "TALENT-OFFER-README.txt"), `CHEESE MAKER — TALENT OFFER & EVENT SETTLEMENT\n\n1. Open the Event Net tab and replace every yellow sample input.\n2. Enter ticket tiers, taxes, venue share, artist terms, and operating costs.\n3. Review the projected artist payout and promoter net.\n4. Open the Offer tab and confirm every term before sharing it.\n5. After the event, enter all six settlement actuals before relying on actual promoter net.\n\nKeep a clean master copy. This workbook supports deal planning and settlement; it is not legal, tax, or accounting advice.\n`);

console.log(JSON.stringify({outputPath, sheets: ["Offer", "Event Net"], formulaErrorScan: "passed"}, null, 2));
