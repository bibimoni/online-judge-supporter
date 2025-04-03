const { Atcoder } = require('./atcoder');
const { Codeforces } = require('./codeforces');
const { wrapper } = require('./utils.js');
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
   * @param {String} problem name (D - bonfire)
   */
  static getProblemShortName(name) {
    const match = name.match(/([a-zA-Z0-9])+/);
    return match ? match[0] : "";
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
      this.map.get(site).getProblem(contest_id, problem_id)
        .then(item => resolve(wrapper(SUCCESS, item)))
        .catch(err => reject(err));
    });
  }
}

module.exports = { Crawler };
