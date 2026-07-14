"use strict";
// weapons.js — 武器定义、射线命中、扩散/后坐力、换弹、视角武器模型
window.CS = window.CS || {};

// ============ 武器数据 ============
// dmg 基础伤害；rpm 射速；spread 基础扩散(弧度)；moveSpread 移动附加；
// recoil 每发上抬；price 价格；tag 击杀信息用名
CS.WEAPONS = {
  knife: {
    id: "knife", name: "刀", tag: "knife", slot: 3, melee: true,
    dmg: 55, rpm: 120, range: 2.2, price: 0, auto: false,
    mag: Infinity, reserve: Infinity, reloadTime: 0,
    spread: 0, moveSpread: 0, recoil: 0, hsMult: 1.5,
  },
  glock: {
    id: "glock", name: "GLOCK-18", tag: "glock", slot: 2,
    dmg: 28, rpm: 400, price: 0, auto: false,
    mag: 20, reserve: 120, reloadTime: 2.2,
    spread: 0.008, moveSpread: 0.030, recoil: 0.011, hsMult: 4, falloff: 0.75,
  },
  usp: {
    id: "usp", name: "USP-S", tag: "usp_silencer", slot: 2,
    dmg: 33, rpm: 350, price: 0, auto: false,
    mag: 12, reserve: 100, reloadTime: 2.2,
    spread: 0.006, moveSpread: 0.028, recoil: 0.012, hsMult: 4, falloff: 0.8, silenced: true,
  },
  ak47: {
    id: "ak47", name: "AK-47", tag: "ak47", slot: 1,
    dmg: 36, rpm: 600, price: 2700, auto: true,
    mag: 30, reserve: 90, reloadTime: 2.5,
    spread: 0.006, moveSpread: 0.045, recoil: 0.017, hsMult: 4, falloff: 0.85,
  },
  m4a4: {
    id: "m4a4", name: "M4A4", tag: "m4a4", slot: 1,
    dmg: 33, rpm: 666, price: 3100, auto: true,
    mag: 30, reserve: 90, reloadTime: 3.1,
    spread: 0.005, moveSpread: 0.038, recoil: 0.013, hsMult: 4, falloff: 0.85,
  },
  awp: {
    id: "awp", name: "AWP", tag: "awp", slot: 1,
    dmg: 115, rpm: 41, price: 4750, auto: false,
    mag: 5, reserve: 30, reloadTime: 3.7,
    spread: 0.05, scopedSpread: 0.0006, moveSpread: 0.08, recoil: 0.06, hsMult: 2.5, falloff: 1, sniper: true,
  },
  hegrenade: {
    id: "hegrenade", name: "HE 手雷", tag: "hegrenade", slot: 4, grenade: true, nadeType: "he",
    dmg: 105, rpm: 60, price: 300, auto: false,
    mag: 1, reserve: 0, reloadTime: 0,
    spread: 0, moveSpread: 0, recoil: 0, hsMult: 1,
  },
  smokegrenade: {
    id: "smokegrenade", name: "烟雾弹", tag: "smokegrenade", slot: 4, grenade: true, nadeType: "smoke",
    dmg: 0, rpm: 60, price: 300, auto: false,
    mag: 1, reserve: 0, reloadTime: 0,
    spread: 0, moveSpread: 0, recoil: 0, hsMult: 1,
  },
  flashbang: {
    id: "flashbang", name: "闪光弹", tag: "flashbang", slot: 4, grenade: true, nadeType: "flash",
    dmg: 0, rpm: 60, price: 200, auto: false,
    mag: 1, reserve: 0, reloadTime: 0,
    spread: 0, moveSpread: 0, recoil: 0, hsMult: 1,
  },
  molotov: {
    id: "molotov", name: "燃烧瓶", tag: "molotov", slot: 4, grenade: true, nadeType: "fire",
    dmg: 28, rpm: 60, price: 400, auto: false,
    mag: 1, reserve: 0, reloadTime: 0,
    spread: 0, moveSpread: 0, recoil: 0, hsMult: 1, fireColor: 0xff6a18,
  },
  incendiary: {
    id: "incendiary", name: "燃烧弹", tag: "incgrenade", slot: 4, grenade: true, nadeType: "fire",
    dmg: 28, rpm: 60, price: 600, auto: false,
    mag: 1, reserve: 0, reloadTime: 0,
    spread: 0, moveSpread: 0, recoil: 0, hsMult: 1, fireColor: 0xff8a30,
  },
};

CS.NADE_ORDER = ["he", "flash", "smoke", "fire"];
CS.NADE_WEAPON = { he: "hegrenade", flash: "flashbang", smoke: "smokegrenade", fire: "molotov" };

// ============ 确定性喷射弹道（AK/M4 压枪模式） ============
// 每发子弹相对准星的固定偏移 [yawOff, pitchOff]（弧度），前几发精准，
// 之后急剧上抬，10 发后转为左右摆动；玩家往下压鼠标即可抵消（和 CS 一致）。
CS.SPRAY_PATTERNS = (function () {
  function build(n, climb, sway, phase) {
    const pts = [];
    let pitch = 0;
    for (let i = 0; i < n; i++) {
      if (i >= 1) pitch += climb * (i < 3 ? 0.45 : i < 10 ? 1 : 0.12);
      const yaw = i < 7 ? 0 : Math.sin((i - 7) * 0.55 + phase) * sway * Math.min(1, (i - 6) / 5);
      pts.push([yaw, pitch]);
    }
    return pts;
  }
  return {
    ak47: build(30, 0.0105, 0.030, 0.4),
    m4a4: build(30, 0.0085, 0.024, 2.2),
  };
})();

// ============ 射线 vs 世界 AABB ============
CS.rayVsAABB = function (ox, oy, oz, dx, dy, dz, c) {
  let tmin = 0, tmax = Infinity;
  const p = [ox, oy, oz], d = [dx, dy, dz];
  const lo = [c.x1, c.y1, c.z1], hi = [c.x2, c.y2, c.z2];
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < 1e-9) {
      if (p[i] < lo[i] || p[i] > hi[i]) return -1;
    } else {
      const inv = 1 / d[i];
      let t1 = (lo[i] - p[i]) * inv, t2 = (hi[i] - p[i]) * inv;
      if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
      if (t1 > tmin) tmin = t1;
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return -1;
    }
  }
  return tmin;
};

CS.rayHitWorld = function (origin, dir, maxDist, colliders) {
  let best = maxDist;
  for (const c of colliders) {
    const t = CS.rayVsAABB(origin.x, origin.y, origin.z, dir.x, dir.y, dir.z, c);
    if (t >= 0 && t < best) best = t;
  }
  return best; // 命中距离（== maxDist 表示未命中）
};

// 射线 vs 角色（身体 AABB，命中点高于 78% 身高算爆头）
CS.rayHitCharacter = function (origin, dir, ch) {
  const r = ch.radius;
  const box = {
    x1: ch.pos.x - r, y1: ch.pos.y, z1: ch.pos.z - r,
    x2: ch.pos.x + r, y2: ch.pos.y + ch.height, z2: ch.pos.z + r,
  };
  const t = CS.rayVsAABB(origin.x, origin.y, origin.z, dir.x, dir.y, dir.z, box);
  if (t < 0) return null;
  const hy = origin.y + dir.y * t;
  return { dist: t, headshot: hy > ch.pos.y + ch.height * 0.78 };
};

// 两点间是否有墙（BOT 视线 / 掩体判断）
CS.lineBlocked = function (a, b, colliders) {
  const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
  const len = Math.hypot(dx, dy, dz);
  if (len < 1e-6) return false;
  const dir = { x: dx / len, y: dy / len, z: dz / len };
  return CS.rayHitWorld(a, dir, len, colliders) < len - 0.05;
};

// ============ 通用开火计算 ============
// shooter: player 或 bot（有 pos/eyeHeight 或 eyeY、team）
// 返回 {hit: ch|null, headshot, dmg, endPoint}
CS.computeShot = function (THREE, origin, dir, def, shooterTeam, characters, colliders) {
  const MAXD = def.melee ? def.range : 300;
  const wallDist = CS.rayHitWorld(origin, dir, MAXD, colliders);
  let hitCh = null, hitInfo = null, bestDist = wallDist;
  for (const ch of characters) {
    if (!ch.alive || ch.team === shooterTeam) continue;
    const info = CS.rayHitCharacter(origin, dir, ch);
    if (info && info.dist < bestDist) {
      bestDist = info.dist;
      hitCh = ch;
      hitInfo = info;
    }
  }
  const endPoint = new THREE.Vector3(
    origin.x + dir.x * bestDist,
    origin.y + dir.y * bestDist,
    origin.z + dir.z * bestDist
  );
  let dmg = 0, headshot = false;
  if (hitCh) {
    headshot = hitInfo.headshot;
    dmg = def.dmg * (headshot ? def.hsMult : 1);
    if (def.falloff) dmg *= Math.pow(def.falloff, bestDist / 30); // 距离衰减
    dmg = Math.max(1, Math.round(dmg));
  }
  return { hit: hitCh, headshot, dmg, endPoint, hitWall: !hitCh && wallDist < MAXD };
};

// 护甲减伤：返回实际扣血，同时扣护甲
CS.applyArmor = function (ch, dmg) {
  if (ch.armor > 0) {
    const absorbed = Math.min(ch.armor, Math.round(dmg * 0.5));
    ch.armor -= absorbed;
    dmg = dmg - absorbed;
  }
  return Math.max(1, Math.round(dmg));
};

// ============ 玩家武器系统（库存 + 视角模型 + 开火/换弹） ============
CS.createWeaponSystem = function (THREE, ctx) {
  // ctx: {camera, player, map, getCharacters, effects, onKill, onDamage}
  const { camera, player, map } = ctx;

  const sys = {
    slots: { 1: null, 2: null, 3: makeInst("knife") }, // 1 主武器 2 副武器 3 刀 (4 = 投掷物)
    current: 2,
    scoped: false,
    lastShotTime: -99,
    _recoilAccum: 0,
    grenades: { he: 0, smoke: 0, flash: 0, fire: 0 },
    grenadeSel: "he",
    fireId: "molotov", // 当前火焰弹种类（T 燃烧瓶 / CT 燃烧弹）
    _sprayIdx: 0,
  };

  function makeInst(id) {
    const def = CS.WEAPONS[id];
    return { def, magAmmo: def.mag, reserveAmmo: def.reserve, reloading: false, reloadEnd: 0 };
  }

  // 槽位 4 的"伪武器"实例：magAmmo 显示当前雷种剩余数量
  const grenadeInst = { def: CS.WEAPONS.hegrenade, magAmmo: 0, reserveAmmo: 0, reloading: false, reloadEnd: 0 };
  function grenadeTotal() { return sys.grenades.he + sys.grenades.smoke + sys.grenades.flash + sys.grenades.fire; }
  function nadeWeaponId(type) { return type === "fire" ? sys.fireId : CS.NADE_WEAPON[type]; }
  // 循环到下一个持有的雷种（he → flash → smoke）
  function nextNade(t) {
    const order = CS.NADE_ORDER;
    let i = order.indexOf(t);
    for (let k = 1; k <= order.length; k++) {
      const cand = order[(i + k) % order.length];
      if (sys.grenades[cand] > 0) return cand;
    }
    return t;
  }

  sys.give = function (id) {
    const def = CS.WEAPONS[id];
    sys.slots[def.slot] = makeInst(id);
    sys.current = def.slot;
    sys.scoped = false;
    switchAnim = 0.4;
    rebuildViewModel();
    if (CS.hud) CS.hud.updateAmmo(sys.cur());
  };
  sys.reset = function (secondaryId) {
    sys.slots[1] = null;
    sys.slots[2] = makeInst(secondaryId);
    sys.slots[3] = makeInst("knife");
    sys.grenades.he = 0;
    sys.grenades.smoke = 0;
    sys.grenades.flash = 0;
    sys.grenades.fire = 0;
    sys.grenadeSel = "he";
    sys.fireId = player.team === "T" ? "molotov" : "incendiary";
    sys.current = 2;
    sys.scoped = false;
    sys._sprayIdx = 0;
    rebuildViewModel();
    if (CS.hud) CS.hud.updateAmmo(sys.cur());
  };
  sys.cur = function () {
    if (sys.current === 4) {
      grenadeInst.def = CS.WEAPONS[nadeWeaponId(sys.grenadeSel)];
      grenadeInst.magAmmo = sys.grenades[sys.grenadeSel];
      return grenadeInst;
    }
    return sys.slots[sys.current];
  };

  sys.addGrenade = function (type) {
    sys.grenades[type]++;
    if (sys.current === 4 && CS.hud) CS.hud.updateAmmo(sys.cur());
  };

  sys.select = function (slot) {
    if (slot === 4) {
      if (grenadeTotal() <= 0) return;
      if (sys.current === 4) {
        // 已在投掷物槽位：再按 4 循环雷种
        const next = nextNade(sys.grenadeSel);
        if (next !== sys.grenadeSel) {
          sys.grenadeSel = next;
          switchAnim = 0.25;
          rebuildViewModel();
          CS.audio.weaponSwitch();
          if (CS.hud) CS.hud.updateAmmo(sys.cur());
        }
        return;
      }
      if (sys.grenades[sys.grenadeSel] <= 0) sys.grenadeSel = nextNade(sys.grenadeSel);
    } else if (!sys.slots[slot] || slot === sys.current) return;
    const c = sys.cur();
    if (c) c.reloading = false;
    sys.current = slot;
    sys.scoped = false;
    sys._sprayIdx = 0;
    switchAnim = 0.4;
    rebuildViewModel();
    CS.audio.weaponSwitch();
    if (CS.hud) CS.hud.updateAmmo(sys.cur());
  };
  sys.cycle = function (dir) {
    const order = [1, 2, 3].filter((s) => sys.slots[s]);
    if (grenadeTotal() > 0) order.push(4);
    const i = order.indexOf(sys.current);
    sys.select(order[(i + dir + order.length) % order.length]);
  };

  sys.startReload = function () {
    const w = sys.cur();
    if (!w || w.def.melee || w.def.grenade || w.reloading) return;
    if (w.magAmmo >= w.def.mag || w.reserveAmmo <= 0) return;
    w.reloading = true;
    w.reloadEnd = performance.now() / 1000 + w.def.reloadTime;
    sys.scoped = false;
    sys._sprayIdx = 0;
    CS.audio.reload();
    if (CS.hud) CS.hud.updateAmmo(w);
  };

  sys.toggleScope = function () {
    const w = sys.cur();
    if (w && w.def.sniper && !w.reloading) {
      sys.scoped = !sys.scoped;
      CS.audio.scope();
    }
  };

  // ---- 投掷 ----
  function doThrow(type) {
    if (sys.grenades[type] <= 0 || !CS.grenades) return false;
    sys.grenades[type]--;
    const dir = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation);
    const origin = player.eyePos().addScaledVector(dir, 0.35);
    const vel = dir.multiplyScalar(15.5).add(new THREE.Vector3(0, 3.5, 0));
    CS.grenades.throw(type, origin, vel, player, nadeWeaponId(type));
    CS.audio.throwPin();
    vmKick = Math.min(1, vmKick + 0.6);
    // 当前雷种投完：切下一种或回到枪械
    if (sys.current === 4) {
      if (sys.grenades[sys.grenadeSel] <= 0) {
        const next = nextNade(sys.grenadeSel);
        if (sys.grenades[next] > 0) {
          sys.grenadeSel = next;
          rebuildViewModel();
        } else {
          sys.current = sys.slots[1] ? 1 : 2;
          switchAnim = 0.4;
          rebuildViewModel();
        }
      } else rebuildViewModel();
    }
    if (CS.hud) CS.hud.updateAmmo(sys.cur());
    return true;
  }

  // G 键快速投掷：优先 HE → 闪光 → 烟雾 → 火焰，不需要先切到槽位 4
  sys.quickThrow = function (now) {
    if (!player.alive) return;
    if (now - sys.lastShotTime < 0.8) return;
    const type = ["he", "flash", "smoke", "fire"].find((t) => sys.grenades[t] > 0) || null;
    if (!type) return;
    sys.lastShotTime = now;
    doThrow(type);
  };

  // 投掷预览用：当前雷的出手点与初速（与 doThrow 完全一致）
  sys.throwParams = function () {
    const dir = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation);
    const origin = player.eyePos().addScaledVector(dir, 0.35);
    const vel = dir.multiplyScalar(15.5).add(new THREE.Vector3(0, 3.5, 0));
    return { origin, vel };
  };

  // 当前扩散（站/蹲/移动/空中/开镜）
  sys.currentSpread = function () {
    const w = sys.cur();
    if (!w || w.def.melee || w.def.grenade) return 0;
    const def = w.def;
    let sp = def.sniper ? (sys.scoped ? def.scopedSpread : def.spread) : def.spread;
    sp += def.moveSpread * player.speedFactor;          // 跑打更散
    if (!player.onGround) sp += 0.05;                   // 空中乱飞
    if (player.crouching) sp *= 0.6;                    // 蹲下更准
    sp += sys._recoilAccum * 0.35;                      // 连发扩散
    return sp;
  };

  // 尝试开火。triggerHeld 表示按住（全自动）
  sys.tryFire = function (now, triggerHeld) {
    if (!player.alive) return;
    const w = sys.cur();
    if (!w) return;
    const def = w.def;
    if (w.reloading) return;
    if (triggerHeld && !def.auto && !def.melee) return;
    const interval = 60 / def.rpm;
    if (now - sys.lastShotTime < interval) return;

    // 投掷物：左键投出当前雷种
    if (def.grenade) {
      sys.lastShotTime = now;
      doThrow(def.nadeType);
      return;
    }

    if (!def.melee && w.magAmmo <= 0) {
      if (!triggerHeld) {
        CS.audio.dryFire();
        sys.startReload();
      }
      return;
    }

    // 喷射弹道索引：停火超过 2.2 个射击间隔即重置（后坐力恢复）
    if (now - sys.lastShotTime > interval * 2.2) sys._sprayIdx = 0;
    sys.lastShotTime = now;
    if (!def.melee) w.magAmmo--;

    // 射向：视线中心 + 确定性喷射弹道（AK/M4） + 随机扩散
    const spread = sys.currentSpread();
    const pattern = CS.SPRAY_PATTERNS[def.id];
    let patYaw = 0, patPitch = 0;
    if (pattern) {
      const p = pattern[Math.min(sys._sprayIdx, pattern.length - 1)];
      const mul = player.crouching ? 0.72 : 1;
      patYaw = p[0] * mul;
      patPitch = p[1] * mul;
      sys._sprayIdx++;
    }
    const dir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(
      camera.rotation.x + patPitch, camera.rotation.y + patYaw, 0, "YXZ"
    ));
    if (spread > 0) {
      const a = Math.random() * Math.PI * 2, m = Math.sqrt(Math.random()) * spread;
      const right = new THREE.Vector3(1, 0, 0).applyEuler(camera.rotation);
      const up = new THREE.Vector3(0, 1, 0).applyEuler(camera.rotation);
      dir.addScaledVector(right, Math.cos(a) * m).addScaledVector(up, Math.sin(a) * m).normalize();
    }

    const origin = player.eyePos();
    const shot = CS.computeShot(THREE, origin, dir, def, player.team, ctx.getCharacters(), map.colliders);

    // 声音 & 特效
    if (def.melee) {
      CS.audio.knife(!!shot.hit);
    } else {
      CS.audio.gunshot(def.id);
      player.lastFired = now; // 雷达"开枪暴露"
      if (!def.silenced) CS.lastCombat = { x: player.pos.x, z: player.pos.z, t: now }; // BOT 听声支援
      ctx.effects.muzzleFlash();
      ctx.effects.tracer(origin, shot.endPoint, def.sniper);
      if (shot.hitWall) ctx.effects.impact(shot.endPoint, dir);
      // 视觉后坐力（弹道由喷射模式决定，这里只做镜头上抬）
      const rec = (pattern ? def.recoil * 0.5 : def.recoil) * (player.crouching ? 0.75 : 1);
      player.recoilPitch += rec;
      sys._recoilAccum = Math.min(0.06, sys._recoilAccum + rec * 0.55);
      vmKick = Math.min(1, vmKick + (def.sniper ? 1 : 0.45));
      if (def.sniper && sys.scoped) sys.scoped = false; // AWP 开枪退镜
    }

    if (shot.hit) {
      const realDmg = CS.applyArmor(shot.hit, shot.dmg);
      ctx.onDamage(shot.hit, realDmg, player, def, shot.headshot);
      ctx.effects.hitmarker(shot.hit.hp <= 0);
      ctx.effects.blood(shot.endPoint, dir);
    }

    if (CS.hud) CS.hud.updateAmmo(w);
    if (!def.melee && w.magAmmo === 0) sys.startReload();
  };

  sys.update = function (now, dt) {
    const w = sys.cur();
    if (w && w.reloading && now >= w.reloadEnd) {
      w.reloading = false;
      const need = w.def.mag - w.magAmmo;
      const take = Math.min(need, w.reserveAmmo);
      w.magAmmo += take;
      w.reserveAmmo -= take;
      CS.audio.reloadEnd();
      if (CS.hud) CS.hud.updateAmmo(w);
    }
    // 后坐力回复
    sys._recoilAccum = Math.max(0, sys._recoilAccum - dt * 0.09);
    player.recoilPitch = Math.max(0, player.recoilPitch - dt * 0.45);
    if (w && !w.def.melee && now - sys.lastShotTime > (60 / w.def.rpm) * 2.2) sys._sprayIdx = 0;
    updateViewModel(now, dt);
  };

  // ============ 视角武器模型（程序化几何） ============
  const vmGroup = new THREE.Group();
  camera.add(vmGroup);
  let vmKick = 0, switchAnim = 0, bobT = 0;

  const gunmetal = new THREE.MeshLambertMaterial({ color: 0x3a3a40 });
  const gunDark = new THREE.MeshLambertMaterial({ color: 0x222226 });
  const wood = new THREE.MeshLambertMaterial({ color: 0x6e4a28 });
  const greenMat = new THREE.MeshLambertMaterial({ color: 0x3d4a30 });
  const bladeMat = new THREE.MeshLambertMaterial({ color: 0x9aa4ac });

  function box(w, h, d, m, x, y, z, g) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    g.add(mesh);
    return mesh;
  }
  function cyl(r, len, m, x, y, z, g, rotX) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), m);
    mesh.rotation.x = rotX === undefined ? Math.PI / 2 : rotX;
    mesh.position.set(x, y, z);
    g.add(mesh);
    return mesh;
  }

  function buildModel(id) {
    const g = new THREE.Group();
    if (id === "knife") {
      box(0.03, 0.09, 0.13, gunDark, 0, -0.02, 0, g);
      const blade = box(0.012, 0.045, 0.3, bladeMat, 0, 0.01, -0.2, g);
      blade.rotation.x = 0.06;
    } else if (id === "glock" || id === "usp") {
      box(0.045, 0.07, 0.24, id === "usp" ? gunDark : gunmetal, 0, 0.02, -0.1, g);
      const grip = box(0.04, 0.13, 0.06, gunDark, 0, -0.06, 0.0, g);
      grip.rotation.x = 0.25;
      if (id === "usp") cyl(0.02, 0.14, gunDark, 0, 0.03, -0.28, g); // 消音器
    } else if (id === "ak47") {
      box(0.05, 0.07, 0.5, gunmetal, 0, 0.02, -0.18, g);
      cyl(0.013, 0.3, gunDark, 0, 0.025, -0.5, g);
      box(0.045, 0.1, 0.14, wood, 0, -0.045, -0.28, g);    // 护木
      const mag = box(0.035, 0.16, 0.07, gunmetal, 0, -0.09, -0.1, g);
      mag.rotation.x = 0.5;                                 // 弯弹匣
      const stock = box(0.04, 0.07, 0.22, wood, 0, -0.01, 0.16, g);
      stock.rotation.x = -0.08;
      box(0.035, 0.1, 0.05, wood, 0, -0.07, 0.03, g);       // 握把
    } else if (id === "m4a4") {
      box(0.05, 0.07, 0.46, gunDark, 0, 0.02, -0.16, g);
      cyl(0.012, 0.26, gunDark, 0, 0.03, -0.48, g);
      box(0.042, 0.09, 0.16, gunDark, 0, -0.04, -0.26, g);
      box(0.03, 0.14, 0.06, gunmetal, 0, -0.085, -0.08, g);
      box(0.04, 0.06, 0.18, gunDark, 0, 0.0, 0.15, g);
      box(0.012, 0.03, 0.1, gunmetal, 0, 0.065, -0.1, g);   // 提把/瞄具
    } else if (id === "awp") {
      box(0.05, 0.075, 0.55, greenMat, 0, 0.02, -0.2, g);
      cyl(0.014, 0.4, gunDark, 0, 0.03, -0.6, g);
      cyl(0.028, 0.2, gunDark, 0, 0.085, -0.12, g);         // 瞄准镜
      box(0.035, 0.12, 0.05, greenMat, 0, -0.07, 0.02, g);
      box(0.045, 0.09, 0.2, greenMat, 0, -0.02, 0.2, g);
      box(0.03, 0.12, 0.05, gunmetal, 0, -0.08, -0.18, g);  // 弹匣
    } else if (id === "hegrenade") {
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), greenMat);
      body.position.set(0, -0.02, -0.05);
      g.add(body);
      box(0.02, 0.03, 0.02, gunmetal, 0, 0.045, -0.05, g);   // 引信头
      box(0.008, 0.05, 0.025, bladeMat, 0.025, 0.03, -0.05, g); // 握片
    } else if (id === "smokegrenade") {
      cyl(0.035, 0.13, new THREE.MeshLambertMaterial({ color: 0x8a8f94 }), 0, -0.01, -0.05, g, 0);
      box(0.02, 0.025, 0.02, gunmetal, 0, 0.065, -0.05, g);
      box(0.008, 0.05, 0.025, bladeMat, 0.028, 0.045, -0.05, g);
    } else if (id === "flashbang") {
      cyl(0.03, 0.11, bladeMat, 0, -0.01, -0.05, g, 0);
      box(0.02, 0.025, 0.02, gunmetal, 0, 0.055, -0.05, g);
      box(0.008, 0.045, 0.025, gunmetal, 0.026, 0.04, -0.05, g);
    } else if (id === "molotov") {
      // 瓶身 + 瓶颈 + 布条
      cyl(0.04, 0.1, new THREE.MeshLambertMaterial({ color: 0x6a8a4a, transparent: true, opacity: 0.85 }), 0, -0.02, -0.05, g, 0);
      cyl(0.016, 0.06, new THREE.MeshLambertMaterial({ color: 0x5a7a3e }), 0, 0.055, -0.05, g, 0);
      box(0.02, 0.05, 0.015, new THREE.MeshLambertMaterial({ color: 0xd8d0b8 }), 0.01, 0.1, -0.05, g);
    } else if (id === "incendiary") {
      cyl(0.035, 0.12, new THREE.MeshLambertMaterial({ color: 0xa03828 }), 0, -0.01, -0.05, g, 0);
      box(0.02, 0.025, 0.02, gunmetal, 0, 0.06, -0.05, g);
      box(0.008, 0.045, 0.025, bladeMat, 0.026, 0.045, -0.05, g);
    }
    return g;
  }

  const models = {};
  for (const id in CS.WEAPONS) models[id] = buildModel(id);

  function rebuildViewModel() {
    while (vmGroup.children.length) vmGroup.remove(vmGroup.children[0]);
    const w = sys.cur();
    if (w) vmGroup.add(models[w.def.id]);
  }
  rebuildViewModel();

  function updateViewModel(now, dt) {
    vmKick = Math.max(0, vmKick - dt * 7);
    switchAnim = Math.max(0, switchAnim - dt);
    const w = sys.cur();
    // 走路摆动
    if (player.onGround && player.speedFactor > 0.1 && player.alive) {
      bobT += dt * 9 * player.speedFactor;
    }
    const bobX = Math.sin(bobT) * 0.008 * player.speedFactor;
    const bobY = -Math.abs(Math.cos(bobT)) * 0.008 * player.speedFactor;

    let reloadDip = 0;
    if (w && w.reloading) {
      const remain = w.reloadEnd - now;
      const p = 1 - Math.min(1, Math.max(0, remain / w.def.reloadTime));
      reloadDip = Math.sin(p * Math.PI) * 0.16;
    }
    const switchDip = switchAnim > 0 ? switchAnim * 0.5 : 0;

    vmGroup.position.set(
      0.22 + bobX,
      -0.22 + bobY - reloadDip - switchDip + vmKick * 0.03,
      -0.42 + vmKick * 0.1
    );
    vmGroup.rotation.set(vmKick * 0.22 + reloadDip * 1.2, 0.06, 0);
    vmGroup.visible = !!w && player.alive && !(sys.scoped);
  }

  return sys;
};

// ============ 地面武器（死亡掉落 / E 拾取） ============
CS.createGroundItems = function (THREE, ctx) {
  // ctx: {scene, map}
  const { scene, map } = ctx;
  const items = []; // {id, magAmmo, reserveAmmo, mesh, label, x, y, z}

  const bodyMat = new THREE.MeshLambertMaterial({ color: 0x2c2c30 });
  const labelCache = {};

  function makeLabel(name) {
    if (labelCache[name]) return labelCache[name];
    const cv = document.createElement("canvas");
    cv.width = 192; cv.height = 48;
    const g = cv.getContext("2d");
    g.font = "bold 26px Arial";
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "rgba(0,0,0,0.55)";
    const w = g.measureText(name).width + 22;
    g.fillRect(96 - w / 2, 6, w, 36);
    g.fillStyle = "#e8dfc0";
    g.fillText(name, 96, 25);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    labelCache[name] = tex;
    return tex;
  }

  function makeMesh(id) {
    const group = new THREE.Group();
    const def = CS.WEAPONS[id];
    const len = def.sniper ? 1.25 : 0.95;
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, len), bodyMat);
    body.castShadow = true;
    group.add(body);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeLabel(def.name), transparent: true, depthTest: false, opacity: 0.9,
    }));
    sprite.scale.set(1.5, 0.375, 1);
    sprite.position.y = 0.55;
    group.add(sprite);
    return group;
  }

  const gi = {
    drop(id, magAmmo, reserveAmmo, pos) {
      if (items.length >= 10) { // 上限，最旧的先消失
        const old = items.shift();
        scene.remove(old.mesh);
      }
      const gy = map.groundHeight(pos.x, pos.z, pos.y + 1);
      const mesh = makeMesh(id);
      const x = pos.x + (Math.random() - 0.5) * 0.7, z = pos.z + (Math.random() - 0.5) * 0.7;
      mesh.position.set(x, gy + 0.07, z);
      mesh.rotation.y = Math.random() * Math.PI * 2;
      mesh.rotation.z = 0.12;
      scene.add(mesh);
      items.push({ id, magAmmo, reserveAmmo, mesh, x, y: gy, z });
    },
    // 返回半径内最近的地面武器（不移除）
    nearest(pos, radius) {
      let best = null, bd = radius * radius;
      for (const it of items) {
        const d = (it.x - pos.x) * (it.x - pos.x) + (it.z - pos.z) * (it.z - pos.z);
        const dy = Math.abs(it.y - pos.y);
        if (d < bd && dy < 2) { bd = d; best = it; }
      }
      return best;
    },
    take(item) {
      const i = items.indexOf(item);
      if (i < 0) return null;
      items.splice(i, 1);
      scene.remove(item.mesh);
      return item;
    },
    clear() {
      for (const it of items) scene.remove(it.mesh);
      items.length = 0;
    },
    count() { return items.length; },
  };
  return gi;
};
