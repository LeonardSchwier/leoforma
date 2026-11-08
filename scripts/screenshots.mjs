// Generates docs/screenshots/*.png from the component gallery in site/.
// Run: npm run screenshots (builds dist/, builds the gallery, drives Chromium
// through Playwright; a browser needs `npx playwright install chromium` once).
import { execFileSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "docs/screenshots");
const site = join(root, "_site");
const MAX_BYTES = 300 * 1024;

execFileSync("node", [join(root, "scripts/build.mjs")], { stdio: "inherit" });
execFileSync(
  join(root, "node_modules/.bin/vite"),
  ["build", join(root, "site"), "--outDir", site, "--emptyOutDir", "--base", "./"],
  { stdio: "inherit" },
);
mkdirSync(out, { recursive: true });

const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".otf": "font/otf" };
const server = createServer(async (req, res) => {
  let path = new URL(req.url, "http://x").pathname;
  if (path === "/") path = "/index.html";
  try {
    const body = await readFile(join(site, path));
    res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}/`;

const demos = ["button", "icon-button", "icon", "badge", "status-indicator", "card", "empty-state", "fields", "tabs", "segmented-control"];
const overlays = ["dialog", "sheet", "menu", "tooltip", "toast"];

const browser = await chromium.launch();
try {
  for (const theme of ["light", "dark"]) {
    const page = await browser.newPage({ viewport: { width: 640, height: 480 }, deviceScaleFactor: 1 });
    await page.goto(`${base}?theme=${theme}`);
    await page.waitForLoadState("networkidle");
    for (const id of demos) {
      await page.locator(`[data-demo="${id}"]`).screenshot({ path: join(out, `${id}-${theme}.png`) });
    }
    for (const name of overlays) {
      await page.goto(`${base}?theme=${theme}&only=${name}`);
      if (name === "menu") await page.getByRole("button", { name: "Actions" }).click();
      if (name === "tooltip") await page.getByRole("button", { name: "Add book" }).focus();
      await page.waitForTimeout(300);
      await page.screenshot({ path: join(out, `${name}-${theme}.png`) });
    }
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}

let failed = false;
for (const theme of ["light", "dark"]) {
  for (const id of [...demos, ...overlays]) {
    const size = statSync(join(out, `${id}-${theme}.png`)).size;
    if (size > MAX_BYTES) {
      console.error(`${id}-${theme}.png is ${size} bytes, over the ${MAX_BYTES} limit`);
      failed = true;
    }
  }
}
if (failed) process.exit(1);
console.log("Screenshots written to docs/screenshots");
