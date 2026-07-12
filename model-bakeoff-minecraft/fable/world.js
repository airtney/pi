/* 迷你我的世界 —— 体素世界：地形生成、树、水、分块网格构建、体素射线检测 */
window.MC = window.MC || {};
(function (MC) {
  'use strict';

  const B = MC.Blocks;

  const SIZE_X = 128;   // 世界宽（X）
  const SIZE_Z = 128;   // 世界长（Z）
  const SIZE_Y = 48;    // 世界高（Y）
  const CHUNK = 16;     // 分块边长（X/Z 方向）
  const WATER_LEVEL = 12;

  // ---------- 值噪声（无依赖） ----------
  function makeNoise2D(seed) {
    const rnd = MC.mulberry32(seed);
    const perm = new Uint8Array(512);
    const base = new Uint8Array(256);
    for (let i = 0; i < 256; i++) base[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = (rnd() * (i + 1)) | 0;
      const t = base[i]; base[i] = base[j]; base[j] = t;
    }
    for (let i = 0; i < 512; i++) perm[i] = base[i & 255];

    function hash(x, y) { return perm[(perm[x & 255] + y) & 255] / 255; }
    const fade = (t) => t * t * (3 - 2 * t);

    return function noise(x, y) {
      const xi = Math.floor(x), yi = Math.floor(y);
      const xf = x - xi, yf = y - yi;
      const u = fade(xf), v = fade(yf);
      const a = hash(xi, yi), b = hash(xi + 1, yi);
      const c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
      return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v; // 0..1
    };
  }

  function fbm(noise, x, y, octaves, lacunarity, gain) {
    let amp = 1, freq = 1, sum = 0, norm = 0;
    for (let i = 0; i < octaves; i++) {
      sum += amp * noise(x * freq, y * freq);
      norm += amp;
      amp *= gain;
      freq *= lacunarity;
    }
    return sum / norm;
  }

  // ---------- 世界数据 ----------
  class World {
    constructor(seed) {
      this.seed = seed || 1337;
      this.data = new Uint8Array(SIZE_X * SIZE_Y * SIZE_Z);
      this.chunksX = Math.ceil(SIZE_X / CHUNK);
      this.chunksZ = Math.ceil(SIZE_Z / CHUNK);
      this.heightMap = new Uint8Array(SIZE_X * SIZE_Z);
      this.generate();
    }

    index(x, y, z) { return (y * SIZE_Z + z) * SIZE_X + x; }

    inBounds(x, y, z) {
      return x >= 0 && x < SIZE_X && y >= 0 && y < SIZE_Y && z >= 0 && z < SIZE_Z;
    }

    get(x, y, z) {
      if (!this.inBounds(x, y, z)) return B.AIR;
      return this.data[this.index(x, y, z)];
    }

    set(x, y, z, id) {
      if (!this.inBounds(x, y, z)) return;
      this.data[this.index(x, y, z)] = id;
    }

    isSolid(x, y, z) {
      const id = this.get(x | 0, y | 0, z | 0);
      return id !== B.AIR && MC.BLOCK_DEFS[id].solid;
    }

    isOpaque(id) { return id !== B.AIR && MC.BLOCK_DEFS[id].opaque; }

    surfaceY(x, z) { // 最高非空方块的 y（找不到返回 -1）
      for (let y = SIZE_Y - 1; y >= 0; y--) {
        if (this.get(x, y, z) !== B.AIR && this.get(x, y, z) !== B.WATER) return y;
      }
      return -1;
    }

    // ---------- 地形生成：小山 + 平地 + 水 + 沙滩 + 树 ----------
    generate() {
      const noise = makeNoise2D(this.seed);
      const hillNoise = makeNoise2D(this.seed * 7 + 3);
      const treeRand = MC.mulberry32(this.seed * 31 + 17);

      for (let x = 0; x < SIZE_X; x++) {
        for (let z = 0; z < SIZE_Z; z++) {
          // 基础起伏 + 大块山地掩码，让世界既有湖泊、平原又有小山
          const basev = fbm(noise, x / 34, z / 34, 4, 2.1, 0.5);      // 0..1
          const hillMask = fbm(hillNoise, x / 70, z / 70, 2, 2.0, 0.5);
          const hills = Math.max(0, hillMask - 0.5) * 2.2;             // 0..~1
          // 拉开对比度，让低处成湖、高处成山
          const shaped = Math.pow(Math.max(0, basev - 0.18) / 0.82, 1.35);
          let h = 6 + Math.round(shaped * 18 + hills * shaped * 24);
          h = Math.max(2, Math.min(SIZE_Y - 12, h));
          this.heightMap[z * SIZE_X + x] = h;

          for (let y = 0; y <= h; y++) {
            let id;
            if (y === 0) id = B.BEDROCK;
            else if (y < h - 3) id = B.STONE;
            else if (y < h) id = B.DIRT;
            else { // 表层
              if (h <= WATER_LEVEL + 1) id = B.SAND;
              else id = B.GRASS;
            }
            this.set(x, y, z, id);
          }
          // 注水
          for (let y = h + 1; y <= WATER_LEVEL; y++) this.set(x, y, z, B.WATER);
        }
      }

      // 种树：草地上按概率生成，避开边缘与过密
      for (let x = 3; x < SIZE_X - 3; x++) {
        for (let z = 3; z < SIZE_Z - 3; z++) {
          const h = this.heightMap[z * SIZE_X + x];
          if (this.get(x, h, z) !== B.GRASS) continue;
          if (treeRand() > 0.012) continue;
          if (this.nearTree(x, z, 3)) continue;
          this.plantTree(x, h, z, treeRand);
        }
      }
    }

    nearTree(x, z, r) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
          const h = this.heightMap[(z + dz) * SIZE_X + (x + dx)];
          if (this.get(x + dx, h + 1, z + dz) === B.LOG) return true;
        }
      }
      return false;
    }

    plantTree(x, groundY, z, rnd) {
      const trunkH = 4 + ((rnd() * 2) | 0);
      const topY = groundY + trunkH;
      if (topY + 2 >= SIZE_Y) return;
      // 树冠：两层 5x5（切角）+ 顶部十字
      for (let dy = -1; dy <= 0; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          for (let dz = -2; dz <= 2; dz++) {
            if (Math.abs(dx) === 2 && Math.abs(dz) === 2 && rnd() < 0.6) continue;
            if (dx === 0 && dz === 0 && dy <= 0) continue; // 树干位置
            if (this.get(x + dx, topY + dy, z + dz) === B.AIR) {
              this.set(x + dx, topY + dy, z + dz, B.LEAVES);
            }
          }
        }
      }
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          if (Math.abs(dx) === 1 && Math.abs(dz) === 1) continue;
          if (this.get(x + dx, topY + 1, z + dz) === B.AIR) {
            this.set(x + dx, topY + 1, z + dz, B.LEAVES);
          }
        }
      }
      this.set(x, topY + 2, z, B.LEAVES);
      for (let y = groundY + 1; y <= topY; y++) this.set(x, y, z, B.LOG);
      this.set(x, groundY, z, B.DIRT); // 树下换成泥土
    }

    // ---------- 体素射线（Amanatides & Woo DDA） ----------
    // 返回 { x,y,z, id, nx,ny,nz }（命中面法线指向来源方向），未命中返回 null
    raycast(origin, dir, maxDist) {
      let x = Math.floor(origin.x), y = Math.floor(origin.y), z = Math.floor(origin.z);
      const stepX = dir.x > 0 ? 1 : -1;
      const stepY = dir.y > 0 ? 1 : -1;
      const stepZ = dir.z > 0 ? 1 : -1;
      const tDeltaX = dir.x !== 0 ? Math.abs(1 / dir.x) : Infinity;
      const tDeltaY = dir.y !== 0 ? Math.abs(1 / dir.y) : Infinity;
      const tDeltaZ = dir.z !== 0 ? Math.abs(1 / dir.z) : Infinity;
      const fr = (v) => v - Math.floor(v);
      let tMaxX = dir.x !== 0 ? tDeltaX * (dir.x > 0 ? 1 - fr(origin.x) : fr(origin.x)) : Infinity;
      let tMaxY = dir.y !== 0 ? tDeltaY * (dir.y > 0 ? 1 - fr(origin.y) : fr(origin.y)) : Infinity;
      let tMaxZ = dir.z !== 0 ? tDeltaZ * (dir.z > 0 ? 1 - fr(origin.z) : fr(origin.z)) : Infinity;
      let nx = 0, ny = 0, nz = 0;
      let t = 0;

      while (t <= maxDist) {
        const id = this.get(x, y, z);
        if (id !== B.AIR && id !== B.WATER) {
          return { x, y, z, id, nx, ny, nz, dist: t };
        }
        if (tMaxX < tMaxY && tMaxX < tMaxZ) {
          x += stepX; t = tMaxX; tMaxX += tDeltaX;
          nx = -stepX; ny = 0; nz = 0;
        } else if (tMaxY < tMaxZ) {
          y += stepY; t = tMaxY; tMaxY += tDeltaY;
          nx = 0; ny = -stepY; nz = 0;
        } else {
          z += stepZ; t = tMaxZ; tMaxZ += tDeltaZ;
          nx = 0; ny = 0; nz = -stepZ;
        }
      }
      return null;
    }
  }

  // ---------- 分块网格构建 ----------
  // 六个面：[法线, 4 个顶点（按面左下/右下/右上/左上的 UV 顺序）]
  const FACES = [
    { // +X
      n: [1, 0, 0],
      v: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]],
    },
    { // -X
      n: [-1, 0, 0],
      v: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]],
    },
    { // +Y（顶）
      n: [0, 1, 0],
      v: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]],
    },
    { // -Y（底）
      n: [0, -1, 0],
      v: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]],
    },
    { // +Z
      n: [0, 0, 1],
      v: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]],
    },
    { // -Z
      n: [0, 0, -1],
      v: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]],
    },
  ];
  // 面亮度：顶面最亮、底面最暗、侧面居中（模拟 MC 的方向光感）
  const FACE_SHADE = [0.8, 0.8, 1.0, 0.55, 0.7, 0.7];

  class ChunkMesher {
    constructor(THREE, world, atlasTexture) {
      this.THREE = THREE;
      this.world = world;
      this.group = new THREE.Group();

      this.solidMat = new THREE.MeshLambertMaterial({
        map: atlasTexture,
        vertexColors: true,
        alphaTest: 0.5, // 树叶镂空
        side: THREE.FrontSide,
      });
      this.waterMat = new THREE.MeshLambertMaterial({
        map: atlasTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      // 每块存 { solid: Mesh|null, water: Mesh|null }
      this.meshes = new Array(world.chunksX * world.chunksZ).fill(null);
      for (let cz = 0; cz < world.chunksZ; cz++) {
        for (let cx = 0; cx < world.chunksX; cx++) {
          this.buildChunk(cx, cz);
        }
      }
    }

    chunkIndex(cx, cz) { return cz * this.world.chunksX + cx; }

    // 修改了 (x,y,z) 后刷新所在块及相邻块
    updateAt(x, z) {
      const cx = Math.floor(x / CHUNK), cz = Math.floor(z / CHUNK);
      const lx = x - cx * CHUNK, lz = z - cz * CHUNK;
      const jobs = new Set([this.chunkIndex(cx, cz)]);
      if (lx === 0 && cx > 0) jobs.add(this.chunkIndex(cx - 1, cz));
      if (lx === CHUNK - 1 && cx < this.world.chunksX - 1) jobs.add(this.chunkIndex(cx + 1, cz));
      if (lz === 0 && cz > 0) jobs.add(this.chunkIndex(cx, cz - 1));
      if (lz === CHUNK - 1 && cz < this.world.chunksZ - 1) jobs.add(this.chunkIndex(cx, cz + 1));
      for (const j of jobs) {
        this.buildChunk(j % this.world.chunksX, (j / this.world.chunksX) | 0);
      }
    }

    buildChunk(cx, cz) {
      const THREE = this.THREE;
      const world = this.world;
      const x0 = cx * CHUNK, z0 = cz * CHUNK;
      const x1 = Math.min(x0 + CHUNK, SIZE_X), z1 = Math.min(z0 + CHUNK, SIZE_Z);

      const solid = { pos: [], nrm: [], uv: [], col: [], idx: [] };
      const water = { pos: [], nrm: [], uv: [], col: [], idx: [] };

      const uvStep = 1 / MC.ATLAS_COLS;

      function pushFace(buf, x, y, z, f, faceIdx, tile) {
        const baseIndex = buf.pos.length / 3;
        const tu = (tile % MC.ATLAS_COLS) * uvStep;
        const tv = 1 - (((tile / MC.ATLAS_COLS) | 0) + 1) * uvStep;
        const shade = FACE_SHADE[faceIdx];
        const uvq = [[0, 0], [1, 0], [1, 1], [0, 1]];
        for (let i = 0; i < 4; i++) {
          const v = f.v[i];
          buf.pos.push(x + v[0], y + v[1], z + v[2]);
          buf.nrm.push(f.n[0], f.n[1], f.n[2]);
          buf.uv.push(tu + uvq[i][0] * uvStep, tv + uvq[i][1] * uvStep);
          buf.col.push(shade, shade, shade);
        }
        buf.idx.push(baseIndex, baseIndex + 1, baseIndex + 2, baseIndex, baseIndex + 2, baseIndex + 3);
      }

      for (let y = 0; y < SIZE_Y; y++) {
        for (let z = z0; z < z1; z++) {
          for (let x = x0; x < x1; x++) {
            const id = world.get(x, y, z);
            if (id === B.AIR) continue;
            const isWater = id === B.WATER;
            const buf = isWater ? water : solid;

            for (let fi = 0; fi < 6; fi++) {
              const f = FACES[fi];
              const nb = world.get(x + f.n[0], y + f.n[1], z + f.n[2]);
              if (isWater) {
                // 水只在露出空气的面渲染（主要是水面）
                if (nb !== B.AIR) continue;
              } else {
                if (world.isOpaque(nb)) continue;
                if (id === B.LEAVES && nb === B.LEAVES) continue;
                // 世界底部朝下的面不渲染
                if (y === 0 && fi === 3) continue;
              }
              const face = fi === 2 ? 'top' : fi === 3 ? 'bottom' : 'side';
              pushFace(buf, x, y, z, f, fi, MC.tileFor(id, face));
              // 水面略微下移，露出岸边
              if (isWater && fi === 2) {
                const n = buf.pos.length;
                for (let k = 1; k <= 4; k++) buf.pos[n - k * 3 + 1] -= 0.12;
              }
            }
          }
        }
      }

      // 替换旧网格
      const ci = this.chunkIndex(cx, cz);
      const old = this.meshes[ci];
      if (old) {
        for (const m of [old.solid, old.water]) {
          if (m) {
            this.group.remove(m);
            m.geometry.dispose();
          }
        }
      }
      const rec = { solid: null, water: null };

      const makeMesh = (buf, mat) => {
        if (buf.idx.length === 0) return null;
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(buf.pos, 3));
        g.setAttribute('normal', new THREE.Float32BufferAttribute(buf.nrm, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(buf.uv, 2));
        g.setAttribute('color', new THREE.Float32BufferAttribute(buf.col, 3));
        g.setIndex(buf.idx);
        const mesh = new THREE.Mesh(g, mat);
        mesh.matrixAutoUpdate = false;
        this.group.add(mesh);
        return mesh;
      };

      rec.solid = makeMesh(solid, this.solidMat);
      rec.water = makeMesh(water, this.waterMat);
      this.meshes[ci] = rec;
    }
  }

  MC.World = World;
  MC.ChunkMesher = ChunkMesher;
  MC.SIZE_X = SIZE_X;
  MC.SIZE_Y = SIZE_Y;
  MC.SIZE_Z = SIZE_Z;
  MC.WATER_LEVEL = WATER_LEVEL;
})(window.MC);
