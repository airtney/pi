"use strict";
// app.js — 主程序：场景、输入、特效、伤害路由、主循环
window.CS = window.CS || {};

CS.boot = function (THREE) {
  // ============ 渲染器 / 场景 / 相机 ============
  const canvas = document.getElementById("game-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa7c4de);
  scene.fog = new THREE.Fog(0xddd0ab, 65, 210); // 沙色远雾，配合天空穹顶


  const BASE_FOV = 75, SCOPE_FOV = 20;
  const camera = new THREE.PerspectiveCamera(BASE_FOV, window.innerWidth / window.innerHeight, 0.05, 400);
  scene.add(camera);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ============ 地图 / 玩家 / BOT ============
  const map = CS.createMap(THREE);
  scene.add(map.group);

  const player = CS.createPlayer(THREE, map, camera);

  const bots = [];
  for (let i = 0; i < 7; i++) {
    const b = CS.createBot(THREE, map, "BOT", "T");
    bots.push(b);
    scene.add(b.mesh);
    b.mesh.visible = false;
  }

  // ============ 特效（对象池：曳光/火花/弹孔复用，避免每枪创建销毁） ============
  const effects = (function () {
    const lights = [], rings = [];

    // ---- 曳光池 ----
    const TRACER_POOL = 24;
    const tracerPool = [];
    for (let i = 0; i < TRACER_POOL; i++) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
        color: 0xffd890, transparent: true, opacity: 0,
      }));
      line.visible = false;
      line.frustumCulled = false;
      scene.add(line);
      tracerPool.push({ line, ttl: 0, max: 1 });
    }
    let tracerI = 0;

    // ---- 火花池（击中墙/血液共用） ----
    const SPARK_POOL = 90;
    const sparkGeo = new THREE.SphereGeometry(0.03, 4, 4);
    const sparkPool = [];
    for (let i = 0; i < SPARK_POOL; i++) {
      const m = new THREE.Mesh(sparkGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      m.visible = false;
      scene.add(m);
      sparkPool.push({ mesh: m, ttl: 0, vel: new THREE.Vector3() });
    }
    let sparkI = 0;

    function spawnSparks(point, color, n, speed, dir) {
      for (let i = 0; i < n; i++) {
        const s = sparkPool[sparkI];
        sparkI = (sparkI + 1) % SPARK_POOL;
        s.mesh.visible = true;
        s.mesh.material.color.setHex(color);
        s.mesh.position.copy(point);
        s.vel.set(
          (Math.random() - 0.5) * speed,
          Math.random() * speed * 0.8,
          (Math.random() - 0.5) * speed
        );
        if (dir) s.vel.addScaledVector(dir, speed * 0.7); // 沿弹道方向喷溅
        s.ttl = 0.35 + Math.random() * 0.25;
      }
    }

    // ---- 弹孔池 ----
    const DECAL_POOL = 48, DECAL_LIFE = 11;
    const decalGeo = new THREE.CircleGeometry(0.055, 8);
    const decalPool = [];
    for (let i = 0; i < DECAL_POOL; i++) {
      const m = new THREE.Mesh(decalGeo, new THREE.MeshBasicMaterial({
        color: 0x181410, transparent: true, opacity: 0, depthWrite: false,
      }));
      m.visible = false;
      scene.add(m);
      decalPool.push({ mesh: m, ttl: 0 });
    }
    let decalI = 0;
    const _dTmp = new THREE.Vector3();

    // 命中点所在 AABB 面的法线（弹孔朝向）
    function surfaceNormal(p, dir) {
      const eps = 0.04;
      for (const c of map.colliders) {
        if (p.x > c.x1 - eps && p.x < c.x2 + eps && p.y > c.y1 - eps && p.y < c.y2 + eps &&
            p.z > c.z1 - eps && p.z < c.z2 + eps) {
          const faces = [
            [Math.abs(p.x - c.x1), -1, 0, 0], [Math.abs(p.x - c.x2), 1, 0, 0],
            [Math.abs(p.y - c.y1), 0, -1, 0], [Math.abs(p.y - c.y2), 0, 1, 0],
            [Math.abs(p.z - c.z1), 0, 0, -1], [Math.abs(p.z - c.z2), 0, 0, 1],
          ];
          let best = faces[0];
          for (const f of faces) if (f[0] < best[0]) best = f;
          return _dTmp.set(best[1], best[2], best[3]);
        }
      }
      if (p.y < 0.08) return _dTmp.set(0, 1, 0); // 地面
      return dir ? _dTmp.set(-dir.x, -dir.y, -dir.z).normalize() : null;
    }

    function addDecal(point, dir) {
      const n = surfaceNormal(point, dir);
      if (!n) return;
      const d = decalPool[decalI];
      decalI = (decalI + 1) % DECAL_POOL;
      d.mesh.visible = true;
      d.mesh.position.set(point.x + n.x * 0.012, point.y + n.y * 0.012, point.z + n.z * 0.012);
      d.mesh.lookAt(point.x + n.x, point.y + n.y, point.z + n.z);
      d.mesh.material.opacity = 0.8;
      d.ttl = DECAL_LIFE;
    }

    const muzzle = new THREE.PointLight(0xffc860, 0, 7, 2);
    camera.add(muzzle);
    muzzle.position.set(0.22, -0.16, -0.7);
    let muzzleT = 0;
    const flashSprite = new THREE.Mesh(
      new THREE.PlaneGeometry(0.16, 0.16),
      new THREE.MeshBasicMaterial({ color: 0xffe0a0, transparent: true, opacity: 0, depthTest: false })
    );
    flashSprite.position.set(0.22, -0.17, -0.75);
    camera.add(flashSprite);

    function addLight(pos, color, intensity, dist, ttl, yOff) {
      const l = new THREE.PointLight(color, intensity, dist, 1.6);
      l.position.copy(pos); l.position.y += yOff || 0.5;
      l.userData.ttl = ttl;
      l.userData.max = intensity;
      scene.add(l);
      lights.push(l);
    }
    function addRing(pos, color, size, ttl, grow) {
      const ring = new THREE.Mesh(
        new THREE.SphereGeometry(size, 10, 10),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.65 })
      );
      ring.position.copy(pos);
      ring.userData.ttl = ttl;
      ring.userData.grow = grow;
      scene.add(ring);
      rings.push(ring);
    }

    return {
      tracer(from, to, thick) {
        const t = tracerPool[tracerI];
        tracerI = (tracerI + 1) % TRACER_POOL;
        const pos = t.line.geometry.attributes.position;
        pos.setXYZ(0, from.x, from.y - 0.06, from.z);
        pos.setXYZ(1, to.x, to.y, to.z);
        pos.needsUpdate = true;
        t.line.material.color.setHex(thick ? 0xcfe8ff : 0xffd890);
        t.line.material.opacity = 0.85;
        t.line.visible = true;
        t.max = thick ? 0.14 : 0.07;
        t.ttl = t.max;
      },
      muzzleFlash() {
        muzzle.intensity = 14;
        muzzleT = 0.045;
        flashSprite.material.opacity = 0.9;
        flashSprite.rotation.z = Math.random() * Math.PI;
      },
      impact(point, dir) {
        spawnSparks(point, 0xd8c8a0, 4, 2.5);
        addDecal(point, dir);
      },
      blood(point, dir) {
        spawnSparks(point, 0xa01818, 9, 3, dir);
      },
      heExplosion(pos) {
        spawnSparks(pos, 0xd8c8a0, 16, 8);
        spawnSparks(pos, 0xff9030, 12, 6);
        addLight(pos, 0xffa040, 30, 26, 0.35);
        addRing(pos, 0xffc060, 0.5, 0.3, 30);
      },
      flashPop(pos) {
        addLight(pos, 0xffffff, 50, 34, 0.25, 0.3);
        addRing(pos, 0xffffff, 0.4, 0.22, 42);
      },
      explosion(pos) {
        spawnSparks(pos, 0xd8c8a0, 34, 14);
        spawnSparks(pos, 0xff8020, 26, 10);
        addLight(pos, 0xffa040, 60, 60, 0.6, 1);
        addRing(pos, 0xffc060, 1, 0.5, 40);
      },
      hitmarker(kill) {
        CS.hud.hitmarker(kill);
        if (kill) CS.audio.headshotDing(); else CS.audio.hitConfirm();
      },
      update(dt) {
        if (muzzleT > 0) {
          muzzleT -= dt;
          if (muzzleT <= 0) { muzzle.intensity = 0; flashSprite.material.opacity = 0; }
        }
        for (const t of tracerPool) {
          if (t.ttl <= 0) continue;
          t.ttl -= dt;
          if (t.ttl <= 0) { t.line.visible = false; continue; }
          t.line.material.opacity = 0.85 * (t.ttl / t.max);
        }
        for (const s of sparkPool) {
          if (s.ttl <= 0) continue;
          s.ttl -= dt;
          if (s.ttl <= 0) { s.mesh.visible = false; continue; }
          s.vel.y -= 9 * dt;
          s.mesh.position.addScaledVector(s.vel, dt);
        }
        for (const d of decalPool) {
          if (d.ttl <= 0) continue;
          d.ttl -= dt;
          if (d.ttl <= 0) { d.mesh.visible = false; continue; }
          if (d.ttl < 2) d.mesh.material.opacity = 0.8 * (d.ttl / 2); // 淡出
        }
        for (let i = rings.length - 1; i >= 0; i--) {
          const s = rings[i];
          s.userData.ttl -= dt;
          s.scale.multiplyScalar(1 + s.userData.grow * dt * 0.25);
          s.material.opacity = Math.max(0, s.userData.ttl * 1.4);
          if (s.userData.ttl <= 0) {
            scene.remove(s);
            s.geometry.dispose(); s.material.dispose();
            rings.splice(i, 1);
          }
        }
        for (let i = lights.length - 1; i >= 0; i--) {
          const l = lights[i];
          l.userData.ttl -= dt;
          l.intensity = Math.max(0, l.userData.ttl * 100);
          if (l.userData.ttl <= 0) { scene.remove(l); lights.splice(i, 1); }
        }
      },
    };
  })();

  // ============ 伤害路由 ============
  function applyDamage(victim, dmg, attacker, weaponDef, headshot) {
    if (!victim.alive) return;
    victim.hp -= dmg;
    if (attacker && attacker !== victim && attacker.team !== victim.team) {
      // 助攻记录（击杀时结算）
      if (!victim._dmgLog) victim._dmgLog = new Map();
      victim._dmgLog.set(attacker, performance.now() / 1000);
    }
    if (victim === player) {
      CS.hud.updateHealth(player);
      CS.hud.damageFlash();
      CS.audio.damageTaken();
    }
    if (victim.hp <= 0) {
      victim.hp = 0;
      if (victim === player) {
        player.alive = false;
        player.deaths++;
        CS.audio.death();
        CS.hud.spectate(true);
        CS.hud.progress(null, null);
        CS.hud.pickupHint(null);
        if (weaponSys.scoped) { weaponSys.scoped = false; }
        // 掉落主武器
        const prim = weaponSys.slots[1];
        if (prim && CS.groundItems) {
          CS.groundItems.drop(prim.def.id, prim.magAmmo, prim.reserveAmmo, player.pos);
          weaponSys.slots[1] = null;
        }
      } else {
        victim.die();
      }
      round.notifyKill(victim, attacker, weaponDef, headshot);
    }
  }

  // ============ 武器系统 ============
  const weaponSys = CS.createWeaponSystem(THREE, {
    camera, player, map,
    getCharacters: () => round.characters,
    effects,
    onDamage: applyDamage,
  });

  // ============ 回合系统 ============
  const round = CS.createRound(THREE, {
    map, scene, player, bots, weaponSys, effects,
    applyDamage,
  });

  // ============ 投掷物系统 ============
  CS.grenades = CS.createGrenades(THREE, {
    scene, map, effects,
    applyDamage,
    getCharacters: () => round.characters,
    getListenerPos: () => ({ x: player.pos.x, y: player.pos.y + player.eyeHeight, z: player.pos.z }),
  });

  // ============ 地面武器（掉落 / 拾取） ============
  CS.groundItems = CS.createGroundItems(THREE, { scene, map });

  // ============ 迷你雷达 ============
  CS.hud.initRadar(map);

  // ============ 输入 ============
  const state = { started: false, locked: false, useHeld: false, useTap: false, mouseDown: false };

  function requestLock() {
    if (!canvas.requestPointerLock) return;
    try {
      const p = canvas.requestPointerLock();
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* 非用户手势调用会被浏览器拒绝，忽略 */ }
  }
  document.addEventListener("pointerlockchange", () => {
    state.locked = document.pointerLockElement === canvas;
    if (state.started && !round.matchOver) CS.hud.showPause(!state.locked);
  });
  document.addEventListener("mousemove", (e) => {
    if (!state.locked || !player.alive) return;
    const sens = weaponSys.scoped ? 0.0006 : 0.0022;
    player.onMouseMove(e.movementX, e.movementY, sens);
  });
  document.addEventListener("mousedown", (e) => {
    CS.audio.unlock();
    if (!state.started) return;
    if (!state.locked) {
      if (!round.matchOver) requestLock();
      return;
    }
    if (CS.hud.buyMenuOpen) return;
    if (e.button === 0) state.mouseDown = true;
    else if (e.button === 2) weaponSys.toggleScope();
  });
  document.addEventListener("mouseup", (e) => {
    if (e.button === 0) state.mouseDown = false;
  });
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("wheel", (e) => {
    if (!state.started || !state.locked || !player.alive) return;
    weaponSys.cycle(e.deltaY > 0 ? 1 : -1);
  }, { passive: true });

  document.addEventListener("keydown", (e) => {
    if (!state.started) return;
    player.keys[e.code] = true;

    if (e.code === "Tab") {
      e.preventDefault();
      if (!CS.hud.scoreboardOpen) {
        CS.hud.renderScoreboard(round.characters, round.score);
        CS.hud.showScoreboard(true);
      }
      return;
    }
    if (e.code === "KeyB") {
      e.preventDefault();
      if (round.phase === "buy") {
        if (CS.hud.buyMenuOpen) CS.hud.hideBuyMenu();
        else CS.hud.showBuyMenu(round.getBuyItems(), player.money);
      } else if (!CS.hud.buyMenuOpen) {
        CS.hud.centerMsg("只能在购买时间购买", 1.5);
      } else CS.hud.hideBuyMenu();
      return;
    }
    if (CS.hud.buyMenuOpen) {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 9) round.buyIndex(n - 1);
      if (e.code === "Escape") CS.hud.hideBuyMenu();
      return;
    }
    if (!player.alive) return;

    switch (e.code) {
      case "Digit1": weaponSys.select(1); break;
      case "Digit2": weaponSys.select(2); break;
      case "Digit3": weaponSys.select(3); break;
      case "Digit4": weaponSys.select(4); break;
      case "KeyQ": weaponSys.cycle(1); break;
      case "KeyR": weaponSys.startReload(); break;
      case "KeyE":
        if (!state.useHeld) state.useTap = true; // 边沿触发：拾取用
        state.useHeld = true;
        break;
      case "KeyG":
        if (round.phase === "live") weaponSys.quickThrow(performance.now() / 1000);
        break;
    }
  });
  document.addEventListener("keyup", (e) => {
    player.keys[e.code] = false;
    if (e.code === "KeyE") state.useHeld = false;
    if (e.code === "Tab") { e.preventDefault(); CS.hud.showScoreboard(false); }
  });

  // ============ 开始 / 重开 ============
  function startGame(team) {
    CS.audio.unlock();
    state.started = true;
    round.setupTeams(team);
    CS.hud.hideStart();
    CS.hud.showHud();
    round.startRound();
    requestLock();
    CS.hud.centerMsg(team === "T" ? "你是恐怖分子 — 安放 C4 或歼灭 CT" : "你是反恐精英 — 守住炸弹点或歼灭 T", 4);
  }
  document.getElementById("btn-join-t").addEventListener("click", () => startGame("T"));
  document.getElementById("btn-join-ct").addEventListener("click", () => startGame("CT"));
  document.getElementById("btn-restart").addEventListener("click", () => location.reload());

  // ============ 武器拾取（E 键 / 无主武器时走过去自动捡） ============
  function usingBombAction() {
    // 安放 / 拆除上下文中 E 键优先给 C4 逻辑
    if (player.hasBomb && !round.bombPlanted) {
      for (const key of ["A", "B"]) {
        const s = map.sites[key];
        if (Math.hypot(player.pos.x - s.x, player.pos.z - s.z) < s.r) return true;
      }
    }
    if (player.team === "CT" && round.bombPlanted) {
      const bp = round.bombPos;
      if (Math.hypot(player.pos.x - bp.x, player.pos.z - bp.z) < 3.2) return true;
    }
    return false;
  }

  function pickupItem(item) {
    CS.groundItems.take(item);
    const cur = weaponSys.slots[1];
    if (cur) CS.groundItems.drop(cur.def.id, cur.magAmmo, cur.reserveAmmo, player.pos);
    weaponSys.give(item.id);
    const w = weaponSys.slots[1];
    w.magAmmo = Math.min(item.magAmmo, w.def.mag);
    w.reserveAmmo = item.reserveAmmo;
    CS.hud.updateAmmo(weaponSys.cur());
    CS.audio.weaponSwitch();
  }

  function updatePickup() {
    if (!player.alive || round.phase === "over" || usingBombAction()) {
      CS.hud.pickupHint(null);
      return;
    }
    const item = CS.groundItems.nearest(player.pos, 1.7);
    if (!item) { CS.hud.pickupHint(null); return; }
    if (!weaponSys.slots[1]) {
      pickupItem(item); // 无主武器：走过去直接捡
      CS.hud.pickupHint(null);
      return;
    }
    if (item.id === weaponSys.slots[1].def.id) { CS.hud.pickupHint(null); return; }
    CS.hud.pickupHint("按 E 换成 " + CS.WEAPONS[item.id].name);
    if (state.useTap) pickupItem(item);
  }

  // ============ 雷达：敌人暴露判定（队友视野 / 最近开枪） ============
  function updateSpotted(now) {
    for (const ch of round.characters) {
      if (ch === player || !ch.alive || ch.team === player.team) { ch._spotted = false; continue; }
      let sp = now - (ch.lastFired || -99) < 2; // 开枪 2 秒内暴露
      if (!sp) {
        for (const mate of round.characters) {
          if (mate.team !== player.team || !mate.alive) continue;
          const dx = ch.pos.x - mate.pos.x, dz = ch.pos.z - mate.pos.z;
          if (dx * dx + dz * dz > 55 * 55) continue;
          const a = { x: mate.pos.x, y: mate.pos.y + 1.6, z: mate.pos.z };
          const b = { x: ch.pos.x, y: ch.pos.y + 1.4, z: ch.pos.z };
          if (CS.lineBlocked(a, b, map.colliders)) continue;
          if (CS.grenades.lineInSmoke(a, b)) continue;
          sp = true;
          break;
        }
      }
      if (sp) ch._spottedUntil = now + 1.5;
      ch._spotted = sp || (ch._spottedUntil || 0) > now;
    }
  }

  CS.debug = { round, player, bots, map, weaponSys, state, grenades: CS.grenades, groundItems: CS.groundItems };

  // ============ 主循环 ============
  let lastT = performance.now() / 1000;
  let fpsAcc = 0, fpsN = 0, fpsT = 0;
  let scopedPrev = false;
  let radarT = 99, sbT = 0;

  function frame() {
    requestAnimationFrame(frame);
    const now = performance.now() / 1000;
    let dt = Math.min(0.1, now - lastT); // 低帧率机器也按真实时间推进（物理有子步保护）
    lastT = now;

    if (state.started) {
      // CS_DEBUG_NOLOCK：无头测试用，允许未锁定鼠标时继续运行
      const paused = !state.locked && !round.matchOver && !window.CS_DEBUG_NOLOCK;
      if (!paused) {
        // 冻结时间玩家不能移动（但可转视角）
        const frozen = round.phase === "buy";
        if (frozen) {
          player.keys["KeyW"] = player.keys["KeyA"] = player.keys["KeyS"] = player.keys["KeyD"] = false;
          player.keys["Space"] = false;
        }
        player.update(dt);

        // 开火
        if (state.mouseDown && !CS.hud.buyMenuOpen && round.phase === "live") {
          weaponSys.tryFire(now, weaponSys._heldBefore === true);
          weaponSys._heldBefore = true;
        } else {
          weaponSys._heldBefore = false;
        }
        weaponSys.update(now, dt);

        // BOT
        const botCtx = {
          characters: round.characters,
          round, effects,
          onDamage: applyDamage,
          listenerPos: player.pos,
          now,
        };
        for (const b of bots) b.update(dt, botCtx);

        // 投掷物
        CS.grenades.update(dt, now);

        // 回合
        round.update(dt, { useHeld: state.useHeld });

        // 武器拾取
        updatePickup();
        state.useTap = false;

        // 雷达（约 12Hz：含队友视野暴露判定）
        radarT += dt;
        if (radarT >= 0.08) {
          radarT = 0;
          updateSpotted(now);
          CS.hud.drawRadar(player, round.characters, {
            planted: round.bombPlanted,
            x: round.bombPos.x, z: round.bombPos.z,
            carrier: round.bombCarrier,
          });
        }

        // 计分板打开时定期刷新
        if (CS.hud.scoreboardOpen) {
          sbT += dt;
          if (sbT >= 0.5) {
            sbT = 0;
            CS.hud.renderScoreboard(round.characters, round.score);
          }
        }

        // 开镜 FOV
        if (weaponSys.scoped !== scopedPrev) {
          scopedPrev = weaponSys.scoped;
          camera.fov = weaponSys.scoped ? SCOPE_FOV : BASE_FOV;
          camera.updateProjectionMatrix();
          CS.hud.scope(weaponSys.scoped);
        }
      }
    }

    effects.update(dt);
    CS.hud.update(dt);

    fpsAcc += dt; fpsN++; fpsT += dt;
    if (fpsT >= 0.5) {
      CS.hud.fps(Math.round(fpsN / fpsAcc));
      fpsAcc = 0; fpsN = 0; fpsT = 0;
    }

    renderer.render(scene, camera);
  }
  frame();
};
