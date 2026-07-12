export const BLOCK = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  WOOD: 4,
};

export const BLOCK_NAMES = ["空气", "草方块", "泥土", "石头", "木头"];

const FACE = {
  TOP: 0,
  BOTTOM: 1,
  SIDE: 2,
};

const COLORS = {
  grassTop: [0.36, 0.62, 0.23],
  grassSide: [0.45, 0.55, 0.28],
  dirt: [0.55, 0.35, 0.17],
  stone: [0.53, 0.53, 0.53],
  woodSide: [0.42, 0.27, 0.14],
  woodTop: [0.55, 0.38, 0.2],
};

function colorFor(block, face) {
  switch (block) {
    case BLOCK.GRASS:
      if (face === FACE.TOP) return COLORS.grassTop;
      if (face === FACE.BOTTOM) return COLORS.dirt;
      return COLORS.grassSide;
    case BLOCK.DIRT:
      return COLORS.dirt;
    case BLOCK.STONE:
      return COLORS.stone;
    case BLOCK.WOOD:
      return face === FACE.SIDE ? COLORS.woodSide : COLORS.woodTop;
    default:
      return [1, 1, 1];
  }
}

const FACE_DIRS = [
  { axis: "y", dir: 1, corners: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], face: FACE.TOP },
  { axis: "y", dir: -1, corners: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], face: FACE.BOTTOM },
  { axis: "z", dir: 1, corners: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], face: FACE.SIDE },
  { axis: "z", dir: -1, corners: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]], face: FACE.SIDE },
  { axis: "x", dir: 1, corners: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], face: FACE.SIDE },
  { axis: "x", dir: -1, corners: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], face: FACE.SIDE },
];

export function key(x, y, z) {
  return `${x},${y},${z}`;
}

export function parseKey(k) {
  const [x, y, z] = k.split(",").map(Number);
  return { x, y, z };
}

export function addFace(vertices, colors, x, y, z, block, faceIndex) {
  const face = FACE_DIRS[faceIndex];
  const rgb = colorFor(block, face.face);

  vertices.push(
    x + face.corners[0][0], y + face.corners[0][1], z + face.corners[0][2],
    x + face.corners[2][0], y + face.corners[2][1], z + face.corners[2][2],
    x + face.corners[1][0], y + face.corners[1][1], z + face.corners[1][2],
  );
  for (let i = 0; i < 3; i++) {
    colors.push(rgb[0], rgb[1], rgb[2]);
  }

  vertices.push(
    x + face.corners[0][0], y + face.corners[0][1], z + face.corners[0][2],
    x + face.corners[3][0], y + face.corners[3][1], z + face.corners[3][2],
    x + face.corners[2][0], y + face.corners[2][1], z + face.corners[2][2],
  );
  for (let i = 0; i < 3; i++) {
    colors.push(rgb[0], rgb[1], rgb[2]);
  }
}

export function neighborOffset(faceIndex) {
  switch (faceIndex) {
    case 0: return [0, 1, 0];
    case 1: return [0, -1, 0];
    case 2: return [0, 0, 1];
    case 3: return [0, 0, -1];
    case 4: return [1, 0, 0];
    case 5: return [-1, 0, 0];
    default: return [0, 0, 0];
  }
}
