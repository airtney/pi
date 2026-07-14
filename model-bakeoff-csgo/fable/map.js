"use strict";
// map.js — Dust II 灵感地图：笔刷(AABB)构建、碰撞盒导出、炸弹点、出生点、BOT 路点图
window.CS = window.CS || {};

CS.createMap = function (THREE) {
  const MIN = -60, MAX = 60, CELL = 2, N = (MAX - MIN) / CELL;
  const WALL_H = 6;
  const group = new THREE.Group();
  const colliders = []; // {x1,y1,z1,x2,y2,z2}

  // ============ 程序化贴图 ============
  function makeTex(draw, size) {
    size = size || 128;
    const cv = document.createElement("canvas");
    cv.width = cv.height = size;
    const g = cv.getContext("2d");
    draw(g, size);
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function speckle(g, s, n, dark, light) {
    for (let i = 0; i < n; i++) {
      const a = 0.03 + Math.random() * 0.1;
      g.fillStyle = (Math.random() < 0.5 ? dark : light).replace("@", a.toFixed(3));
      g.fillRect(Math.random() * s, Math.random() * s, 1 + Math.random() * 3, 1 + Math.random() * 3);
    }
  }
  const wallTex = makeTex((g, s) => {
    g.fillStyle = "#c9b183"; g.fillRect(0, 0, s, s);
    speckle(g, s, 500, "rgba(90,70,40,@)", "rgba(255,245,215,@)");
    g.strokeStyle = "rgba(80,60,35,0.18)"; g.lineWidth = 1.5;
    for (let y = 0; y < s; y += 32) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(s, y); g.stroke();
      const off = (y / 32) % 2 === 0 ? 0 : 32;
      for (let x = off; x < s; x += 64) {
        g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 32); g.stroke();
      }
    }
  });
  const groundTex = makeTex((g, s) => {
    g.fillStyle = "#cdbb90"; g.fillRect(0, 0, s, s);
    speckle(g, s, 900, "rgba(100,80,50,@)", "rgba(255,250,225,@)");
    g.fillStyle = "rgba(120,95,60,0.25)";
    for (let i = 0; i < 14; i++) {
      g.beginPath();
      g.arc(Math.random() * s, Math.random() * s, 1 + Math.random() * 2.5, 0, 7);
      g.fill();
    }
  });
  const concreteTex = makeTex((g, s) => {
    g.fillStyle = "#a9a498"; g.fillRect(0, 0, s, s);
    speckle(g, s, 600, "rgba(50,50,50,@)", "rgba(240,240,235,@)");
    g.strokeStyle = "rgba(40,40,40,0.2)"; g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, s / 2); g.lineTo(s, s / 2); g.stroke();
    g.beginPath(); g.moveTo(s / 2, 0); g.lineTo(s / 2, s); g.stroke();
  });
  const crateTex = makeTex((g, s) => {
    g.fillStyle = "#8f6f45"; g.fillRect(0, 0, s, s);
    speckle(g, s, 300, "rgba(60,40,20,@)", "rgba(230,200,150,@)");
    g.strokeStyle = "#5e452a"; g.lineWidth = 5;
    g.strokeRect(3, 3, s - 6, s - 6);
    g.lineWidth = 3;
    g.beginPath(); g.moveTo(4, 4); g.lineTo(s - 4, s - 4); g.stroke();
    g.beginPath(); g.moveTo(s - 4, 4); g.lineTo(4, s - 4); g.stroke();
  });
  const darkTex = makeTex((g, s) => {
    g.fillStyle = "#6e6657"; g.fillRect(0, 0, s, s);
    speckle(g, s, 400, "rgba(20,20,20,@)", "rgba(200,190,170,@)");
  });
  // 区域地面变体：中路石板 / 隧道暗土 / A 大道红沙（帮助玩家辨认在哪条路）
  const midFloorTex = makeTex((g, s) => {
    g.fillStyle = "#b3a88f"; g.fillRect(0, 0, s, s);
    speckle(g, s, 500, "rgba(60,55,45,@)", "rgba(245,240,225,@)");
    g.strokeStyle = "rgba(50,45,35,0.3)"; g.lineWidth = 2;
    for (let k = 0; k <= s; k += 42) {
      g.beginPath(); g.moveTo(0, k); g.lineTo(s, k); g.stroke();
      g.beginPath(); g.moveTo(k, 0); g.lineTo(k, s); g.stroke();
    }
  });
  const tunnelFloorTex = makeTex((g, s) => {
    g.fillStyle = "#8d7c5c"; g.fillRect(0, 0, s, s);
    speckle(g, s, 700, "rgba(30,25,15,@)", "rgba(190,175,140,@)");
  });
  const longFloorTex = makeTex((g, s) => {
    g.fillStyle = "#c9a578"; g.fillRect(0, 0, s, s);
    speckle(g, s, 800, "rgba(130,80,40,@)", "rgba(255,235,200,@)");
  });

  function mat(tex) {
    return new THREE.MeshLambertMaterial({ map: tex });
  }
  const wallMat = mat(wallTex), groundMat = mat(groundTex),
    concreteMat = mat(concreteTex), crateMat = mat(crateTex), darkMat = mat(darkTex);

  // 让盒子每个面的 UV 按世界尺寸缩放（4m 一个循环），避免贴图拉伸
  function scaleBoxUV(geo, w, h, d) {
    const uv = geo.attributes.uv, S = 4;
    for (let k = 0; k < uv.count; k++) {
      const f = Math.floor(k / 4);
      let su = 1, sv = 1;
      if (f === 0 || f === 1) { su = d / S; sv = h / S; }
      else if (f === 2 || f === 3) { su = w / S; sv = d / S; }
      else { su = w / S; sv = h / S; }
      uv.setXY(k, uv.getX(k) * su, uv.getY(k) * sv);
    }
    uv.needsUpdate = true;
  }

  function addBox(x1, y1, z1, x2, y2, z2, material, noCollide) {
    const w = x2 - x1, h = y2 - y1, d = z2 - z1;
    const geo = new THREE.BoxGeometry(w, h, d);
    scaleBoxUV(geo, w, h, d);
    const m = new THREE.Mesh(geo, material);
    m.position.set((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
    m.castShadow = true; m.receiveShadow = true;
    group.add(m);
    if (!noCollide) colliders.push({ x1, y1, z1, x2, y2, z2 });
    return m;
  }

  // ============ 布局：先"开凿"通道，其余全部为实体墙 ============
  // 坐标：z 负方向为北(CT)，正方向为南(T)；x 正为东(A 区)，负为西(B 区)
  const openRects = [
    [-30, 40, 30, 58],    // T 出生点广场（南）
    [-50, 44, -30, 56],   // T -> 西侧连接
    [-50, -30, -40, 48],  // 西侧隧道（B 通道）
    [-58, -56, -28, -26], // B 点
    [30, 44, 50, 56],     // T -> 东侧连接
    [40, -28, 50, 48],    // A 大道 (Long A)
    [26, -56, 56, -26],   // A 点区域
    [-6, -26, 6, 44],     // 中路 (Mid)
    [-8, -34, 8, -26],    // 中路十字
    [-28, -34, -8, -26],  // 十字 -> B 通道（B 门）
    [-4, -42, 6, -34],    // 中门 -> CT
    [-16, -58, 18, -42],  // CT 出生点（北）
    [18, -50, 26, -42],   // CT -> A
    [-28, -52, -16, -44], // CT -> B
    [8, -34, 26, -26],    // 中路 -> A 小道 (Short)
  ];
  const grid = [];
  for (let j = 0; j < N; j++) {
    grid[j] = [];
    for (let i = 0; i < N; i++) {
      const cx = MIN + i * CELL + 1, cz = MIN + j * CELL + 1;
      let open = false;
      for (const r of openRects) {
        if (cx > r[0] && cx < r[2] && cz > r[1] && cz < r[3]) { open = true; break; }
      }
      grid[j][i] = open ? 0 : 1;
    }
  }
  // 贪心合并实体格子为大盒子
  const used = grid.map((row) => row.map(() => false));
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      if (grid[j][i] !== 1 || used[j][i]) continue;
      let w = 1;
      while (i + w < N && grid[j][i + w] === 1 && !used[j][i + w]) w++;
      let h = 1;
      outer: while (j + h < N) {
        for (let k = 0; k < w; k++) if (grid[j + h][i + k] !== 1 || used[j + h][i + k]) break outer;
        h++;
      }
      for (let jj = 0; jj < h; jj++) for (let ii = 0; ii < w; ii++) used[j + jj][i + ii] = true;
      addBox(MIN + i * CELL, 0, MIN + j * CELL, MIN + (i + w) * CELL, WALL_H, MIN + (j + h) * CELL, wallMat);
    }
  }

  // ============ 地面 ============
  {
    const geo = new THREE.PlaneGeometry(MAX - MIN, MAX - MIN);
    const t = groundTex.clone(); t.needsUpdate = true; t.repeat.set(30, 30);
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: t }));
    m.rotation.x = -Math.PI / 2;
    m.receiveShadow = true;
    group.add(m);
  }
  // 区域地面覆盖层（辨识中路/隧道/大道）
  function floorPatch(x1, z1, x2, z2, tex, repX, repZ) {
    const t = tex.clone(); t.needsUpdate = true; t.repeat.set(repX, repZ);
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(x2 - x1, z2 - z1),
      new THREE.MeshLambertMaterial({ map: t })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set((x1 + x2) / 2, 0.02, (z1 + z2) / 2);
    m.receiveShadow = true;
    group.add(m);
  }
  floorPatch(-6, -34, 6, 44, midFloorTex, 3, 18);      // 中路石板
  floorPatch(-50, -30, -40, 48, tunnelFloorTex, 3, 20); // 隧道暗土
  floorPatch(40, -28, 50, 48, longFloorTex, 3, 20);     // A 大道红沙
  floorPatch(-58, -56, -28, -26, concreteTex, 8, 8);    // B 点水泥

  // ============ 天空穹顶（渐变，程序化） ============
  {
    const cv = document.createElement("canvas");
    cv.width = 4; cv.height = 128;
    const g = cv.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, "#5f93c9");
    grad.addColorStop(0.55, "#a7c4de");
    grad.addColorStop(0.8, "#e2d5b2");
    grad.addColorStop(1, "#e8d9b0");
    g.fillStyle = grad;
    g.fillRect(0, 0, 4, 128);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(300, 24, 12),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false })
    );
    group.add(sky);
    // 太阳圆盘
    const sunDisc = new THREE.Mesh(
      new THREE.CircleGeometry(14, 20),
      new THREE.MeshBasicMaterial({ color: 0xfff3cc, fog: false })
    );
    sunDisc.position.set(160, 190, -120);
    sunDisc.lookAt(0, 0, 0);
    group.add(sunDisc);
  }

  // ============ A 点高台 + 台阶 ============
  // 高台（分三块，留出西侧台阶凹口）
  addBox(30, 0, -56, 56, 2, -46, concreteMat); // 北块
  addBox(30, 0, -40, 56, 2, -32, concreteMat); // 南块
  addBox(34.8, 0, -46, 56, 2, -40, concreteMat); // 凹口东侧补齐
  // 西侧台阶（CT 方向上台）
  for (let i = 0; i < 4; i++) {
    addBox(30 + i * 1.2, 0, -46, 30 + (i + 1) * 1.2, 0.4 * (i + 1), -40, concreteMat);
  }
  // 南侧台阶（A 大道 / 小道方向上台）
  for (let i = 0; i < 4; i++) {
    addBox(40, 0, -27.2 - 1.2 * i - 1.2, 48, 0.4 * (i + 1), -27.2 - 1.2 * i, concreteMat);
  }
  addBox(40, 0, -32, 48, 2, -31.2, concreteMat); // 顶步接平台

  // ============ 隧道顶棚（B 通道成为真正的隧道） ============
  addBox(-50, 3.4, -28, -40, 4.2, 42, darkMat);

  // ============ 门框 / 拱 ============
  addBox(-4, 3.2, -34.6, 6, WALL_H, -33.4, darkMat);   // 中门
  addBox(-29, 3.2, -34, -27, WALL_H, -26, darkMat);    // B 门
  addBox(40, 3.4, 7, 50, WALL_H, 9, wallMat);          // A 大道拱门

  // ============ 木箱（掩体） ============
  function crate(cx, cz, s, y0) {
    addBox(cx - s / 2, y0, cz - s / 2, cx + s / 2, y0 + s, cz + s / 2, crateMat);
  }
  crate(-14, 44, 1.8, 0); crate(16, 46, 1.8, 0);            // T 出生点
  crate(-4.2, 6, 2.4, 0); crate(-4.2, 8.5, 2.4, 0); crate(-4.2, 7.2, 2.4, 2.4); // 中路
  crate(4.4, -12, 2.2, 0);                                   // 中路北段掩体
  crate(4.2, 26, 1.8, 0);                                    // 中路南段掩体
  crate(47.8, 12, 2.4, 0); crate(47.8, 14.5, 2.4, 0);        // A 大道
  crate(42, -18, 2.2, 0); crate(42, -15.7, 2.2, 0);          // A 大道拐角双箱
  crate(-48.5, -8, 1.8, 0);                                  // 隧道
  crate(-42, 24, 1.8, 0);                                    // 隧道南段
  crate(-52.6, -34, 2.4, 0); crate(-50.2, -34, 2.4, 0); crate(-51.4, -34, 2.4, 2.4); // B 点
  crate(-34, -52, 1.8, 0); crate(-31.5, -29.5, 2.4, 0);      // B 点
  crate(-44, -49, 2.2, 0); crate(-44, -46.7, 2.2, 0);        // B 点后场双箱
  crate(50.5, -50.5, 2.4, 2); crate(48, -50.5, 2.4, 2); crate(49.2, -50.5, 2.4, 4.4); // A 点
  crate(33, -36, 1.8, 2);                                    // A 点
  crate(20, -27.3, 2.2, 0);                                  // A 小道口（贴墙，不挡路线）
  crate(14, -55, 1.8, 0);                                    // CT 出生点

  // ============ 炸弹点标记 ============
  const sites = {
    A: { x: 43, y: 2, z: -44, r: 7 },
    B: { x: -43, y: 0, z: -42, r: 7 },
  };
  function siteDecal(site, letter) {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const g = cv.getContext("2d");
    g.strokeStyle = "rgba(230,190,60,0.9)"; g.lineWidth = 10;
    g.setLineDash([28, 18]);
    g.beginPath(); g.arc(128, 128, 116, 0, Math.PI * 2); g.stroke();
    g.setLineDash([]);
    g.font = "bold 150px Arial"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "rgba(230,190,60,0.85)";
    g.fillText(letter, 128, 136);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(site.r * 2, site.r * 2),
      new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(site.x, site.y + 0.02, site.z);
    group.add(m);
  }
  siteDecal(sites.A, "A");
  siteDecal(sites.B, "B");

  // 空中漂浮的点位字母（远处也能辨认 A/B）
  function siteBeacon(site, letter) {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 128;
    const g = cv.getContext("2d");
    g.font = "bold 96px Arial"; g.textAlign = "center"; g.textBaseline = "middle";
    g.strokeStyle = "rgba(0,0,0,0.7)"; g.lineWidth = 10;
    g.strokeText(letter, 64, 70);
    g.fillStyle = "rgba(240,200,70,0.95)";
    g.fillText(letter, 64, 70);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, opacity: 0.85 }));
    sp.scale.set(2.4, 2.4, 1);
    sp.position.set(site.x, site.y + 6.5, site.z);
    group.add(sp);
  }
  siteBeacon(sites.A, "A");
  siteBeacon(sites.B, "B");

  // ============ 光照（沙漠午后：暖阳 + 沙色环境光） ============
  const hemi = new THREE.HemisphereLight(0xbdd2e8, 0x9a8055, 0.95);
  group.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe3b0, 1.75);
  sun.position.set(55, 58, -18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -75; sun.shadow.camera.right = 75;
  sun.shadow.camera.top = 75; sun.shadow.camera.bottom = -75;
  sun.shadow.camera.far = 220;
  sun.shadow.bias = -0.0005;
  group.add(sun);
  group.add(sun.target);
  // 隧道内的点光
  for (const z of [-15, 5, 25]) {
    const p = new THREE.PointLight(0xffc880, 8, 16, 1.6);
    p.position.set(-45, 3, z);
    group.add(p);
  }

  // ============ 出生点 ============
  const spawns = {
    T: [
      { x: 0, z: 50, yaw: 0 }, { x: 6, z: 52, yaw: 0 }, { x: -6, z: 52, yaw: 0 },
      { x: 10, z: 48, yaw: 0 }, { x: -10, z: 48, yaw: 0 },
    ],
    CT: [
      { x: 0, z: -50, yaw: Math.PI }, { x: 6, z: -52, yaw: Math.PI }, { x: -6, z: -52, yaw: Math.PI },
      { x: 10, z: -48, yaw: Math.PI }, { x: -10, z: -48, yaw: Math.PI },
    ],
  };

  // ============ BOT 路点图 ============
  const wpDefs = {
    tspawn: [0, 50], tspawn_w: [-24, 50], tspawn_e: [24, 50],
    outside_tun: [-40, 50], tun_s: [-45, 36], tun_mid: [-45, 8], tun_n: [-45, -20],
    b_tun: [-45, -28], b_site: [-43, -42], b_back: [-54, -50], b_east: [-32, -31],
    b_door_e: [-20, -30], ct_b: [-22, -48], ct_spawn: [0, -50], ct_mid: [1, -38],
    cross: [0, -30], mid_n: [0, -16], mid_m: [0, 8], mid_s: [0, 34],
    short: [16, -30], a_pit: [28, -30], a_south: [34, -28], a_steps: [44, -29],
    a_site: [44, -44], a_plat_n: [38, -52], a_west: [28, -43], ct_a: [22, -46],
    outside_long: [40, 50], long_s: [45, 36], long_mid: [45, 8], long_n: [45, -24],
  };
  const wpEdges = [
    ["tspawn", "tspawn_w"], ["tspawn", "tspawn_e"], ["tspawn", "mid_s"],
    ["tspawn_w", "outside_tun"], ["tspawn_e", "outside_long"],
    ["outside_tun", "tun_s"], ["tun_s", "tun_mid"], ["tun_mid", "tun_n"],
    ["tun_n", "b_tun"], ["b_tun", "b_site"], ["b_site", "b_back"],
    ["b_site", "b_east"], ["b_east", "b_door_e"], ["b_door_e", "cross"],
    ["b_site", "ct_b"], ["ct_b", "ct_spawn"], ["ct_spawn", "ct_mid"],
    ["ct_mid", "cross"], ["cross", "mid_n"], ["mid_n", "mid_m"],
    ["mid_m", "mid_s"], ["mid_s", "tspawn"], ["cross", "short"],
    ["short", "a_pit"], ["short", "a_south"], ["a_pit", "a_south"],
    ["a_pit", "a_west"], ["a_west", "ct_a"], ["a_west", "a_site"],
    ["a_south", "a_steps"], ["a_steps", "a_site"], ["long_n", "a_steps"],
    ["a_south", "long_n"], ["a_site", "a_plat_n"], ["ct_spawn", "ct_a"],
    ["outside_long", "long_s"], ["long_s", "long_mid"], ["long_mid", "long_n"],
  ];

  // 地面高度查询：低于 belowY+0.6 的最高盒子顶
  function groundHeight(x, z, belowY) {
    if (belowY === undefined) belowY = 1e9;
    let top = 0;
    for (const c of colliders) {
      if (x > c.x1 && x < c.x2 && z > c.z1 && z < c.z2 && c.y2 <= belowY + 0.6 && c.y2 > top) {
        top = c.y2;
      }
    }
    return top;
  }

  const waypoints = {};
  for (const name in wpDefs) {
    const [x, z] = wpDefs[name];
    waypoints[name] = { name, x, y: groundHeight(x, z, 2.5), z, adj: [] };
  }
  for (const [a, b] of wpEdges) {
    waypoints[a].adj.push(b);
    waypoints[b].adj.push(a);
  }

  function nearestWaypoint(pos) {
    let best = null, bd = 1e9;
    for (const name in waypoints) {
      const w = waypoints[name];
      const d = (w.x - pos.x) * (w.x - pos.x) + (w.z - pos.z) * (w.z - pos.z);
      if (d < bd) { bd = d; best = w; }
    }
    return best;
  }

  // Dijkstra 寻路，返回路点对象数组
  function findPath(fromPos, toName) {
    const start = nearestWaypoint(fromPos).name;
    if (start === toName) return [waypoints[toName]];
    const dist = {}, prev = {}, visited = {};
    for (const n in waypoints) dist[n] = 1e9;
    dist[start] = 0;
    for (;;) {
      let u = null, ud = 1e9;
      for (const n in waypoints) if (!visited[n] && dist[n] < ud) { ud = dist[n]; u = n; }
      if (u === null || u === toName) break;
      visited[u] = true;
      const wu = waypoints[u];
      for (const v of wu.adj) {
        if (visited[v]) continue;
        const wv = waypoints[v];
        const d = ud + Math.hypot(wv.x - wu.x, wv.z - wu.z);
        if (d < dist[v]) { dist[v] = d; prev[v] = u; }
      }
    }
    if (dist[toName] >= 1e9) return [waypoints[toName]];
    const path = [];
    let cur = toName;
    while (cur !== undefined) { path.unshift(waypoints[cur]); cur = prev[cur]; }
    return path;
  }

  return {
    group, colliders, sites, spawns, waypoints,
    bounds: { min: MIN, max: MAX },
    groundHeight, nearestWaypoint, findPath,
  };
};
