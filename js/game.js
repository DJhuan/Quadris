class Game {
  constructor() {
    this.state = "MENU";
    this.board = Board.createBoard();

    this.currentPiece = null;
    this.nextPiece = null;

    this.gravityCycle = ["DOWN", "LEFT", "UP", "RIGHT"];
    this.gravityIndex = 0;
    this.gravity = { x: 0, y: 1 };
    this.gravityDirection = "DOWN";

    this.score = 0;
    this.highScore = this.loadHighScore();
    this.level = 1;
    this.linesCleared = 0;

    this.dropInterval = 800;
    this.lastDropTime = 0;
    this.isClearingLines = false;

    this.onStateChange = null;
    this.onScoreChange = null;
    this.onGravityChange = null;
  }

  getGravityVector(dir) {
    switch (dir) {
      case "UP":
        return { x: 0, y: -1 };
      case "DOWN":
        return { x: 0, y: 1 };
      case "LEFT":
        return { x: -1, y: 0 };
      case "RIGHT":
        return { x: 1, y: 0 };
      default:
        return { x: 0, y: 1 };
    }
  }

  loadHighScore() {
    try {
      const saved = localStorage.getItem("quadris_high_score");
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      return 0;
    }
  }

  saveHighScore() {
    try {
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem("quadris_high_score", this.highScore.toString());
      }
    } catch (e) {
      return;
    }
  }

  startGame() {
    Board.resetBoard(this.board);

    this.score = 0;
    this.level = 1;
    this.linesCleared = 0;
    this.dropInterval = 800;
    this.isClearingLines = false;

    this.gravityIndex = 0;
    this.setGravity(this.gravityCycle[0]);

    const nextDir =
      this.gravityCycle[(this.gravityIndex + 1) % this.gravityCycle.length];
    this.nextPiece = Pieces.createPiece(
      null,
      this.getGravityVector(nextDir),
      Board.COLS,
      Board.ROWS,
    );
    this.spawnNextPiece();

    this.state = "PLAYING";
    this.lastDropTime = performance.now();

    if (this.onScoreChange) this.onScoreChange(this);
    if (this.onStateChange) this.onStateChange(this.state);
  }

  togglePause() {
    if (this.state === "PLAYING") {
      this.state = "PAUSED";
    } else if (this.state === "PAUSED") {
      this.state = "PLAYING";
      this.lastDropTime = performance.now();
    }
    if (this.onStateChange) this.onStateChange(this.state);
  }

  setGravity(dir) {
    this.gravityDirection = dir;
    this.gravity = this.getGravityVector(dir);

    if (this.onGravityChange) {
      this.onGravityChange(this.gravityDirection, this.gravity);
    }
  }

  spawnNextPiece() {
    this.currentPiece =
      this.nextPiece ||
      Pieces.createPiece(null, this.gravity, Board.COLS, Board.ROWS);
    const spawnPos = Pieces.getSpawnPosition(
      this.currentPiece.shape,
      this.gravity,
      Board.COLS,
      Board.ROWS,
    );
    this.currentPiece.x = spawnPos.x;
    this.currentPiece.y = spawnPos.y;

    const nextDir =
      this.gravityCycle[(this.gravityIndex + 1) % this.gravityCycle.length];
    this.nextPiece = Pieces.createPiece(
      null,
      this.getGravityVector(nextDir),
      Board.COLS,
      Board.ROWS,
    );

    if (
      !Collision.isValidPosition(
        this.board,
        this.currentPiece,
        this.currentPiece.x,
        this.currentPiece.y,
      )
    ) {
      this.gameOver();
    }
  }

  movePiece(dx, dy) {
    if (
      this.state !== "PLAYING" ||
      !this.currentPiece ||
      this.isClearingLines
    ) {
      return;
    }

    if (dx === this.gravity.x && dy === this.gravity.y) {
      this.applyGravity();
      return;
    }

    if (dx === -this.gravity.x && dy === -this.gravity.y) {
      return;
    }

    const newX = this.currentPiece.x + dx;
    const newY = this.currentPiece.y + dy;

    if (Collision.isValidPosition(this.board, this.currentPiece, newX, newY)) {
      this.currentPiece.x = newX;
      this.currentPiece.y = newY;
    }
  }

  rotateCurrentPiece(direction = "CW") {
    if (
      this.state !== "PLAYING" ||
      !this.currentPiece ||
      this.isClearingLines
    ) {
      return;
    }

    const rotateFn =
      direction === "CW"
        ? Pieces.rotateMatrixClockwise
        : Pieces.rotateMatrixCounterClockwise;
    const result = Collision.tryRotate(this.board, this.currentPiece, rotateFn);

    if (result.success) {
      this.currentPiece.shape = result.newShape;
      this.currentPiece.x = result.x;
      this.currentPiece.y = result.y;
    }
  }

  hardDrop() {
    if (
      this.state !== "PLAYING" ||
      !this.currentPiece ||
      this.isClearingLines
    ) {
      return;
    }

    while (true) {
      const step = Collision.checkGravityStep(
        this.board,
        this.currentPiece,
        this.gravity,
      );
      if (step.hitBlock) {
        this.lockPiece();
        break;
      }
      if (step.crossedBorder) {
        this.gameOver();
        break;
      }
      if (step.valid) {
        this.currentPiece.x = step.x;
        this.currentPiece.y = step.y;
      }
    }
  }

  applyGravity() {
    if (
      this.state !== "PLAYING" ||
      !this.currentPiece ||
      this.isClearingLines
    ) {
      return;
    }

    const step = Collision.checkGravityStep(
      this.board,
      this.currentPiece,
      this.gravity,
    );

    if (step.hitBlock) {
      this.lockPiece();
    } else if (step.crossedBorder) {
      this.gameOver();
    } else if (step.valid) {
      this.currentPiece.x = step.x;
      this.currentPiece.y = step.y;
    }
  }

  lockPiece() {
    if (!this.currentPiece || this.isClearingLines) return;

    Board.lockPieceToBoard(this.board, this.currentPiece);
    this.currentPiece = null;

    const { fullRows, fullCols } = Board.findFullLinesAndColumns(this.board);
    const totalLines = fullRows.length + fullCols.length;

    if (totalLines > 0) {
      this.isClearingLines = true;

      if (window.gameRenderer) {
        window.gameRenderer.effects.clearingLines = {
          rows: fullRows,
          cols: fullCols,
        };
      }

      this.addScore(totalLines);

      setTimeout(() => {
        Board.clearAndCollapse(this.board, fullRows, fullCols, this.gravity);

        if (window.gameRenderer) {
          window.gameRenderer.effects.clearingLines = null;
        }

        this.isClearingLines = false;

        this.gravityIndex = (this.gravityIndex + 1) % this.gravityCycle.length;
        this.setGravity(this.gravityCycle[this.gravityIndex]);

        if (this.state === "PLAYING") {
          this.spawnNextPiece();
          this.lastDropTime = performance.now();
        }
      }, 140);
    } else {
      this.gravityIndex = (this.gravityIndex + 1) % this.gravityCycle.length;
      this.setGravity(this.gravityCycle[this.gravityIndex]);

      this.spawnNextPiece();
      this.lastDropTime = performance.now();
    }
  }

  addScore(linesCount) {
    let basePoints = 100;
    if (linesCount === 2) basePoints = 300;
    else if (linesCount === 3) basePoints = 500;
    else if (linesCount >= 4) basePoints = 800;

    const gained = basePoints * this.level;
    this.score += gained;
    this.linesCleared += linesCount;
    this.saveHighScore();

    const newLevel = Math.floor(this.linesCleared / 5) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      this.dropInterval = Math.max(100, 800 - (this.level - 1) * 70);
    }

    if (this.onScoreChange) {
      this.onScoreChange(this);
    }
  }

  gameOver() {
    this.state = "GAME_OVER";
    this.saveHighScore();

    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  update(timestamp) {
    if (this.state !== "PLAYING" || this.isClearingLines) return;

    if (timestamp - this.lastDropTime >= this.dropInterval) {
      this.applyGravity();
      this.lastDropTime = timestamp;
    }
  }
}

window.Game = Game;
