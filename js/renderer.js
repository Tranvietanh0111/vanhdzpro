import { ParticleSystem } from "./particles.js";
export class Renderer {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    });
    this.holdCanvas = document.getElementById("hold-canvas");
    this.holdCtx = this.holdCanvas.getContext("2d");
    this.nextCanvas = document.getElementById("next-canvas");
    this.nextCtx = this.nextCanvas.getContext("2d");
    this.particles = new ParticleSystem();
    this.cell = 30;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.setupCanvas(this.canvas, 300, 600);
    this.setupCanvas(this.holdCanvas, 120, 90);
    this.setupCanvas(this.nextCanvas, 120, 90);
    this.boardContainer = document.querySelector(".board-container");
  }
  setupCanvas(c, w, h) {
    c.width = Math.floor(w * this.dpr);
    c.height = Math.floor(h * this.dpr);
    c.style.width = w + "px";
    c.style.height = h + "px";
  }
  clear(ctx, w, h) {
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
  }
  render(board, piece) {
    const ctx = this.ctx;
    this.clear(ctx, 300, 600);
    ctx.fillStyle = "#07121f";
    ctx.fillRect(0, 0, 300, 600);
    ctx.strokeStyle = "rgba(116,211,255,.055)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= 10; x++) {
      ctx.beginPath();
      ctx.moveTo(x * 30 + 0.5, 0);
      ctx.lineTo(x * 30 + 0.5, 600);
      ctx.stroke();
    }
    for (let y = 0; y <= 20; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * 30 + 0.5);
      ctx.lineTo(300, y * 30 + 0.5);
      ctx.stroke();
    }
    for (let y = 0; y < 20; y++)
      for (let x = 0; x < 10; x++) {
        const b = board.grid[y][x];
        if (b) this.block(ctx, x, y, b.color);
      }
    if (piece) {
      const ghost = { ...piece };
      while (board.isValid(ghost, 0, 1)) ghost.y++;
      this.drawPiece(ctx, ghost, true);
      this.drawPiece(ctx, piece, false);
    }
  }
  block(ctx, x, y, color, ghost = false) {
    const px = x * 30,
      py = y * 30;
    if (ghost) {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.1;
      ctx.fillRect(px + 3, py + 3, 24, 24);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.35;
      ctx.strokeRect(px + 3.5, py + 3.5, 23, 23);
      ctx.globalAlpha = 1;
      return;
    }
    ctx.save();

    ctx.shadowColor = color;
    ctx.shadowBlur = 10;

    const g = ctx.createLinearGradient(px, py, px + 30, py + 30);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(.07, color);
    g.addColorStop(.55, color);
    g.addColorStop(1, "#10283b");

    ctx.fillStyle = g;
    ctx.fillRect(px + 1, py + 1, 28, 28);

    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(255,255,255,.34)";
    ctx.fillRect(px + 3, py + 3, 24, 4);

    ctx.fillStyle = "rgba(255,255,255,.08)";
    ctx.fillRect(px + 3, py + 8, 24, 2);

    ctx.fillStyle = "rgba(0,0,0,.28)";
    ctx.fillRect(px + 3, py + 24, 24, 3);

    ctx.strokeStyle = "rgba(255,255,255,.42)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 1.5, py + 1.5, 27, 27);

    ctx.restore();
  }
  drawPiece(ctx, piece, ghost) {
    for (let y = 0; y < piece.shape.length; y++)
      for (let x = 0; x < piece.shape[y].length; x++)
        if (piece.shape[y][x]) {
          const by = piece.y + y,
            bx = piece.x + x;
          if (by >= 0) this.block(ctx, bx, by, piece.color, ghost);
        }
  }
  previewClear(ctx) {
    this.clear(ctx, 120, 90);
    ctx.fillStyle = "rgba(255,255,255,.015)";
    ctx.fillRect(0, 0, 120, 90);
  }
  previewPiece(ctx, piece, yOffset = 0) {
    if (!piece) return;
    const s = piece.shape,
      n = s.length,
      scale = 22,
      ox = (120 - n * scale) / 2,
      oy = (90 - n * scale) / 2 + yOffset;
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++)
        if (s[y][x]) {
          const px = ox + x * scale,
            py = oy + y * scale;
          ctx.fillStyle = piece.color;
          ctx.fillRect(px + 1, py + 1, scale - 2, scale - 2);
          ctx.fillStyle = "rgba(255,255,255,.2)";
          ctx.fillRect(px + 3, py + 3, scale - 6, 3);
        }
  }
  renderHold(piece) {
    this.previewClear(this.holdCtx);
    this.previewPiece(this.holdCtx, piece);
  }
  renderNext(list) {
    this.previewClear(this.nextCtx);
    if (list[0]) this.previewPiece(this.nextCtx, list[0], -23);
  }
  explodeLines(board, rows) {
    for (const row of rows) {
      const colors = board.grid[row].filter(Boolean).map((b) => b.color);
      this.particles.lineBurst(row, colors.length ? colors : ["#00eaff"]);
    }
  }
  updateParticles(dt) {
    this.particles.update(dt);
  }
  renderParticles() {
    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.particles.render(ctx);
    ctx.restore();
  }
}
