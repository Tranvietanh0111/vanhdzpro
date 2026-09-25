export class Input {
  constructor(game) {
    this.game = game;
    this.down = new Set();
    this.das = 115;
    this.arr = 35;
    this.repeatTimer = 0;

    this.handleDown = this.handleDown.bind(this);
    this.handleUp = this.handleUp.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.bound = false;
  }

  bind() {
    if (this.bound) return;

    window.addEventListener("keydown", this.handleDown);
    window.addEventListener("keyup", this.handleUp);
    window.addEventListener("blur", this.handleBlur);

    this.bound = true;
  }

  destroy() {
    if (!this.bound) return;

    window.removeEventListener("keydown", this.handleDown);
    window.removeEventListener("keyup", this.handleUp);
    window.removeEventListener("blur", this.handleBlur);

    this.bound = false;
    this.down.clear();
  }

  handleDown(e) {
    if (!this.game.running) return;

    const controls = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Space",
      "KeyC",
      "Escape",
    ];

    if (controls.includes(e.code)) {
      e.preventDefault();
    }

    if (
      e.repeat &&
      ["ArrowUp", "ArrowDown", "Space", "KeyC", "Escape"].includes(e.code)
    ) {
      return;
    }

    if (e.code === "Escape") {
      this.game.togglePause();
      return;
    }

    if (this.game.paused) return;

    if (e.code === "ArrowLeft") {
      this.down.add("ArrowLeft");
      this.game.move(-1);
      this.repeatTimer = 0;
      return;
    }

    if (e.code === "ArrowRight") {
      this.down.add("ArrowRight");
      this.game.move(1);
      this.repeatTimer = 0;
      return;
    }

    if (e.code === "ArrowUp") {
      this.game.rotate(1);
      return;
    }

    if (e.code === "ArrowDown") {
      this.game.rotate(-1);
      return;
    }

    if (e.code === "Space") {
      this.game.hardDrop();
      return;
    }

    if (e.code === "KeyC") {
      this.game.hold();
    }
  }

  handleUp(e) {
    this.down.delete(e.code);
  }

  handleBlur() {
    this.down.clear();
  }

  update(dt) {
    if (!this.game.running || this.game.paused) return;

    const left = this.down.has("ArrowLeft");
    const right = this.down.has("ArrowRight");

    if (!left && !right) {
      this.repeatTimer = 0;
      return;
    }

    this.repeatTimer += dt;

    if (this.repeatTimer < this.das) return;

    this.repeatTimer -= this.arr;

    if (left) this.game.move(-1);
    else if (right) this.game.move(1);
  }
}
