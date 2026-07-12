import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

const WORLD_SIZE = 34;
const HALF_WORLD = WORLD_SIZE / 2;
const PLAYER_HEIGHT = 1.8;
const PLAYER_RADIUS = 0.3;
const EYE_HEIGHT = 1.62;
const REACH = 6;
const BLOCK_TYPES = ["grass", "dirt", "stone", "log"];
const BLOCK_NAMES = {
  grass: "草方块",
  dirt: "泥土",
  stone: "石头",
  log: "橡木原木",
  leaves: "橡树树叶",
};

const game = document.querySelector("#game");
const startScreen = document.querySelector("#start-screen");
const startButton = document.querySelector("#start-button");
const startCopy = document.querySelector("#start-copy");
const coordinates = document.querySelector("#coordinates");
const targetLabel = document.querySelector("#target-label");
const loading = document.querySelector("#loading");
const slots = [...document.querySelectorAll(".slot")];

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x86c8f2);
scene.fog = new THREE.Fog(0x9ed1ed, 27, 58);

const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.05, 120);
camera.rotation.order = "YXZ";

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
game.append(renderer.domElement);

const hemisphere = new THREE.HemisphereLight(0xc9ecff, 0x617145, 2.1);
scene.add(hemisphere);

const sun = new THREE.DirectionalLight(0xfff1c2, 2.7);
sun.position.set(-18, 28, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -25;
sun.shadow.camera.right = 25;
sun.shadow.camera.top = 25;
sun.shadow.camera.bottom = -25;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 70;
sun.shadow.bias = -0.0004;
scene.add(sun);

const worldGroup = new THREE.Group();
scene.add(worldGroup);

const blocks = new Map();
const terrainHeights = new Map();
const raycastMeshes = [];
const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
const dummy = new THREE.Object3D();

function seededNoise(x, y, seed = 0) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 91.3) * 43758.5453123;
  return value - Math.floor(value);
}

function createPixelTexture(base, accents, mode = "noise") {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const context = canvas.getContext("2d");
  context.fillStyle = base;
  context.fillRect(0, 0, 16, 16);

  if (mode === "rings") {
    context.strokeStyle = accents[0];
    context.lineWidth = 2;
    context.strokeRect(2, 2, 12, 12);
    context.strokeStyle = accents[1];
    context.strokeRect(5, 5, 6, 6);
    context.fillStyle = accents[0];
    context.fillRect(7, 7, 2, 2);
  } else if (mode === "bark") {
    for (let x = 1; x < 16; x += 4) {
      context.fillStyle = accents[(x / 4) % accents.length | 0];
      context.fillRect(x, 0, 2, 16);
      context.fillStyle = "rgba(255,255,255,.08)";
      context.fillRect(x + 2, 0, 1, 16);
    }
    context.fillStyle = accents[0];
    context.fillRect(5, 3, 2, 5);
    context.fillRect(13, 10, 2, 4);
  } else if (mode === "leaves") {
    for (let y = 0; y < 16; y += 2) {
      for (let x = 0; x < 16; x += 2) {
        const random = seededNoise(x, y, 8);
        context.fillStyle = random > 0.78 ? accents[1] : random > 0.45 ? accents[0] : base;
        context.fillRect(x, y, 2, 2);
      }
    }
    context.clearRect(2, 5, 2, 2);
    context.clearRect(11, 2, 2, 2);
    context.clearRect(7, 12, 2, 2);
  } else {
    for (let y = 0; y < 16; y += 2) {
      for (let x = 0; x < 16; x += 2) {
        const random = seededNoise(x, y, base.length);
        if (random > 0.55) {
          context.fillStyle = accents[Math.floor(random * accents.length) % accents.length];
          context.fillRect(x, y, random > 0.85 ? 3 : 2, random > 0.85 ? 2 : 3);
        }
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestMipmapNearestFilter;
  return texture;
}

const textures = {
  grassTop: createPixelTexture("#69a83c", ["#4e8c31", "#89bd48", "#5c9934"]),
  grassSide: createPixelTexture("#8a5b35", ["#754726", "#9c6c3d", "#5c9435"]),
  dirt: createPixelTexture("#85552f", ["#6c4126", "#9b6a3d", "#754a29"]),
  stone: createPixelTexture("#858a88", ["#666c6b", "#a1a4a0", "#747978"]),
  bark: createPixelTexture("#815d2f", ["#5f4022", "#a47a3e"], "bark"),
  rings: createPixelTexture("#a8814c", ["#72522e", "#c19b62"], "rings"),
  leaves: createPixelTexture("#4d8a35", ["#39742b", "#69a647"], "leaves"),
};

const lambert = (map, options = {}) => new THREE.MeshLambertMaterial({ map, ...options });
const blockMaterials = {
  grass: [
    lambert(textures.grassSide),
    lambert(textures.grassSide),
    lambert(textures.grassTop),
    lambert(textures.dirt),
    lambert(textures.grassSide),
    lambert(textures.grassSide),
  ],
  dirt: lambert(textures.dirt),
  stone: lambert(textures.stone),
  log: [
    lambert(textures.bark),
    lambert(textures.bark),
    lambert(textures.rings),
    lambert(textures.rings),
    lambert(textures.bark),
    lambert(textures.bark),
  ],
  leaves: lambert(textures.leaves, { alphaTest: 0.35, side: THREE.DoubleSide }),
};

function blockKey(x, y, z) {
  return `${x},${y},${z}`;
}

function setBlock(x, y, z, type) {
  blocks.set(blockKey(x, y, z), { x, y, z, type });
}

function terrainHeight(x, z) {
  const broad = Math.sin(x * 0.21) * 1.25 + Math.cos(z * 0.18) * 1.1;
  const detail = Math.sin((x + z) * 0.12) * 0.65 + Math.cos((x - z) * 0.09) * 0.5;
  let height = Math.round(4.2 + broad + detail);
  const distanceFromSpawn = Math.hypot(x, z);
  if (distanceFromSpawn < 4.5) {
    height = Math.round(THREE.MathUtils.lerp(4, height, distanceFromSpawn / 4.5));
  }
  return THREE.MathUtils.clamp(height, 2, 7);
}

function generateWorld() {
  for (let x = -HALF_WORLD; x < HALF_WORLD; x++) {
    for (let z = -HALF_WORLD; z < HALF_WORLD; z++) {
      const top = terrainHeight(x, z);
      terrainHeights.set(`${x},${z}`, top);
      for (let y = 0; y <= top; y++) {
        let type = "stone";
        if (y === top) type = "grass";
        else if (y >= top - 2) type = "dirt";
        setBlock(x, y, z, type);
      }
    }
  }

  for (let x = -HALF_WORLD + 2; x < HALF_WORLD - 2; x++) {
    for (let z = -HALF_WORLD + 2; z < HALF_WORLD - 2; z++) {
      if (Math.hypot(x, z) < 5 || seededNoise(x, z, 42) < 0.974) continue;
      const top = terrainHeights.get(`${x},${z}`);
      const nearby = [
        terrainHeights.get(`${x + 1},${z}`),
        terrainHeights.get(`${x - 1},${z}`),
        terrainHeights.get(`${x},${z + 1}`),
        terrainHeights.get(`${x},${z - 1}`),
      ];
      if (nearby.some((height) => Math.abs(height - top) > 1)) continue;

      const trunkHeight = seededNoise(x, z, 7) > 0.45 ? 4 : 3;
      for (let y = 1; y <= trunkHeight; y++) setBlock(x, top + y, z, "log");

      const crownY = top + trunkHeight;
      for (let dy = -1; dy <= 1; dy++) {
        const radius = dy === 1 ? 1 : 2;
        for (let dx = -radius; dx <= radius; dx++) {
          for (let dz = -radius; dz <= radius; dz++) {
            if (Math.abs(dx) === radius && Math.abs(dz) === radius && seededNoise(x + dx, z + dz, dy) > 0.6) continue;
            if (dx === 0 && dz === 0 && dy <= 0) continue;
            setBlock(x + dx, crownY + dy, z + dz, "leaves");
          }
        }
      }
      setBlock(x, crownY + 2, z, "leaves");
    }
  }
}

function rebuildWorld() {
  worldGroup.clear();
  raycastMeshes.length = 0;
  const byType = new Map();
  for (const type of [...BLOCK_TYPES, "leaves"]) byType.set(type, []);
  for (const block of blocks.values()) byType.get(block.type).push(block);

  for (const [type, typeBlocks] of byType) {
    if (!typeBlocks.length) continue;
    const mesh = new THREE.InstancedMesh(blockGeometry, blockMaterials[type], typeBlocks.length);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.blocks = typeBlocks;
    typeBlocks.forEach((block, index) => {
      dummy.position.set(block.x, block.y, block.z);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    worldGroup.add(mesh);
    raycastMeshes.push(mesh);
  }
}

generateWorld();
rebuildWorld();

const cloudGroup = new THREE.Group();
const cloudMaterial = new THREE.MeshLambertMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.78,
  depthWrite: false,
});
const cloudGeometry = new THREE.BoxGeometry(1, 1, 1);
for (let cloudIndex = 0; cloudIndex < 7; cloudIndex++) {
  const cloud = new THREE.Group();
  const length = 3 + Math.floor(seededNoise(cloudIndex, 2, 1) * 4);
  for (let part = 0; part < length; part++) {
    const puff = new THREE.Mesh(cloudGeometry, cloudMaterial);
    puff.position.set(part * 1.7, seededNoise(cloudIndex, part, 9) > 0.66 ? 0.45 : 0, 0);
    puff.scale.set(2.2, 0.65, 1.7 + seededNoise(part, cloudIndex, 4));
    cloud.add(puff);
  }
  cloud.position.set(-25 + cloudIndex * 9, 16 + (cloudIndex % 3), -20 + (cloudIndex * 7) % 38);
  cloudGroup.add(cloud);
}
scene.add(cloudGroup);

const highlight = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(1.025, 1.025, 1.025)),
  new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, depthTest: false }),
);
highlight.visible = false;
highlight.renderOrder = 10;
scene.add(highlight);

const player = {
  position: new THREE.Vector3(0, terrainHeight(0, 0) + 0.51, 0),
  velocity: new THREE.Vector3(),
  grounded: false,
  yaw: Math.PI * 0.82,
  pitch: -0.12,
};

camera.rotation.set(player.pitch, player.yaw, 0);
camera.position.set(player.position.x, player.position.y + EYE_HEIGHT, player.position.z);

const keys = new Set();
const raycaster = new THREE.Raycaster();
raycaster.far = REACH;
const screenCenter = new THREE.Vector2(0, 0);
let selectedSlot = 0;
let aimedBlock = null;
let aimedNormal = null;
let locked = false;
let audioContext = null;
const particles = [];
const particleGeometry = new THREE.BoxGeometry(0.11, 0.11, 0.11);

function playerCollides(position) {
  const minX = position.x - PLAYER_RADIUS;
  const maxX = position.x + PLAYER_RADIUS;
  const minY = position.y;
  const maxY = position.y + PLAYER_HEIGHT;
  const minZ = position.z - PLAYER_RADIUS;
  const maxZ = position.z + PLAYER_RADIUS;

  if (
    minX < -HALF_WORLD - 0.5 ||
    maxX > HALF_WORLD - 0.5 ||
    minZ < -HALF_WORLD - 0.5 ||
    maxZ > HALF_WORLD - 0.5 ||
    minY < 0.5
  ) return true;

  const epsilon = 0.0001;
  const xStart = Math.ceil(minX - 0.5 + epsilon);
  const xEnd = Math.floor(maxX + 0.5 - epsilon);
  const yStart = Math.ceil(minY - 0.5 + epsilon);
  const yEnd = Math.floor(maxY + 0.5 - epsilon);
  const zStart = Math.ceil(minZ - 0.5 + epsilon);
  const zEnd = Math.floor(maxZ + 0.5 - epsilon);

  for (let x = xStart; x <= xEnd; x++) {
    for (let y = yStart; y <= yEnd; y++) {
      for (let z = zStart; z <= zEnd; z++) {
        if (blocks.has(blockKey(x, y, z))) return true;
      }
    }
  }
  return false;
}

function movePlayerAxis(axis, amount) {
  if (!amount) return true;
  const candidate = player.position.clone();
  candidate[axis] += amount;
  if (playerCollides(candidate)) return false;
  player.position.copy(candidate);
  return true;
}

function updatePlayer(delta) {
  const forwardAmount = (keys.has("KeyW") ? 1 : 0) - (keys.has("KeyS") ? 1 : 0);
  const rightAmount = (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0);
  const input = new THREE.Vector2(rightAmount, forwardAmount);
  if (input.lengthSq() > 1) input.normalize();

  const speed = keys.has("ShiftLeft") || keys.has("ShiftRight") ? 7.2 : 4.7;
  const forwardX = -Math.sin(player.yaw);
  const forwardZ = -Math.cos(player.yaw);
  const rightX = Math.cos(player.yaw);
  const rightZ = -Math.sin(player.yaw);
  const desiredX = (forwardX * input.y + rightX * input.x) * speed;
  const desiredZ = (forwardZ * input.y + rightZ * input.x) * speed;
  const acceleration = 1 - Math.exp(-14 * delta);
  player.velocity.x += (desiredX - player.velocity.x) * acceleration;
  player.velocity.z += (desiredZ - player.velocity.z) * acceleration;
  player.velocity.y = Math.max(player.velocity.y - 23 * delta, -25);
  player.grounded = false;

  const maxTravel = Math.max(
    Math.abs(player.velocity.x * delta),
    Math.abs(player.velocity.y * delta),
    Math.abs(player.velocity.z * delta),
  );
  const steps = Math.max(1, Math.ceil(maxTravel / 0.08));
  const stepDelta = delta / steps;

  for (let step = 0; step < steps; step++) {
    if (!movePlayerAxis("x", player.velocity.x * stepDelta)) player.velocity.x = 0;
    if (!movePlayerAxis("z", player.velocity.z * stepDelta)) player.velocity.z = 0;
    const verticalMovement = player.velocity.y * stepDelta;
    if (!movePlayerAxis("y", verticalMovement)) {
      if (verticalMovement < 0) player.grounded = true;
      player.velocity.y = 0;
    }
  }

  if (player.position.y < -8) resetPlayer();
  camera.position.set(player.position.x, player.position.y + EYE_HEIGHT, player.position.z);
  camera.rotation.set(player.pitch, player.yaw, 0);
}

function resetPlayer() {
  player.position.set(0, terrainHeight(0, 0) + 0.51, 0);
  player.velocity.set(0, 0, 0);
}

function updateTarget() {
  raycaster.setFromCamera(screenCenter, camera);
  const hit = raycaster.intersectObjects(raycastMeshes, false)[0];
  if (!hit || hit.instanceId === undefined) {
    aimedBlock = null;
    aimedNormal = null;
    highlight.visible = false;
    targetLabel.textContent = "";
    return;
  }

  aimedBlock = hit.object.userData.blocks[hit.instanceId];
  aimedNormal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).round();
  highlight.position.set(aimedBlock.x, aimedBlock.y, aimedBlock.z);
  highlight.visible = true;
  targetLabel.textContent = BLOCK_NAMES[aimedBlock.type];
}

function blockTouchesPlayer(x, y, z) {
  return (
    x + 0.5 > player.position.x - PLAYER_RADIUS &&
    x - 0.5 < player.position.x + PLAYER_RADIUS &&
    y + 0.5 > player.position.y &&
    y - 0.5 < player.position.y + PLAYER_HEIGHT &&
    z + 0.5 > player.position.z - PLAYER_RADIUS &&
    z - 0.5 < player.position.z + PLAYER_RADIUS
  );
}

function playBlockSound(placing) {
  audioContext ??= new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = placing ? "square" : "triangle";
  oscillator.frequency.setValueAtTime(placing ? 115 : 155, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(placing ? 75 : 65, audioContext.currentTime + 0.08);
  gain.gain.setValueAtTime(0.055, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.09);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1);
}

function spawnBreakParticles(block) {
  const sourceMaterial = Array.isArray(blockMaterials[block.type])
    ? blockMaterials[block.type][2]
    : blockMaterials[block.type];
  const material = sourceMaterial.clone();
  material.side = THREE.DoubleSide;

  for (let index = 0; index < 10; index++) {
    const mesh = new THREE.Mesh(particleGeometry, material);
    mesh.position.set(
      block.x + (seededNoise(index, block.x, 2) - 0.5) * 0.75,
      block.y + (seededNoise(index, block.y, 3) - 0.25) * 0.75,
      block.z + (seededNoise(index, block.z, 4) - 0.5) * 0.75,
    );
    scene.add(mesh);
    particles.push({
      mesh,
      material,
      velocity: new THREE.Vector3(
        (seededNoise(index, block.x, 5) - 0.5) * 2.5,
        1.5 + seededNoise(index, block.y, 6) * 2,
        (seededNoise(index, block.z, 7) - 0.5) * 2.5,
      ),
      life: 0.65,
    });
  }
}

function updateParticles(delta) {
  for (let index = particles.length - 1; index >= 0; index--) {
    const particle = particles[index];
    particle.life -= delta;
    particle.velocity.y -= 8 * delta;
    particle.mesh.position.addScaledVector(particle.velocity, delta);
    particle.mesh.rotation.x += delta * 5;
    particle.mesh.rotation.y += delta * 4;
    particle.mesh.scale.setScalar(Math.max(0, particle.life / 0.65));
    if (particle.life <= 0) {
      scene.remove(particle.mesh);
      particle.material.dispose();
      particles.splice(index, 1);
    }
  }
}

function breakAimedBlock() {
  if (!aimedBlock || aimedBlock.y === 0) return;
  spawnBreakParticles(aimedBlock);
  blocks.delete(blockKey(aimedBlock.x, aimedBlock.y, aimedBlock.z));
  playBlockSound(false);
  rebuildWorld();
  aimedBlock = null;
}

function placeAimedBlock() {
  if (!aimedBlock || !aimedNormal) return;
  const x = aimedBlock.x + aimedNormal.x;
  const y = aimedBlock.y + aimedNormal.y;
  const z = aimedBlock.z + aimedNormal.z;
  if (
    x < -HALF_WORLD ||
    x >= HALF_WORLD ||
    z < -HALF_WORLD ||
    z >= HALF_WORLD ||
    y < 1 ||
    y > 18 ||
    blocks.has(blockKey(x, y, z)) ||
    blockTouchesPlayer(x, y, z)
  ) return;

  setBlock(x, y, z, BLOCK_TYPES[selectedSlot]);
  playBlockSound(true);
  rebuildWorld();
}

function selectSlot(index) {
  selectedSlot = THREE.MathUtils.clamp(index, 0, BLOCK_TYPES.length - 1);
  slots.forEach((slot, slotIndex) => slot.classList.toggle("selected", slotIndex === selectedSlot));
}

function updateClouds(delta) {
  for (const cloud of cloudGroup.children) {
    cloud.position.x += delta * 0.38;
    if (cloud.position.x > 28) cloud.position.x = -32;
  }
}

function updateHud() {
  coordinates.textContent =
    `XYZ ${player.position.x.toFixed(1)} / ${player.position.y.toFixed(1)} / ${player.position.z.toFixed(1)}`;
}

startButton.addEventListener("click", () => renderer.domElement.requestPointerLock());
renderer.domElement.addEventListener("click", () => {
  if (!locked) renderer.domElement.requestPointerLock();
});

document.addEventListener("pointerlockchange", () => {
  locked = document.pointerLockElement === renderer.domElement;
  startScreen.classList.toggle("hidden", locked);
  if (!locked) {
    keys.clear();
    startCopy.textContent = "游戏已暂停。你的方块世界仍在原处。";
    startButton.textContent = "继续游戏";
  }
});

document.addEventListener("mousemove", (event) => {
  if (!locked) return;
  player.yaw -= event.movementX * 0.0021;
  player.pitch -= event.movementY * 0.0021;
  player.pitch = THREE.MathUtils.clamp(player.pitch, -Math.PI / 2 + 0.02, Math.PI / 2 - 0.02);
});

document.addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (event.code === "Space") {
    event.preventDefault();
    if (locked && player.grounded) {
      player.velocity.y = 8.2;
      player.grounded = false;
    }
  }
  if (/^Digit[1-4]$/.test(event.code)) selectSlot(Number(event.code.at(-1)) - 1);
});

document.addEventListener("keyup", (event) => keys.delete(event.code));
document.addEventListener("contextmenu", (event) => event.preventDefault());
document.addEventListener("mousedown", (event) => {
  if (!locked) return;
  if (event.button === 0) breakAimedBlock();
  if (event.button === 2) placeAimedBlock();
});
document.addEventListener("wheel", (event) => {
  if (!locked) return;
  selectSlot((selectedSlot + Math.sign(event.deltaY) + BLOCK_TYPES.length) % BLOCK_TYPES.length);
}, { passive: true });

window.addEventListener("blur", () => keys.clear());
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});

let previousTime = performance.now();
function animate(time) {
  requestAnimationFrame(animate);
  const delta = Math.min((time - previousTime) / 1000, 0.05);
  previousTime = time;

  if (locked) updatePlayer(delta);
  updateParticles(delta);
  updateClouds(delta);
  updateTarget();
  updateHud();
  renderer.render(scene, camera);
}

loading.classList.add("done");
requestAnimationFrame(animate);
