import * as THREE from "three";
import { BLOCK, BLOCK_NAMES } from "./blocks.js";
import { VoxelWorld } from "./world.js";
import { Player } from "./player.js";

const overlay = document.getElementById("overlay");
const hud = document.getElementById("hud");
const slots = [...document.querySelectorAll(".slot")];
const hint = document.getElementById("hint");

const HOTBAR_BLOCKS = [BLOCK.GRASS, BLOCK.DIRT, BLOCK.STONE, BLOCK.WOOD];
let selectedSlot = 0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 40, 90);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.55));
const sun = new THREE.DirectionalLight(0xfff4d6, 0.85);
sun.position.set(30, 50, 20);
scene.add(sun);

const world = new VoxelWorld();
world.generate();
scene.add(world.group);

const player = new Player(camera, renderer.domElement);
player.bindInput();
const spawn = world.findSpawn();
player.setPosition(spawn.x, spawn.y, spawn.z);
scene.add(player.controls.getObject());

const particles = [];
const particleGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
const particleMat = new THREE.MeshBasicMaterial({ color: 0x888888 });

function setSelectedSlot(index) {
  selectedSlot = index;
  slots.forEach((el, i) => el.classList.toggle("active", i === index));
  hint.textContent = `当前：${BLOCK_NAMES[HOTBAR_BLOCKS[index]]}`;
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Digit1") setSelectedSlot(0);
  if (e.code === "Digit2") setSelectedSlot(1);
  if (e.code === "Digit3") setSelectedSlot(2);
  if (e.code === "Digit4") setSelectedSlot(3);
});

overlay.addEventListener("click", () => player.lock());
player.controls.addEventListener("lock", () => {
  overlay.classList.add("hidden");
  hud.classList.remove("hidden");
});
player.controls.addEventListener("unlock", () => {
  overlay.classList.remove("hidden");
  hud.classList.add("hidden");
});

function spawnBreakParticles(x, y, z, blockType) {
  const colors = {
    [BLOCK.GRASS]: 0x5a9e3a,
    [BLOCK.DIRT]: 0x8b5a2b,
    [BLOCK.STONE]: 0x888888,
    [BLOCK.WOOD]: 0x6b4423,
  };
  const mat = particleMat.clone();
  mat.color.setHex(colors[blockType] ?? 0xaaaaaa);

  for (let i = 0; i < 8; i++) {
    const mesh = new THREE.Mesh(particleGeo, mat.clone());
    mesh.position.set(x + 0.5, y + 0.5, z + 0.5);
    mesh.userData.vel = new THREE.Vector3(
      (Math.random() - 0.5) * 4,
      Math.random() * 4 + 1,
      (Math.random() - 0.5) * 4,
    );
    mesh.userData.life = 0.6;
    scene.add(mesh);
    particles.push(mesh);
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.userData.life -= dt;
    p.userData.vel.y -= 12 * dt;
    p.position.addScaledVector(p.userData.vel, dt);
    p.material.opacity = Math.max(0, p.userData.life);
    p.material.transparent = true;
    if (p.userData.life <= 0) {
      scene.remove(p);
      particles.splice(i, 1);
    }
  }
}

let breakCooldown = 0;

renderer.domElement.addEventListener("mousedown", (e) => {
  if (!player.isLocked()) return;
  const origin = player.getEyePosition().clone();
  const dir = player.getLookDirection();
  const hit = world.raycast(origin, dir);
  if (!hit) return;

  if (e.button === 0 && breakCooldown <= 0) {
    const { x, y, z } = hit.hit;
    const block = world.getBlock(x, y, z);
    world.setBlock(x, y, z, BLOCK.AIR);
    world.rebuildMesh();
    spawnBreakParticles(x, y, z, block);
    breakCooldown = 0.12;
  }

  if (e.button === 2 && hit.place) {
    const { x, y, z } = hit.place;
    if (!player.occupiesBlock(x, y, z)) {
      world.setBlock(x, y, z, HOTBAR_BLOCKS[selectedSlot]);
      world.rebuildMesh();
    }
  }
});

renderer.domElement.addEventListener("contextmenu", (e) => e.preventDefault());

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

setSelectedSlot(0);

let last = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  breakCooldown -= dt;
  player.update(dt, world);

  if (player.isLocked()) {
    const origin = player.getEyePosition().clone();
    const dir = player.getLookDirection();
    const hit = world.raycast(origin, dir);
    if (hit) {
      world.setHighlight(hit.hit.x, hit.hit.y, hit.hit.z, true);
    } else {
      world.setHighlight(0, 0, 0, false);
    }
  } else {
    world.setHighlight(0, 0, 0, false);
  }

  updateParticles(dt);
  renderer.render(scene, camera);
}

animate(last);
