/* 迷你我的世界 —— 方块定义与程序化像素纹理图集（无需任何图片资源） */
window.MC = window.MC || {};
(function (MC) {
  'use strict';

  const TILE = 16; // 单个贴图 16x16 像素
  const COLS = 8;  // 图集 8x8 个贴图位

  const Blocks = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    LOG: 4,
    LEAVES: 5,
    SAND: 6,
    WATER: 7,
    BEDROCK: 8,
  };

  // 图集内贴图编号
  const T = {
    GRASS_TOP: 0,
    GRASS_SIDE: 1,
    DIRT: 2,
    STONE: 3,
    LOG_SIDE: 4,
    LOG_TOP: 5,
    LEAVES: 6,
    SAND: 7,
    WATER: 8,
    BEDROCK: 9,
  };

  // solid: 参与碰撞；opaque: 会遮挡相邻方块的面
  const BLOCK_DEFS = {
    [Blocks.GRASS]:   { name: '草方块', solid: true,  opaque: true,  tiles: { top: T.GRASS_TOP, bottom: T.DIRT, side: T.GRASS_SIDE } },
    [Blocks.DIRT]:    { name: '泥土',   solid: true,  opaque: true,  tiles: { all: T.DIRT } },
    [Blocks.STONE]:   { name: '石头',   solid: true,  opaque: true,  tiles: { all: T.STONE } },
    [Blocks.LOG]:     { name: '木头',   solid: true,  opaque: true,  tiles: { top: T.LOG_TOP, bottom: T.LOG_TOP, side: T.LOG_SIDE } },
    [Blocks.LEAVES]:  { name: '树叶',   solid: true,  opaque: false, tiles: { all: T.LEAVES } },
    [Blocks.SAND]:    { name: '沙子',   solid: true,  opaque: true,  tiles: { all: T.SAND } },
    [Blocks.WATER]:   { name: '水',     solid: false, opaque: false, tiles: { all: T.WATER } },
    [Blocks.BEDROCK]: { name: '基岩',   solid: true,  opaque: true,  tiles: { all: T.BEDROCK } },
  };

  function tileFor(id, face) { // face: 'top' | 'bottom' | 'side'
    const t = BLOCK_DEFS[id].tiles;
    return t.all !== undefined ? t.all : t[face];
  }

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeAtlas(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = TILE * COLS;
    const ctx = canvas.getContext('2d');
    const rand = mulberry32(20240712);

    const clampc = (v) => Math.max(0, Math.min(255, Math.round(v)));

    function px(tx, ty, x, y, rgb) {
      ctx.fillStyle = 'rgb(' + clampc(rgb[0]) + ',' + clampc(rgb[1]) + ',' + clampc(rgb[2]) + ')';
      ctx.fillRect(tx * TILE + x, ty * TILE + y, 1, 1);
    }

    function vary(base, amt) {
      const f = 1 + (rand() * 2 - 1) * amt;
      return [base[0] * f, base[1] * f, base[2] * f];
    }

    // 基础噪点贴图
    function noiseTile(t, base, amt, holeChance) {
      const tx = t % COLS, ty = (t / COLS) | 0;
      for (let y = 0; y < TILE; y++) {
        for (let x = 0; x < TILE; x++) {
          if (holeChance && rand() < holeChance) continue; // 留透明孔（树叶用）
          px(tx, ty, x, y, vary(base, amt));
        }
      }
    }

    const GRASS = [106, 176, 62];
    const DIRT = [136, 97, 66];
    const STONE = [127, 127, 127];
    const LOG = [104, 82, 50];
    const LOG_DARK = [70, 55, 33];
    const LEAF = [56, 124, 38];
    const SAND = [221, 209, 164];
    const WATER = [50, 106, 200];
    const BEDROCK = [72, 72, 74];

    // 0 草方块顶面
    noiseTile(T.GRASS_TOP, GRASS, 0.14);
    // 2 泥土
    noiseTile(T.DIRT, DIRT, 0.13);
    // 1 草方块侧面：泥土 + 顶部不规则草边
    noiseTile(T.GRASS_SIDE, DIRT, 0.13);
    for (let x = 0; x < TILE; x++) {
      const h = 2 + ((rand() * 3) | 0);
      for (let y = 0; y < h; y++) px(1, 0, x, y, vary(GRASS, 0.14));
    }
    // 3 石头：灰色噪点 + 深色斑点
    noiseTile(T.STONE, STONE, 0.09);
    for (let i = 0; i < 26; i++) {
      px(T.STONE % COLS, (T.STONE / COLS) | 0, (rand() * TILE) | 0, (rand() * TILE) | 0, vary([100, 100, 100], 0.08));
    }
    // 4 木头侧面：竖条纹树皮
    {
      const tx = T.LOG_SIDE % COLS, ty = (T.LOG_SIDE / COLS) | 0;
      for (let x = 0; x < TILE; x++) {
        const dark = x % 4 === 0 ? 0.68 : 1;
        for (let y = 0; y < TILE; y++) {
          const c = vary(LOG, 0.1);
          px(tx, ty, x, y, [c[0] * dark, c[1] * dark, c[2] * dark]);
        }
      }
    }
    // 5 木头顶面：年轮
    {
      const tx = T.LOG_TOP % COLS, ty = (T.LOG_TOP / COLS) | 0;
      for (let y = 0; y < TILE; y++) {
        for (let x = 0; x < TILE; x++) {
          const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
          let c;
          if (d > 6.5) c = vary(LOG_DARK, 0.12);
          else c = vary((d | 0) % 2 === 0 ? [176, 143, 90] : [148, 116, 68], 0.07);
          px(tx, ty, x, y, c);
        }
      }
    }
    // 6 树叶：绿色噪点 + 透明孔
    noiseTile(T.LEAVES, LEAF, 0.2, 0.09);
    // 7 沙子
    noiseTile(T.SAND, SAND, 0.06);
    // 8 水
    noiseTile(T.WATER, WATER, 0.06);
    // 9 基岩
    noiseTile(T.BEDROCK, BEDROCK, 0.3);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;

    // 单个贴图的独立 canvas（HUD 图标用）
    function tileCanvas(t) {
      const cv = document.createElement('canvas');
      cv.width = cv.height = TILE;
      const c2 = cv.getContext('2d');
      c2.drawImage(canvas, (t % COLS) * TILE, ((t / COLS) | 0) * TILE, TILE, TILE, 0, 0, TILE, TILE);
      return cv;
    }

    // 贴图平均颜色（粒子用），返回 [r,g,b]，0-1
    const avgCache = new Map();
    function avgColor(t) {
      if (avgCache.has(t)) return avgCache.get(t);
      const data = ctx.getImageData((t % COLS) * TILE, ((t / COLS) | 0) * TILE, TILE, TILE).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue;
        r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
      }
      n = Math.max(1, n);
      const c = [r / n / 255, g / n / 255, b / n / 255];
      avgCache.set(t, c);
      return c;
    }

    return { texture, canvas, tileCanvas, avgColor };
  }

  MC.TILE = TILE;
  MC.ATLAS_COLS = COLS;
  MC.Blocks = Blocks;
  MC.BLOCK_DEFS = BLOCK_DEFS;
  MC.tileFor = tileFor;
  MC.makeAtlas = makeAtlas;
  MC.mulberry32 = mulberry32;
})(window.MC);
