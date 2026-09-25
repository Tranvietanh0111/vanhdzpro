import { Board } from "./board.js";
import { randomPiece, rotatePiece } from "./pieces.js";
import { Renderer } from "./renderer.js";
import { Input } from "./input.js";
import { Effects } from "./effects.js";
import { Storage } from "./storage.js";
import { AudioManager } from "./audio.js";

const KICKS = {
  normal: {
    0: [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, -1],
      [-1, -1],
      [1, -1],
    ],
    1: [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, 1],
      [-1, 1],
      [1, 1],
    ],
    2: [
      [0, 0],
      [1, 0],
      [-1, 0],
      [0, -1],
      [1, -1],
      [-1, -1],
    ],
    3: [
      [0, 0],
      [1, 0],
      [-1, 0],
      [0, 1],
      [1, 1],
      [-1, 1],
    ],
  },

  I: {
    0: [
      [0, 0],
      [-2, 0],
      [1, 0],
      [-2, -1],
      [1, 2],
    ],
    1: [
      [0, 0],
      [2, 0],
      [-1, 0],
      [2, 1],
      [-1, -2],
    ],
    2: [
      [0, 0],
      [1, 0],
      [-2, 0],
      [1, 2],
      [-2, -1],
    ],
    3: [
      [0, 0],
      [-1, 0],
      [2, 0],
      [-1, -2],
      [2, 1],
    ],
  },
};

export class Game {
  constructor(mode) {
    this.mode = mode;
    this.running = false;
    this.paused = false;

    this.score = 0;
    this.lines = 0;
    this.combo = 0;
    this.maxCombo = 0;

    this.startTime = 0;
    this.elapsedTime = 0;
    this.lastTime = 0;
    this.animationFrame = null;

    this.board = new Board();
    this.renderer = new Renderer();
    this.effects = new Effects();
    this.input = new Input(this);
    this.audio = new AudioManager();

    this.currentPiece = null;
    this.holdPiece = null;
    this.canHold = true;
    this.nextPieces = [];

    this.modeElement = document.getElementById("mode-name");
    this.scoreElement = document.getElementById("score");
    this.highScoreElement = document.getElementById("high-score");
    this.linesElement = document.getElementById("lines");
    this.comboElement = document.getElementById("combo");
    this.timerElement = document.getElementById("timer");
    this.pauseOverlay = document.getElementById("pause-overlay");
  }

  start() {
    this.running = true;
    this.paused = false;

    this.score = 0;
    this.lines = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.elapsedTime = 0;

    this.board.reset();
    this.effects.reset();

    this.nextPieces = [randomPiece(), randomPiece(), randomPiece()];

    this.holdPiece = null;
    this.canHold = true;

    this.currentPiece = this.getNextPiece();

    this.startTime = performance.now();
    this.lastTime = this.startTime;

    this.audio.init();

    this.pauseOverlay.classList.remove("active");
    document.getElementById("new-record").classList.remove("active");

    this.updateModeName();
    this.updateUI();

    this.input.bind();
    this.loop();
  }

  stop() {
    this.running = false;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = null;
    this.input.destroy();
  }

  getNextPiece() {
    const p = this.nextPieces.shift();

    this.nextPieces.push(randomPiece());

    p.x = Math.floor((this.board.width - p.shape[0].length) / 2);

    p.y = 0;
    p.rotation = 0;

    return p;
  }

  pause() {
    if (!this.running || this.paused) return;

    this.paused = true;
    this.pauseOverlay.classList.add("active");
  }

  resume() {
    if (!this.running || !this.paused) return;

    this.paused = false;
    this.lastTime = performance.now();

    this.pauseOverlay.classList.remove("active");
    this.audio.resume();
  }

  togglePause() {
    if (this.paused) this.resume();
    else this.pause();
  }

  move(dir) {
    if (!this.running || this.paused) return false;

    if (this.board.isValid(this.currentPiece, dir, 0)) {
      this.currentPiece.x += dir;
      this.audio.move();
      return true;
    }

    return false;
  }

  rotate(direction = 1) {
    if (!this.running || this.paused || this.currentPiece.type === "O") {
      return;
    }

    const from = this.currentPiece.rotation;

    let next;

    if (direction === 1) {
      next = rotatePiece(this.currentPiece);
    } else {
      next = {
        ...this.currentPiece,
        shape: this.currentPiece.shape.map((row) => [...row]),
      };

      next.rotation = (from + 3) % 4;

      for (let i = 0; i < 3; i++) {
        next = rotatePiece(next);
      }
    }

    const group = this.currentPiece.type === "I" ? KICKS.I : KICKS.normal;

    const tests = group[from];

    for (const [dx, dy] of tests) {
      if (this.board.isValid(next, dx, dy)) {
        next.x = this.currentPiece.x + dx;
        next.y = this.currentPiece.y + dy;

        this.currentPiece = next;

        this.audio.rotate();

        return;
      }
    }
  }

  hardDrop() {
    if (!this.running || this.paused) return;

    let distance = 0;

    while (this.board.isValid(this.currentPiece, 0, 1)) {
      this.currentPiece.y++;
      distance++;
    }

    this.score += distance * 2;

    this.audio.hardDrop();

    this.lockPiece();
    this.updateUI();
  }

  hold() {
    if (!this.running || this.paused || !this.canHold) {
      return;
    }

    if (!this.holdPiece) {
      this.holdPiece = {
        ...this.currentPiece,
        shape: this.currentPiece.shape.map((row) => [...row]),
      };

      this.currentPiece = this.getNextPiece();
    } else {
      const temp = this.holdPiece;

      this.holdPiece = {
        ...this.currentPiece,
        shape: this.currentPiece.shape.map((row) => [...row]),
      };

      this.currentPiece = {
        ...temp,
        shape: temp.shape.map((row) => [...row]),
        x: 3,
        y: 0,
        rotation: 0,
      };
    }

    this.canHold = false;

    this.audio.hold();

    this.updateUI();
  }

  lockPiece() {
    this.board.merge(this.currentPiece);

    const rows = this.board.getFullRows();

    if (rows.length) {
      this.renderer.explodeLines(this.board, rows);
    }

    const cleared = this.board.clearRows(rows);

    if (cleared) {
      this.handleLines(cleared);
    } else {
      this.combo = 0;
    }

    this.canHold = true;

    this.currentPiece = this.getNextPiece();

    if (!this.board.isValid(this.currentPiece)) {
      this.finishGame(false);
    }

    this.updateUI();
  }

  handleLines(n) {
    const base = {
      1: 100,
      2: 300,
      3: 500,
      4: 800,
    };

    this.lines += n;

    this.combo++;

    this.maxCombo = Math.max(this.maxCombo, this.combo);

    this.score += (base[n] || 0) + Math.max(0, this.combo - 1) * 50;

    this.effects.triggerLineClear(n);

    if (this.combo >= 2) {
      this.effects.showCombo(this.combo);
      this.audio.combo(this.combo);
    }

    if (n === 4) {
      this.effects.showTetris();
      this.audio.tetris();
    } else {
      this.audio.lineClear(n);
    }

    if (this.mode === "40-lines" && this.lines >= 40) {
      this.finishGame(true);
    }

    if (this.mode === "100-lines" && this.lines >= 100) {
      this.finishGame(true);
    }
  }

  finishGame(completed) {
    if (!this.running) return;

    this.running = false;

    this.audio[completed ? "tetris" : "gameOver"]();

    this.showResult();
  }

  updateModeName() {
    this.modeElement.textContent =
      this.mode === "40-lines"
        ? "40 LINES"
        : this.mode === "100-lines"
          ? "100 LINES"
          : "5 MINUTES";
  }

  updateTimer() {
    const ms = this.elapsedTime;

    const total = Math.floor(ms / 1000);
    const min = Math.floor(total / 60);
    const sec = total % 60;

    this.timerElement.textContent = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  updateUI() {
    this.scoreElement.textContent = String(this.score).padStart(6, "0");

    this.highScoreElement.textContent = String(
      Storage.getHighScore(this.mode),
    ).padStart(6, "0");

    this.linesElement.textContent = String(this.lines).padStart(2, "0");

    this.comboElement.textContent = this.combo > 1 ? `×${this.combo}` : "×0";

    this.updateTimer();
  }

  showResult() {
    const isRecord = Storage.saveHighScore(this.mode, this.score);

    if (isRecord) {
      this.audio.record();
    }

    document.getElementById("game-screen").classList.remove("active");

    document.getElementById("result-screen").classList.add("active");

    document.getElementById("result-score").textContent = String(
      this.score,
    ).padStart(6, "0");

    document.getElementById("result-lines").textContent = this.lines;

    document.getElementById("result-time").textContent =
      this.timerElement.textContent;

    document.getElementById("result-combo").textContent = `×${this.maxCombo}`;

    document.getElementById("new-record").classList.toggle("active", isRecord);

    document.getElementById("result-title").textContent =
      this.mode === "5-minutes"
        ? "TIME UP"
        : this.lines >= (this.mode === "40-lines" ? 40 : 100)
          ? "CLEARED"
          : "GAME OVER";
  }

  update(dt, now) {
    if (!this.running || this.paused) return;

    this.elapsedTime = now - this.startTime;

    if (this.mode === "5-minutes" && this.elapsedTime >= 300000) {
      this.elapsedTime = 300000;

      this.updateUI();

      this.finishGame(true);

      return;
    }

    this.input.update(dt);

    this.updateUI();
  }

  render() {
    this.renderer.render(this.board, this.currentPiece);

    this.renderer.renderHold(this.holdPiece);

    this.renderer.renderNext(this.nextPieces);

    this.renderer.renderParticles();
  }

  loop() {
    if (!this.running) return;

    const now = performance.now();

    const dt = Math.min(34, now - this.lastTime);

    this.lastTime = now;

    this.update(dt, now);

    this.effects.update(dt);
    this.effects.updateMessage();

    this.renderer.updateParticles(dt);

    this.render();

    this.effects.applyShake(this.renderer.boardContainer);

    this.effects.applyFlash();

    this.animationFrame = requestAnimationFrame(() => this.loop());
  }
}
