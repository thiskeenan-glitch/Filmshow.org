import assert from "node:assert/strict";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load("payhip-kit/output/talent-offer-settlement.xlsx"));
const net = workbook.worksheets.getItem("Event Net");
const offer = workbook.worksheets.getItem("Offer");

assert.equal(net.getRange("B14").values[0][0], 11575, "gross ticket sales should reconcile to ticket tiers");
assert.equal(net.getRange("E14").values[0][0], 13075, "total revenue should include other revenue");
assert.equal(Math.round(net.getRange("H14").values[0][0]), 5147, "promoter net should reconcile");
assert.equal(Math.round(offer.getRange("C22").values[0][0]), 3478, "offer should link to artist payout");

net.getRange("E18:E22").values = [[0], [0], [0], [0], [0]];
workbook.recalculate();
assert.equal(net.getRange("B14").values[0][0], 0, "zero sales should remain a real zero");
assert.equal(net.getRange("B29").values[0][0], 1800, "versus deal should preserve the guarantee when backend is lower");
assert.ok(net.getRange("H14").values[0][0] < 0, "a loss should remain visible rather than being hidden");

net.getRange("B25").values = [["Guarantee"]];
net.getRange("E18:E22").values = [[200], [100], [35], [10], [0]];
workbook.recalculate();
assert.equal(net.getRange("B29").values[0][0], 1800, "guarantee deal should not apply backend share");

console.log(JSON.stringify({reconciliation: "passed", boundaryChecks: ["zero sales", "guarantee floor", "loss visibility", "deal type switch"]}, null, 2));
