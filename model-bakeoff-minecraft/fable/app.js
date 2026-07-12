/* 迷你我的世界 —— 主程序：场景、输入、破坏/放置、热键栏、粒子、音效
   由 index.html 内联 module 脚本加载 Three.js（CDN）后调用 MC.start(...)，
   这样直接双击 index.html（file://）也能运行。 */
window.MC = window.MC || {};
window.MC.start = function start(THREE, PointerLockControls) {
  'use strict';
  const MC = window.MC;
  const B = MC.Blocks;

  // ---------- 基础场景 ----------
  const scene = new THREE.Scene();
  const SKY = new THREE.Color(0x87ceeb);
  scene.background = SKY;
  scene.fog = new THREE.Fog(SKY, 60, 150);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 400);

  const renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('game').appendChild(renderer.domElement);

  // 白天光照：环境光 + 太阳方向光 + 天空半球光
  scene.add(new THREE.AmbientLight(0xffffff, 0.62));
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.35);
  sun.position.set(0.6, 1, 0.35).multiplyScalar(100);
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xbfe3ff, 0x8a7a5a, 0.35));

  // ---------- 世界 ----------
  const atlas = MC.makeAtlas(THREE);
  const world = new MC.World(1337);
  const mesher = new MC.ChunkMesher(THREE, world, atlas.texture);
  scene.add(mesher.group);

  // 简单方块云
  const cloudGroup = new THREE.Group();
  {
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    const rnd = MC.mulberry32(99);
    for (let i = 0; i < 26; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(8 + rnd() * 18, 1.2, 6 + rnd() * 14), mat);
      m.position.set(rnd() * 300 - 90, 44 + rnd() * 5, rnd() * 300 - 90);
      cloudGroup.add(m);
    }
    scene.add(cloudGroup);
  }

  // ---------- 玩家与控制 ----------
  const player = new MC.Player(world);
  player.spawn(MC.SIZE_X / 2, MC.SIZE_Z / 2);

  const controls = new PointerLockControls(camera, document.body);
  const overlay = document.getElementById('overlay');
  const hud = document.getElementById('hud');

  document.getElementById('play-btn').addEventListener('click', () => controls.lock());
  controls.addEventListener('lock', () => {
    overlay.classList.add('hidden');
    hud.classList.remove('hidden');
  });
  controls.addEventListener('unlock', () => {
    overlay.classList.remove('hidden');
    hud.classList.add('hidden');
  });

  const input = { forward: false, back: false, left: false, right: false, jump: false, sprint: false };
  const KEYMAP = {
    KeyW: 'forward', ArrowUp: 'forward',
    KeyS: 'back', ArrowDown: 'back',
    KeyA: 'left', ArrowLeft: 'left',
    KeyD: 'right', ArrowRight: 'right',
    Space: 'jump',
    ShiftLeft: 'sprint', ShiftRight: 'sprint',
  };

  document.addEventListener('keydown', (e) => {
    if (KEYMAP[e.code]) { input[KEYMAP[e.code]] = true; e.preventDefault(); }
    if (e.code.startsWith('Digit')) {
      const n = parseInt(e.code.slice(5), 10);
      if (n >= 1 && n <= HOTBAR.length) selectSlot(n - 1);
    }
  });
  document.addEventListener('keyup', (e) => {
    if (KEYMAP[e.code]) input[KEYMAP[e.code]] = false;
  });

  // ---------- 热键栏（1-4 切换放置方块） ----------
  const HOTBAR = [B.GRASS, B.DIRT, B.STONE, B.LOG];
  let slot = 0;

  function buildHotbar() {
    const bar = document.getElementById('hotbar');
    HOTBAR.forEach((id, i) => {
      const cell = document.createElement('div');
      cell.className = 'slot';
      const icon = atlas.tileCanvas(MC.tileFor(id, 'side'));
      icon.className = 'slot-icon';
      const key = document.createElement('span');
      key.className = 'slot-key';
      key.textContent = String(i + 1);
      cell.appendChild(icon);
      cell.appendChild(key);
      bar.appendChild(cell);
    });
  }
  function selectSlot(i) {
    slot = i;
    document.querySelectorAll('#hotbar .slot').forEach((el, j) => {
      el.classList.toggle('active', j === i);
    });
    document.getElementById('block-name').textContent = MC.BLOCK_DEFS[HOTBAR[i]].name;
  }
  buildHotbar();
  selectSlot(0);

  document.addEventListener('wheel', (e) => {
    if (!controls.isLocked) return;
    const d = e.deltaY > 0 ? 1 : -1;
    selectSlot((slot + d + HOTBAR.length) % HOTBAR.length);
  });

  // ---------- 准星射线 + 方块高亮轮廓 ----------
  const REACH = 5.5;
  const highlight = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1.002, 1.002, 1.002)),
    new THREE.LineBasicMaterial({ color: 0x111111 })
  );
  highlight.visible = false;
  scene.add(highlight);

  const _dir = new THREE.Vector3();
  function pickTarget() {
    camera.getWorldDirection(_dir);
    return world.raycast(player.eyePos(), _dir, REACH);
  }

  // ---------- 破坏 / 放置 ----------
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('mousedown', (e) => {
    if (!controls.isLocked) return;
    const hit = pickTarget();
    if (!hit) return;
    if (e.button === 0) { // 左键破坏
      if (hit.id === B.BEDROCK) { playSound('deny'); return; }
      // 水面以下且邻接水时，破坏后由水填充（简化流体）
      const refill = hit.y <= MC.WATER_LEVEL && nearWater(hit.x, hit.y, hit.z);
      world.set(hit.x, hit.y, hit.z, refill ? B.WATER : B.AIR);
      mesher.updateAt(hit.x, hit.z);
      spawnBreakParticles(hit);
      playSound('break');
    } else if (e.button === 2) { // 右键放置
      const px = hit.x + hit.nx, py = hit.y + hit.ny, pz = hit.z + hit.nz;
      if (!world.inBounds(px, py, pz)) return;
      const cur = world.get(px, py, pz);
      if (cur !== B.AIR && cur !== B.WATER) return;
      if (player.intersectsBlock(px, py, pz)) return; // 不能放进自己身体里
      world.set(px, py, pz, HOTBAR[slot]);
      mesher.updateAt(px, pz);
      playSound('place');
    }
  });

  function nearWater(x, y, z) {
    return (
      world.get(x + 1, y, z) === B.WATER || world.get(x - 1, y, z) === B.WATER ||
      world.get(x, y, z + 1) === B.WATER || world.get(x, y, z - 1) === B.WATER ||
      world.get(x, y + 1, z) === B.WATER
    );
  }

  // ---------- 破坏粒子 ----------
  const particles = [];
  const particleGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
  function spawnBreakParticles(hit) {
    const c = atlas.avgColor(MC.tileFor(hit.id, 'side'));
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(c[0], c[1], c[2]) });
    for (let i = 0; i < 14; i++) {
      const m = new THREE.Mesh(particleGeo, mat);
      m.position.set(
        hit.x + 0.2 + Math.random() * 0.6,
        hit.y + 0.2 + Math.random() * 0.6,
        hit.z + 0.2 + Math.random() * 0.6
      );
      scene.add(m);
      particles.push({
        mesh: m,
        vx: (Math.random() - 0.5) * 3.4,
        vy: 2 + Math.random() * 3,
        vz: (Math.random() - 0.5) * 3.4,
        life: 0.55 + Math.random() * 0.3,
      });
    }
  }
  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        scene.remove(p.mesh);
        p.mesh.material.dispose();
        particles.splice(i, 1);
        continue;
      }
      p.vy -= 14 * dt;
      p.mesh.position.x += p.vx * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.position.z += p.vz * dt;
      p.mesh.scale.setScalar(Math.min(1, p.life * 3));
    }
  }

  // ---------- 音效（WebAudio 合成，无音频文件） ----------
  let audioCtx = null;
  function playSound(kind) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx;
      const t = ctx.currentTime;
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      if (kind === 'break') {
        const len = 0.12;
        const buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass'; f.frequency.value = 900;
        src.connect(f); f.connect(gain);
        gain.gain.setValueAtTime(0.35, t);
        src.start(t);
      } else if (kind === 'place') {
        const o = ctx.createOscillator();
        o.type = 'square';
        o.frequency.setValueAtTime(220, t);
        o.frequency.exponentialRampToValueAtTime(110, t + 0.08);
        o.connect(gain);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        o.start(t); o.stop(t + 0.1);
      } else { // deny（敲基岩）
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(90, t);
        o.connect(gain);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        o.start(t); o.stop(t + 0.13);
      }
    } catch (_) { /* 音频不可用时静默 */ }
  }

  // ---------- HUD ----------
  const posEl = document.getElementById('pos');
  const fpsEl = document.getElementById('fps');
  const waterTint = document.getElementById('water-tint');
  let fpsAcc = 0, fpsN = 0, fpsShown = 0;

  // ---------- 主循环 ----------
  const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
  const IDLE_INPUT = { forward: false, back: false, left: false, right: false, jump: false, sprint: false };
  let last = performance.now();

  function tick(now) {
    requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (controls.isLocked) {
      _euler.setFromQuaternion(camera.quaternion);
      player.update(dt, input, _euler.y);
    } else {
      player.update(dt, IDLE_INPUT, 0);
    }
    const eye = player.eyePos();
    camera.position.set(eye.x, eye.y, eye.z);

    // 准星方块高亮
    const hit = controls.isLocked ? pickTarget() : null;
    if (hit) {
      highlight.position.set(hit.x + 0.5, hit.y + 0.5, hit.z + 0.5);
      highlight.visible = true;
    } else {
      highlight.visible = false;
    }

    // 水下蓝色滤镜
    const headIn = world.get(Math.floor(eye.x), Math.floor(eye.y), Math.floor(eye.z)) === B.WATER;
    waterTint.classList.toggle('hidden', !headIn);

    cloudGroup.position.x = ((now / 1000) * 0.8) % 200 - 100;

    updateParticles(dt);

    // HUD
    fpsAcc += dt; fpsN++;
    if (fpsAcc >= 0.5) {
      fpsShown = Math.round(fpsN / fpsAcc);
      fpsAcc = 0; fpsN = 0;
    }
    posEl.textContent = 'XYZ: ' + player.pos.x.toFixed(1) + ' / ' + player.pos.y.toFixed(1) + ' / ' + player.pos.z.toFixed(1);
    fpsEl.textContent = fpsShown + ' FPS';

    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // 初始视角
  camera.position.set(player.pos.x, player.pos.y + MC.PLAYER_EYE, player.pos.z);
  camera.lookAt(player.pos.x + 8, player.pos.y + MC.PLAYER_EYE, player.pos.z - 12);

  requestAnimationFrame(tick);

  // 测试钩子（自动化验收用，不影响游戏）
  window.__MC_DEBUG = { scene, camera, world, player, mesher, controls, input, THREE, pickTarget, selectSlot, renderer };
  window.__MC_READY = true;
};
