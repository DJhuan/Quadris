const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

const PIECE_COLORS = {
  I: {
    main: "#06b6d4",
    light: "#67e8f9",
    dark: "#0891b2",
    glow: "rgba(6, 182, 212, 0.45)",
  },
  O: {
    main: "#eab308",
    light: "#fef08a",
    dark: "#ca8a04",
    glow: "rgba(234, 179, 8, 0.45)",
  },
  T: {
    main: "#a855f7",
    light: "#e9d5ff",
    dark: "#7e22ce",
    glow: "rgba(168, 85, 247, 0.45)",
  },
  S: {
    main: "#10b981",
    light: "#a7f3d0",
    dark: "#047857",
    glow: "rgba(16, 185, 129, 0.45)",
  },
  Z: {
    main: "#ef4444",
    light: "#fecaca",
    dark: "#b91c1c",
    glow: "rgba(239, 68, 68, 0.45)",
  },
  J: {
    main: "#3b82f6",
    light: "#bfdbfe",
    dark: "#1d4ed8",
    glow: "rgba(59, 130, 246, 0.45)",
  },
  L: {
    main: "#f97316",
    light: "#fed7aa",
    dark: "#c2410c",
    glow: "rgba(249, 115, 22, 0.45)",
  },
  FIXED: {
    main: "#475569",
    light: "#94a3b8",
    dark: "#1e293b",
    glow: "rgba(148, 163, 184, 0.6)",
  },
};

const PIECE_TYPES = ["I", "O", "T", "S", "Z", "J", "L"];

let pieceBag = [];

// Sempre haverá todas as peças, apenas em ordem aleatória.
function replenishBag() {
  pieceBag = [...PIECE_TYPES];
  for (let i = pieceBag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieceBag[i], pieceBag[j]] = [pieceBag[j], pieceBag[i]];
  }
}

function getNextPieceType() {
  if (pieceBag.length === 0) {
    replenishBag();
  }
  return pieceBag.pop();
}

function cloneMatrix(matrix) {
  return matrix.map((row) => [...row]);
}

function rotateMatrixClockwise(matrix) {
  const n = matrix.length;
  const m = matrix[0].length;
  const rotated = [];
  for (let c = 0; c < m; c++) {
    rotated[c] = [];
    for (let r = n - 1; r >= 0; r--) {
      rotated[c].push(matrix[r][c]);
    }
  }
  return rotated;
}

function rotateMatrixCounterClockwise(matrix) {
  const n = matrix.length;
  const m = matrix[0].length;
  const rotated = [];
  for (let c = m - 1; c >= 0; c--) {
    const row = [];
    for (let r = 0; r < n; r++) {
      row.push(matrix[r][c]);
    }
    rotated.push(row);
  }
  return rotated;
}

// Como há 4 direções de gravidade, a peça deve nasce de acordo com elas;
function getSpawnPosition(
  shape,
  gravity,
  cols = window.Board ? window.Board.COLS : 30,
  rows = window.Board ? window.Board.ROWS : 30,
) {
  const shapeH = shape.length;
  const shapeW = shape[0].length;

  if (gravity.y === 1) {
    return {
      x: Math.floor((cols - shapeW) / 2),
      y: 0,
    };
  } else if (gravity.y === -1) {
    return {
      x: Math.floor((cols - shapeW) / 2),
      y: rows - shapeH,
    };
  } else if (gravity.x === 1) {
    return {
      x: 0,
      y: Math.floor((rows - shapeH) / 2),
    };
  } else {
    return {
      x: cols - shapeW,
      y: Math.floor((rows - shapeH) / 2),
    };
  }
}

function createPiece(
  type = null,
  gravity = { x: 0, y: 1 },
  cols = window.Board ? window.Board.COLS : 30,
  rows = window.Board ? window.Board.ROWS : 30,
) {
  const pieceType = type || getNextPieceType();
  const shape = cloneMatrix(SHAPES[pieceType]);
  const spawnPos = getSpawnPosition(shape, gravity, cols, rows);

  return {
    type: pieceType,
    shape: shape,
    x: spawnPos.x,
    y: spawnPos.y,
    rotation: 0,
  };
}

window.Pieces = {
  SHAPES,
  PIECE_COLORS,
  PIECE_TYPES,
  getNextPieceType,
  cloneMatrix,
  rotateMatrixClockwise,
  rotateMatrixCounterClockwise,
  getSpawnPosition,
  createPiece,
};
