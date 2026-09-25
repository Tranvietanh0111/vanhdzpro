export class AudioManager {
  constructor() {
    this.enabled = true;
    this.context = null;
    this.master = null;
  }
  init() {
    if (this.context) return;
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) {
      this.enabled = false;
      return;
    }
    this.context = new C();
    this.master = this.context.createGain();
    this.master.gain.value = 0.08;
    this.master.connect(this.context.destination);
  }
  resume() {
    if (!this.context) this.init();
    if (this.context?.state === "suspended") this.context.resume();
  }
  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) this.resume();
    return this.enabled;
  }
  tone(f, d = 0.06, type = "square", v = 0.45, to = null) {
    if (!this.enabled) return;
    this.resume();
    if (!this.context) return;
    const o = this.context.createOscillator(),
      g = this.context.createGain(),
      t = this.context.currentTime;
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (to !== null)
      o.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + d);
    g.gain.setValueAtTime(0.001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + d + 0.02);
  }
  move() {
    this.tone(180, 0.035, "square", 0.25);
  }
  rotate() {
    this.tone(420, 0.055, "square", 0.35, 560);
  }
  softDrop() {
    this.tone(120, 0.03, "triangle", 0.2);
  }
  hardDrop() {
    this.tone(90, 0.09, "sawtooth", 0.45, 48);
  }
  hold() {
    this.tone(260, 0.08, "triangle", 0.38, 430);
  }
  lineClear(n) {
    const notes =
      n === 4
        ? [520, 660, 780, 1040]
        : n === 3
          ? [520, 660, 780]
          : n === 2
            ? [520, 660]
            : [520];
    notes.forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.11, "square", 0.48), i * 45),
    );
  }
  tetris() {
    [520, 660, 780, 1040].forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.15, "square", 0.55), i * 65),
    );
  }
  combo(n) {
    this.tone(Math.min(300 + n * 25, 800), 0.06, "triangle", 0.3);
  }
  gameOver() {
    this.tone(260, 0.14, "sawtooth", 0.45, 150);
    setTimeout(() => this.tone(170, 0.2, "sawtooth", 0.4, 70), 120);
  }
  record() {
    [660, 780, 1040, 1320].forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.16, "triangle", 0.55), i * 80),
    );
  }
}
