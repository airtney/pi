"use strict";
// grenades.js — 投掷物：HE 手雷（弧线弹道 + 范围伤害）与烟雾弹（遮挡视线的烟云）
window.CS = window.CS || {};

CS.createGrenades = function (THREE, ctx) {
  // ctx: {scene, map, effects, applyDamage, getCharacters, getListenerPos}
  const { scene, map, effects } = ctx;
  const GRAV = 14, HE_FUSE = 1.7, SMOKE_FUSE = 1.5;
  const HE_RADIUS = 10, HE_DMG = 105;
  const SMOKE_LIFE = 15, SMOKE_R = 3.6;

  const projs = [];   // {type, pos, vel, thrower, born, mesh, rested}
  const smokes = [];  // {x,y,z,r,born,group,puffs:[{mesh,phase,base}]}
  let tintNow = 0;

  const heMat = new THREE.MeshLambertMaterial({ color: 0x3d4a30 });
  const smokeShellMat = new THREE.MeshLambertMaterial({ color: 0x8a8f94 });
  const projGeo = new THREE.SphereGeometry(0.09, 8, 8);
  const puffGeo = new THREE.SphereGeometry(1, 10, 10);

  const gren = {};

  // ============ 投掷 ============
  gren.throw = function (type, origin, vel, thrower) {
    const mesh = new THREE.Mesh(projGeo, type === "he" ? heMat : smokeShellMat);
    mesh.position.copy(origin);
    mesh.castShadow = true;
    scene.add(mesh);
    projs.push({
      type,
      pos: { x: origin.x, y: origin.y, z: origin.z },
      vel: { x: vel.x, y: vel.y, z: vel.z },
      thrower,
      born: performance.now() / 1000,
      mesh,
    });
  };

  // BOT 用：朝目标点抛物线投掷（粗略弧线即可）
  gren.throwAt = function (type, origin, target, thrower) {
    const dx = target.x - origin.x, dz = target.z - origin.z;
    const dh = Math.hypot(dx, dz) || 1;
    const speed = Math.min(17, 7 + dh * 0.5);
    const vel = new THREE.Vector3(
      (dx / dh) * speed,
      speed * 0.3 + (target.y - origin.y) * 0.5 + dh * 0.14,
      (dz / dh) * speed
    );
    gren.throw(type, new THREE.Vector3(origin.x, origin.y, origin.z), vel, thrower);
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
      } else if (collides(p.pos.x, ny, p.pos.z)) {
        bounced = Math.abs(p.vel.y);
        if (p.vel.y < 0) { p.vel.y = Math.abs(p.vel.y) > 2 ? -p.vel.y * 0.4 : 0; p.vel.x *= 0.8; p.vel.z *= 0.8; }
        else p.vel.y *= -0.4;
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
  }

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

  // ============ 清场（回合开始） ============
  gren.clear = function () {
    for (const p of projs) scene.remove(p.mesh);
    projs.length = 0;
    for (const s of smokes) {
      s.puffs.forEach((pf) => pf.mesh.material.dispose());
      scene.remove(s.group);
    }
    smokes.length = 0;
    CS.hud.smokeTint(0);
    tintNow = 0;
  };

  // ============ 主更新 ============
  gren.update = function (dt, now) {
    // 投掷物
    for (let i = projs.length - 1; i >= 0; i--) {
      const p = projs[i];
      stepProjectile(p, dt);
      const fuse = p.type === "he" ? HE_FUSE : SMOKE_FUSE;
      if (now - p.born >= fuse) {
        scene.remove(p.mesh);
        projs.splice(i, 1);
        if (p.type === "he") detonateHE(p);
        else deploySmoke(p);
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
