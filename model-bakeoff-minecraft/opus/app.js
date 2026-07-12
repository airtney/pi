import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

// ==================================================================
// 迷你我的世界 - 体素沙盒
// ==================================================================

const WORLD_SIZE = 56;      // 地图 x/z 尺寸
const MAX_HEIGHT = 24;      // 最大高度
const WATER_LEVEL = 7;      // 水平面
const REACH = 6;            // 交互距离（方块）

// -------------------- 方块颜色 --------------------
const BLOCK_COLORS = {
  grass: "#6ab150",
  dirt: "#8a6a43",
  stone: "#909090",
  wood: "#7a5a34",
  leaves: "#3f8b34",
  water: "#3a6ede",
  sand: "#dcd29a",
};

// 热键栏可放置的方块
const HOTBAR = ["grass", "dirt", "stone", "wood"];
let selected = 0;

// ==================================================================
// 场景基础
// ==================================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 40, 90);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 光照：环境光 + 太阳（方向光）
scene.add(new THREE.HemisphereLight(0xffffff, 0x556b2f, 0.9));
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(40, 80, 20);
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.35));

// ==================================================================
// 程序化像素贴图
// ==================================================================
function shade(hex, delta) {
  const c = new THREE.Color(hex);
  c.r = THREE.MathUtils.clamp(c.r + delta, 0, 1);
  c.g = THREE.MathUtils.clamp(c.g + delta, 0, 1);
  c.b = THREE.MathUtils.clamp(c.b + delta, 0, 1);
  return `#${c.getHexString()}`;
}

function makeTexture(paint) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 16;
  const ctx = canvas.getContext("2d");
  paint(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

function noiseFill(ctx, base, amp) {
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      ctx.fillStyle = shade(base, (Math.random() - 0.5) * amp);
      ctx.fillRect(x, y, 1, 1);
    }
}

const textures = {
  grass_top: makeTexture((ctx) => noiseFill(ctx, BLOCK_COLORS.grass, 0.18)),
  grass_side: makeTexture((ctx) => {
    noiseFill(ctx, BLOCK_COLORS.dirt, 0.16);
    for (let x = 0; x < 16; x++) {
      const h = 3 + Math.floor(Math.random() * 2);
      for (let y = 0; y < h; y++) {
        ctx.fillStyle = shade(BLOCK_COLORS.grass, (Math.random() - 0.5) * 0.2);
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }),
  dirt: makeTexture((ctx) => noiseFill(ctx, BLOCK_COLORS.dirt, 0.16)),
  stone: makeTexture((ctx) => noiseFill(ctx, BLOCK_COLORS.stone, 0.14)),
  wood_top: makeTexture((ctx) => {
    noiseFill(ctx, "#b6905a", 0.1);
    ctx.strokeStyle = shade("#b6905a", -0.2);
    ctx.beginPath();
    ctx.arc(8, 8, 5, 0, Math.PI * 2);
    ctx.arc(8, 8, 2.5, 0, Math.PI * 2);
    ctx.stroke();
  }),
  wood_side: makeTexture((ctx) => {
    noiseFill(ctx, BLOCK_COLORS.wood, 0.08);
    for (let x = 0; x < 16; x += 4) {
      ctx.fillStyle = shade(BLOCK_COLORS.wood, -0.15);
      ctx.fillRect(x, 0, 1, 16);
    }
  }),
  leaves: makeTexture((ctx) => noiseFill(ctx, BLOCK_COLORS.leaves, 0.22)),
  water: makeTexture((ctx) => noiseFill(ctx, BLOCK_COLORS.water, 0.1)),
  sand: makeTexture((ctx) => noiseFill(ctx, BLOCK_COLORS.sand, 0.12)),
};

const materials = {
  grass_top: new THREE.MeshLambertMaterial({ map: textures.grass_top }),
  grass_side: new THREE.MeshLambertMaterial({ map: textures.grass_side }),
  dirt: new THREE.MeshLambertMaterial({ map: textures.dirt }),
  stone: new THREE.MeshLambertMaterial({ map: textures.stone }),
  wood_top: new THREE.MeshLambertMaterial({ map: textures.wood_top }),
  wood_side: new THREE.MeshLambertMaterial({ map: textures.wood_side }),
  leaves: new THREE.MeshLambertMaterial({ map: textures.leaves }),
  sand: new THREE.MeshLambertMaterial({ map: textures.sand }),
  water: new THREE.MeshLambertMaterial({
    map: textures.water,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  }),
};

// ==================================================================
// 世界数据
// ==================================================================
const world = new Map();
const keyOf = (x, y, z) => `${x},${y},${z}`;
const getBlock = (x, y, z) => world.get(keyOf(x, y, z));
const setBlock = (x, y, z, t) => {
  if (t) world.set(keyOf(x, y, z), t);
  else world.delete(keyOf(x, y, z));
};
const isOpaque = (t) => t !== undefined && t !== "water";

// -------------------- 简易 value noise --------------------
function rand2(x, z) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
function valueNoise(x, z) {
  const xi = Math.floor(x),
    zi = Math.floor(z);
  const xf = x - xi,
    zf = z - zi;
  const v00 = rand2(xi, zi),
    v10 = rand2(xi + 1, zi),
    v01 = rand2(xi, zi + 1),
    v11 = rand2(xi + 1, zi + 1);
  const u = smooth(xf),
    v = smooth(zf);
  return lerp(lerp(v00, v10, u), lerp(v01, v11, u), v);
}
function terrainHeight(x, z) {
  let h = valueNoise(x * 0.06, z * 0.06) * 12;
  h += valueNoise(x * 0.14, z * 0.14) * 5;
  h += valueNoise(x * 0.3, z * 0.3) * 2;
  return Math.floor(h) + 4;
}

function plantTree(x, z, groundY) {
  const trunk = 4 + Math.floor(Math.random() * 2);
  for (let i = 1; i <= trunk; i++) setBlock(x, groundY + i, z, "wood");
  const top = groundY + trunk;
  for (let dy = -1; dy <= 2; dy++) {
    const r = dy <= 0 ? 2 : dy === 1 ? 1 : 1;
    for (let dx = -r; dx <= r; dx++)
      for (let dz = -r; dz <= r; dz++) {
        if (dx === 0 && dz === 0 && dy <= 0) continue;
        if (Math.abs(dx) === r && Math.abs(dz) === r && Math.random() < 0.5)
          continue;
        const y = top + dy;
        if (!getBlock(x + dx, y, z + dz)) setBlock(x + dx, y, z + dz, "leaves");
      }
  }
}

function generateWorld() {
  for (let x = 0; x < WORLD_SIZE; x++) {
    for (let z = 0; z < WORLD_SIZE; z++) {
      const h = Math.min(terrainHeight(x, z), MAX_HEIGHT);
      for (let y = 0; y <= h; y++) {
        let t;
        if (y === 0) t = "stone";
        else if (y === h) {
          if (h <= WATER_LEVEL + 1) t = "sand";
          else t = "grass";
        } else if (y > h - 3) t = "dirt";
        else t = "stone";
        setBlock(x, y, z, t);
      }
      // 填水
      for (let y = h + 1; y <= WATER_LEVEL; y++) setBlock(x, y, z, "water");
    }
  }
  // 种树
  for (let i = 0; i < 24; i++) {
    const x = 3 + Math.floor(Math.random() * (WORLD_SIZE - 6));
    const z = 3 + Math.floor(Math.random() * (WORLD_SIZE - 6));
    const h = Math.min(terrainHeight(x, z), MAX_HEIGHT);
    if (h > WATER_LEVEL + 1 && getBlock(x, h, z) === "grass")
      plantTree(x, z, h);
  }
}

// ==================================================================
// 网格构建（贪心的可见面剔除，按材质分组）
// ==================================================================
const FACES = [
  { dir: [-1, 0, 0], key: "side", c: [[0,1,0],[0,0,0],[0,1,1],[0,0,1]] },
  { dir: [1, 0, 0], key: "side", c: [[1,1,1],[1,0,1],[1,1,0],[1,0,0]] },
  { dir: [0, -1, 0], key: "bottom", c: [[1,0,1],[0,0,1],[1,0,0],[0,0,0]] },
  { dir: [0, 1, 0], key: "top", c: [[0,1,1],[1,1,1],[0,1,0],[1,1,0]] },
  { dir: [0, 0, -1], key: "side", c: [[1,0,0],[0,0,0],[1,1,0],[0,1,0]] },
  { dir: [0, 0, 1], key: "side", c: [[0,0,1],[1,0,1],[0,1,1],[1,1,1]] },
];
const FACE_UV = [[0,1],[0,0],[1,1],[1,0]];

function faceMaterial(type, key) {
  if (type === "grass")
    return key === "top" ? "grass_top" : key === "bottom" ? "dirt" : "grass_side";
  if (type === "wood") return key === "side" ? "wood_side" : "wood_top";
  return type;
}

const worldGroup = new THREE.Group();
scene.add(worldGroup);

function rebuildWorld() {
  for (const child of worldGroup.children) child.geometry.dispose();
  worldGroup.clear();

  const buffers = {}; // matKey -> {pos, norm, uv, idx}
  const push = (mat) => {
    if (!buffers[mat]) buffers[mat] = { pos: [], norm: [], uv: [], idx: [] };
    return buffers[mat];
  };

  for (const [k, type] of world) {
    const [x, y, z] = k.split(",").map(Number);
    const isWater = type === "water";
    for (const f of FACES) {
      const nb = getBlock(x + f.dir[0], y + f.dir[1], z + f.dir[2]);
      if (isWater) {
        if (nb !== undefined) continue; // 水只画临空面
      } else {
        if (isOpaque(nb)) continue;
      }
      const matKey = isWater ? "water" : faceMaterial(type, f.key);
      const b = push(matKey);
      const base = b.pos.length / 3;
      for (let i = 0; i < 4; i++) {
        b.pos.push(x + f.c[i][0], y + f.c[i][1], z + f.c[i][2]);
        b.norm.push(f.dir[0], f.dir[1], f.dir[2]);
        b.uv.push(FACE_UV[i][0], FACE_UV[i][1]);
      }
      b.idx.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
    }
  }

  for (const matKey in buffers) {
    const b = buffers[matKey];
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(b.pos, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(b.norm, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(b.uv, 2));
    geo.setIndex(b.idx);
    const mesh = new THREE.Mesh(geo, materials[matKey]);
    mesh.renderOrder = matKey === "water" ? 1 : 0;
    worldGroup.add(mesh);
  }
}

generateWorld();
rebuildWorld();

// ==================================================================
// 选中方块高亮框
// ==================================================================
const highlight = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(1.002, 1.002, 1.002)),
  new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
);
highlight.visible = false;
scene.add(highlight);

// ==================================================================
// 玩家 & 控制
// ==================================================================
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

const velocity = new THREE.Vector3();
let onGround = false;
const PLAYER_HALF = 0.3;
const PLAYER_HEIGHT = 1.8;
const EYE_HEIGHT = 1.6;
const GRAVITY = 26;
const MOVE_SPEED = 5.2;
const JUMP_SPEED = 8.6;

// 出生点：地图中心地面之上
const spawnX = Math.floor(WORLD_SIZE / 2);
const spawnZ = Math.floor(WORLD_SIZE / 2);
let spawnY = MAX_HEIGHT;
for (let y = MAX_HEIGHT; y >= 0; y--) {
  if (isOpaque(getBlock(spawnX, y, spawnZ))) {
    spawnY = y + 1;
    break;
  }
}
controls.getObject().position.set(spawnX + 0.5, spawnY + EYE_HEIGHT, spawnZ + 0.5);

const keys = {};
document.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code >= "Digit1" && e.code <= "Digit4")
    selectSlot(Number(e.code.slice(5)) - 1);
});
document.addEventListener("keyup", (e) => (keys[e.code] = false));
window.addEventListener("wheel", (e) => {
  selectSlot((selected + (e.deltaY > 0 ? 1 : HOTBAR.length - 1)) % HOTBAR.length);
});

// -------------------- 碰撞检测 --------------------
function collides(px, py, pz) {
  const minX = Math.floor(px - PLAYER_HALF);
  const maxX = Math.floor(px + PLAYER_HALF);
  const minY = Math.floor(py - EYE_HEIGHT);
  const maxY = Math.floor(py - EYE_HEIGHT + PLAYER_HEIGHT);
  const minZ = Math.floor(pz - PLAYER_HALF);
  const maxZ = Math.floor(pz + PLAYER_HALF);
  for (let x = minX; x <= maxX; x++)
    for (let y = minY; y <= maxY; y++)
      for (let z = minZ; z <= maxZ; z++)
        if (isOpaque(getBlock(x, y, z))) return true;
  return false;
}

function updatePhysics(dt) {
  const obj = controls.getObject();
  const pos = obj.position;

  // 水平输入（相对相机朝向）
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));

  const wish = new THREE.Vector3();
  if (keys["KeyW"]) wish.add(forward);
  if (keys["KeyS"]) wish.sub(forward);
  if (keys["KeyD"]) wish.add(right);
  if (keys["KeyA"]) wish.sub(right);
  if (wish.lengthSq() > 0) wish.normalize().multiplyScalar(MOVE_SPEED);

  velocity.x = wish.x;
  velocity.z = wish.z;
  velocity.y -= GRAVITY * dt;

  if (keys["Space"] && onGround) {
    velocity.y = JUMP_SPEED;
    onGround = false;
  }

  // 分轴移动 + 碰撞
  const nx = pos.x + velocity.x * dt;
  if (!collides(nx, pos.y, pos.z)) pos.x = nx;
  else velocity.x = 0;

  const nz = pos.z + velocity.z * dt;
  if (!collides(pos.x, pos.y, nz)) pos.z = nz;
  else velocity.z = 0;

  onGround = false;
  const ny = pos.y + velocity.y * dt;
  if (!collides(pos.x, ny, pos.z)) pos.y = ny;
  else {
    if (velocity.y < 0) onGround = true;
    velocity.y = 0;
  }

  // 掉出世界保护
  if (pos.y < -20) {
    pos.set(spawnX + 0.5, spawnY + EYE_HEIGHT + 2, spawnZ + 0.5);
    velocity.set(0, 0, 0);
  }
}

// ==================================================================
// 体素射线（Amanatides & Woo）
// ==================================================================
function raycastVoxel() {
  const origin = camera.getWorldPosition(new THREE.Vector3());
  const dir = camera.getWorldDirection(new THREE.Vector3());

  let x = Math.floor(origin.x),
    y = Math.floor(origin.y),
    z = Math.floor(origin.z);
  const stepX = Math.sign(dir.x),
    stepY = Math.sign(dir.y),
    stepZ = Math.sign(dir.z);
  const tDX = stepX !== 0 ? Math.abs(1 / dir.x) : Infinity;
  const tDY = stepY !== 0 ? Math.abs(1 / dir.y) : Infinity;
  const tDZ = stepZ !== 0 ? Math.abs(1 / dir.z) : Infinity;
  let tMX = stepX > 0 ? (x + 1 - origin.x) / dir.x : (origin.x - x) / -dir.x;
  let tMY = stepY > 0 ? (y + 1 - origin.y) / dir.y : (origin.y - y) / -dir.y;
  let tMZ = stepZ > 0 ? (z + 1 - origin.z) / dir.z : (origin.z - z) / -dir.z;
  if (!isFinite(tMX)) tMX = Infinity;
  if (!isFinite(tMY)) tMY = Infinity;
  if (!isFinite(tMZ)) tMZ = Infinity;

  let normal = [0, 0, 0];
  let dist = 0;
  while (dist <= REACH) {
    const t = getBlock(x, y, z);
    if (t !== undefined && t !== "water")
      return { x, y, z, normal, type: t };
    if (tMX < tMY && tMX < tMZ) {
      x += stepX;
      dist = tMX;
      tMX += tDX;
      normal = [-stepX, 0, 0];
    } else if (tMY < tMZ) {
      y += stepY;
      dist = tMY;
      tMY += tDY;
      normal = [0, -stepY, 0];
    } else {
      z += stepZ;
      dist = tMZ;
      tMZ += tDZ;
      normal = [0, 0, -stepZ];
    }
  }
  return null;
}

// ==================================================================
// 破坏 / 放置
// ==================================================================
function overlapsPlayer(x, y, z) {
  const pos = controls.getObject().position;
  const feet = pos.y - EYE_HEIGHT;
  return (
    x + 1 > pos.x - PLAYER_HALF &&
    x < pos.x + PLAYER_HALF &&
    z + 1 > pos.z - PLAYER_HALF &&
    z < pos.z + PLAYER_HALF &&
    y + 1 > feet &&
    y < feet + PLAYER_HEIGHT
  );
}

const particles = [];
function spawnParticles(x, y, z, type) {
  const color = new THREE.Color(BLOCK_COLORS[type] || "#888");
  const mat = new THREE.MeshLambertMaterial({ color });
  for (let i = 0; i < 8; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), mat);
    m.position.set(x + 0.5, y + 0.5, z + 0.5);
    m.userData.vel = new THREE.Vector3(
      (Math.random() - 0.5) * 3,
      Math.random() * 4 + 1,
      (Math.random() - 0.5) * 3
    );
    m.userData.life = 0.7;
    scene.add(m);
    particles.push(m);
  }
}
function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.userData.vel.y -= GRAVITY * dt;
    p.position.addScaledVector(p.userData.vel, dt);
    p.userData.life -= dt;
    p.scale.multiplyScalar(0.94);
    if (p.userData.life <= 0) {
      scene.remove(p);
      p.geometry.dispose();
      particles.splice(i, 1);
    }
  }
}

document.addEventListener("mousedown", (e) => {
  if (!controls.isLocked) return;
  const hit = raycastVoxel();
  if (!hit) return;

  if (e.button === 0) {
    // 左键破坏
    if (hit.y === 0) return; // 保留基岩层
    spawnParticles(hit.x, hit.y, hit.z, hit.type);
    setBlock(hit.x, hit.y, hit.z, null);
    rebuildWorld();
  } else if (e.button === 2) {
    // 右键放置
    const nx = hit.x + hit.normal[0];
    const ny = hit.y + hit.normal[1];
    const nz = hit.z + hit.normal[2];
    if (getBlock(nx, ny, nz)) return;
    if (overlapsPlayer(nx, ny, nz)) return;
    setBlock(nx, ny, nz, HOTBAR[selected]);
    rebuildWorld();
  }
});
document.addEventListener("contextmenu", (e) => e.preventDefault());

// ==================================================================
// 热键栏 UI
// ==================================================================
function selectSlot(i) {
  selected = i;
  document.querySelectorAll(".slot").forEach((el, idx) => {
    el.classList.toggle("active", idx === selected);
  });
}
HOTBAR.forEach((type, i) => {
  const icon = document.getElementById(`icon-${i}`);
  if (icon) icon.style.background = BLOCK_COLORS[type];
  const slot = document.querySelector(`.slot[data-slot="${i}"]`);
  if (slot) slot.addEventListener("click", () => selectSlot(i));
});
selectSlot(0);

// ==================================================================
// 开始 / 指针锁定
// ==================================================================
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("startBtn");
document.getElementById("loading").classList.add("hidden");

startBtn.addEventListener("click", () => controls.lock());
controls.addEventListener("lock", () => overlay.classList.add("hidden"));
controls.addEventListener("unlock", () => overlay.classList.remove("hidden"));

// ==================================================================
// 主循环
// ==================================================================
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (controls.isLocked) {
    updatePhysics(dt);
    const hit = raycastVoxel();
    if (hit) {
      highlight.visible = true;
      highlight.position.set(hit.x + 0.5, hit.y + 0.5, hit.z + 0.5);
    } else {
      highlight.visible = false;
    }
  }
  updateParticles(dt);
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
