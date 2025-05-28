import { Atcoder } from "./atcoder.js";
import { Codeforces } from "./codeforces.js";
import { Vnoj } from "./vnoj.js";
import { Exception } from "../error_handler/error.js";
import { saveCookie } from "../config/load_config.js";

class Crawler {
  constructor() {
    /**
     * register problem data
     * @type {Map<string, {Site Class}>}
     */
    this.map = new Map();
    this.addSite(new Atcoder());
    this.addSite(new Codeforces());
    this.addSite(new Vnoj());
  }
  /**
   * return the letter indicating the order of the problem
   * in most online judge (A, B, C, A1, D1, ZZ, EE)
   * IN LOWER CASE
   * @param {String} problem name (D - bonfire)
   */
  static getProblemShortName(name) {
    const match = name.match(/([a-zA-Z0-9])+/);
    return (match ? match[0] : "").toLowerCase();
  }
  /**
   * get problem data with url
   *
   * @param {String} url
   * @returns {Promise <ProblemData>}>} problem data with testcases and status code
   */
  getProblemFromUrl(url) {
    for (const site of this.map.values()) {
      if (url.startsWith(site.baseUrl)) {
        return site.getProblemFromUrl(url);
      }
    }
    return new Promise.reject(Exception.unsupportedUrl(url));
  }
  /**
   * login to a site by open browser and login
   * @param {String} url can be site baseUrl or site loginUrl
   */
  async login(url) {
    for (const site of this.map.values()) {
      if ((site.loginUrl.startsWith(url) || site.name.startsWith(url)) && typeof site.login === 'function') {
        try {
          const cookies = await site.login();
          saveCookie(site.name, cookies);
        }
        catch (err) {
          throw err;
        }
        return site.baseUrl;
      }
    }
    throw Exception.unsupportedUrl(url);
  }
  /**
   * register crawler
   * @param {Site} site, a class containing the crawler from a site
   */
  addSite(site) {
    this.map.set(site.name, site);
  }
}
export { Crawler };
export default {
  Crawler
};
