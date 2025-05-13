class Verdict {
    static #_MLE = 0;
    static #_TLE = 1;
    static #_RE = 2;
    static #_WA = 3;
    static #_CE = 5;
    static #_UNKNOWN = 4;
    static #_AC = 6;
    static get MLE() { return this.#_MLE; }
    static get TLE() { return this.#_TLE; }
    static get RE() { return this.#_RE; }
    static get WA() { return this.#_WA; }
    static get CE() { return this.#_CE; }
    static get UNKNOWN() { return this.#_UNKNOWN; }
    static get AC() { return this.#_AC; }
}
export { Verdict };
export default {
    Verdict
};
