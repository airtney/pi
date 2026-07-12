import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

// ——— Block types ———
const AIR = 0;
const GRASS = 1;
const DIRT = 2;
const STONE = 3;
const WOOD = 4;
const LEAVES = 5;

const BLOCK_COLORS = {
  [GRASS]: 0x5d9e3e,
  [DIRT]: 0x8b5a2b,
  [STONE]: 0x7a7a7a,
  [WOOD]: 0xa0723a,
  [LEAVES]: 0x3d8b3d,
};

const HOTBAR_TYPES = [GRASS, DIRT, STONE, WOOD];
const HOTBAR_NAMES = ["草方块", "泥土", "石头", "木头"];

// ——— World size ———
const WORLD_W = 48;
const WORLD_D = 48;
const WORLD_H = 32;
const SEA_LEVEL = 6;

const world = new Uint8Array(WORLD_W * WORLD_H * WORLD_D);

function idx(x, y, z) {
  return x + WORLD_W * (z + WORLD_D * y);
}

function inBounds(x, y, z) {
  return x >= 0 && x < WORLD_W && y >= 0 && y < WORLD_H && z >= 0 && z < WORLD_D;
}

function getBlock(x, y, z) {
  if (!inBounds(x, y, z)) return STONE;
  return world[idx(x, y, z)];
}

function setBlock(x, y, z, type) {
  if (!inBounds(x, y, z)) return;
  world[idx(x, y, z)] = type;
}

// ——— Simple value noise ———
function hash2(x, z) {
  let n = x * 374761393 + z * 668265263;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967296;
}

function smoothNoise(x, z) {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const sx = fx * fx * (3 - 2 * fx);
  const sz = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz);
  const b = hash2(ix + 1, iz);
  const c = hash2(ix, iz + 1);
  const d = hash2(ix + 1, iz + 1);
  return a + (b - a) * sx + (c - a) * sz + (a - b - c + d) * sx * sz;
}

function fbm(x, z) {
  let v = 0;
  let a = 1;
  let f = 0.04;
  for (let i = 0; i < 4; i++) {
    v += smoothNoise(x * f, z * f) * a;
    a *= 0.5;
    f *= 2;
  }
  return v;
}

function heightAt(x, z) {
  const n = fbm(x + 100, z + 50);
  return Math.floor(4 + n * 10);
}

function generateTerrain() {
  for (let x = 0; x < WORLD_W; x++) {
    for (let z = 0; z < WORLD_D; z++) {
      const h = heightAt(x, z);
      for (let y = 0; y <= h; y++) {
        let type = STONE;
        if (y === h) type = GRASS;
        else if (y >= h - 3) type = DIRT;
        setBlock(x, y, z, type);
      }
      // shallow water in low valleys
      if (h < SEA_LEVEL) {
        for (let y = h + 1; y <= SEA_LEVEL; y++) {
          // leave air; water is visual only via blue tint later — skip solid water
        }
      }
    }
  }

  // Trees
  for (let i = 0; i < 55; i++) {
    const tx = 2 + Math.floor(hash2(i * 7, 3) * (WORLD_W - 4));
    const tz = 2 + Math.floor(hash2(i * 11, 9) * (WORLD_D - 4));
    const th = heightAt(tx, tz);
    if (th < SEA_LEVEL || th > WORLD_H - 8) continue;
    if (getBlock(tx, th, tz) !== GRASS) continue;
    const trunkH = 3 + Math.floor(hash2(tx, tz) * 3);
    for (let y = 1; y <= trunkH; y++) {
      setBlock(tx, th + y, tz, WOOD);
    }
    const top = th + trunkH;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        for (let dy = 0; dy <= 2; dy++) {
          if (Math.abs(dx) === 2 && Math.abs(dz) === 2 && dy > 0) continue;
          if (dx === 0 && dz === 0 && dy < 2) continue;
          const lx = tx + dx;
          const ly = top + dy - 1;
          const lz = tz + dz;
          if (getBlock(lx, ly, lz) === AIR) setBlock(lx, ly, lz, LEAVES);
        }
      }
    }
  }
}

// ——— Three.js setup ———
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 40, 90);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const ambient = new THREE.AmbientLight(0xb0c4de, 0.55);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xfff5e0, 0.95);
sun.position.set(40, 60, 20);
sun.castShadow = true;
scene.add(sun);
scene.add(new THREE.HemisphereLight(0x87ceeb, 0x5d8a3e, 0.35));

// ——— Mesh building (merged by type) ———
const blockMeshes = new Map();
const geometry = new THREE.BoxGeometry(1, 1, 1);

function rebuildMeshes() {
  for (const mesh of blockMeshes.values()) {
    scene.remove(mesh);
    mesh.geometry.dispose();
    if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
    else mesh.material.dispose();
  }
  blockMeshes.clear();

  const positions = {
    [GRASS]: [],
    [DIRT]: [],
    [STONE]: [],
    [WOOD]: [],
    [LEAVES]: [],
  };

  const faces = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ];

  for (let y = 0; y < WORLD_H; y++) {
    for (let z = 0; z < WORLD_D; z++) {
      for (let x = 0; x < WORLD_W; x++) {
        const t = getBlock(x, y, z);
        if (t === AIR) continue;
        let exposed = false;
        for (const [dx, dy, dz] of faces) {
          const n = getBlock(x + dx, y + dy, z + dz);
          if (n === AIR) {
            exposed = true;
            break;
          }
        }
        if (!exposed) continue;
        positions[t].push(x + 0.5, y + 0.5, z + 0.5);
      }
    }
  }

  for (const [typeStr, list] of Object.entries(positions)) {
    const type = Number(typeStr);
    if (list.length === 0) continue;
    const count = list.length / 3;
    const mesh = new THREE.InstancedMesh(geometry, createMaterial(type), count);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const m = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      m.setPosition(list[i * 3], list[i * 3 + 1], list[i * 3 + 2]);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh);
    blockMeshes.set(type, mesh);
  }
}

function createMaterial(type) {
  if (type === GRASS) {
    const top = new THREE.MeshLambertMaterial({ color: 0x5d9e3e });
    const side = new THREE.MeshLambertMaterial({ color: 0x7a9e4a });
    const bottom = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
    return [side, side, top, bottom, side, side];
  }
  if (type === LEAVES) {
    return new THREE.MeshLambertMaterial({
      color: BLOCK_COLORS[LEAVES],
      transparent: true,
      opacity: 0.92,
    });
  }
  return new THREE.MeshLambertMaterial({ color: BLOCK_COLORS[type] });
}

// ——— Highlight wireframe ———
const highlightGeo = new THREE.BoxGeometry(1.02, 1.02, 1.02);
const highlightMat = new THREE.MeshBasicMaterial({
  color: 0x000000,
  wireframe: true,
  transparent: true,
  opacity: 0.55,
});
const highlight = new THREE.Mesh(highlightGeo, highlightMat);
highlight.visible = false;
scene.add(highlight);

// ——— Player ———
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

const blocker = document.getElementById("blocker");
blocker.addEventListener("click", () => controls.lock());
controls.addEventListener("lock", () => blocker.classList.add("hidden"));
controls.addEventListener("unlock", () => blocker.classList.remove("hidden"));

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const keys = { w: false, a: false, s: false, d: false, space: false };

document.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "KeyW": keys.w = true; break;
    case "KeyA": keys.a = true; break;
    case "KeyS": keys.s = true; break;
    case "KeyD": keys.d = true; break;
    case "Space": keys.space = true; e.preventDefault(); break;
    case "Digit1": selectSlot(0); break;
    case "Digit2": selectSlot(1); break;
    case "Digit3": selectSlot(2); break;
    case "Digit4": selectSlot(3); break;
  }
});

document.addEventListener("keyup", (e) => {
  switch (e.code) {
    case "KeyW": keys.w = false; break;
    case "KeyA": keys.a = false; break;
    case "KeyS": keys.s = false; break;
    case "KeyD": keys.d = false; break;
    case "Space": keys.space = false; break;
  }
});

let selectedSlot = 0;
function selectSlot(i) {
  selectedSlot = i;
  document.querySelectorAll(".slot").forEach((el, idx) => {
    el.classList.toggle("selected", idx === i);
  });
}

const PLAYER_RADIUS = 0.3;
const PLAYER_HEIGHT = 1.7;
const EYE_HEIGHT = 1.5;
let onGround = false;

function spawnPlayer() {
  const sx = Math.floor(WORLD_W / 2);
  const sz = Math.floor(WORLD_D / 2);
  const sy = heightAt(sx, sz) + 2;
  controls.getObject().position.set(sx + 0.5, sy + EYE_HEIGHT, sz + 0.5);
  velocity.set(0, 0, 0);
}

function solidAt(x, y, z) {
  const t = getBlock(Math.floor(x), Math.floor(y), Math.floor(z));
  return t !== AIR;
}

function collideAABB(px, py, pz) {
  // feet at py - EYE_HEIGHT, head at py + (PLAYER_HEIGHT - EYE_HEIGHT)
  const feet = py - EYE_HEIGHT;
  const head = feet + PLAYER_HEIGHT;
  const minX = px - PLAYER_RADIUS;
  const maxX = px + PLAYER_RADIUS;
  const minZ = pz - PLAYER_RADIUS;
  const maxZ = pz + PLAYER_RADIUS;

  const x0 = Math.floor(minX);
  const x1 = Math.floor(maxX);
  const y0 = Math.floor(feet);
  const y1 = Math.floor(head - 0.01);
  const z0 = Math.floor(minZ);
  const z1 = Math.floor(maxZ);

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      for (let z = z0; z <= z1; z++) {
        if (solidAt(x + 0.5, y + 0.5, z + 0.5)) {
          return true;
        }
      }
    }
  }
  return false;
}

function moveAxis(pos, axis, delta) {
  pos[axis] += delta;
  if (collideAABB(pos.x, pos.y, pos.z)) {
    pos[axis] -= delta;
    if (axis === "y") velocity.y = 0;
    return false;
  }
  return true;
}

// ——— Raycast for break/place ———
const raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2(0, 0);

function raycastVoxel(maxDist = 6) {
  const origin = controls.getObject().position.clone();
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);

  let lastAir = null;
  const step = 0.05;
  for (let t = 0; t < maxDist; t += step) {
    const p = origin.clone().addScaledVector(dir, t);
    const bx = Math.floor(p.x);
    const by = Math.floor(p.y);
    const bz = Math.floor(p.z);
    if (!inBounds(bx, by, bz)) {
      lastAir = { x: bx, y: by, z: bz };
      continue;
    }
    const block = getBlock(bx, by, bz);
    if (block !== AIR) {
      return {
        hit: { x: bx, y: by, z: bz, type: block },
        place: lastAir,
      };
    }
    lastAir = { x: bx, y: by, z: bz };
  }
  return null;
}

function breakBlock() {
  const result = raycastVoxel();
  if (!result || !result.hit) return;
  const { x, y, z } = result.hit;
  if (y <= 0) return; // bedrock-ish floor
  setBlock(x, y, z, AIR);
  spawnBreakParticles(x + 0.5, y + 0.5, z + 0.5, result.hit.type);
  rebuildMeshes();
}

function placeBlock() {
  const result = raycastVoxel();
  if (!result || !result.place || !result.hit) return;
  const { x, y, z } = result.place;
  if (!inBounds(x, y, z)) return;
  if (getBlock(x, y, z) !== AIR) return;

  // don't place inside player
  const pos = controls.getObject().position;
  const feet = pos.y - EYE_HEIGHT;
  const head = feet + PLAYER_HEIGHT;
  if (
    x === Math.floor(pos.x) &&
    z === Math.floor(pos.z) &&
    y >= Math.floor(feet) &&
    y <= Math.floor(head)
  ) {
    return;
  }

  setBlock(x, y, z, HOTBAR_TYPES[selectedSlot]);
  rebuildMeshes();
}

document.addEventListener("mousedown", (e) => {
  if (!controls.isLocked) return;
  if (e.button === 0) breakBlock();
  if (e.button === 2) placeBlock();
});

document.addEventListener("contextmenu", (e) => e.preventDefault());

// ——— Break particles ———
const particles = [];
function spawnBreakParticles(x, y, z, type) {
  const color = BLOCK_COLORS[type] || 0x888888;
  const geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
  const mat = new THREE.MeshBasicMaterial({ color });
  for (let i = 0; i < 10; i++) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * 4,
      Math.random() * 3 + 1,
      (Math.random() - 0.5) * 4
    );
    scene.add(m);
    particles.push({ mesh: m, vel, life: 0.6 });
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    p.vel.y -= 12 * dt;
    p.mesh.position.addScaledVector(p.vel, dt);
    if (p.life <= 0) {
      scene.remove(p.mesh);
      particles.splice(i, 1);
    }
  }
}

// ——— Water visual (flat plane in valleys) ———
function addWater() {
  const waterMat = new THREE.MeshLambertMaterial({
    color: 0x3a7ab8,
    transparent: true,
    opacity: 0.55,
  });
  const positions = [];
  for (let x = 0; x < WORLD_W; x++) {
    for (let z = 0; z < WORLD_D; z++) {
      const h = heightAt(x, z);
      if (h < SEA_LEVEL) {
        positions.push(x + 0.5, SEA_LEVEL + 0.4, z + 0.5);
      }
    }
  }
  if (positions.length === 0) return;
  const waterGeo = new THREE.BoxGeometry(1, 0.2, 1);
  const mesh = new THREE.InstancedMesh(waterGeo, waterMat, positions.length / 3);
  const m = new THREE.Matrix4();
  for (let i = 0; i < positions.length / 3; i++) {
    m.setPosition(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
    mesh.setMatrixAt(i, m);
  }
  scene.add(mesh);
}

// ——— Game loop ———
const clock = new THREE.Clock();
const SPEED = 6;
const JUMP = 8;
const GRAVITY = 22;

function updatePlayer(dt) {
  if (!controls.isLocked) return;

  velocity.y -= GRAVITY * dt;

  direction.set(0, 0, 0);
  const forward = Number(keys.w) - Number(keys.s);
  const right = Number(keys.d) - Number(keys.a);
  direction.z = forward;
  direction.x = right;
  if (direction.lengthSq() > 0) direction.normalize();

  const obj = controls.getObject();
  const pos = obj.position;

  // horizontal relative to look
  const euler = new THREE.Euler(0, 0, 0, "YXZ");
  euler.setFromQuaternion(obj.quaternion);
  const sin = Math.sin(euler.y);
  const cos = Math.cos(euler.y);

  const dx = (direction.x * cos + direction.z * sin) * SPEED * dt;
  const dz = (-direction.x * sin + direction.z * cos) * SPEED * dt;

  moveAxis(pos, "x", dx);
  moveAxis(pos, "z", dz);

  onGround = false;
  const beforeY = pos.y;
  const moved = moveAxis(pos, "y", velocity.y * dt);
  if (!moved && velocity.y < 0) {
    onGround = true;
  }
  if (!moved && beforeY === pos.y && velocity.y < 0) {
    onGround = true;
  }
  // ground check: block below feet
  const feetY = pos.y - EYE_HEIGHT;
  if (
    solidAt(pos.x, feetY - 0.05, pos.z) ||
    solidAt(pos.x - PLAYER_RADIUS, feetY - 0.05, pos.z) ||
    solidAt(pos.x + PLAYER_RADIUS, feetY - 0.05, pos.z) ||
    solidAt(pos.x, feetY - 0.05, pos.z - PLAYER_RADIUS) ||
    solidAt(pos.x, feetY - 0.05, pos.z + PLAYER_RADIUS)
  ) {
    onGround = true;
    if (velocity.y < 0) velocity.y = 0;
  }

  if (keys.space && onGround) {
    velocity.y = JUMP;
    onGround = false;
  }

  // world bounds clamp
  pos.x = Math.max(PLAYER_RADIUS, Math.min(WORLD_W - PLAYER_RADIUS, pos.x));
  pos.z = Math.max(PLAYER_RADIUS, Math.min(WORLD_D - PLAYER_RADIUS, pos.z));
  if (pos.y < -10) spawnPlayer();
}

function updateHighlight() {
  const result = raycastVoxel();
  if (result && result.hit && controls.isLocked) {
    highlight.visible = true;
    highlight.position.set(result.hit.x + 0.5, result.hit.y + 0.5, result.hit.z + 0.5);
  } else {
    highlight.visible = false;
  }
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  updatePlayer(dt);
  updateParticles(dt);
  updateHighlight();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ——— Init ———
generateTerrain();
rebuildMeshes();
addWater();
spawnPlayer();
animate();

console.log("迷你我的世界已加载", HOTBAR_NAMES.join("/"));
