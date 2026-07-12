import * as THREE from "three";
import { BLOCK, key, addFace, neighborOffset } from "./blocks.js";

export const WORLD_W = 48;
export const WORLD_D = 48;
export const WORLD_H = 32;
export const SEA_LEVEL = 5;

function hash(x, z) {
  let n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function noise2D(x, z) {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const a = hash(ix, iz);
  const b = hash(ix + 1, iz);
  const c = hash(ix, iz + 1);
  const d = hash(ix + 1, iz + 1);
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}

export function terrainHeight(x, z) {
  const nx = x * 0.08;
  const nz = z * 0.08;
  const hills =
    noise2D(nx, nz) * 6 +
    noise2D(nx * 2.3 + 10, nz * 2.3) * 3 +
    Math.sin(x * 0.15) * 1.5 +
    Math.cos(z * 0.12) * 1.5;
  return Math.max(2, Math.min(WORLD_H - 4, Math.floor(SEA_LEVEL + hills)));
}

export class VoxelWorld {
  constructor() {
    this.blocks = new Map();
    this.mesh = null;
    this.highlight = null;
    this.group = new THREE.Group();
  }

  getBlock(x, y, z) {
    if (x < 0 || z < 0 || x >= WORLD_W || z >= WORLD_D || y < 0 || y >= WORLD_H) {
      return BLOCK.AIR;
    }
    return this.blocks.get(key(x, y, z)) ?? BLOCK.AIR;
  }

  setBlock(x, y, z, type) {
    if (x < 0 || z < 0 || x >= WORLD_W || z >= WORLD_D || y < 0 || y >= WORLD_H) {
      return false;
    }
    const k = key(x, y, z);
    if (type === BLOCK.AIR) {
      this.blocks.delete(k);
    } else {
      this.blocks.set(k, type);
    }
    return true;
  }

  generate() {
    this.blocks.clear();

    for (let x = 0; x < WORLD_W; x++) {
      for (let z = 0; z < WORLD_D; z++) {
        const h = terrainHeight(x, z);
        for (let y = 0; y <= h; y++) {
          let type = BLOCK.STONE;
          if (y === h) type = BLOCK.GRASS;
          else if (y >= h - 3) type = BLOCK.DIRT;
          this.setBlock(x, y, z, type);
        }
      }
    }

    for (let i = 0; i < 55; i++) {
      const x = 3 + Math.floor(hash(i * 3.1, i * 7.9) * (WORLD_W - 6));
      const z = 3 + Math.floor(hash(i * 11.3, i * 5.7) * (WORLD_D - 6));
      const ground = terrainHeight(x, z);
      if (ground < SEA_LEVEL + 1) continue;
      const trunkH = 4 + Math.floor(hash(x, z) * 2);
      for (let y = 1; y <= trunkH; y++) {
        this.setBlock(x, ground + y, z, BLOCK.WOOD);
      }
    }

    this.rebuildMesh();
  }

  isSolid(x, y, z) {
    return this.getBlock(x, y, z) !== BLOCK.AIR;
  }

  rebuildMesh() {
    if (this.mesh) {
      this.group.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }

    const vertices = [];
    const colors = [];

    for (const [k, block] of this.blocks) {
      const [x, y, z] = k.split(",").map(Number);
      for (let f = 0; f < 6; f++) {
        const [dx, dy, dz] = neighborOffset(f);
        if (!this.isSolid(x + dx, y + dy, z + dz)) {
          addFace(vertices, colors, x, y, z, block, f);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshLambertMaterial({ vertexColors: true });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.matrixAutoUpdate = false;
    this.group.add(this.mesh);
  }

  setHighlight(x, y, z, visible) {
    if (!this.highlight) {
      const geo = new THREE.BoxGeometry(1.002, 1.002, 1.002);
      const edges = new THREE.EdgesGeometry(geo);
      this.highlight = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.65 }),
      );
      this.highlight.visible = false;
      this.group.add(this.highlight);
    }
    if (visible) {
      this.highlight.position.set(x + 0.5, y + 0.5, z + 0.5);
      this.highlight.visible = true;
    } else {
      this.highlight.visible = false;
    }
  }

  raycast(origin, direction, maxDist = 6) {
    const pos = origin.clone();
    const dir = direction.clone().normalize();
    const step = 0.05;
    let lastAir = null;

    for (let t = 0; t < maxDist; t += step) {
      pos.copy(origin).addScaledVector(dir, t);
      const bx = Math.floor(pos.x);
      const by = Math.floor(pos.y);
      const bz = Math.floor(pos.z);
      if (this.isSolid(bx, by, bz)) {
        return { hit: { x: bx, y: by, z: bz }, place: lastAir };
      }
      lastAir = { x: bx, y: by, z: bz };
    }
    return null;
  }

  findSpawn() {
    const cx = Math.floor(WORLD_W / 2);
    const cz = Math.floor(WORLD_D / 2);
    const y = terrainHeight(cx, cz);
    return { x: cx + 0.5, y: y + 1 + 1.62, z: cz + 0.5 };
  }
}
