export class ParticleSystem {
  constructor() {
    this.particles = [];
  }
  burst(x, y, color, count = 18, power = 1) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2,
        s = (1 + Math.random() * 5) * power;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 1.5,
        life: 0.35 + Math.random() * 0.45,
        max: 0.8,
        size: 1 + Math.random() * 3,
        color,
      });
    }
  }
  lineBurst(row, colors) {
    for (let x = 0; x < 10; x++)
      this.burst(x * 30 + 15, row * 30 + 15, colors[x % colors.length], 5, 1.2);
  }
  update(dt) {
    const d = dt / 16.666;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * d;
      p.y += p.vy * d;
      p.vy += 0.16 * d;
      p.life -= dt / 1000;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }
  render(ctx) {
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
}
