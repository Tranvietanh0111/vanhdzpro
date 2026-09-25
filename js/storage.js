export class Storage {
  static key(mode) {
    return `vanh_high_score_${mode}`;
  }
  static getHighScore(mode) {
    return Number(localStorage.getItem(this.key(mode)) || 0);
  }
  static saveHighScore(mode, score) {
    const old = this.getHighScore(mode);
    if (score > old) {
      localStorage.setItem(this.key(mode), String(score));
      return true;
    }
    return false;
  }
}
