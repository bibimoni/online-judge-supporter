const { Atcoder } = require('./atcoder');
const { Codeforces } = require('./codeforces');
const { wrapper, ProblemData } = require('../types');
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
   * @return {Object: {"status", ProblemData}} problem data with testcases and status code
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