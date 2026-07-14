"use strict";
// bots.js — BOT：路点寻路、视野检测、开火、安放/拆除 C4、程序化人物模型
window.CS = window.CS || {};

CS.BOT_NAMES = {
  T: ["Phoenix", "Elite", "Pirate", "Anarchist"],
  CT: ["Seal", "GIGN", "SAS", "FBI"],
};

CS.createBot = function (THREE, map, name, team) {
  const bot = {
    name, team,
    isHuman: false,
    pos: { x: 0, y: 0, z: 0 },
    vel: { x: 0, y: 0, z: 0 },
    radius: 0.42,
    height: 1.8,
    onGround: true,
    yaw: 0,
    alive: true,
    hp: 100, armor: 0, money: 800,
    kills: 0, deaths: 0,
    hasBomb: false,
    crouching: false,
    speedFactor: 0,

    // AI 状态
    state: "idle",       // idle | seek | combat | plant | defuse | guard
    path: [], pathI: 0,
    goal: null,          // 目标路点名
    target: null,        // 敌人
    lastSeen: 0,
    nextShot: 0,
    reactUntil: 0,       // 反应延迟
    strafeDir: 1, strafeT: 0,
    repathT: 0,
    weapon: null,        // {def, magAmmo, reloading, reloadEnd}
    grenades: { he: 0, smoke: 0 },
    actionT: 0,          // 安放/拆除进度
    guardT: 0,
  };

  // ============ 模型 ============
  const isT = team === "T";
  const skin = new THREE.MeshLambertMaterial({ color: 0xc8a078 });
  const clothA = new THREE.MeshLambertMaterial({ color: isT ? 0x8a7448 : 0x33465e });
  const clothB = new THREE.MeshLambertMaterial({ color: isT ? 0x5c4d30 : 0x22303f });
  const gunMat = new THREE.MeshLambertMaterial({ color: 0x2c2c30 });

  const g = new THREE.Group();
  function part(w, h, d, m, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    g.add(mesh);
    return mesh;
  }
  const legL = part(0.22, 0.8, 0.24, clothB, -0.14, 0.4, 0);
  const legR = part(0.22, 0.8, 0.24, clothB, 0.14, 0.4, 0);
  part(0.56, 0.62, 0.32, clothA, 0, 1.1, 0);                       // 躯干
  const armL = part(0.14, 0.55, 0.16, clothA, -0.36, 1.12, 0);
  const armR = part(0.14, 0.55, 0.16, clothA, 0.36, 1.12, 0);
  const head = part(0.3, 0.3, 0.3, skin, 0, 1.62, 0);
  if (isT) part(0.32, 0.1, 0.32, clothB, 0, 1.74, 0);              // T 头巾
  else part(0.34, 0.14, 0.34, gunMat, 0, 1.72, 0);                 // CT 头盔
  const gun = part(0.06, 0.08, 0.7, gunMat, 0.2, 1.25, -0.35);
  gun.rotation.x = 0.05;
  bot.mesh = g;
  bot.headMesh = head;
  bot._animParts = { legL, legR, armL, armR };

  bot.setWeapon = function (id) {
    const def = CS.WEAPONS[id];
    bot.weapon = { def, magAmmo: def.mag, reloading: false, reloadEnd: 0 };
    gun.visible = !def.melee;
    gun.scale.z = def.sniper ? 1.35 : def.slot === 2 ? 0.5 : 1;
  };
  bot.setWeapon(team === "T" ? "glock" : "usp");

  bot.spawnAt = function (sp) {
    bot.pos.x = sp.x + (Math.random() - 0.5); bot.pos.z = sp.z + (Math.random() - 0.5);
    bot.pos.y = map.groundHeight(bot.pos.x, bot.pos.z, 3) + 0.01;
    bot.vel.x = bot.vel.y = bot.vel.z = 0;
    bot.yaw = sp.yaw;
    bot.hp = 100; bot.alive = true;
    bot.state = "idle"; bot.path = []; bot.target = null; bot.actionT = 0;
    g.visible = true;
    g.rotation.z = 0;
    syncMesh();
  };

  bot.eyePos = function () {
    return new THREE.Vector3(bot.pos.x, bot.pos.y + 1.62, bot.pos.z);
  };

  bot.die = function () {
    bot.alive = false;
    bot.deaths++;
    bot.state = "dead";
    // 倒地"尸体"
    g.rotation.z = (Math.random() < 0.5 ? 1 : -1) * Math.PI / 2;
    g.position.y = bot.pos.y + 0.35;
  };

  function syncMesh() {
    g.position.set(bot.pos.x, bot.pos.y, bot.pos.z);
    g.rotation.y = bot.yaw;
  }

  // ============ 寻路 ============
  function setGoal(wpName) {
    bot.goal = wpName;
    bot.path = map.findPath(bot.pos, wpName);
    bot.pathI = 0;
  }
  bot.setGoal = setGoal;

  function followPath(dt, speedMul) {
    if (bot.pathI >= bot.path.length) return true;
    const wp = bot.path[bot.pathI];
    const dx = wp.x - bot.pos.x, dz = wp.z - bot.pos.z;
    const d = Math.hypot(dx, dz);
    if (d < 1.6) { bot.pathI++; return bot.pathI >= bot.path.length; }
    const speed = 6.2 * (speedMul || 1);
    const wishX = (dx / d) * speed, wishZ = (dz / d) * speed;
    bot.vel.x += (wishX - bot.vel.x) * Math.min(1, 10 * dt);
    bot.vel.z += (wishZ - bot.vel.z) * Math.min(1, 10 * dt);
    bot.yaw = Math.atan2(-dx, -dz); // 面向移动方向
    // 卡住检测 → 小跳
    bot._stuckT = (bot._stuckT || 0) + dt;
    if (bot._stuckT > 0.6) {
      bot._stuckT = 0;
      if (Math.hypot(bot.vel.x, bot.vel.z) < 1.2 && bot.onGround) bot.vel.y = 5.4;
    }
    return false;
  }

  // ============ 视野 ============
  function canSee(ch) {
    if (!ch.alive) return false;
    const dx = ch.pos.x - bot.pos.x, dz = ch.pos.z - bot.pos.z;
    const d = Math.hypot(dx, dz);
    if (d > 60) return false;
    // FOV ~200°（战斗中不看角度）
    if (bot.state !== "combat") {
      const fwdX = -Math.sin(bot.yaw), fwdZ = -Math.cos(bot.yaw);
      const dot = (dx * fwdX + dz * fwdZ) / (d || 1);
      if (dot < -0.2) return false;
    }
    const eye = bot.eyePos();
    const tgt = { x: ch.pos.x, y: ch.pos.y + ch.height * 0.7, z: ch.pos.z };
    if (CS.lineBlocked(eye, tgt, map.colliders)) return false;
    if (CS.grenades && CS.grenades.lineInSmoke(eye, tgt)) return false; // 烟雾遮挡
    return true;
  }

  function acquireTarget(characters, now) {
    let best = null, bd = 1e9;
    for (const ch of characters) {
      if (ch === bot || ch.team === bot.team || !ch.alive) continue;
      if (!canSee(ch)) continue;
      const d = Math.hypot(ch.pos.x - bot.pos.x, ch.pos.z - bot.pos.z);
      if (d < bd) { bd = d; best = ch; }
    }
    if (best && bot.target !== best) {
      bot.target = best;
      bot.reactUntil = now + 0.25 + Math.random() * 0.4; // 反应时间
    }
    if (best) bot.lastSeen = now;
    return best;
  }

  // ============ 开火 ============
  function combatFire(now, ctx) {
    const w = bot.weapon, def = w.def;
    if (w.reloading) {
      if (now >= w.reloadEnd) { w.reloading = false; w.magAmmo = def.mag; }
      else return;
    }
    if (w.magAmmo <= 0) {
      w.reloading = true;
      w.reloadEnd = now + def.reloadTime;
      return;
    }
    if (now < bot.reactUntil || now < bot.nextShot) return;

    const t = bot.target;
    const eye = bot.eyePos();
    const aim = new THREE.Vector3(
      t.pos.x - eye.x,
      t.pos.y + t.height * (0.55 + Math.random() * 0.3) - eye.y,
      t.pos.z - eye.z
    );
    const dist = aim.length();
    aim.normalize();
    // BOT 误差：距离越远越不准
    const err = 0.012 + dist * 0.0011 + (def.sniper ? -0.006 : 0);
    aim.x += (Math.random() - 0.5) * 2 * err;
    aim.y += (Math.random() - 0.5) * 2 * err;
    aim.z += (Math.random() - 0.5) * 2 * err;
    aim.normalize();

    w.magAmmo--;
    const interval = def.auto
      ? 60 / def.rpm + (Math.random() < 0.3 ? 0.25 : 0) // 偶尔点射停顿
      : Math.max(60 / def.rpm, 0.5 + Math.random() * 0.4);
    bot.nextShot = now + interval;

    const shot = CS.computeShot(THREE, eye, aim, def, bot.team, ctx.characters, map.colliders);
    CS.audio.gunshotAt(def.id, bot.pos, ctx.listenerPos);
    ctx.effects.tracer(eye, shot.endPoint, def.sniper);
    if (shot.hitWall) ctx.effects.impact(shot.endPoint);
    if (shot.hit) {
      const realDmg = CS.applyArmor(shot.hit, shot.dmg);
      ctx.onDamage(shot.hit, realDmg, bot, def, shot.headshot);
      ctx.effects.blood(shot.endPoint);
    }
  }

  // ============ 主更新 ============
  // ctx: {characters, round, effects, onDamage, listenerPos, now}
  bot.update = function (dt, ctx) {
    if (!bot.alive) return;
    const now = ctx.now, round = ctx.round;

    // 冻结（购买时间）
    if (round.phase === "buy" || round.phase === "over" || round.phase === "warmup") {
      bot.vel.x = 0; bot.vel.z = 0;
      bot.vel.y -= 17 * dt;
      CS.movePhysics(bot, dt, map.colliders, map.bounds);
      syncMesh();
      return;
    }

    const enemy = acquireTarget(ctx.characters, now);

    // ---- 状态决策 ----
    if (enemy && bot.state !== "plant" && bot.state !== "defuse") {
      bot.state = "combat";
    } else if (bot.state === "combat" && (!bot.target || !bot.target.alive || now - bot.lastSeen > 2.5)) {
      bot.target = null;
      bot.state = "idle";
    }

    if (bot.state === "idle" || (bot.state === "seek" && bot.pathI >= bot.path.length)) {
      decideObjective(round, now);
    }

    // ---- 状态执行 ----
    switch (bot.state) {
      case "seek": {
        const arrived = followPath(dt, bot.hasBomb ? 0.95 : 1);
        if (arrived) bot.state = "idle";
        checkSiteActions(round, dt, ctx);
        break;
      }
      case "guard": {
        bot.vel.x *= 0.8; bot.vel.z *= 0.8;
        bot.guardT -= dt;
        bot.yaw += dt * 0.5 * bot.strafeDir; // 缓慢扫视
        if (bot.guardT <= 0) { bot.state = "idle"; bot.strafeDir *= -1; }
        checkSiteActions(round, dt, ctx);
        break;
      }
      case "combat": {
        if (bot.target && bot.target.alive) {
          const t = bot.target;
          const dx = t.pos.x - bot.pos.x, dz = t.pos.z - bot.pos.z;
          const d = Math.hypot(dx, dz);
          bot.yaw = Math.atan2(-dx, -dz);
          // 横向走位 + 距离控制
          bot.strafeT -= dt;
          if (bot.strafeT <= 0) {
            bot.strafeT = 0.5 + Math.random(); bot.strafeDir *= -1;
            maybeThrowGrenade(t, d, now);
          }
          const px = -dz / (d || 1), pz = dx / (d || 1);
          let mx = px * bot.strafeDir * 3.2, mz = pz * bot.strafeDir * 3.2;
          if (d > 26) { mx += (dx / d) * 3.5; mz += (dz / d) * 3.5; }
          else if (d < 7 && !bot.weapon.def.melee) { mx -= (dx / d) * 2.5; mz -= (dz / d) * 2.5; }
          bot.vel.x += (mx - bot.vel.x) * Math.min(1, 8 * dt);
          bot.vel.z += (mz - bot.vel.z) * Math.min(1, 8 * dt);
          if (canSee(t)) combatFire(now, ctx);
        }
        break;
      }
      case "plant": {
        bot.vel.x *= 0.7; bot.vel.z *= 0.7;
        bot.actionT += dt;
        if (bot.actionT >= 3.2) {
          bot.actionT = 0;
          bot.state = "guard"; bot.guardT = 5;
          round.botPlant(bot);
        }
        break;
      }
      case "defuse": {
        bot.vel.x *= 0.5; bot.vel.z *= 0.5;
        if (!round.bombPlanted) { bot.state = "idle"; bot.actionT = 0; break; }
        bot.actionT += dt;
        if (bot.actionT >= 6) {
          bot.actionT = 0;
          round.botDefuse(bot);
          bot.state = "guard"; bot.guardT = 3;
        }
        break;
      }
    }

    // 物理
    bot.vel.y -= 17 * dt;
    CS.movePhysics(bot, dt, map.colliders, map.bounds);
    bot.speedFactor = Math.min(1, Math.hypot(bot.vel.x, bot.vel.z) / 7.2);

    // 走路动画
    if (bot.speedFactor > 0.1 && bot.onGround) {
      bot._walkT = (bot._walkT || 0) + dt * 9 * bot.speedFactor;
      const s = Math.sin(bot._walkT) * 0.5;
      bot._animParts.legL.rotation.x = s;
      bot._animParts.legR.rotation.x = -s;
      bot._animParts.armL.rotation.x = -s * 0.7;
      bot._animParts.armR.rotation.x = s * 0.7;
    } else {
      bot._animParts.legL.rotation.x *= 0.85;
      bot._animParts.legR.rotation.x *= 0.85;
      bot._animParts.armL.rotation.x *= 0.85;
      bot._animParts.armR.rotation.x *= 0.85;
    }
    // 脚步声（近处可闻）
    if (bot.onGround && bot.speedFactor > 0.4) {
      bot._stepT = (bot._stepT || 0) + dt * bot.speedFactor;
      if (bot._stepT > 0.4) {
        bot._stepT = 0;
        CS.audio.footstepAt(bot.pos, ctx.listenerPos);
      }
    }
    syncMesh();
  };

  // ---- 目标决策 ----
  function decideObjective(round, now) {
    if (bot.team === "T") {
      if (round.bombPlanted) {
        // 守包
        const site = round.bombSite;
        const near = Math.hypot(bot.pos.x - site.x, bot.pos.z - site.z) < site.r + 4;
        if (near) { bot.state = "guard"; bot.guardT = 3 + Math.random() * 3; }
        else { setGoal(site === map.sites.A ? "a_site" : "b_site"); bot.state = "seek"; }
      } else if (bot.hasBomb) {
        setGoal(bot._siteChoice || (bot._siteChoice = Math.random() < 0.5 ? "a_site" : "b_site"));
        bot.state = "seek";
      } else {
        // 陪包/推进
        const carrier = round.bombCarrier;
        if (carrier && carrier.alive && carrier !== bot && Math.random() < 0.6) {
          setGoal(map.nearestWaypoint(carrier.pos).name);
        } else {
          setGoal(pick(["a_site", "b_site", "mid_n", "long_n", "cross"]));
        }
        bot.state = "seek";
      }
    } else {
      // CT
      if (round.bombPlanted) {
        const bp = round.bombPos;
        const d = Math.hypot(bot.pos.x - bp.x, bot.pos.z - bp.z);
        if (d < 2 && Math.abs(bot.pos.y - bp.y) < 2.5) {
          bot.state = "defuse"; bot.actionT = 0;
        } else if (d < 14) {
          // 直线走向炸弹本体
          bot.path = [{ name: "bomb", x: bp.x, y: bp.y, z: bp.z, adj: [] }];
          bot.pathI = 0;
          bot.state = "seek";
        } else {
          setGoal(round.bombSite === map.sites.A ? "a_site" : "b_site");
          bot.state = "seek";
        }
      } else {
        if (Math.random() < 0.35) { bot.state = "guard"; bot.guardT = 2 + Math.random() * 4; }
        else {
          setGoal(pick(["a_site", "b_site", "cross", "mid_n", "ct_mid", "long_n", "b_door_e"]));
          bot.state = "seek";
        }
      }
    }
  }

  // 走到点位时触发安放 / 拆除
  function checkSiteActions(round, dt, ctx) {
    if (bot.team === "T" && bot.hasBomb && !round.bombPlanted) {
      for (const key of ["A", "B"]) {
        const s = map.sites[key];
        if (Math.hypot(bot.pos.x - s.x, bot.pos.z - s.z) < s.r - 1) {
          bot.state = "plant"; bot.actionT = 0;
          bot._plantSiteKey = key;
          return;
        }
      }
    }
    if (bot.team === "CT" && round.bombPlanted) {
      const bp = round.bombPos;
      if (Math.hypot(bot.pos.x - bp.x, bot.pos.z - bp.z) < 2 && Math.abs(bot.pos.y - bp.y) < 2.5) {
        bot.state = "defuse"; bot.actionT = 0;
      }
    }
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // 战斗中偶尔投掷（换走位方向时判定一次）
  function maybeThrowGrenade(target, dist, now) {
    if (!CS.grenades || !bot.onGround || now < (bot._nadeCd || 0)) return;
    if (bot.grenades.he > 0 && dist > 9 && dist < 28 && Math.random() < 0.3) {
      bot.grenades.he--;
      bot._nadeCd = now + 9;
      CS.grenades.throwAt("he", bot.eyePos(),
        { x: target.pos.x, y: target.pos.y + 0.4, z: target.pos.z }, bot);
    } else if (bot.grenades.smoke > 0 && dist > 8 && dist < 30 && bot.hp < 65 && Math.random() < 0.4) {
      // 残血时朝自己与敌人之间丢烟掩护
      bot.grenades.smoke--;
      bot._nadeCd = now + 9;
      CS.grenades.throwAt("smoke", bot.eyePos(),
        { x: (bot.pos.x + target.pos.x) / 2, y: bot.pos.y, z: (bot.pos.z + target.pos.z) / 2 }, bot);
    }
  }

  // 简易经济购买（回合开始时由 round.js 调用）
  bot.buyPhase = function () {
    if (bot.weapon.def.slot === 1) {
      bot.weapon.magAmmo = bot.weapon.def.mag; // 已有主武器：补弹
    } else if (bot.money >= CS.WEAPONS.awp.price && Math.random() < 0.2) {
      bot.money -= CS.WEAPONS.awp.price;
      bot.setWeapon("awp");
    } else {
      const primary = bot.team === "T" ? "ak47" : "m4a4";
      const pDef = CS.WEAPONS[primary];
      if (bot.money >= pDef.price) {
        bot.money -= pDef.price;
        bot.setWeapon(primary);
      }
    }
    if (bot.money >= 650 && bot.armor < 50) {
      bot.money -= 650;
      bot.armor = 100;
    }
    // 偶尔补投掷物
    if (bot.money >= 300 && bot.grenades.he < 1 && Math.random() < 0.5) {
      bot.money -= 300;
      bot.grenades.he = 1;
    }
    if (bot.money >= 300 && bot.grenades.smoke < 1 && Math.random() < 0.35) {
      bot.money -= 300;
      bot.grenades.smoke = 1;
    }
  };

  return bot;
};
