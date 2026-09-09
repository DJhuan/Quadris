function isValidPosition(board, piece, targetX, targetY, customShape = null) {
  const shape = customShape || piece.shape;
  const rows = board.length;
  const cols = board[0].length;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const boardX = targetX + c;
        const boardY = targetY + r;

        if (boardX < 0 || boardX >= cols || boardY < 0 || boardY >= rows) {
          return false;
        }

        if (
          window.Board &&
          typeof window.Board.isPlayable === "function" &&
          !window.Board.isPlayable(boardY, boardX)
        ) {
          return false;
        }

        if (board[boardY][boardX] !== null) {
          return false;
        }
      }
    }
  }

  return true;
}

function checkGravityStep(board, piece, gravity) {
  const shape = piece.shape;
  const rows = board.length;
  const cols = board[0].length;
  const nextX = piece.x + gravity.x;
  const nextY = piece.y + gravity.y;

  let willHitBlock = false;
  let willCrossBorder = false;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;

      const targetX = nextX + c;
      const targetY = nextY + r;

      if (gravity.y === 1 && targetY >= rows) {
        willCrossBorder = true;
      } else if (gravity.y === -1 && targetY < 0) {
        willCrossBorder = true;
      } else if (gravity.x === 1 && targetX >= cols) {
        willCrossBorder = true;
      } else if (gravity.x === -1 && targetX < 0) {
        willCrossBorder = true;
      } else if (
        targetY >= 0 &&
        targetY < rows &&
        targetX >= 0 &&
        targetX < cols
      ) {
        if (
          window.Board &&
          typeof window.Board.isPlayable === "function" &&
          !window.Board.isPlayable(targetY, targetX)
        ) {
          willHitBlock = true;
        } else if (board[targetY][targetX] !== null) {
          willHitBlock = true;
        }
      }
    }
  }

  if (willHitBlock) {
    return { hitBlock: true, crossedBorder: false, valid: false };
  }
  if (willCrossBorder) {
    return { hitBlock: false, crossedBorder: true, valid: false };
  }
  return {
    hitBlock: false,
    crossedBorder: false,
    valid: true,
    x: nextX,
    y: nextY,
  };
}

function tryRotate(board, piece, rotateFn) {
  const newShape = rotateFn(piece.shape);
  const kicks = [
    { dx: 0, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -2, dy: 0 },
    { dx: 2, dy: 0 },
    { dx: 0, dy: -2 },
    { dx: 0, dy: 2 },
  ];

  for (const kick of kicks) {
    const testX = piece.x + kick.dx;
    const testY = piece.y + kick.dy;
    if (isValidPosition(board, piece, testX, testY, newShape)) {
      return {
        success: true,
        newShape: newShape,
        x: testX,
        y: testY,
      };
    }
  }

  return { success: false };
}

window.Collision = {
  isValidPosition,
  checkGravityStep,
  tryRotate,
};
