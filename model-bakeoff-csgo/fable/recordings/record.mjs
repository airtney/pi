// Records one full match of the CS mini-clone in headless Chrome via CDP.
// - joins team T, injects autopilot.js to play the human slot
// - captures frames with Page.startScreencast into frames/
// - polls game status; stops when the match is over (or hard cap)
// - writes timing.json (frame timestamps) + status.json (score progression + events)
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { spawn } from "node:child_process";

// Working dir for temp output (frames/, chrome profile, logs). Autopilot.js must sit next to it.
const BASE = process.env.CSGO_RECORD_BASE || "/tmp/csgo-record-1";
const FRAMES_DIR = `${BASE}/frames`;
const GAME_URL = "http://127.0.0.1:8765/";
const TEAM = "T";
const PORT = 9224;
const HARD_CAP_SEC = 2100;
const POST_MATCH_TAIL_SEC = 7;

mkdirSync(FRAMES_DIR, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

const chrome = spawn("google-chrome", [
  "--headless=new",
  "--no-sandbox",
  `--user-data-dir=${BASE}/profile-rec`,
  "--enable-unsafe-swiftshader",
  "--disable-dev-shm-usage",
  "--window-size=1280,720",
  "--force-device-scale-factor=1",
  "--autoplay-policy=no-user-gesture-required",
  "--mute-audio",
  `--remote-debugging-port=${PORT}`,
  "about:blank",
], { stdio: ["ignore", "ignore", "ignore"] });
process.on("exit", () => { try { chrome.kill("SIGKILL"); } catch {} });

async function getTarget() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === "page");
      if (page) return page;
    } catch {}
    await sleep(300);
  }
  throw new Error("chrome devtools endpoint not ready");
}

const target = await getTarget();
const ws = new WebSocket(target.webSocketDebuggerUrl);
let msgId = 0;
const pending = new Map();
const eventHandlers = new Map();

ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
  } else if (msg.method && eventHandlers.has(msg.method)) {
    eventHandlers.get(msg.method)(msg.params);
  }
};
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evalJs(expression) {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error("page exception: " + JSON.stringify(r.exceptionDetails.exception));
  return r.result.value;
}
await new Promise((r) => (ws.onopen = r));

await send("Page.enable");
await send("Runtime.enable");
await send("Page.addScriptToEvaluateOnNewDocument", { source: "window.CS_DEBUG_NOLOCK = true;" });
await send("Page.navigate", { url: GAME_URL });
log("navigated to", GAME_URL);

// wait for boot (Three.js CDN + game init)
for (let i = 0; i < 60; i++) {
  const ok = await evalJs("!!(window.CS && CS.debug && document.getElementById('btn-join-t'))").catch(() => false);
  if (ok) break;
  await sleep(500);
  if (i === 59) throw new Error("game did not boot");
}
log("game booted");

// ---- start screencast BEFORE joining so the recording includes the start screen ----
const frameMeta = [];
let frameN = 0;
eventHandlers.set("Page.screencastFrame", (p) => {
  frameN++;
  const name = `f-${String(frameN).padStart(6, "0")}.jpg`;
  writeFileSync(`${FRAMES_DIR}/${name}`, Buffer.from(p.data, "base64"));
  frameMeta.push({ name, ts: p.metadata.timestamp });
  send("Page.screencastFrameAck", { sessionId: p.sessionId }).catch(() => {});
});
await send("Page.startScreencast", { format: "jpeg", quality: 80, maxWidth: 1280, maxHeight: 720, everyNthFrame: 1 });
const wallStart = Date.now();
await sleep(1500);

// ---- join team + install autopilot ----
await evalJs(`document.getElementById('btn-join-${TEAM.toLowerCase()}').click(); "clicked"`);
log("joined team", TEAM);
const autopilotSrc = readFileSync(`${BASE}/autopilot.js`, "utf8");
await evalJs(autopilotSrc + "; 'autopilot installed'");
log("autopilot installed");

// ---- poll until match over ----
const progression = [];
let lastScoreKey = "";
let matchOverAt = null;
const t0 = Date.now();

for (;;) {
  await sleep(2000);
  const elapsed = (Date.now() - t0) / 1000;
  let st;
  try {
    st = JSON.parse(await evalJs("window.__getStatus()"));
  } catch (e) {
    log("status poll failed:", e.message);
    continue;
  }
  const key = `${st.scoreT}-${st.scoreCT}-${st.roundNum}`;
  if (key !== lastScoreKey) {
    lastScoreKey = key;
    progression.push({ elapsed_sec: +elapsed.toFixed(1), ...st });
    log(`r${st.roundNum} T ${st.scoreT} : ${st.scoreCT} CT | phase=${st.phase} hp=${st.playerHp} alive=${st.playerAlive} K/D=${st.playerKills}/${st.playerDeaths} $${st.money} frames=${frameN}`);
  }
  if (st.matchOver && matchOverAt === null) {
    matchOverAt = elapsed;
    log("MATCH OVER at", elapsed.toFixed(1), "s — tail recording");
  }
  if (matchOverAt !== null && elapsed - matchOverAt >= POST_MATCH_TAIL_SEC) break;
  if (elapsed > HARD_CAP_SEC) { log("hard cap reached"); break; }
}

// final full-res screenshot of the match-end screen
try {
  const shot = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${BASE}/match-end.png`, Buffer.from(shot.data, "base64"));
} catch {}

await send("Page.stopScreencast").catch(() => {});
const events = JSON.parse(await evalJs("window.__getEvents()").catch(() => "[]"));
const finalStatus = JSON.parse(await evalJs("window.__getStatus()").catch(() => "{}"));

writeFileSync(`${BASE}/timing.json`, JSON.stringify({ wallStart, frames: frameMeta }));
writeFileSync(`${BASE}/status.json`, JSON.stringify({
  team: TEAM,
  url: GAME_URL,
  startedAtIso: new Date(wallStart).toISOString(),
  durationSec: +(((Date.now() - wallStart) / 1000).toFixed(1)),
  finalStatus,
  progression,
  events,
}, null, 2));

log(`done: ${frameN} frames, final score T ${finalStatus.scoreT} : ${finalStatus.scoreCT} CT`);
chrome.kill("SIGKILL");
process.exit(0);
