"use strict";
// audio.js — WebAudio 程序化音效：枪声、脚步、C4 蜂鸣、爆炸等（无音频文件）
window.CS = window.CS || {};

CS.audio = (function () {
  let ctx = null, master = null;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function noiseBuffer(dur) {
    const c = ensure();
    const buf = c.createBuffer(1, Math.max(1, (dur * c.sampleRate) | 0), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  // 通用噪声爆音：filterFreq 越低越闷
  function bang(vol, dur, filterFreq, filterQ, decayPow) {
    const c = ensure();
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(dur);
    const f = c.createBiquadFilter();
    f.type = "lowpass"; f.frequency.value = filterFreq; f.Q.value = filterQ || 0.7;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur * (decayPow || 1));
    src.connect(f); f.connect(g); g.connect(master);
    src.start();
  }

  function tone(freq, vol, dur, type, freqEnd) {
    const c = ensure();
    const o = c.createOscillator();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, c.currentTime);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, c.currentTime + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g); g.connect(master);
    o.start(); o.stop(c.currentTime + dur + 0.05);
  }

  // 距离衰减系数
  function attenuate(srcPos, listenerPos, refDist) {
    if (!srcPos || !listenerPos) return 1;
    const d = Math.hypot(srcPos.x - listenerPos.x, (srcPos.y || 0) - (listenerPos.y || 0), srcPos.z - listenerPos.z);
    return Math.min(1, refDist / Math.max(refDist, d));
  }

  const gunParams = {
    glock:  { vol: 0.45, dur: 0.14, freq: 2400, sub: 180 },
    usp:    { vol: 0.22, dur: 0.12, freq: 1200, sub: 140 }, // 消音
    ak47:   { vol: 0.62, dur: 0.19, freq: 3200, sub: 130 },
    m4a4:   { vol: 0.55, dur: 0.16, freq: 3600, sub: 150 },
    awp:    { vol: 0.85, dur: 0.42, freq: 2000, sub: 70  },
    knife:  { vol: 0.2,  dur: 0.06, freq: 5000, sub: 0   },
  };

  function gunshotScaled(id, scale) {
    const p = gunParams[id] || gunParams.glock;
    const v = p.vol * scale;
    if (v < 0.01) return;
    bang(v, p.dur, p.freq, 1.2);
    if (p.sub) tone(p.sub, v * 0.7, p.dur * 1.4, "triangle", p.sub * 0.4); // 低频枪体感
    if (id === "awp") bang(v * 0.5, 0.6, 500, 0.6, 1.4);                   // 回响
  }

  return {
    unlock() { ensure(); },

    gunshot(id) { gunshotScaled(id, 1); },
    gunshotAt(id, pos, listener) { gunshotScaled(id, attenuate(pos, listener, 9) * 0.9); },

    dryFire() { tone(1800, 0.15, 0.05, "square", 900); },
    knife(hit) {
      bang(0.15, 0.05, 6000, 1);
      if (hit) bang(0.3, 0.09, 900, 1);
    },
    reload() { tone(700, 0.14, 0.07, "square", 350); bang(0.1, 0.08, 1500, 1); },
    reloadEnd() { tone(1100, 0.16, 0.06, "square", 1500); bang(0.12, 0.05, 2500, 1); },
    weaponSwitch() { bang(0.08, 0.05, 2000, 1); },
    scope() { tone(1500, 0.1, 0.05, "sine", 2000); },
    jump() { bang(0.05, 0.05, 500, 0.7); },

    footstep() {
      bang(0.06 + Math.random() * 0.03, 0.06, 400 + Math.random() * 250, 0.8);
    },
    footstepAt(pos, listener) {
      const a = attenuate(pos, listener, 5);
      if (a > 0.12) bang(0.08 * a, 0.06, 380 + Math.random() * 200, 0.8);
    },

    hitConfirm() { tone(2600, 0.12, 0.04, "sine", 2200); },
    headshotDing() { tone(3400, 0.16, 0.09, "sine", 3000); },
    damageTaken() { bang(0.28, 0.12, 700, 1); tone(190, 0.2, 0.14, "sawtooth", 120); },
    death() { tone(300, 0.3, 0.5, "sawtooth", 60); bang(0.2, 0.3, 600, 0.7); },

    buy() { tone(1200, 0.16, 0.07, "sine"); tone(1800, 0.14, 0.09, "sine"); },
    buyFail() { tone(300, 0.18, 0.14, "square", 200); },

    throwPin() { tone(2400, 0.12, 0.04, "square", 1600); bang(0.08, 0.05, 3000, 1); },
    throwPinAt(pos, listener) {
      const a = attenuate(pos, listener, 6);
      if (a > 0.15) tone(2400, 0.1 * a, 0.04, "square", 1600);
    },
    grenadeBounceAt(pos, listener) {
      const a = attenuate(pos, listener, 8);
      if (a > 0.1) { bang(0.14 * a, 0.05, 2200, 1.4); tone(900, 0.08 * a, 0.05, "triangle", 500); }
    },
    heExplosionAt(pos, listener) {
      const a = attenuate(pos, listener, 14);
      if (a < 0.05) return;
      bang(0.75 * a, 0.7, 1100, 0.5, 1.1);
      tone(70, 0.55 * a, 0.6, "triangle", 30);
      bang(0.3 * a, 0.35, 3200, 0.6);
    },
    smokeDeployAt(pos, listener) {
      const a = attenuate(pos, listener, 10);
      if (a < 0.08) return;
      bang(0.28 * a, 1.6, 700, 0.4, 1.5); // 持续嘶嘶声
      tone(500, 0.1 * a, 0.25, "sine", 250);
    },

    bombBeep(urgent) { tone(urgent ? 2200 : 1900, urgent ? 0.3 : 0.2, 0.07, "square"); },
    bombPlanted() { tone(1500, 0.25, 0.12, "square"); tone(1000, 0.2, 0.2, "square"); },
    defuseTick() { bang(0.07, 0.03, 3500, 2); },
    bombDefused() { tone(900, 0.25, 0.15, "sine", 1400); tone(1800, 0.2, 0.3, "sine"); },

    explosion() {
      bang(1.0, 1.4, 900, 0.4, 1.1);
      tone(55, 0.9, 1.3, "triangle", 25);
      bang(0.5, 0.6, 3000, 0.5);
    },

    roundStart() { tone(880, 0.2, 0.1, "sine"); tone(1320, 0.18, 0.16, "sine"); },
    roundWin() { [660, 880, 1100].forEach((f, i) => setTimeout(() => tone(f, 0.22, 0.2, "sine"), i * 130)); },
    roundLose() { [500, 400, 300].forEach((f, i) => setTimeout(() => tone(f, 0.22, 0.24, "sawtooth"), i * 150)); },
  };
})();
