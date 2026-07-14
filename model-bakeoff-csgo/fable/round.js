"use strict";
// round.js — 回合状态机：购买时间→对战→结算、经济、C4 安放/拆除、比分
window.CS = window.CS || {};

CS.createRound = function (THREE, ctx) {
  // ctx: {map, scene, player, bots, weaponSys, effects}
  const { map, scene, player, bots } = ctx;
  const characters = [player, ...bots];

  const BUY_TIME = 12, ROUND_TIME = 115, BOMB_TIME = 40, OVER_TIME = 5;
  const PLANT_TIME = 3.2, DEFUSE_TIME = 6;
  const WIN_ROUNDS = 8, MAX_MONEY = 16000;

  const round = {
    phase: "warmup", // warmup | buy | live | over
    timer: 0,
    number: 0,
    score: { T: 0, CT: 0 },
    lossStreak: { T: 0, CT: 0 },
    bombPlanted: false,
    bombSite: null,
    bombTimer: 0,
    bombCarrier: null,
    matchOver: false,
    playerPlanting: 0,
    playerDefusing: 0,
  };

  // ============ C4 模型 ============
  const bombGroup = new THREE.Group();
  {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.18, 0.35),
      new THREE.MeshLambertMaterial({ color: 0x3d3a30 })
    );
    body.position.y = 0.09;
    bombGroup.add(body);
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.04, 0.2),
      new THREE.MeshLambertMaterial({ color: 0x181818 })
    );
    panel.position.y = 0.2;
    bombGroup.add(panel);
  }
  const bombLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff2020 })
  );
  bombLight.position.set(0.12, 0.24, 0);
  bombGroup.add(bombLight);
  bombGroup.visible = false;
  scene.add(bombGroup);
  let beepAccum = 0;
  round.bombPos = bombGroup.position; // 已安放 C4 的世界坐标（实时引用）

  // ============ 队伍分配 ============
  round.setupTeams = function (playerTeam) {
    player.team = playerTeam;
    // 玩家 + 3 名同队 BOT vs 4 名敌方 BOT
    const tNames = CS.BOT_NAMES.T.slice(), ctNames = CS.BOT_NAMES.CT.slice();
    let ti = 0, ci = 0;
    bots.forEach((b, i) => {
      const team = (playerTeam === "T") ? (i < 3 ? "T" : "CT") : (i < 3 ? "CT" : "T");
      b.team = team;
      b.name = team === "T" ? tNames[ti++] : ctNames[ci++];
      b.setWeapon(team === "T" ? "glock" : "usp");
      recolorBot(b); // 阵营换色
    });
  };

  function recolorBot(b) {
    const isT = b.team === "T";
    const colors = [0xc8a078, isT ? 0x8a7448 : 0x33465e, isT ? 0x5c4d30 : 0x22303f, 0x2c2c30];
    b.mesh.children.forEach((mesh, i) => {
      if (!mesh.material) return;
      // 0-1 腿, 2 躯干, 3-4 臂, 5 头, 6 帽, 7 枪
      if (i <= 1) mesh.material.color.setHex(colors[2]);
      else if (i === 2 || i === 3 || i === 4) mesh.material.color.setHex(colors[1]);
      else if (i === 5) mesh.material.color.setHex(colors[0]);
      else if (i === 6) mesh.material.color.setHex(isT ? colors[2] : colors[3]);
    });
  }

  // ============ 回合开始 ============
  round.startRound = function () {
    round.number++;
    round.phase = "buy";
    round.timer = BUY_TIME;
    round.bombPlanted = false;
    round.bombSite = null;
    round.bombTimer = 0;
    round.playerPlanting = 0;
    round.playerDefusing = 0;
    bombGroup.visible = false;
    CS.hud.bombIndicator(false);
    CS.hud.progress(null, null);
    if (CS.grenades) CS.grenades.clear();     // 清掉上回合的投掷物与烟雾
    if (CS.groundItems) CS.groundItems.clear(); // 清掉上回合掉落的武器

    // 复活 & 出生点
    const spawnIdx = { T: 0, CT: 0 };
    for (const ch of characters) {
      const list = map.spawns[ch.team];
      const sp = list[spawnIdx[ch.team]++ % list.length];
      ch.armor = ch._survived ? ch.armor : 0;
      ch._dmgLog = null; // 助攻记录
      ch.spawnAt(sp);
    }

    // 武器保留/重置
    if (!player._survived) {
      ctx.weaponSys.reset(player.team === "T" ? "glock" : "usp");
      player.armor = 0;
    } else {
      // 补满弹匣
      for (const s of [1, 2]) {
        const w = ctx.weaponSys.slots[s];
        if (w) { w.magAmmo = w.def.mag; }
      }
      ctx.weaponSys.select(ctx.weaponSys.slots[1] ? 1 : 2);
    }
    for (const b of bots) {
      if (!b._survived) {
        b.setWeapon(b.team === "T" ? "glock" : "usp");
        b.armor = 0;
        b.grenades.he = 0;
        b.grenades.smoke = 0;
        b.grenades.flash = 0;
      }
      b.buyPhase();
    }

    // C4 交给随机 T
    const ts = characters.filter((c) => c.team === "T");
    for (const c of characters) c.hasBomb = false;
    round.bombCarrier = ts[Math.floor(Math.random() * ts.length)];
    round.bombCarrier.hasBomb = true;

    CS.hud.updateScore(round.score.T, round.score.CT, round.number);
    CS.hud.updateHealth(player);
    CS.hud.updateMoney(player);
    CS.hud.updateAmmo(ctx.weaponSys.cur());
    CS.hud.spectate(false);
    CS.hud.carryIndicator(player.hasBomb);
    updateAliveHud();
    CS.hud.centerMsg("购买时间 — 按 B 打开购买菜单", 3.5);
    CS.audio.roundStart();
  };

  function updateAliveHud() {
    const t = characters.filter((c) => c.team === "T" && c.alive).length;
    const ct = characters.filter((c) => c.team === "CT" && c.alive).length;
    CS.hud.updateAlive(t, ct);
    return { t, ct };
  }

  // ============ 击杀处理 ============
  round.notifyKill = function (victim, attacker, weaponDef, headshot) {
    victim.hasBombWas = victim.hasBomb;
    if (victim.hasBomb) {
      // 转交给最近存活 T
      victim.hasBomb = false;
      const ts = characters.filter((c) => c.team === "T" && c.alive && c !== victim);
      if (ts.length) {
        ts.sort((a, b) =>
          Math.hypot(a.pos.x - victim.pos.x, a.pos.z - victim.pos.z) -
          Math.hypot(b.pos.x - victim.pos.x, b.pos.z - victim.pos.z));
        round.bombCarrier = ts[0];
        ts[0].hasBomb = true;
        if (ts[0] === player) {
          CS.hud.centerMsg("你拾取了 C4", 2);
          CS.hud.carryIndicator(true);
        }
      }
    }
    if (attacker && attacker !== victim) {
      attacker.kills++;
      const reward = weaponDef && weaponDef.melee ? 1500 : weaponDef && weaponDef.sniper ? 100 : 300;
      attacker.money = Math.min(MAX_MONEY, attacker.money + reward);
      if (attacker === player) CS.hud.updateMoney(player);
    }
    // 助攻：6 秒内对死者造成过伤害的其他敌人
    if (victim._dmgLog) {
      const nowS = performance.now() / 1000;
      for (const [helper, t] of victim._dmgLog) {
        if (helper !== attacker && helper.team !== victim.team && nowS - t < 6) helper.assists++;
      }
      victim._dmgLog = null;
    }
    CS.hud.killfeed(
      attacker ? attacker.name : "C4", attacker ? attacker.team : "T",
      victim.name, victim.team,
      weaponDef ? weaponDef.tag : "world", headshot,
      attacker === player || victim === player
    );
    const alive = updateAliveHud();

    if (round.phase !== "live") return;
    // 歼灭判定：炸弹已安放时 T 全灭不结束（等拆除/爆炸），CT 全灭直接 T 胜
    if (alive.ct === 0) {
      endRound("T", "歼灭反恐精英");
    } else if (alive.t === 0 && !round.bombPlanted) {
      endRound("CT", "歼灭恐怖分子");
    }
  };

  // ============ C4 ============
  function plantBomb(planter, site, siteKey) {
    round.bombPlanted = true;
    round.bombSite = site;
    round.bombTimer = BOMB_TIME;
    round.timer = 999; // 回合计时失效
    planter.hasBomb = false;
    planter.money = Math.min(MAX_MONEY, planter.money + 300);
    bombGroup.position.set(
      planter.pos.x, map.groundHeight(planter.pos.x, planter.pos.z, planter.pos.y + 1) + 0.01, planter.pos.z
    );
    bombGroup.visible = true;
    beepAccum = 0;
    CS.hud.bombIndicator(true);
    CS.hud.carryIndicator(false);
    CS.hud.centerMsg("炸弹已安放在 " + siteKey + " 点！", 3);
    CS.audio.bombPlanted();
    if (planter === player) CS.hud.updateMoney(player);
    // 全体 BOT 改变目标
    for (const b of bots) if (b.alive) { b.state = "idle"; }
  }

  function defuseBomb(defuser) {
    round.bombPlanted = false;
    bombGroup.visible = false;
    CS.hud.bombIndicator(false);
    CS.audio.bombDefused();
    defuser.money = Math.min(MAX_MONEY, defuser.money + 300);
    if (defuser === player) CS.hud.updateMoney(player);
    endRound("CT", "炸弹已拆除");
  }

  function explodeBomb() {
    bombGroup.visible = false;
    CS.hud.bombIndicator(false);
    ctx.effects.explosion(bombGroup.position);
    CS.audio.explosion();
    CS.hud.explosionFlash();
    // 爆炸范围伤害
    for (const ch of characters) {
      if (!ch.alive) continue;
      const d = Math.hypot(ch.pos.x - bombGroup.position.x, ch.pos.y - bombGroup.position.y, ch.pos.z - bombGroup.position.z);
      if (d < 26) {
        const dmg = Math.round(240 * (1 - d / 26));
        ctx.applyDamage(ch, dmg, null, null, false);
      }
    }
    round.bombPlanted = false;
    endRound("T", "目标已摧毁");
  }

  round.botPlant = function (bot) {
    if (round.bombPlanted || round.phase !== "live" || !bot.hasBomb) return;
    const key = bot._plantSiteKey || "A";
    plantBomb(bot, map.sites[key], key);
  };
  round.botDefuse = function (bot) {
    if (!round.bombPlanted || round.phase !== "live") return;
    defuseBomb(bot);
  };

  // 玩家所处炸弹点（可安放）
  function playerAtSite() {
    for (const key of ["A", "B"]) {
      const s = map.sites[key];
      if (Math.hypot(player.pos.x - s.x, player.pos.z - s.z) < s.r - 0.5) return key;
    }
    return null;
  }
  function playerNearBomb() {
    if (!round.bombPlanted) return false;
    return Math.hypot(player.pos.x - bombGroup.position.x, player.pos.z - bombGroup.position.z) < 2.5 &&
      Math.abs(player.pos.y - bombGroup.position.y) < 2.5;
  }

  // ============ 回合结束 ============
  function endRound(winner, reason) {
    if (round.phase === "over") return;
    round.phase = "over";
    round.timer = OVER_TIME;
    round.score[winner]++;
    CS.hud.updateScore(round.score.T, round.score.CT, round.number);
    CS.hud.progress(null, null);

    const playerWon = player.team === winner;
    CS.hud.banner(
      winner === "T" ? "恐怖分子获胜" : "反恐精英获胜",
      reason,
      winner === "T" ? "t-win" : "ct-win",
      4
    );
    if (playerWon) CS.audio.roundWin(); else CS.audio.roundLose();

    // 经济结算
    round.lossStreak[winner] = 0;
    const loser = winner === "T" ? "CT" : "T";
    round.lossStreak[loser] = Math.min(4, round.lossStreak[loser] + 1);
    const loseBonus = 1400 + (round.lossStreak[loser] - 1) * 500;
    for (const ch of characters) {
      ch.money = Math.min(MAX_MONEY, ch.money + (ch.team === winner ? 3250 : loseBonus));
      ch._survived = ch.alive;
    }
    CS.hud.updateMoney(player);

    if (round.score[winner] >= WIN_ROUNDS) {
      round.matchOver = true;
      setTimeout(() => {
        CS.hud.showMatchEnd(player.team === winner, round.score.T, round.score.CT);
        document.exitPointerLock && document.exitPointerLock();
      }, 2500);
    }
  }

  // ============ 购买 ============
  round.getBuyItems = function () {
    const rifle = player.team === "T" ? CS.WEAPONS.ak47 : CS.WEAPONS.m4a4;
    const hasRifle = ctx.weaponSys.slots[1] && ctx.weaponSys.slots[1].def.id === rifle.id;
    const hasAwp = ctx.weaponSys.slots[1] && ctx.weaponSys.slots[1].def.id === "awp";
    return [
      {
        label: rifle.name + "（步枪）", price: rifle.price, owned: hasRifle,
        buy: () => buyWeapon(rifle.id),
      },
      {
        label: "AWP（狙击枪）", price: CS.WEAPONS.awp.price, owned: hasAwp,
        buy: () => buyWeapon("awp"),
      },
      {
        label: "防弹衣 + 头盔", price: 650, owned: player.armor >= 100,
        buy: () => {
          if (!spend(650)) return;
          player.armor = 100;
          CS.hud.updateHealth(player);
          done();
        },
      },
      {
        label: "闪光弹（4 切换 / G 投掷）", price: 200, owned: ctx.weaponSys.grenades.flash >= 1,
        buy: () => {
          if (!spend(200)) return;
          ctx.weaponSys.addGrenade("flash");
          done();
        },
      },
      {
        label: "HE 手雷（G 或 4 投掷）", price: 300, owned: ctx.weaponSys.grenades.he >= 1,
        buy: () => {
          if (!spend(300)) return;
          ctx.weaponSys.addGrenade("he");
          done();
        },
      },
      {
        label: "烟雾弹（G 或 4 投掷）", price: 300, owned: ctx.weaponSys.grenades.smoke >= 1,
        buy: () => {
          if (!spend(300)) return;
          ctx.weaponSys.addGrenade("smoke");
          done();
        },
      },
      {
        label: "补满弹药", price: 200, owned: false,
        buy: () => {
          if (!spend(200)) return;
          for (const s of [1, 2]) {
            const w = ctx.weaponSys.slots[s];
            if (w) { w.magAmmo = w.def.mag; w.reserveAmmo = w.def.reserve; }
          }
          CS.hud.updateAmmo(ctx.weaponSys.cur());
          done();
        },
      },
    ];
  };
  function spend(price) {
    if (round.phase !== "buy") { CS.audio.buyFail(); return false; }
    if (player.money < price) { CS.audio.buyFail(); return false; }
    player.money -= price;
    return true;
  }
  function done() {
    CS.audio.buy();
    CS.hud.updateMoney(player);
    round.refreshBuyMenu();
  }
  function buyWeapon(id) {
    const def = CS.WEAPONS[id];
    const cur = ctx.weaponSys.slots[def.slot];
    if (cur && cur.def.id === id) { CS.audio.buyFail(); return; }
    if (!spend(def.price)) return;
    ctx.weaponSys.give(id);
    CS.hud.updateAmmo(ctx.weaponSys.cur());
    done();
  }
  round.refreshBuyMenu = function () {
    if (CS.hud.buyMenuOpen) CS.hud.showBuyMenu(round.getBuyItems(), player.money);
  };
  round.buyIndex = function (i) {
    const items = round.getBuyItems();
    if (items[i] && !items[i].owned) items[i].buy();
  };

  // ============ 主更新 ============
  // input: {useHeld: E 键是否按住}
  round.update = function (dt, input) {
    if (round.matchOver) return;

    switch (round.phase) {
      case "buy":
        round.timer -= dt;
        if (round.timer <= 0) {
          round.phase = "live";
          round.timer = ROUND_TIME;
          CS.hud.hideBuyMenu();
          CS.hud.centerMsg("对战开始！", 2);
          CS.audio.roundStart();
        }
        break;

      case "live":
        if (!round.bombPlanted) {
          round.timer -= dt;
          if (round.timer <= 0) {
            endRound("CT", "时间耗尽");
            break;
          }
        }

        // ---- 玩家安放 ----
        if (player.alive && player.hasBomb && !round.bombPlanted && input.useHeld && player.onGround) {
          const siteKey = playerAtSite();
          if (siteKey) {
            round.playerPlanting += dt;
            CS.hud.progress("安放炸弹中…", round.playerPlanting / PLANT_TIME);
            if (round.playerPlanting >= PLANT_TIME) {
              round.playerPlanting = 0;
              CS.hud.progress(null, null);
              plantBomb(player, map.sites[siteKey], siteKey);
            }
          } else {
            round.playerPlanting = 0;
            CS.hud.progress(null, null);
            CS.hud.centerMsg("必须在 A/B 炸弹点内安放", 1.2);
          }
        } else if (round.playerPlanting > 0) {
          round.playerPlanting = 0;
          CS.hud.progress(null, null);
        }

        // ---- 玩家拆除 ----
        if (player.alive && player.team === "CT" && round.bombPlanted && input.useHeld && playerNearBomb()) {
          round.playerDefusing += dt;
          CS.hud.progress("拆除炸弹中…", round.playerDefusing / DEFUSE_TIME);
          if (Math.floor(round.playerDefusing * 4) !== Math.floor((round.playerDefusing - dt) * 4)) CS.audio.defuseTick();
          if (round.playerDefusing >= DEFUSE_TIME) {
            round.playerDefusing = 0;
            CS.hud.progress(null, null);
            defuseBomb(player);
          }
        } else if (round.playerDefusing > 0) {
          round.playerDefusing = 0;
          CS.hud.progress(null, null);
        }

        // ---- C4 计时 ----
        if (round.bombPlanted) {
          round.bombTimer -= dt;
          // 蜂鸣加速
          const interval = Math.max(0.12, round.bombTimer / BOMB_TIME * 1.0);
          beepAccum += dt;
          if (beepAccum >= interval) {
            beepAccum = 0;
            CS.audio.bombBeep(round.bombTimer < 10);
            bombLight.material.color.setHex(0xff2020);
            setTimeout(() => bombLight.material.color.setHex(0x551010), 90);
          }
          if (round.bombTimer <= 0) explodeBomb();
        }
        break;

      case "over":
        round.timer -= dt;
        if (round.timer <= 0 && !round.matchOver) round.startRound();
        break;
    }

    CS.hud.updateTimer(
      round.bombPlanted ? round.bombTimer : round.timer,
      round.phase,
      round.bombPlanted
    );

    // 携带提示（仅玩家）
    if (round.phase === "live") {
      CS.hud.carryIndicator(player.alive && player.hasBomb && !round.bombPlanted);
    }
  };

  round.characters = characters;
  return round;
};
