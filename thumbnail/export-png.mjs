import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "portfolio doc", "package.json"),
);
const puppeteer = require("puppeteer");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, "index.html");
const pngPath = path.join(__dirname, "Escape-Club-Thumbnail.png");
const fileUrl = "file:///" + htmlPath.replace(/\\/g, "/");

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--allow-file-access-from-files"],
});
const page = await browser.newPage();
await page.setViewport({ width: 2000, height: 1500, deviceScaleFactor: 1 });
await page.goto(fileUrl, { waitUntil: "networkidle0", timeout: 120000 });
await page.evaluate(async () => {
  const imgs = document.querySelectorAll(".phone-screen img, .imac-screen img");
  await Promise.all(
    [...imgs].map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });
    }),
  );
});
await page.screenshot({
  path: pngPath,
  type: "png",
  clip: { x: 0, y: 0, width: 2000, height: 1500 },
});
await browser.close();
console.log("PNG written:", pngPath);
