const { Atcoder } = require('./atcoder');
const { ProblemData } = require('./types');

class Crawler {
  constructor() {
    /**
    * register problem data
    * @type {Map<string, {Site Class}>}
    */
    this.map = new Map();
    this.map.set('atcoder', new Atcoder());
  }

  /**
   * @param {String} site 
   * @param {String} contest_id 
   * @param {String} problem_id 
   * @return {ProblemData} problem data with testcases
   */
  get_problem(site, contest_id, problem_id) {
    return new Promise((resolve, reject) => {
      this.map.get(site).get_problem(contest_id, problem_id)
        .then(item => resolve(item))
        .catch(err => reject(err));
    });
  }
}

module.exports = { Crawler };