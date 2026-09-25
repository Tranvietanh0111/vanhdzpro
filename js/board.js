export class Board {
  constructor(width = 10, height = 20) {
    this.width = width;
    this.height = height;
    this.reset();
  }
  reset() {
    this.grid = Array.from({ length: this.height }, () =>
      Array(this.width).fill(null),
    );
  }
  isValid(piece, dx = 0, dy = 0, shape = piece.shape) {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) continue;
        const bx = piece.x + x + dx;
        const by = piece.y + y + dy;
        if (bx < 0 || bx >= this.width || by >= this.height) return false;
        if (by >= 0 && this.grid[by][bx]) return false;
      }
    }
    return true;
  }
  merge(piece) {
    for (let y = 0; y < piece.shape.length; y++)
      for (let x = 0; x < piece.shape[y].length; x++)
        if (piece.shape[y][x]) {
          const bx = piece.x + x,
            by = piece.y + y;
          if (by >= 0 && by < this.height)
            this.grid[by][bx] = { color: piece.color, type: piece.type };
        }
  }
  getFullRows() {
    const rows = [];
    for (let y = 0; y < this.height; y++)
      if (this.grid[y].every(Boolean)) rows.push(y);
    return rows;
  }
  clearRows(rows) {
    if (!rows.length) return 0;
    const remove = new Set(rows);
    const kept = this.grid.filter((_, i) => !remove.has(i));
    while (kept.length < this.height)
      kept.unshift(Array(this.width).fill(null));
    this.grid = kept;
    return rows.length;
  }
}
