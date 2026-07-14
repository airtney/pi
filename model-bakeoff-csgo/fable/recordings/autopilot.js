// Autopilot injected into the game page. Drives the human player slot via CS.debug
// internals: waypoint navigation, target acquisition, buying, C4 planting.
// Also wraps HUD killfeed/banner to log match events into window.__events.
(() => {
  if (window.__autopilotInstalled) return;
  window.__autopilotInstalled = true;

  const D = CS.debug;
  const { round, player, map, weaponSys, state } = D;

  window.__events = [];
  const now = () => performance.now() / 1000;
  const logEvent = (e) => window.__events.push(Object.assign({ t: +now().toFixed(1), round: round.number }, e));

  const origKillfeed = CS.hud.killfeed.bind(CS.hud);
  CS.hud.killfeed = (an, at, vn, vt, tag, hs, mine) => {
    logEvent({ type: "kill", attacker: an, attackerTeam: at, victim: vn, victimTeam: vt, weapon: tag, headshot: !!hs });
    return origKillfeed(an, at, vn, vt, tag, hs, mine);
  };
  const origBanner = CS.hud.banner.bind(CS.hud);
  CS.hud.banner = (title, sub, cls, dur) => {
    logEvent({ type: "round", title, sub, scoreT: round.score.T, scoreCT: round.score.CT });
    return origBanner(title, sub, cls, dur);
  };

  // ---------- helpers ----------
  const normAng = (a) => {
    while (a > Math.PI) a -= 2 * Math.PI;
    while (a < -Math.PI) a += 2 * Math.PI;
    return a;
  };

  function visibleEnemy() {
    let best = null, bd = 1e9;
    const a = { x: player.pos.x, y: player.pos.y + player.eyeHeight, z: player.pos.z };
    for (const ch of round.characters) {
      if (ch === player || !ch.alive || ch.team === player.team) continue;
      const b = { x: ch.pos.x, y: ch.pos.y + 1.4, z: ch.pos.z };
      if (CS.lineBlocked(a, b, map.colliders)) continue;
      if (CS.grenades && CS.grenades.lineInSmoke && CS.grenades.lineInSmoke(a, b)) continue;
      const d = Math.hypot(b.x - a.x, b.z - a.z);
      if (d < bd) { bd = d; best = ch; }
    }
    return best;
  }

  function nearestEnemyAlive() {
    let best = null, bd = 1e9;
    for (const ch of round.characters) {
      if (ch === player || !ch.alive || ch.team === player.team) continue;
      const d = Math.hypot(ch.pos.x - player.pos.x, ch.pos.z - player.pos.z);
      if (d < bd) { bd = d; best = ch; }
    }
    return best;
  }

  function tryBuy(substr) {
    const items = round.getBuyItems();
    const i = items.findIndex((it) => it.label.indexOf(substr) >= 0);
    if (i >= 0 && !items[i].owned) items[i].buy();
  }

  // ---------- autopilot state ----------
  let path = [], pathI = 0, repathT = 0, boughtRound = 0;
  let strafeDir = 1, strafeT = 0;
  let lastPos = { x: 0, z: 0 }, stuckT = 0, jumpT = 0;
  let lastTick = now();

  function setGoal(wpName) {
    path = map.findPath(player.pos, wpName);
    pathI = 0;
  }

  function clearInput() {
    player.keys = {};
    state.mouseDown = false;
    state.useHeld = false;
  }

  function faceToward(tx, tz, dt, rate) {
    const wantYaw = Math.atan2(-(tx - player.pos.x), -(tz - player.pos.z));
    const dy = normAng(wantYaw - player.yaw);
    player.yaw += dy * Math.min(1, dt * rate);
    return Math.abs(dy);
  }

  window.__autopilotTimer = setInterval(() => {
    const t = now();
    const dt = Math.min(0.25, t - lastTick);
    lastTick = t;
    if (!state.started || round.matchOver) { clearInput(); return; }
    if (!player.alive) { clearInput(); return; }

    // ----- buy phase -----
    if (round.phase === "buy") {
      clearInput();
      if (boughtRound !== round.number) {
        boughtRound = round.number;
        tryBuy("步枪");        // AK-47 / M4A4 depending on side
        tryBuy("防弹衣");
        tryBuy("拆弹钳");      // CT only (no-op as T)
        tryBuy("闪光弹");
        tryBuy("HE");
        logEvent({ type: "buy", money: player.money });
      }
      // look toward mid while frozen so the round starts with a sensible view
      faceToward(0, 0, dt, 2);
      return;
    }
    if (round.phase !== "live") { clearInput(); return; }

    const keys = {};
    let mouseDown = false;
    let useHeld = false;
    let navigating = false;

    const enemy = visibleEnemy();

    // ----- objective: plant C4 -----
    let planting = false;
    if (player.hasBomb && !round.bombPlanted) {
      let siteKey = "A", bd = 1e9;
      for (const k of ["A", "B"]) {
        const s = map.sites[k];
        const d = Math.hypot(player.pos.x - s.x, player.pos.z - s.z);
        if (d < bd) { bd = d; siteKey = k; }
      }
      const s = map.sites[siteKey];
      if (bd < s.r - 1.2) {
        planting = true;
        useHeld = true;                 // hold E: plant
      } else {
        navigating = true;
        repathT -= dt;
        if (repathT <= 0 || pathI >= path.length) {
          setGoal(siteKey === "A" ? "a_site" : "b_site");
          repathT = 3;
        }
      }
    }

    // ----- combat -----
    if (enemy && !planting) {
      const ex = enemy.pos.x, ez = enemy.pos.z;
      const dxz = Math.hypot(ex - player.pos.x, ez - player.pos.z);
      const dy = (enemy.pos.y + 1.35) - (player.pos.y + player.eyeHeight);
      const yawErr = faceToward(ex, ez, dt, 9);
      const wantPitch = Math.atan2(dy, Math.max(0.001, dxz));
      const dp = wantPitch - player.pitch;
      player.pitch += dp * Math.min(1, dt * 9);
      player.pitch = Math.max(-1.4, Math.min(1.4, player.pitch));
      // slight aim jitter so it looks human
      player.yaw += (Math.random() - 0.5) * 0.004;

      if (yawErr < 0.09 && Math.abs(dp) < 0.09) mouseDown = true;

      // strafe while fighting; push closer if far
      strafeT -= dt;
      if (strafeT <= 0) { strafeDir = -strafeDir; strafeT = 0.5 + Math.random() * 0.6; }
      keys[strafeDir > 0 ? "KeyD" : "KeyA"] = true;
      if (dxz > 26) keys["KeyW"] = true;
      navigating = false;
    } else if (!planting) {
      // ----- navigation goal -----
      if (!navigating) {
        repathT -= dt;
        if (repathT <= 0 || pathI >= path.length) {
          repathT = 2.5 + Math.random();
          if (round.bombPlanted && player.team === "T") {
            setGoal(map.nearestWaypoint(round.bombPos).name);      // guard the bomb
          } else if (round.bombPlanted && player.team === "CT") {
            setGoal(map.nearestWaypoint(round.bombPos).name);      // retake / defuse
          } else {
            const e = nearestEnemyAlive();
            if (e) setGoal(map.nearestWaypoint(e.pos).name);       // hunt
          }
        }
        navigating = true;
      }
    }

    // ----- CT defuse -----
    if (player.team === "CT" && round.bombPlanted &&
        Math.hypot(player.pos.x - round.bombPos.x, player.pos.z - round.bombPos.z) < 2.2 && !enemy) {
      useHeld = true;
      navigating = false;
    }

    // ----- follow path -----
    if (navigating && pathI < path.length) {
      const wp = path[pathI];
      const d = Math.hypot(wp.x - player.pos.x, wp.z - player.pos.z);
      if (d < 1.8) {
        pathI++;
      } else {
        faceToward(wp.x, wp.z, dt, 6);
        // level the view while walking
        player.pitch += (0 - player.pitch) * Math.min(1, dt * 4);
        keys["KeyW"] = true;
      }
    }

    // ----- stuck detection: hop -----
    const moved = Math.hypot(player.pos.x - lastPos.x, player.pos.z - lastPos.z);
    lastPos = { x: player.pos.x, z: player.pos.z };
    if (keys["KeyW"] && moved < 0.04) stuckT += dt; else stuckT = 0;
    if (stuckT > 1.2) { jumpT = 0.25; stuckT = 0; }
    if (jumpT > 0) { jumpT -= dt; keys["Space"] = true; }

    if (planting || useHeld) {
      // stand still while planting/defusing
      delete keys["KeyW"]; delete keys["KeyA"]; delete keys["KeyD"]; delete keys["Space"];
    }

    player.keys = keys;
    state.mouseDown = mouseDown;
    state.useHeld = useHeld;
  }, 50);

  window.__getStatus = () => JSON.stringify({
    phase: round.phase,
    roundNum: round.number,
    scoreT: round.score.T,
    scoreCT: round.score.CT,
    matchOver: round.matchOver,
    playerTeam: player.team,
    playerAlive: player.alive,
    playerHp: player.hp,
    playerKills: player.kills,
    playerDeaths: player.deaths,
    money: player.money,
    bombPlanted: round.bombPlanted,
    aliveT: round.characters.filter((c) => c.team === "T" && c.alive).length,
    aliveCT: round.characters.filter((c) => c.team === "CT" && c.alive).length,
  });
  window.__getEvents = () => JSON.stringify(window.__events);
})();
