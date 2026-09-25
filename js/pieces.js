export const PIECES = {
  I: {
    color: "#00eaff",
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  O: {
    color: "#ffd83d",
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  T: {
    color: "#a855ff",
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  S: {
    color: "#35e06f",
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
  },
  Z: {
    color: "#ff405c",
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
  },
  J: {
    color: "#3b82ff",
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  L: {
    color: "#ff8a30",
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
};
export const PIECE_NAMES = Object.keys(PIECES);
export function createPiece(type) {
  const d = PIECES[type];
  return {
    type,
    color: d.color,
    shape: d.shape.map((r) => [...r]),
    x: 3,
    y: 0,
    rotation: 0,
  };
}
export function randomPiece() {
  return createPiece(
    PIECE_NAMES[Math.floor(Math.random() * PIECE_NAMES.length)],
  );
}
export function rotateMatrix(shape) {
  const n = shape.length;
  const out = Array.from({ length: n }, () => Array(n).fill(0));
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) out[x][n - 1 - y] = shape[y][x];
  return out;
}
export function rotatePiece(piece) {
  const next = {
    ...piece,
    shape: rotateMatrix(piece.shape),
    rotation: (piece.rotation + 1) % 4,
  };
  return next;
}
