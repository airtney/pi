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
};

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
    grenades: { he: 0, smoke: 0 },
    grenadeSel: "he",
  };

  function makeInst(id) {
    const def = CS.WEAPONS[id];
    return { def, magAmmo: def.mag, reserveAmmo: def.reserve, reloading: false, reloadEnd: 0 };
  }

  // 槽位 4 的"伪武器"实例：magAmmo 显示当前雷种剩余数量
  const grenadeInst = { def: CS.WEAPONS.hegrenade, magAmmo: 0, reserveAmmo: 0, reloading: false, reloadEnd: 0 };
  function grenadeTotal() { return sys.grenades.he + sys.grenades.smoke; }
  function otherNade(t) { return t === "he" ? "smoke" : "he"; }

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
    sys.grenadeSel = "he";
    sys.current = 2;
    sys.scoped = false;
    rebuildViewModel();
    if (CS.hud) CS.hud.updateAmmo(sys.cur());
  };
  sys.cur = function () {
    if (sys.current === 4) {
      grenadeInst.def = CS.WEAPONS[sys.grenadeSel === "he" ? "hegrenade" : "smokegrenade"];
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
        // 已在投掷物槽位：再按 4 切换雷种
        const other = otherNade(sys.grenadeSel);
        if (sys.grenades[other] > 0) {
          sys.grenadeSel = other;
          switchAnim = 0.25;
          rebuildViewModel();
          CS.audio.weaponSwitch();
          if (CS.hud) CS.hud.updateAmmo(sys.cur());
        }
        return;
      }
      if (sys.grenades[sys.grenadeSel] <= 0) sys.grenadeSel = otherNade(sys.grenadeSel);
    } else if (!sys.slots[slot] || slot === sys.current) return;
    const c = sys.cur();
    if (c) c.reloading = false;
    sys.current = slot;
    sys.scoped = false;
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
    CS.grenades.throw(type, origin, vel, player);
    CS.audio.throwPin();
    vmKick = Math.min(1, vmKick + 0.6);
    // 当前雷种投完：切另一种或回到枪械
    if (sys.current === 4) {
      if (sys.grenades[sys.grenadeSel] <= 0) {
        const other = otherNade(sys.grenadeSel);
        if (sys.grenades[other] > 0) {
          sys.grenadeSel = other;
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

  // G 键快速投掷：优先 HE，其次烟雾，不需要先切到槽位 4
  sys.quickThrow = function (now) {
    if (!player.alive) return;
    if (now - sys.lastShotTime < 0.8) return;
    const type = sys.grenades.he > 0 ? "he" : sys.grenades.smoke > 0 ? "smoke" : null;
    if (!type) return;
    sys.lastShotTime = now;
    doThrow(type);
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

    sys.lastShotTime = now;
    if (!def.melee) w.magAmmo--;

    // 射向：视线中心 + 随机扩散
    const spread = sys.currentSpread();
    const dir = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation);
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
      ctx.effects.muzzleFlash();
      ctx.effects.tracer(origin, shot.endPoint, def.sniper);
      if (shot.hitWall) ctx.effects.impact(shot.endPoint);
      // 后坐力
      const rec = def.recoil * (player.crouching ? 0.75 : 1);
      player.recoilPitch += rec;
      sys._recoilAccum = Math.min(0.06, sys._recoilAccum + rec * 0.55);
      vmKick = Math.min(1, vmKick + (def.sniper ? 1 : 0.45));
      if (def.sniper && sys.scoped) sys.scoped = false; // AWP 开枪退镜
    }

    if (shot.hit) {
      const realDmg = CS.applyArmor(shot.hit, shot.dmg);
      ctx.onDamage(shot.hit, realDmg, player, def, shot.headshot);
      ctx.effects.hitmarker(shot.hit.hp <= 0);
      ctx.effects.blood(shot.endPoint);
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
