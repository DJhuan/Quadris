const SIZE = 30;
const COLS = SIZE;
const ROWS = SIZE;

const PLAYABLE_MIN = 10;
const PLAYABLE_MAX = 19;

function isPlayable(r, c) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
  return (
    (c >= PLAYABLE_MIN && c <= PLAYABLE_MAX) ||
    (r >= PLAYABLE_MIN && r <= PLAYABLE_MAX)
  );
}

function placeCenterCube(board) {
  const midY = Math.floor(board.length / 2);
  const midX = Math.floor(board[0].length / 2);
  board[midY - 1][midX - 1] = "FIXED";
  board[midY - 1][midX] = "FIXED";
  board[midY][midX - 1] = "FIXED";
  board[midY][midX] = "FIXED";
}

function isCenterCube(r, c, board) {
  const midY = Math.floor(board.length / 2);
  const midX = Math.floor(board[0].length / 2);
  return (r === midY - 1 || r === midY) && (c === midX - 1 || c === midX);
}

function createBoard(cols = COLS, rows = ROWS) {
  const board = [];
  for (let r = 0; r < rows; r++) {
    board.push(new Array(cols).fill(null));
  }
  placeCenterCube(board);
  return board;
}

function resetBoard(board) {
  const rows = board.length;
  const cols = board[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      board[r][c] = null;
    }
  }
  placeCenterCube(board);
}

function lockPieceToBoard(board, piece) {
  const shape = piece.shape;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const boardX = piece.x + c;
        const boardY = piece.y + r;
        if (
          boardY >= 0 &&
          boardY < board.length &&
          boardX >= 0 &&
          boardX < board[0].length &&
          isPlayable(boardY, boardX)
        ) {
          board[boardY][boardX] = piece.type;
        }
      }
    }
  }
}

function findFullLinesAndColumns(board) {
  const rows = board.length;
  const cols = board[0].length;
  const fullRows = [];
  const fullCols = [];

  for (let r = 0; r < rows; r++) {
    let isFull = true;
    for (let c = PLAYABLE_MIN; c <= PLAYABLE_MAX; c++) {
      if (board[r][c] === null) {
        isFull = false;
        break;
      }
    }
    if (isFull) {
      fullRows.push(r);
    }
  }

  for (let c = 0; c < cols; c++) {
    let isFull = true;
    for (let r = PLAYABLE_MIN; r <= PLAYABLE_MAX; r++) {
      if (board[r][c] === null) {
        isFull = false;
        break;
      }
    }
    if (isFull) {
      fullCols.push(c);
    }
  }

  return { fullRows, fullCols };
}

function clearAndCollapse(board, fullRows, fullCols, gravity) {
  const clearedCount = fullRows.length + fullCols.length;
  if (clearedCount === 0) return 0;

  const rows = board.length;
  const cols = board[0].length;
  const midY = Math.floor(rows / 2);
  const midX = Math.floor(cols / 2);

  for (const r of fullRows) {
    for (let c = PLAYABLE_MIN; c <= PLAYABLE_MAX; c++) {
      if (!isCenterCube(r, c, board)) {
        board[r][c] = null;
      }
    }
  }

  for (const c of fullCols) {
    for (let r = PLAYABLE_MIN; r <= PLAYABLE_MAX; r++) {
      if (!isCenterCube(r, c, board)) {
        board[r][c] = null;
      }
    }
  }

  if (fullRows.length > 0) {
    const sortedRows = [...fullRows].sort((a, b) => a - b);

    for (const rClear of sortedRows) {
      for (let c = PLAYABLE_MIN; c <= PLAYABLE_MAX; c++) {
        const isCubeCol = c === midX - 1 || c === midX;

        if (isCubeCol) {
          if (rClear <= midY - 2) {
            for (let r = rClear; r > 0; r--) {
              board[r][c] = board[r - 1][c];
            }
            board[0][c] = null;
          } else if (rClear >= midY + 1) {
            for (let r = rClear; r > midY + 1; r--) {
              board[r][c] = board[r - 1][c];
            }
            board[midY + 1][c] = null;
          }
        } else {
          for (let r = rClear; r > 0; r--) {
            board[r][c] = board[r - 1][c];
          }
          board[0][c] = null;
        }
      }
    }
  }

  if (fullCols.length > 0) {
    const sortedCols = [...fullCols].sort((a, b) => a - b);

    for (const cClear of sortedCols) {
      for (let r = PLAYABLE_MIN; r <= PLAYABLE_MAX; r++) {
        const isCubeRow = r === midY - 1 || r === midY;

        if (cClear < midX) {
          const limitC = isCubeRow ? midX - 2 : midX - 1;
          if (cClear <= limitC) {
            for (let c = cClear; c > 0; c--) {
              board[r][c] = board[r][c - 1];
            }
            board[r][0] = null;
          }
        } else {
          const limitC = isCubeRow ? midX + 1 : midX;
          if (cClear >= limitC) {
            for (let c = cClear; c < cols - 1; c++) {
              board[r][c] = board[r][c + 1];
            }
            board[r][cols - 1] = null;
          }
        }
      }

      if (cClear >= PLAYABLE_MIN && cClear <= PLAYABLE_MAX) {
        const hanging = [];
        for (let r = 0; r < PLAYABLE_MIN; r++) {
          if (board[r][cClear] !== null) {
            hanging.push(board[r][cClear]);
            board[r][cClear] = null;
          }
        }
        let targetR = PLAYABLE_MIN - 1;
        while (hanging.length > 0 && targetR >= 0) {
          board[targetR][cClear] = hanging.pop();
          targetR--;
        }
      }
    }
  }

  placeCenterCube(board);
  return clearedCount;
}

window.Board = {
  SIZE,
  COLS,
  ROWS,
  PLAYABLE_MIN,
  PLAYABLE_MAX,
  isPlayable,
  createBoard,
  resetBoard,
  placeCenterCube,
  isCenterCube,
  lockPieceToBoard,
  findFullLinesAndColumns,
  clearAndCollapse,
};
