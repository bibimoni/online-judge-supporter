class Verdict {
  static #_MLE = 0;
  static #_TLE = 1;
  static #_RE = 2;
  static #_WA = 3;
  static #_COMPLILE_ERROR = 5;
  static #_UNKNOWN = 4;

  static get MLE() { return this.#_MLE; }
  static get TLE() { return this.#_TLE; }
  static get RE() { return this.#_RE; }
  static get WA() { return this.#_WA; }
  static get COMPLILE_ERROR() { return this.#_COMPLILE_ERROR; }
  static get UNKNOWN() { return this.#_UNKNOWN; }
}

module.exports = { Verdict };


