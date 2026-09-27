import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const require = createRequire(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "portfolio doc", "package.json"),
);
const puppeteer = require("puppeteer");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shotsDir = path.join(__dirname, "shots");
const mockups = path.join(__dirname, "..", "portfolio doc", "mockups");
const BASE = process.env.PORTFOLIO_BASE_URL ?? "https://escape-club.vercel.app";

fs.mkdirSync(shotsDir, { recursive: true });

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function copyIfExists(from, to) {
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, to);
    console.log("Copied", to);
  }
}

copyIfExists(path.join(mockups, "05-globe.png"), path.join(shotsDir, "desktop-globe.png"));

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox"],
});

const desktop = await browser.newPage();
await desktop.setViewport({ width: 1512, height: 982, deviceScaleFactor: 2 });
await desktop.goto(`${BASE}/dashboard/globe`, { waitUntil: "networkidle2", timeout: 120000 });
await delay(5500);
await desktop.screenshot({ path: path.join(shotsDir, "desktop-globe.png"), type: "png" });
console.log("Captured desktop-globe.png");

const email = `thumb.${Date.now()}@example.com`;
const regPage = await browser.newPage();
await regPage.goto(`${BASE}/join?mode=apply`, { waitUntil: "networkidle2" });
await regPage.evaluate(
  async ({ email, password, name }) => {
    await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
      credentials: "include",
    });
  },
  { email, password: "ThumbnailShot2026!", name: "Escape Club" },
);

const mobile = await browser.newPage();
await mobile.setUserAgent(
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
);
await mobile.setViewport({ width: 440, height: 956, deviceScaleFactor: 3, isMobile: true });
await mobile.goto(BASE, { waitUntil: "networkidle2", timeout: 120000 });
await mobile.evaluate(() => {
  let meta = document.querySelector('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "viewport");
    document.head.appendChild(meta);
  }
  meta.setAttribute(
    "content",
    "width=device-width, initial-scale=1, viewport-fit=cover",
  );
  document.documentElement.style.background = "#2e2910";
  const header = document.querySelector("header");
  if (header) header.style.paddingTop = "14px";
});
await delay(3200);
await mobile.screenshot({ path: path.join(shotsDir, "phone-landing.png"), type: "png" });
console.log("Captured phone-landing.png");

await browser.close();
