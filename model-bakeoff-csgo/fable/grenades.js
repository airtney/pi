"use strict";
// grenades.js — 投掷物：HE（范围伤害）/ 闪光（致盲）/ 烟雾（挡视线）/ 火焰（区域封锁）
window.CS = window.CS || {};

CS.createGrenades = function (THREE, ctx) {
  // ctx: {scene, map, effects, applyDamage, getCharacters, getListenerPos}
  const { scene, map, effects } = ctx;
  const GRAV = 14, HE_FUSE = 1.7, SMOKE_FUSE = 1.5, FLASH_FUSE = 1.4, FIRE_FUSE = 2.0;
  const HE_RADIUS = 10, HE_DMG = 105;
  const SMOKE_LIFE = 15, SMOKE_R = 3.6;
  const FLASH_RADIUS = 26;
  const FIRE_LIFE = 7, FIRE_R = 3.2, FIRE_TICK = 0.25, FIRE_TICK_DMG = 7; // 28 dps

  const projs = [];   // {type, pos, vel, thrower, born, mesh, srcId, landed}
  const smokes = [];  // {x,y,z,r,born,group,puffs:[{mesh,phase,base}]}
  const fires = [];   // {x,y,z,r,born,thrower,srcId,group,flames,light,nextTick}
  let tintNow = 0;

  const heMat = new THREE.MeshLambertMaterial({ color: 0x3d4a30 });
  const smokeShellMat = new THREE.MeshLambertMaterial({ color: 0x8a8f94 });
  const flashShellMat = new THREE.MeshLambertMaterial({ color: 0xb8bec4 });
  const fireShellMat = new THREE.MeshLambertMaterial({ color: 0x9a5a30 });
  const projGeo = new THREE.SphereGeometry(0.09, 8, 8);
  const puffGeo = new THREE.SphereGeometry(1, 10, 10);
  const flameGeo = new THREE.ConeGeometry(0.32, 1.1, 6);
  const scorchGeo = new THREE.CircleGeometry(1, 16);

  const gren = {};

  // ============ 投掷 ============
  // srcId：具体武器 id（molotov / incendiary 等，用于击杀信息与火焰颜色）
  gren.throw = function (type, origin, vel, thrower, srcId) {
    const mesh = new THREE.Mesh(projGeo,
      type === "he" ? heMat : type === "flash" ? flashShellMat : type === "fire" ? fireShellMat : smokeShellMat);
    mesh.position.copy(origin);
    mesh.castShadow = true;
    scene.add(mesh);
    projs.push({
      type,
      pos: { x: origin.x, y: origin.y, z: origin.z },
      vel: { x: vel.x, y: vel.y, z: vel.z },
      thrower,
      srcId: srcId || CS.NADE_WEAPON[type],
      born: performance.now() / 1000,
      mesh,
      landed: false,
    });
  };

  // BOT 用：朝目标点抛物线投掷（粗略弧线即可）
  gren.throwAt = function (type, origin, target, thrower, srcId) {
    const dx = target.x - origin.x, dz = target.z - origin.z;
    const dh = Math.hypot(dx, dz) || 1;
    const speed = Math.min(17, 7 + dh * 0.5);
    const vel = new THREE.Vector3(
      (dx / dh) * speed,
      speed * 0.3 + (target.y - origin.y) * 0.5 + dh * 0.14,
      (dz / dh) * speed
    );
    gren.throw(type, new THREE.Vector3(origin.x, origin.y, origin.z), vel, thrower, srcId);
    CS.audio.throwPinAt({ x: origin.x, y: origin.y, z: origin.z }, ctx.getListenerPos());
  };

  // ============ 物理 ============
  function collides(x, y, z) {
    const r = 0.1;
    for (const c of map.colliders) {
      if (x + r > c.x1 && x - r < c.x2 && y + r > c.y1 && y - r < c.y2 && z + r > c.z1 && z - r < c.z2) return true;
    }
    return false;
  }

  function stepProjectile(p, dt) {
    p.vel.y -= GRAV * dt;
    const speed = Math.abs(p.vel.x) + Math.abs(p.vel.y) + Math.abs(p.vel.z);
    const steps = Math.max(1, Math.ceil(speed * dt / 0.25));
    const sdt = dt / steps;
    for (let s = 0; s < steps; s++) {
      let bounced = 0;
      const nx = p.pos.x + p.vel.x * sdt;
      if (collides(nx, p.pos.y, p.pos.z)) { p.vel.x *= -0.4; bounced = Math.abs(p.vel.x); } else p.pos.x = nx;
      const nz = p.pos.z + p.vel.z * sdt;
      if (collides(p.pos.x, p.pos.y, nz)) { p.vel.z *= -0.4; bounced = Math.max(bounced, Math.abs(p.vel.z)); } else p.pos.z = nz;
      const ny = p.pos.y + p.vel.y * sdt;
      if (ny <= 0.09 && p.vel.y < 0) {
        p.pos.y = 0.09;
        bounced = Math.abs(p.vel.y);
        p.vel.y = Math.abs(p.vel.y) > 2 ? -p.vel.y * 0.4 : 0;
        p.vel.x *= 0.8; p.vel.z *= 0.8; // 地面摩擦
        p.landed = true;               // 火焰弹落地即燃
      } else if (collides(p.pos.x, ny, p.pos.z)) {
        bounced = Math.abs(p.vel.y);
        if (p.vel.y < 0) {
          p.vel.y = Math.abs(p.vel.y) > 2 ? -p.vel.y * 0.4 : 0;
          p.vel.x *= 0.8; p.vel.z *= 0.8;
          p.landed = true;
        } else p.vel.y *= -0.4;
      } else p.pos.y = ny;
      if (bounced > 2.5) CS.audio.grenadeBounceAt(p.pos, ctx.getListenerPos());
    }
    p.mesh.position.set(p.pos.x, p.pos.y, p.pos.z);
    p.mesh.rotation.x += dt * 8;
    p.mesh.rotation.z += dt * 5;
  }

  // ============ 引爆 ============
  function detonateHE(p) {
    effects.heExplosion(new THREE.Vector3(p.pos.x, p.pos.y + 0.2, p.pos.z));
    CS.audio.heExplosionAt(p.pos, ctx.getListenerPos());
    const def = CS.WEAPONS.hegrenade;
    for (const ch of ctx.getCharacters()) {
      if (!ch.alive) continue;
      // 不伤队友，但会伤到投掷者自己
      if (ch.team === p.thrower.team && ch !== p.thrower) continue;
      const cy = ch.pos.y + ch.height * 0.5;
      const d = Math.hypot(ch.pos.x - p.pos.x, cy - p.pos.y, ch.pos.z - p.pos.z);
      if (d >= HE_RADIUS) continue;
      let dmg = HE_DMG * (1 - d / HE_RADIUS);
      // 隔墙伤害减半
      if (CS.lineBlocked({ x: p.pos.x, y: p.pos.y + 0.3, z: p.pos.z }, { x: ch.pos.x, y: cy, z: ch.pos.z }, map.colliders)) {
        dmg *= 0.35;
      }
      dmg = Math.max(1, Math.round(dmg));
      dmg = CS.applyArmor(ch, dmg);
      ctx.applyDamage(ch, dmg, p.thrower, def, false);
      if (ch.isHuman) {
        const shake = Math.min(0.9, 1.2 * (1 - d / HE_RADIUS));
        CS.hud.heFlash(shake);
      }
    }
    // 投掷者是玩家且命中敌人时的命中反馈由 applyDamage/killfeed 呈现，这里只做近距白闪
    if (p.thrower.isHuman) {
      const d = Math.hypot(p.thrower.pos.x - p.pos.x, p.thrower.pos.z - p.pos.z);
      if (d < HE_RADIUS * 1.4) CS.hud.heFlash(0.25);
    }
  }

  // 闪光弹：视线可达 + 距离 + 朝向决定致盲强度
  function detonateFlash(p) {
    const now = performance.now() / 1000;
    const fpos = { x: p.pos.x, y: p.pos.y + 0.3, z: p.pos.z };
    effects.flashPop(new THREE.Vector3(fpos.x, fpos.y, fpos.z));
    CS.audio.flashBangAt(p.pos, ctx.getListenerPos());
    for (const ch of ctx.getCharacters()) {
      if (!ch.alive) continue;
      const eye = { x: ch.pos.x, y: ch.pos.y + ch.height * 0.9, z: ch.pos.z };
      const d = Math.hypot(eye.x - fpos.x, eye.y - fpos.y, eye.z - fpos.z);
      if (d >= FLASH_RADIUS) continue;
      if (CS.lineBlocked(fpos, eye, map.colliders)) continue; // 墙后不炸盲
      if (gren.lineInSmoke(fpos, eye)) continue;              // 烟雾挡闪
      // 朝向系数：面向闪光全致盲，背对只有轻微
      let facing = 1;
      const fx = -Math.sin(ch.yaw !== undefined ? ch.yaw : 0), fz = -Math.cos(ch.yaw !== undefined ? ch.yaw : 0);
      const tx = (fpos.x - eye.x) / (d || 1), tz = (fpos.z - eye.z) / (d || 1);
      const dot = fx * tx + fz * tz;
      facing = dot > 0.2 ? 1 : dot > -0.3 ? 0.55 : 0.22;
      const strength = Math.min(1, (1 - d / FLASH_RADIUS) * 1.4) * facing;
      if (strength < 0.08) continue;
      if (ch.isHuman) {
        CS.hud.flashBlind(strength);
        if (strength > 0.55) CS.audio.flashRing(strength);
      } else {
        const dur = 0.5 + strength * 3.2;
        ch.blindUntil = Math.max(ch.blindUntil || 0, now + dur);
        ch.target = null; // 丢失目标
      }
    }
  }

  function deploySmoke(p) {
    const gy = map.groundHeight(p.pos.x, p.pos.z, p.pos.y + 0.5);
    const group = new THREE.Group();
    group.position.set(p.pos.x, gy, p.pos.z);
    const puffs = [];
    for (let i = 0; i < 13; i++) {
      const mat = new THREE.MeshLambertMaterial({
        color: 0xc2c6c9, transparent: true, opacity: 0, depthWrite: false,
      });
      const m = new THREE.Mesh(puffGeo, mat);
      const a = Math.random() * Math.PI * 2, rr = Math.random() * SMOKE_R * 0.6;
      m.position.set(Math.cos(a) * rr, 0.3 + Math.random() * 1.9, Math.sin(a) * rr);
      const base = 1.1 + Math.random() * 1.3;
      m.scale.setScalar(base * 0.3);
      group.add(m);
      puffs.push({ mesh: m, phase: Math.random() * Math.PI * 2, base });
    }
    scene.add(group);
    smokes.push({ x: p.pos.x, y: gy + 1.4, z: p.pos.z, r: SMOKE_R, born: performance.now() / 1000, group, puffs });
    CS.audio.smokeDeployAt(p.pos, ctx.getListenerPos());
    // 烟雾浇灭覆盖范围内的火焰（和 CS 一致）
    for (let i = fires.length - 1; i >= 0; i--) {
      const f = fires[i];
      if (Math.hypot(f.x - p.pos.x, f.z - p.pos.z) < SMOKE_R + f.r * 0.5) removeFire(i);
    }
  }

  // ============ 火焰（燃烧瓶 / 燃烧弹） ============
  function removeFire(i) {
    const f = fires[i];
    f.flames.forEach((fl) => fl.mesh.material.dispose());
    f.scorch.material.dispose();
    scene.remove(f.group);
    fires.splice(i, 1);
  }

  function deployFire(p) {
    const gy = map.groundHeight(p.pos.x, p.pos.z, p.pos.y + 0.5);
    // 落进烟雾里：直接熄灭，不成火
    for (const s of smokes) {
      if (Math.hypot(p.pos.x - s.x, p.pos.z - s.z) < s.r) {
        CS.audio.fireOutAt(p.pos, ctx.getListenerPos());
        return;
      }
    }
    const def = CS.WEAPONS[p.srcId] || CS.WEAPONS.molotov;
    const group = new THREE.Group();
    group.position.set(p.pos.x, gy, p.pos.z);
    // 烧痕
    const scorch = new THREE.Mesh(scorchGeo, new THREE.MeshBasicMaterial({
      color: 0x181008, transparent: true, opacity: 0.55, depthWrite: false,
    }));
    scorch.rotation.x = -Math.PI / 2;
    scorch.position.y = 0.02;
    scorch.scale.setScalar(FIRE_R);
    group.add(scorch);
    // 火苗（锥体集群，逐帧闪动）
    const flames = [];
    for (let i = 0; i < 12; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: def.fireColor, transparent: true, opacity: 0.85, depthWrite: false,
      });
      const m = new THREE.Mesh(flameGeo, mat);
      const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * FIRE_R * 0.85;
      m.position.set(Math.cos(a) * rr, 0.5, Math.sin(a) * rr);
      const base = 0.6 + Math.random() * 0.8;
      m.scale.setScalar(base);
      group.add(m);
      flames.push({ mesh: m, phase: Math.random() * Math.PI * 2, base });
    }
    const light = new THREE.PointLight(def.fireColor, 9, FIRE_R * 4, 1.6);
    light.position.y = 1;
    group.add(light);
    scene.add(group);
    fires.push({
      x: p.pos.x, y: gy, z: p.pos.z, r: FIRE_R,
      born: performance.now() / 1000,
      thrower: p.thrower, srcId: p.srcId,
      group, flames, light, scorch,
      nextTick: 0,
    });
    CS.audio.fireIgniteAt(p.pos, ctx.getListenerPos());
  }

  // BOT 路径回避 / 站位判断：某点是否在火里
  gren.pointInFire = function (x, z, y) {
    for (const f of fires) {
      if (Math.abs((y || 0) - f.y) > 2.2) continue;
      const dx = x - f.x, dz = z - f.z;
      if (dx * dx + dz * dz < f.r * f.r) return true;
    }
    return false;
  };
  gren.nearestFire = function (x, z) {
    let best = null, bd = 1e9;
    for (const f of fires) {
      const d = (x - f.x) * (x - f.x) + (z - f.z) * (z - f.z);
      if (d < bd) { bd = d; best = f; }
    }
    return best;
  };

  // ============ 烟雾遮挡视线（线段 vs 球） ============
  gren.lineInSmoke = function (a, b) {
    for (const s of smokes) {
      const r = s.r * 0.9;
      const abx = b.x - a.x, aby = b.y - a.y, abz = b.z - a.z;
      const len2 = abx * abx + aby * aby + abz * abz;
      let t = 0;
      if (len2 > 1e-9) {
        t = ((s.x - a.x) * abx + (s.y - a.y) * aby + (s.z - a.z) * abz) / len2;
        t = Math.max(0, Math.min(1, t));
      }
      const px = a.x + abx * t - s.x, py = a.y + aby * t - s.y, pz = a.z + abz * t - s.z;
      if (px * px + py * py + pz * pz < r * r) return true;
    }
    return false;
  };

  gren.activeSmokes = function () { return smokes.length; };
  gren.activeProjectiles = function () { return projs.length; };
  gren.activeFires = function () { return fires.length; };

  // 投掷预览：按同一套物理模拟弧线，输出点列（供 HUD 画虚线）
  gren.simulateArc = function (origin, vel, outPoints, maxPoints) {
    const p = { x: origin.x, y: origin.y, z: origin.z };
    const v = { x: vel.x, y: vel.y, z: vel.z };
    const dt = 0.05;
    let n = 0;
    outPoints[n++] = { x: p.x, y: p.y, z: p.z };
    for (let i = 0; i < 60 && n < maxPoints; i++) {
      v.y -= GRAV * dt;
      const nx = p.x + v.x * dt, ny = p.y + v.y * dt, nz = p.z + v.z * dt;
      if (ny <= 0.09 || collides(nx, ny, nz)) {
        outPoints[n++] = { x: p.x, y: Math.max(0.09, p.y), z: p.z };
        break;
      }
      p.x = nx; p.y = ny; p.z = nz;
      if (i % 2 === 0) outPoints[n++] = { x: p.x, y: p.y, z: p.z };
    }
    return n;
  };

  // ============ 清场（回合开始） ============
  gren.clear = function () {
    for (const p of projs) scene.remove(p.mesh);
    projs.length = 0;
    for (const s of smokes) {
      s.puffs.forEach((pf) => pf.mesh.material.dispose());
      scene.remove(s.group);
    }
    smokes.length = 0;
    for (let i = fires.length - 1; i >= 0; i--) removeFire(i);
    CS.hud.smokeTint(0);
    tintNow = 0;
  };

  // ============ 主更新 ============
  gren.update = function (dt, now) {
    // 投掷物
    for (let i = projs.length - 1; i >= 0; i--) {
      const p = projs[i];
      stepProjectile(p, dt);
      const fuse = p.type === "he" ? HE_FUSE : p.type === "flash" ? FLASH_FUSE : p.type === "fire" ? FIRE_FUSE : SMOKE_FUSE;
      // 火焰弹：落地即燃，否则引信到时也燃
      const done = p.type === "fire" ? (p.landed || now - p.born >= fuse) : now - p.born >= fuse;
      if (done) {
        scene.remove(p.mesh);
        projs.splice(i, 1);
        if (p.type === "he") detonateHE(p);
        else if (p.type === "flash") detonateFlash(p);
        else if (p.type === "fire") deployFire(p);
        else deploySmoke(p);
      }
    }

    // 火焰：闪动、伤害 tick、寿命
    for (let i = fires.length - 1; i >= 0; i--) {
      const f = fires[i];
      const age = now - f.born;
      if (age >= FIRE_LIFE) { removeFire(i); continue; }
      const grow = Math.min(1, age / 0.35);
      const fade = age > FIRE_LIFE - 1 ? FIRE_LIFE - age : 1;
      for (const fl of f.flames) {
        const flick = 0.7 + 0.3 * Math.sin(now * 13 + fl.phase) * Math.sin(now * 7.3 + fl.phase * 2);
        fl.mesh.scale.set(fl.base * grow * fade, fl.base * grow * fade * (0.8 + flick * 0.5), fl.base * grow * fade);
        fl.mesh.position.y = 0.45 * fl.mesh.scale.y;
        fl.mesh.material.opacity = 0.85 * grow * fade;
      }
      f.light.intensity = 9 * grow * fade * (0.85 + 0.15 * Math.sin(now * 17 + f.born));
      if (now >= f.nextTick) {
        f.nextTick = now + FIRE_TICK;
        const def = CS.WEAPONS[f.srcId] || CS.WEAPONS.molotov;
        for (const ch of ctx.getCharacters()) {
          if (!ch.alive) continue;
          if (ch.team === f.thrower.team && ch !== f.thrower) continue; // 不烧队友
          const dx = ch.pos.x - f.x, dz = ch.pos.z - f.z;
          if (dx * dx + dz * dz > f.r * f.r || Math.abs(ch.pos.y - f.y) > 2.2) continue;
          ctx.applyDamage(ch, FIRE_TICK_DMG, f.thrower, def, false); // 火焰无视护甲
        }
        CS.audio.fireCrackleAt(f, ctx.getListenerPos());
      }
    }

    // 烟云动画与寿命
    for (let i = smokes.length - 1; i >= 0; i--) {
      const s = smokes[i];
      const age = now - s.born;
      if (age >= SMOKE_LIFE) {
        s.puffs.forEach((pf) => pf.mesh.material.dispose());
        scene.remove(s.group);
        smokes.splice(i, 1);
        continue;
      }
      // 0-0.6s 膨胀成型，最后 1.8s 消散
      const grow = Math.min(1, age / 0.6);
      const fade = age > SMOKE_LIFE - 1.8 ? (SMOKE_LIFE - age) / 1.8 : 1;
      for (const pf of s.puffs) {
        pf.mesh.scale.setScalar(pf.base * (0.3 + 0.7 * grow) * (0.85 + 0.15 * Math.sin(now * 0.7 + pf.phase)));
        pf.mesh.material.opacity = 0.88 * grow * fade;
        pf.mesh.position.y += dt * 0.05;
      }
      s.group.rotation.y += dt * 0.06;
    }

    // 玩家身处烟中 → 轻微灰屏
    let tintTarget = 0;
    const eye = ctx.getListenerPos();
    for (const s of smokes) {
      const d = Math.hypot(eye.x - s.x, (eye.y || 1.6) - s.y, eye.z - s.z);
      if (d < s.r + 0.6) tintTarget = Math.max(tintTarget, 0.55 * Math.min(1, (s.r + 0.6 - d) / s.r + 0.35));
    }
    tintNow += (tintTarget - tintNow) * Math.min(1, dt * 8);
    CS.hud.smokeTint(tintNow < 0.02 ? 0 : tintNow);
  };

  return gren;
};
