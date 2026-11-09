// Browser checks for index.html. Run: node smoke.mjs (from tests/, after npm ci).
// Starts its own static server, drives the page in headless Chrome on a phone-sized
// screen and prints one line per test. Exit code 1 if anything fails.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KEY = "spieleabend.sammlung";
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".png": "image/png",
  ".webmanifest": "application/manifest+json", ".json": "application/json" };

function findChrome(){
  if(process.env.CHROME_PATH) return process.env.CHROME_PATH;
  if(fs.existsSync("/usr/bin/google-chrome")) return "/usr/bin/google-chrome";
  const base = "/opt/pw-browsers";
  if(fs.existsSync(base)){
    for(const d of fs.readdirSync(base).filter(n => /^chromium-\d+$/.test(n)).sort().reverse()){
      for(const s of fs.readdirSync(path.join(base, d)).filter(n => /^chrome-linux/.test(n))){
        const p = path.join(base, d, s, "chrome");
        if(fs.existsSync(p)) return p;
      }
    }
  }
  throw new Error("No Chrome found; set CHROME_PATH");
}

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if(p.endsWith("/")) p += "index.html";
  const f = path.join(ROOT, p);
  if(!f.startsWith(ROOT) || !fs.existsSync(f) || !fs.statSync(f).isFile()){ res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const ORIGIN = "http://127.0.0.1:" + server.address().port;

const browser = await puppeteer.launch({
  executablePath: findChrome(), headless: "new",
  args: ["--no-sandbox", "--headless=new", "--lang=de-DE"]
});

let failed = 0;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const assert = (c, msg) => { if(!c) throw new Error(msg || "assertion failed"); };
const eq = (a, b, msg) => assert(JSON.stringify(a) === JSON.stringify(b), (msg || "not equal") + ": " + JSON.stringify(a) + " vs " + JSON.stringify(b));

// Opens a fresh page in its own context (own storage). Errors are collected in page.errs.
async function open({ lang = "de-DE", dark = false, url = "/index.html" } = {}){
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  page.errs = [];
  page.on("pageerror", e => page.errs.push("pageerror: " + e.message));
  page.on("console", m => { if(m.type() === "error") page.errs.push("console: " + m.text()); });
  page.on("dialog", d => d.accept());
  await page.setRequestInterception(true);
  page.on("request", r => r.url().startsWith(ORIGIN) || r.url().startsWith("data:") || r.url().startsWith("blob:") ? r.continue() : r.abort());
  await page.emulate({ viewport: { width: 412, height: 915, deviceScaleFactor: 1, isMobile: true, hasTouch: true }, userAgent: "Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile Safari/537.36" });
  await page.setExtraHTTPHeaders({ "Accept-Language": lang });
  await page.evaluateOnNewDocument(l => {
    Object.defineProperty(navigator, "language", { get: () => l });
    Object.defineProperty(navigator, "languages", { get: () => [l] });
    delete Navigator.prototype.serviceWorker;   // no service worker: deterministic, no caching
  }, lang);
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: dark ? "dark" : "light" }]);
  await page.goto(ORIGIN + url, { waitUntil: "load" });
  return page;
}
const samples = async page => { await page.click('[data-leer="beispiele"]'); await sleep(50); };
const names = (page, sel) => page.$$eval(sel, els => els.map(e => (e.querySelector("h3, .mname, b") || e).textContent.trim()));
const stored = page => page.evaluate(k => JSON.parse(localStorage.getItem(k)).games, KEY);
const noErrors = page => eq(page.errs, [], "console/page errors");

async function setPlayers(page, n){
  for(let i = 0; i < 30; i++){
    const v = Number(await page.$eval("#anzahl", e => e.value));
    if(v === n) return;
    await page.click(v > n ? "#weniger" : "#mehr");
  }
  throw new Error("could not set players to " + n);
}

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test("a. empty shelf, samples load (9 games)", async () => {
  const page = await open();
  assert(await page.$('[data-leer="beispiele"]'), "no sample button on empty shelf");
  eq(await stored(page).catch(() => []), [], "shelf not empty");
  await samples(page);
  const shown = await names(page, "#results > *");
  const out = await names(page, "#outlist > li");
  assert(shown.length > 0, "no suggestions in #results");
  eq(shown.length + out.length, 9, "games in results+outlist");
  await noErrors(page);
});

test("b. player count 1 moves games with min > 1 to #outlist", async () => {
  const page = await open();
  await samples(page);
  await setPlayers(page, 1);
  const games = await stored(page);
  const needMore = games.filter(g => g.min > 1).map(g => g.name);
  assert(needMore.length > 0, "no sample needs more than 1 player");
  const shown = await names(page, "#results > *");
  const out = await names(page, "#outlist > li");
  for(const n of needMore){
    assert(out.includes(n), n + " not in #outlist");
    assert(!shown.includes(n), n + " still in #results");
  }
  await noErrors(page);
});

test("c. mood chip changes results, second tap restores", async () => {
  const page = await open();
  await samples(page);
  const before = JSON.stringify([await names(page, "#results > *"), await names(page, "#outlist > li")]);
  const moods = await page.$$eval("[data-mood]", els => els.map(e => e.dataset.mood));
  let changed = false;
  for(const m of moods){
    await page.click('[data-mood="' + m + '"]');
    const during = JSON.stringify([await names(page, "#results > *"), await names(page, "#outlist > li")]);
    await page.click('[data-mood="' + m + '"]');
    const after = JSON.stringify([await names(page, "#results > *"), await names(page, "#outlist > li")]);
    eq(after, before, "second tap did not restore (" + m + ")");
    if(during !== before) changed = true;
  }
  assert(changed, "no mood chip changed the results");
  await noErrors(page);
});

test("d. played today keeps the card in place, toggles class on", async () => {
  const page = await open();
  await samples(page);
  const before = await names(page, "#results > *");
  const id = await page.$eval("#results [data-played]", e => e.dataset.played);
  const sel = '[data-played="' + id + '"]';
  const idx = () => page.$eval(sel, e => [...e.closest("#results").children].indexOf(e.closest(".game")));
  const i0 = await idx();
  await page.click(sel);
  eq(await idx(), i0, "card index after tap");
  assert(await page.$eval(sel, e => e.classList.contains("on")), "button lacks class on");
  eq(await names(page, "#results > *"), before, "list order changed");
  await page.click(sel);
  assert(!(await page.$eval(sel, e => e.classList.contains("on"))), "class on not removed by second tap");
  eq(await idx(), i0, "card index after undo");
  await noErrors(page);
});

test("e. pause: stays, goes last after filter change, dice never picks it, survives reload", async () => {
  const page = await open();
  await samples(page);
  const before = await names(page, "#results > *");
  const id = await page.$eval("#results [data-pause]", e => e.dataset.pause);
  const name = before[0];
  await page.click('[data-pause="' + id + '"]');
  eq((await names(page, "#results > *"))[0], name, "card moved right after pause");
  eq(await page.$eval('[data-pause="' + id + '"]', e => e.textContent.trim()), "Pause beenden");
  const m = await page.$eval("[data-mood]", e => e.dataset.mood);
  await page.click('[data-mood="' + m + '"]');
  await page.click('[data-mood="' + m + '"]');
  const shown = await names(page, "#results > *");
  const out = await names(page, "#outlist > li");
  eq(shown[shown.length - 1], name, "paused game is not last");
  assert(!out.includes(name), "paused game is in #outlist");
  for(let i = 0; i < 20; i++){
    await page.click("#dice");
    const picked = await page.$$eval("#results .game.picked", els => els.map(e => e.querySelector("h3").textContent.trim()));
    assert(picked.length === 1, "no picked card after roll " + i);
    assert(picked[0] !== name, "dice picked the paused game");
  }
  await page.reload({ waitUntil: "load" });
  const g = (await stored(page)).find(x => x.name === name);
  assert(g.pausedUntil > Date.now(), "pause not stored");
  const shown2 = await names(page, "#results > *");
  eq(shown2[shown2.length - 1], name, "pause lost after reload");
  await noErrors(page);
});

test("f. backup round trip (replace)", async () => {
  const page = await open();
  await samples(page);
  const first = await page.$eval("#results [data-pause]", e => e.dataset.pause);
  await page.click('[data-pause="' + first + '"]');
  await page.click('#results [data-played]');
  const key = gs => gs.map(g => [g.name, g.lastPlayed, g.pausedUntil || 0]);
  const orig = key(await stored(page));
  assert(orig.some(x => x[1] > 0) && orig.some(x => x[2] > 0), "setup: no played/paused game");
  await page.evaluate(() => { document.querySelector("#collection").open = true; document.querySelector("details.backup").open = true; });
  const json = await page.$eval("#backup", e => e.value);
  assert(json.includes("pausedUntil"), "export lacks pausedUntil");
  // wipe the shelf, then bring it back through the page's own import path
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ games: [] })), KEY);
  await page.reload({ waitUntil: "load" });
  eq((await stored(page)).length, 0, "shelf not wiped");
  await page.evaluate(() => { document.querySelector("#collection").open = true; document.querySelector("details.backup").open = true; });
  await page.$eval("#backup", (e, v) => { e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); }, json);
  await page.click("#import");
  eq(key(await stored(page)), orig, "collection differs after import");
  await page.reload({ waitUntil: "load" });
  eq(key(await stored(page)), orig, "collection differs after reload");
  await noErrors(page);
});

test("g. English labels on the card footer", async () => {
  const page = await open({ lang: "en-US" });
  await samples(page);
  const foot = await page.$eval("#results .cardfoot", e => e.textContent);
  assert(foot.includes("Played today"), "no 'Played today'");
  assert(foot.includes("Not in the mood"), "no 'Not in the mood'");
  assert(!/Heute gespielt|Gerade keine Lust/.test(foot), "German label in card footer: " + foot);
  await noErrors(page);
});

test("h. touch targets are at least 44x44", async () => {
  const page = await open();
  await samples(page);
  await page.evaluate(() => { document.querySelector("#collection").open = true; document.querySelector("details.backup").open = true; });
  await page.click("#collist .crow");
  await sleep(50);
  const bad = await page.evaluate(() => {
    const out = [], seen = new Set(); let n = 0;
    const sel = 'button, [role="button"], summary, label:has(input[type="checkbox"]), input[type="checkbox"]';
    for(const e of document.querySelectorAll(sel)){
      const box = e.matches('input[type="checkbox"]') && e.closest("label") ? e.closest("label") : e;   // checkbox counts together with its label
      const cs = getComputedStyle(e), r = box.getBoundingClientRect();
      if(r.width === 0 || r.height === 0 || cs.visibility === "hidden" || cs.display === "none") continue;
      if(e.closest("[hidden]")) continue;
      n++;
      if(r.height < 43.5 || r.width < 43.5){
        const d = e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + (e.className && typeof e.className === "string" ? "." + e.className.trim().replace(/\s+/g, ".") : "") +
          " [" + (e.textContent || "").trim().slice(0, 25) + "] " + Math.round(r.width) + "x" + Math.round(r.height);
        if(!seen.has(d)){ seen.add(d); out.push(d); }
      }
    }
    if(n < 30) out.push("only " + n + " elements measured");
    return out;
  });
  eq(bad, [], "elements under 44px");
  await noErrors(page);
});

test("i. dark mode loads without errors and differs from light", async () => {
  const bg = async dark => { const p = await open({ dark }); await samples(p); await noErrors(p); const c = await p.evaluate(() => getComputedStyle(document.body).backgroundColor); await p.close(); return c; };
  const light = await bg(false), dark = await bg(true);
  assert(light !== dark, "same body background in light and dark: " + light);
});

const t0 = Date.now();
try{
  for(const [name, fn] of tests){
    try{ await fn(); console.log("ok - " + name); }
    catch(e){ failed++; console.log("FAIL - " + name + " :: " + e.message); }
  }
}finally{
  await browser.close().catch(() => {});
  server.close();
}
console.log((failed ? failed + " test(s) failed" : "all " + tests.length + " tests passed") + " in " + ((Date.now() - t0) / 1000).toFixed(1) + " s");
process.exit(failed ? 1 : 0);
