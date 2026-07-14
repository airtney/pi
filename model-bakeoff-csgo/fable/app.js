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
  scene.background = new THREE.Color(0x9fc4e0);
  scene.fog = new THREE.Fog(0xc4d4dd, 60, 190);

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

  // ============ 特效 ============
  const effects = (function () {
    const tracers = [], sparks = [], lights = [];
    const sparkGeo = new THREE.SphereGeometry(0.03, 4, 4);
    const impactMat = new THREE.MeshBasicMaterial({ color: 0xd8c8a0 });
    const bloodMat = new THREE.MeshBasicMaterial({ color: 0xa01818 });

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

    function spawnSparks(point, mat, n, speed) {
      for (let i = 0; i < n; i++) {
        const m = new THREE.Mesh(sparkGeo, mat);
        m.position.copy(point);
        m.userData.vel = new THREE.Vector3(
          (Math.random() - 0.5) * speed,
          Math.random() * speed * 0.8,
          (Math.random() - 0.5) * speed
        );
        m.userData.ttl = 0.35 + Math.random() * 0.25;
        scene.add(m);
        sparks.push(m);
      }
    }

    return {
      tracer(from, to, thick) {
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(from.x, from.y - 0.06, from.z), to.clone(),
        ]);
        const mat = new THREE.LineBasicMaterial({
          color: thick ? 0xcfe8ff : 0xffd890, transparent: true, opacity: 0.85,
        });
        const line = new THREE.Line(geo, mat);
        line.userData.ttl = thick ? 0.14 : 0.07;
        scene.add(line);
        tracers.push(line);
      },
      muzzleFlash() {
        muzzle.intensity = 14;
        muzzleT = 0.045;
        flashSprite.material.opacity = 0.9;
        flashSprite.rotation.z = Math.random() * Math.PI;
      },
      impact(point) { spawnSparks(point, impactMat, 5, 2.5); },
      blood(point) { spawnSparks(point, bloodMat, 8, 3); },
      heExplosion(pos) {
        spawnSparks(pos, impactMat, 18, 8);
        spawnSparks(pos, new THREE.MeshBasicMaterial({ color: 0xff9030 }), 14, 6);
        const l = new THREE.PointLight(0xffa040, 30, 26, 1.6);
        l.position.copy(pos); l.position.y += 0.5;
        l.userData.ttl = 0.35;
        scene.add(l);
        lights.push(l);
        const ring = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 10, 10),
          new THREE.MeshBasicMaterial({ color: 0xffc060, transparent: true, opacity: 0.65 })
        );
        ring.position.copy(pos);
        ring.userData.ttl = 0.3;
        ring.userData.grow = 30;
        scene.add(ring);
        sparks.push(ring);
      },
      explosion(pos) {
        spawnSparks(pos, impactMat, 40, 14);
        spawnSparks(pos, new THREE.MeshBasicMaterial({ color: 0xff8020 }), 30, 10);
        const l = new THREE.PointLight(0xffa040, 60, 60, 1.5);
        l.position.copy(pos); l.position.y += 1;
        l.userData.ttl = 0.6;
        scene.add(l);
        lights.push(l);
        const ring = new THREE.Mesh(
          new THREE.SphereGeometry(1, 12, 12),
          new THREE.MeshBasicMaterial({ color: 0xffc060, transparent: true, opacity: 0.7 })
        );
        ring.position.copy(pos);
        ring.userData.ttl = 0.5;
        ring.userData.grow = 40;
        scene.add(ring);
        sparks.push(ring);
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
        for (let i = tracers.length - 1; i >= 0; i--) {
          const t = tracers[i];
          t.userData.ttl -= dt;
          t.material.opacity = Math.max(0, t.userData.ttl * 10);
          if (t.userData.ttl <= 0) {
            scene.remove(t); t.geometry.dispose(); t.material.dispose();
            tracers.splice(i, 1);
          }
        }
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.userData.ttl -= dt;
          if (s.userData.vel) {
            s.userData.vel.y -= 9 * dt;
            s.position.addScaledVector(s.userData.vel, dt);
          }
          if (s.userData.grow) {
            s.scale.multiplyScalar(1 + s.userData.grow * dt * 0.25);
            s.material.opacity = Math.max(0, s.userData.ttl * 1.4);
          }
          if (s.userData.ttl <= 0) {
            scene.remove(s);
            if (s.userData.grow) s.geometry.dispose();
            sparks.splice(i, 1);
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
        if (weaponSys.scoped) { weaponSys.scoped = false; }
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

  // ============ 输入 ============
  const state = { started: false, locked: false, useHeld: false, mouseDown: false };

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
      case "KeyE": state.useHeld = true; break;
      case "KeyG":
        if (round.phase === "live") weaponSys.quickThrow(performance.now() / 1000);
        break;
    }
  });
  document.addEventListener("keyup", (e) => {
    player.keys[e.code] = false;
    if (e.code === "KeyE") state.useHeld = false;
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

  CS.debug = { round, player, bots, map, weaponSys, state, grenades: CS.grenades };

  // ============ 主循环 ============
  let lastT = performance.now() / 1000;
  let fpsAcc = 0, fpsN = 0, fpsT = 0;
  let scopedPrev = false;

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
