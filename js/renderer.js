const CELL_SIZE = 20;

class Renderer {
  constructor(canvas, nextCanvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.nextCanvas = nextCanvas;
    this.nextCtx = nextCanvas.getContext("2d");

    this.canvas.width = Board.COLS * CELL_SIZE;
    this.canvas.height = Board.ROWS * CELL_SIZE;

    this.gravityParticles = [];

    this.effects = {
      clearingLines: null,
      floatingTexts: [],
    };
  }

  drawGrid() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const minP = Board.PLAYABLE_MIN * CELL_SIZE;
    const maxP = (Board.PLAYABLE_MAX + 1) * CELL_SIZE;

    ctx.save();

    const corners = [
      { x: 0, y: 0, w: minP, h: minP },
      { x: maxP, y: 0, w: w - maxP, h: minP },
      { x: 0, y: maxP, w: minP, h: h - maxP },
      { x: maxP, y: maxP, w: w - maxP, h: h - maxP },
    ];

    for (const corner of corners) {
      ctx.fillStyle = "rgba(3, 5, 10, 0.94)";
      ctx.fillRect(corner.x, corner.y, corner.w, corner.h);

      ctx.save();
      ctx.beginPath();
      ctx.rect(corner.x, corner.y, corner.w, corner.h);
      ctx.clip();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      const step = 16;
      for (
        let offset = -corner.h;
        offset < corner.w + corner.h;
        offset += step
      ) {
        ctx.beginPath();
        ctx.moveTo(corner.x + offset, corner.y);
        ctx.lineTo(corner.x + offset + corner.h, corner.y + corner.h);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;

    for (let c = 1; c < Board.COLS; c++) {
      const x = c * CELL_SIZE;
      if (c >= Board.PLAYABLE_MIN && c <= Board.PLAYABLE_MAX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(x, minP);
        ctx.lineTo(x, maxP);
        ctx.stroke();
      }
    }

    for (let r = 1; r < Board.ROWS; r++) {
      const y = r * CELL_SIZE;
      if (r >= Board.PLAYABLE_MIN && r <= Board.PLAYABLE_MAX) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(minP, y);
        ctx.lineTo(maxP, y);
        ctx.stroke();
      }
    }
    ctx.strokeStyle = "rgba(248, 250, 252, 0.35)";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(minP, 0);
    ctx.lineTo(minP, minP);
    ctx.lineTo(0, minP);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(maxP, 0);
    ctx.lineTo(maxP, minP);
    ctx.lineTo(w, minP);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, maxP);
    ctx.lineTo(minP, maxP);
    ctx.lineTo(minP, h);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w, maxP);
    ctx.lineTo(maxP, maxP);
    ctx.lineTo(maxP, h);
    ctx.stroke();

    ctx.strokeStyle = "rgba(56, 189, 248, 0.18)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(minP, minP, maxP - minP, maxP - minP);
    ctx.setLineDash([]);

    ctx.restore();
  }

  drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
  }

  drawBlock(ctx, x, y, size, type, options = {}) {
    const { isGhost = false, alpha = 1.0, isClearing = false } = options;
    const colors = Pieces.PIECE_COLORS[type] || Pieces.PIECE_COLORS.T;

    ctx.save();
    ctx.globalAlpha = alpha;

    const px = x * size;
    const py = y * size;
    const inset = 1.0;
    const bSize = size - inset * 2;
    const radius = 2;

    if (isGhost) {
      ctx.strokeStyle = colors.light;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 2]);
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.strokeRect(px + inset, py + inset, bSize, bSize);
      ctx.fillRect(px + inset, py + inset, bSize, bSize);
      ctx.restore();
      return;
    }

    if (isClearing) {
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 10;
      ctx.fillRect(px + inset, py + inset, bSize, bSize);
      ctx.restore();
      return;
    }

    if (type === "FIXED") {
      const grad = ctx.createLinearGradient(px, py, px + size, py + size);
      grad.addColorStop(0, "#475569");
      grad.addColorStop(0.5, "#334155");
      grad.addColorStop(1, "#1e293b");
      ctx.fillStyle = grad;
      this.drawRoundedRect(ctx, px + inset, py + inset, bSize, bSize, radius);
      ctx.fill();

      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.2;
      this.drawRoundedRect(ctx, px + inset, py + inset, bSize, bSize, radius);
      ctx.stroke();

      ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
      ctx.fillRect(px + inset + 3, py + inset + 3, bSize - 6, bSize - 6);

      ctx.restore();
      return;
    }

    const grad = ctx.createLinearGradient(px, py, px + size, py + size);
    grad.addColorStop(0, colors.light);
    grad.addColorStop(0.3, colors.main);
    grad.addColorStop(1, colors.dark);

    ctx.fillStyle = grad;
    this.drawRoundedRect(ctx, px + inset, py + inset, bSize, bSize, radius);
    ctx.fill();

    ctx.strokeStyle = colors.light;
    ctx.lineWidth = 0.8;
    this.drawRoundedRect(ctx, px + inset, py + inset, bSize, bSize, radius);
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(px + inset + 1, py + inset + 1, bSize - 2, 1.5);
    ctx.fillRect(px + inset + 1, py + inset + 1, 1.5, bSize - 2);

    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(px + inset + 1, py + size - inset - 2.5, bSize - 2, 1.5);
    ctx.fillRect(px + size - inset - 2.5, py + inset + 1, 1.5, bSize - 2);

    ctx.restore();
  }

  drawBoard(board) {
    const clearing = this.effects.clearingLines;

    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        const cell = board[r][c];
        if (cell !== null) {
          const isRowClearing = clearing && clearing.rows.includes(r);
          const isColClearing = clearing && clearing.cols.includes(c);
          const isClearing = isRowClearing || isColClearing;

          this.drawBlock(this.ctx, c, r, CELL_SIZE, cell, {
            isClearing,
            alpha: isClearing ? 0.9 : 1.0,
          });
        }
      }
    }
  }

  drawPiece(ctx, piece, offsetX, offsetY, size = CELL_SIZE, options = {}) {
    if (!piece || !piece.shape) return;
    const shape = piece.shape;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          this.drawBlock(
            ctx,
            offsetX + c,
            offsetY + r,
            size,
            piece.type,
            options,
          );
        }
      }
    }
  }

  drawNextPiece(piece) {
    const ctx = this.nextCtx;
    const w = this.nextCanvas.width;
    const h = this.nextCanvas.height;

    ctx.clearRect(0, 0, w, h);

    if (!piece || !piece.shape) return;

    const shape = piece.shape;
    const miniCellSize = 22;
    const shapeW = shape[0].length * miniCellSize;
    const shapeH = shape.length * miniCellSize;

    const startX = Math.round((w - shapeW) / 2 / miniCellSize);
    const startY = Math.round((h - shapeH) / 2 / miniCellSize);

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          this.drawBlock(ctx, startX + c, startY + r, miniCellSize, piece.type);
        }
      }
    }
  }

  draw(game) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, "#0a0e17");
    bgGrad.addColorStop(1, "#05070c");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    this.drawGrid();
    this.drawBoard(game.board);

    if (game.state === "PLAYING" || game.state === "PAUSED") {
      if (game.currentPiece) {
        this.drawPiece(
          ctx,
          game.currentPiece,
          game.currentPiece.x,
          game.currentPiece.y,
          CELL_SIZE,
        );
      }
    }

    this.drawNextPiece(game.nextPiece);
  }
}

window.Renderer = Renderer;
