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
    "smoke-tint",
  ];
  ids.forEach((id) => (el[id] = $(id)));

  let centerMsgTimer = 0, bannerTimer = 0, hitTimer = 0;

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
      el["round-timer"].textContent = bombPlanted ? "" + s : Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
      el["round-timer"].classList.toggle("danger", bombPlanted ? s <= 10 : s <= 15);
      const names = { warmup: "准备", buy: "购买时间", live: "对战中", over: "回合结束" };
      el["round-phase"].textContent = bombPlanted ? "炸弹已安放" : names[phase] || phase;
    },
    updateScore(tScore, ctScore, roundNum) {
      el["score-t-val"].textContent = tScore;
      el["score-ct-val"].textContent = ctScore;
      el["round-num"].textContent = "第 " + roundNum + " 回合";
    },
    updateAlive(t, ct) {
      el["alive-t"].textContent = "T 存活 " + t;
      el["alive-ct"].textContent = "CT 存活 " + ct;
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
      el["smoke-tint"].style.opacity = String(op);
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
