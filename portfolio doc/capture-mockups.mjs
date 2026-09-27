import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "mockups");
const BASE = process.env.PORTFOLIO_BASE_URL ?? "https://escape-club.vercel.app";
/** MacBook Pro class desktop viewport (M-series). */
const VIEW = { width: 1512, height: 982, deviceScaleFactor: 2 };
/** iPhone 18 Pro Max class viewport (440×956 logical @3x). */
const PHONE = {
  width: 440,
  height: 956,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

fs.mkdirSync(outDir, { recursive: true });
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(page, name) {
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, type: "png" });
  console.log("Saved", file);
}

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage();
await page.setViewport(VIEW);

await page.goto(BASE, { waitUntil: "networkidle2", timeout: 120000 });
await delay(3000);
await shot(page, "01-landing-hero");

await page.evaluate(() =>
  document.querySelector("#destinations")?.scrollIntoView({ behavior: "instant", block: "start" }),
);
await delay(2000);
await shot(page, "02-destinations");

await page.goto(`${BASE}/join?mode=apply`, { waitUntil: "networkidle2", timeout: 120000 });
await delay(2000);
await shot(page, "03-join");

const email = `portfolio.capture.${Date.now()}@example.com`;
const password = "PortfolioCapture2026!";
await page.evaluate(
  async ({ email, password, name }) => {
    await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
      credentials: "include",
    });
  },
  { email, password, name: "Mira Halvorsen" },
);

await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle2", timeout: 120000 });
await delay(4500);
await shot(page, "04-dashboard");

await page.goto(`${BASE}/dashboard/globe`, { waitUntil: "networkidle2", timeout: 120000 });
await delay(6000);
await shot(page, "05-globe");

await page.goto(`${BASE}/dashboard/itinerary`, { waitUntil: "networkidle2", timeout: 120000 });
await delay(3500);
await shot(page, "06-itinerary");

const mobile = await browser.newPage();
await mobile.setUserAgent(
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
);
await mobile.setViewport(PHONE);

async function prepMobilePage() {
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
}

async function mobileShot(url, name, after) {
  await mobile.goto(url, { waitUntil: "networkidle2", timeout: 120000 });
  await prepMobilePage();
  if (after) await after();
  await delay(3200);
  const file = path.join(outDir, `${name}.png`);
  await mobile.screenshot({ path: file, type: "png" });
  console.log("Saved", file);
}

await mobileShot(BASE, "07-landing-mobile");
await mobileShot(`${BASE}/join?mode=apply`, "08-join-mobile");
await mobileShot(BASE, "09-destinations-mobile", async () => {
  await mobile.evaluate(() =>
    document.querySelector("#destinations")?.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await delay(800);
});

await mobile.goto(`${BASE}/dashboard`, { waitUntil: "networkidle2", timeout: 120000 });
await delay(3500);
await mobile.screenshot({ path: path.join(outDir, "10-dashboard-mobile.png"), type: "png" });
console.log("Saved dashboard mobile");

await browser.close();
console.log("Done.");
