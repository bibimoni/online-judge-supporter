const { Atcoder } = require("./atcoder");
const { Codeforces } = require("./codeforces");
const { wrapper } = require("./utils.js");
const { Exception } = require("../error_handler/error");
const SUCCESS = 200;

class Crawler {
  constructor() {
    /**
     * register problem data
     * @type {Map<string, {Site Class}>}
     */
    this.map = new Map();
    this.addSite(new Atcoder());
    this.addSite(new Codeforces());
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
   * register crawler
   * @param {Site} site, a class containing the crawler from a site
   */
  addSite(site) {
    this.map.set(site.name, site);
  }

  /**
   * @param {String} site
   * @param {String} contest_id
   * @param {String} problem_id
   * @return {Object: { "status", "testcase" }} problem data with testcases and status code
   */
  getProblem(site, contest_id, problem_id) {
    return new Promise((resolve, reject) => {
      this.map
        .get(site)
        .getProblem(contest_id, problem_id)
        .then((item) => resolve(wrapper(SUCCESS, item)))
        .catch((err) => reject(err));
    });
  }
}

module.exports = { Crawler };
