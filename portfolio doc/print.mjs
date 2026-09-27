import puppeteer from "puppeteer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, "Escape-Club-Product-Case-Study.html");
const pdfPath = path.join(__dirname, "Escape-Club-Product-Case-Study.pdf");
const fileUrl = "file:///" + htmlPath.replace(/\\/g, "/");

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--allow-file-access-from-files"],
});
const page = await browser.newPage();
await page.goto(fileUrl, { waitUntil: "networkidle0", timeout: 120000 });
await page.emulateMediaType("print");
await page.pdf({
  path: pdfPath,
  format: "A4",
  landscape: true,
  printBackground: true,
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
  preferCSSPageSize: true,
});
await browser.close();
console.log("PDF written:", pdfPath);
