"use strict";
// hud.js — DOM HUD：血量/护甲/弹药/金钱/计时/击杀信息/购买菜单/横幅
window.CS = window.CS || {};

CS.hud = (function () {
  const $ = (id) => document.getElementById(id);
  const el = {};
  const ids = [
    "hud", "start-screen", "pause-screen", "match-end",
    "health-val", "armor-val", "money", "buy-money",
    "weapon-name", "ammo-mag", "ammo-reserve", "ammo-sep",
    "round-timer", "round-phase", "score-t-val", "score-ct-val",
    "alive-t", "alive-ct", "round-num",
    "killfeed", "center-msg", "round-banner", "banner-title", "banner-sub",
    "progress-wrap", "progress-label", "progress-fill",
    "bomb-indicator", "carry-indicator", "spectate-msg",
    "buy-menu", "buy-items", "hitmarker", "damage-vignette", "flash-overlay",
    "scope-overlay", "fps-counter", "match-end-title", "match-end-score", "crosshair",
    "smoke-tint", "radar", "scoreboard", "sb-score", "sb-body", "pickup-hint",
  ];
  ids.forEach((id) => (el[id] = $(id)));

  let centerMsgTimer = 0, bannerTimer = 0, hitTimer = 0;
  // DOM 写入缓存：值不变则跳过（避免每帧触发样式/布局）
  const cache = {};
  function setText(id, text) {
    if (cache[id] !== text) { cache[id] = text; el[id].textContent = text; }
  }

  const hud = {
    showHud() { el["hud"].classList.remove("hidden"); },
    hideStart() { el["start-screen"].classList.add("hidden"); },
    showPause(v) { el["pause-screen"].classList.toggle("hidden", !v); },

    updateHealth(p) {
      el["health-val"].textContent = Math.max(0, Math.ceil(p.hp));
      el["health-val"].classList.toggle("low", p.hp <= 30);
      el["armor-val"].textContent = Math.max(0, Math.ceil(p.armor));
    },
    updateMoney(p) {
      el["money"].textContent = "$ " + p.money;
      el["buy-money"].textContent = "$" + p.money;
    },
    updateAmmo(w) {
      if (!w) return;
      el["weapon-name"].textContent = w.def.name;
      if (w.def.melee) {
        el["ammo-mag"].textContent = "—";
        el["ammo-reserve"].textContent = "";
        el["ammo-sep"].style.display = "none";
        el["ammo-mag"].classList.remove("empty");
      } else if (w.def.grenade) {
        el["ammo-mag"].textContent = w.magAmmo;
        el["ammo-reserve"].textContent = "";
        el["ammo-sep"].style.display = "none";
        el["ammo-mag"].classList.toggle("empty", w.magAmmo === 0);
      } else {
        el["ammo-sep"].style.display = "";
        el["ammo-mag"].textContent = w.reloading ? "--" : w.magAmmo;
        el["ammo-reserve"].textContent = w.reserveAmmo;
        el["ammo-mag"].classList.toggle("empty", w.magAmmo === 0 && !w.reloading);
      }
    },
    updateTimer(sec, phase, bombPlanted) {
      const s = Math.max(0, Math.ceil(sec));
      setText("round-timer", bombPlanted ? "" + s : Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"));
      const danger = bombPlanted ? s <= 10 : s <= 15;
      if (cache._timerDanger !== danger) {
        cache._timerDanger = danger;
        el["round-timer"].classList.toggle("danger", danger);
      }
      const names = { warmup: "准备", buy: "购买时间", live: "对战中", over: "回合结束" };
      setText("round-phase", bombPlanted ? "炸弹已安放" : names[phase] || phase);
    },
    updateScore(tScore, ctScore, roundNum) {
      el["score-t-val"].textContent = tScore;
      el["score-ct-val"].textContent = ctScore;
      el["round-num"].textContent = "第 " + roundNum + " 回合";
    },
    updateAlive(t, ct) {
      setText("alive-t", "T 存活 " + t);
      setText("alive-ct", "CT 存活 " + ct);
    },

    killfeed(attackerName, attackerTeam, victimName, victimTeam, weaponTag, headshot, mine) {
      const div = document.createElement("div");
      div.className = "kf-entry" + (mine ? " mine" : "");
      const aCls = attackerTeam === "T" ? "t-color" : "ct-color";
      const vCls = victimTeam === "T" ? "t-color" : "ct-color";
      div.innerHTML =
        '<span class="' + aCls + '">' + attackerName + "</span>" +
        '<span class="kf-weapon">[' + weaponTag + "]</span>" +
        (headshot ? '<span class="kf-hs">HS</span> ' : "") +
        '<span class="' + vCls + '">' + victimName + "</span>";
      el["killfeed"].appendChild(div);
      while (el["killfeed"].children.length > 5) el["killfeed"].removeChild(el["killfeed"].firstChild);
      setTimeout(() => { if (div.parentNode) div.parentNode.removeChild(div); }, 6000);
    },

    centerMsg(text, dur) {
      el["center-msg"].textContent = text;
      el["center-msg"].classList.remove("hidden");
      centerMsgTimer = dur || 2.5;
    },
    banner(title, sub, cls, dur) {
      el["banner-title"].textContent = title;
      el["banner-title"].className = cls || "";
      el["banner-sub"].textContent = sub || "";
      el["round-banner"].classList.remove("hidden");
      bannerTimer = dur || 4;
    },

    progress(label, frac) {
      if (frac === null) {
        el["progress-wrap"].classList.add("hidden");
      } else {
        el["progress-wrap"].classList.remove("hidden");
        el["progress-label"].textContent = label;
        el["progress-fill"].style.width = Math.min(100, frac * 100).toFixed(1) + "%";
      }
    },

    bombIndicator(v) { el["bomb-indicator"].classList.toggle("hidden", !v); },
    carryIndicator(v) { el["carry-indicator"].classList.toggle("hidden", !v); },
    spectate(v) { el["spectate-msg"].classList.toggle("hidden", !v); },
    scope(v) {
      el["scope-overlay"].classList.toggle("hidden", !v);
      el["crosshair"].style.display = v ? "none" : "";
    },

    hitmarker(kill) {
      el["hitmarker"].classList.remove("hidden");
      el["hitmarker"].classList.toggle("kill", !!kill);
      hitTimer = 0.12;
    },
    damageFlash() {
      el["damage-vignette"].style.transition = "none";
      el["damage-vignette"].style.opacity = "1";
      requestAnimationFrame(() => {
        el["damage-vignette"].style.transition = "opacity 0.5s ease-out";
        el["damage-vignette"].style.opacity = "0";
      });
    },
    explosionFlash() {
      el["flash-overlay"].style.transition = "none";
      el["flash-overlay"].style.opacity = "0.9";
      requestAnimationFrame(() => {
        el["flash-overlay"].style.transition = "opacity 1.6s ease-out";
        el["flash-overlay"].style.opacity = "0";
      });
    },
    heFlash(intensity) {
      el["flash-overlay"].style.transition = "none";
      el["flash-overlay"].style.opacity = String(Math.min(0.75, intensity));
      requestAnimationFrame(() => {
        el["flash-overlay"].style.transition = "opacity 0.7s ease-out";
        el["flash-overlay"].style.opacity = "0";
      });
    },
    smokeTint(op) {
      const v = op.toFixed(2);
      if (cache._smokeTint !== v) {
        cache._smokeTint = v;
        el["smoke-tint"].style.opacity = v;
      }
    },
    // 闪光弹致盲：强度 0-1，持续时间随强度
    flashBlind(strength) {
      const o = el["flash-overlay"];
      o.style.transition = "none";
      o.style.opacity = String(Math.min(1, strength));
      const dur = (0.6 + 2.4 * strength).toFixed(2);
      requestAnimationFrame(() => {
        o.style.transition = "opacity " + dur + "s ease-in";
        o.style.opacity = "0";
      });
    },

    pickupHint(text) {
      if (text) {
        setText("pickup-hint", text);
        el["pickup-hint"].classList.remove("hidden");
      } else if (cache._pickupShown !== false) {
        el["pickup-hint"].classList.add("hidden");
      }
      cache._pickupShown = !!text;
    },

    // ---- 计分板 ----
    scoreboardOpen: false,
    showScoreboard(v) {
      hud.scoreboardOpen = v;
      el["scoreboard"].classList.toggle("hidden", !v);
    },
    renderScoreboard(characters, score) {
      el["sb-score"].textContent = "T " + score.T + " : " + score.CT + " CT";
      const teams = [
        { key: "T", label: "恐怖分子", cls: "t-color" },
        { key: "CT", label: "反恐精英", cls: "ct-color" },
      ];
      let html = "";
      for (const tm of teams) {
        const rows = characters
          .filter((c) => c.team === tm.key)
          .sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
        html += '<div class="sb-team ' + tm.cls + '">' + tm.label + "</div>" +
          '<table class="sb-table"><tr><th class="sb-name">名字</th><th>K</th><th>A</th><th>D</th><th>$</th><th></th></tr>';
        for (const c of rows) {
          html += "<tr class='" + (c.alive ? "" : "sb-dead") + (c.isHuman ? " sb-me" : "") + "'>" +
            '<td class="sb-name">' + c.name + (c.hasBomb ? ' <span class="sb-c4">C4</span>' : "") + "</td>" +
            "<td>" + c.kills + "</td><td>" + (c.assists || 0) + "</td><td>" + c.deaths + "</td>" +
            "<td>$" + c.money + "</td>" +
            "<td>" + (c.alive ? "存活" : "阵亡") + "</td></tr>";
        }
        html += "</table>";
      }
      el["sb-body"].innerHTML = html;
    },

    // ---- 迷你雷达 ----
    _radarImg: null,
    _radarScale: 1,
    initRadar(map) {
      // 静态地图俯视图：一次性渲染到离屏 canvas
      const SIZE = 512;
      const cv = document.createElement("canvas");
      cv.width = cv.height = SIZE;
      const g = cv.getContext("2d");
      const world = map.bounds.max - map.bounds.min;
      const s = SIZE / world;
      hud._radarScale = s;
      hud._radarMin = map.bounds.min;
      g.fillStyle = "#1a1812";
      g.fillRect(0, 0, SIZE, SIZE);
      for (const c of map.colliders) {
        // 只画影响站立层的实体（墙 & 掩体 & 高台）
        if (c.y1 > 2.5 || c.y2 < 0.8) continue;
        const isWall = c.y2 >= 4;
        const isPlatform = c.y2 <= 2.2 && c.y1 <= 0.01;
        g.fillStyle = isWall ? "#5c563f" : isPlatform ? "#3a3527" : "#786f4e";
        g.fillRect((c.x1 - map.bounds.min) * s, (c.z1 - map.bounds.min) * s, (c.x2 - c.x1) * s, (c.z2 - c.z1) * s);
      }
      // 通道地面提亮
      hud._radarImg = cv;
      hud._radarSites = map.sites;
    },
    // characters: 所有角色；spotted: Set/函数判断敌人是否显示
    drawRadar(player, characters, bomb) {
      const cv = el["radar"];
      const g = cv.getContext("2d");
      const W = cv.width, H = cv.height, cx = W / 2, cy = H / 2;
      const PXM = 2.4; // 每米像素（显示约 ±36m）
      g.clearRect(0, 0, W, H);
      // 圆形裁剪
      g.save();
      g.beginPath();
      g.arc(cx, cy, W / 2 - 1, 0, Math.PI * 2);
      g.clip();
      g.fillStyle = "rgba(12,11,8,0.85)";
      g.fillRect(0, 0, W, H);

      // 地图底图（旋转到玩家朝向朝上）
      const rot = player.yaw;
      g.translate(cx, cy);
      g.rotate(rot);
      g.scale(PXM, PXM);
      g.translate(-player.pos.x, -player.pos.z);
      const imgScale = hud._radarScale;
      g.globalAlpha = 0.9;
      g.drawImage(hud._radarImg,
        hud._radarMin, hud._radarMin,
        (hud._radarImg.width / imgScale), (hud._radarImg.height / imgScale));
      g.globalAlpha = 1;

      // 炸弹点字母
      g.font = "7px Arial";
      g.textAlign = "center"; g.textBaseline = "middle";
      for (const key in hud._radarSites) {
        const site = hud._radarSites[key];
        g.save();
        g.translate(site.x, site.z);
        g.rotate(-rot);
        g.fillStyle = "rgba(230,190,60,0.9)";
        g.fillText(key, 0, 0);
        g.restore();
      }

      // C4（已安放 = 闪烁红方块；被携带 = 橙点）
      if (bomb && bomb.planted) {
        if (Math.floor(performance.now() / 400) % 2 === 0) {
          g.fillStyle = "#ff3c3c";
          g.fillRect(bomb.x - 1.6, bomb.z - 1.6, 3.2, 3.2);
        }
      } else if (bomb && bomb.carrier && bomb.carrier.alive && bomb.carrier.team === player.team) {
        g.fillStyle = "#ffa020";
        g.beginPath(); g.arc(bomb.carrier.pos.x, bomb.carrier.pos.z, 2.2, 0, Math.PI * 2); g.fill();
      }

      // 角色点位
      for (const ch of characters) {
        if (ch === player || !ch.alive) continue;
        const friendly = ch.team === player.team;
        if (!friendly && !ch._spotted) continue;
        let dx = ch.pos.x, dz = ch.pos.z;
        // 敌人贴边（超出雷达范围时钉在边缘）
        if (!friendly) {
          const rx = ch.pos.x - player.pos.x, rz = ch.pos.z - player.pos.z;
          const d = Math.hypot(rx, rz);
          const maxD = (W / 2 - 8) / PXM;
          if (d > maxD) {
            dx = player.pos.x + (rx / d) * maxD;
            dz = player.pos.z + (rz / d) * maxD;
          }
        }
        g.fillStyle = friendly ? (player.team === "T" ? "#e0a83c" : "#6fa8dc") : "#ff4a3c";
        g.beginPath();
        g.arc(dx, dz, 1.5, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();

      // 玩家箭头（固定居中朝上）
      g.strokeStyle = "rgba(255,255,255,0.9)";
      g.fillStyle = "#fff";
      g.beginPath();
      g.moveTo(cx, cy - 5);
      g.lineTo(cx - 3.5, cy + 4);
      g.lineTo(cx + 3.5, cy + 4);
      g.closePath();
      g.fill();
      // 外圈
      g.strokeStyle = "rgba(120,115,95,0.6)";
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(cx, cy, W / 2 - 1, 0, Math.PI * 2);
      g.stroke();
    },

    // ---- 购买菜单 ----
    buyMenuOpen: false,
    showBuyMenu(items, money) {
      hud.buyMenuOpen = true;
      el["buy-menu"].classList.remove("hidden");
      el["buy-items"].innerHTML = "";
      items.forEach((it, i) => {
        const div = document.createElement("div");
        const afford = money >= it.price && !it.owned;
        div.className = "buy-item" + (it.owned ? " owned" : "") + (!afford && !it.owned ? " cant-afford" : "");
        div.innerHTML =
          '<span class="buy-key">' + (i + 1) + "</span>" +
          '<span class="buy-name">' + it.label + "</span>" +
          '<span class="buy-price">' + (it.owned ? "已拥有" : "$" + it.price) + "</span>";
        if (afford) div.addEventListener("click", () => it.buy());
        el["buy-items"].appendChild(div);
      });
    },
    hideBuyMenu() {
      hud.buyMenuOpen = false;
      el["buy-menu"].classList.add("hidden");
    },

    showMatchEnd(won, tScore, ctScore) {
      el["match-end-title"].textContent = won ? "胜利" : "失败";
      el["match-end-score"].textContent = tScore + " : " + ctScore;
      el["match-end"].classList.remove("hidden");
    },

    fps(v) { el["fps-counter"].textContent = v + " FPS"; },

    update(dt) {
      if (centerMsgTimer > 0) {
        centerMsgTimer -= dt;
        if (centerMsgTimer <= 0) el["center-msg"].classList.add("hidden");
      }
      if (bannerTimer > 0) {
        bannerTimer -= dt;
        if (bannerTimer <= 0) el["round-banner"].classList.add("hidden");
      }
      if (hitTimer > 0) {
        hitTimer -= dt;
        if (hitTimer <= 0) el["hitmarker"].classList.add("hidden");
      }
    },
  };

  return hud;
})();
