const cheerio = require('cheerio');
const { get_html_data } = require('./fetcher');
const { ProblemData, TestCase } = require('./types');

class Codeforces {
  constructor() {
    this.name = "Codeforces";
  }
  /** 
   * create a full url to task (https://codeforces.com/contest/2075/problem/A)
   * 
   * @param {String} contest_id 
   * @param {String} task_id 
   */
  convert_to_url(contest_id, task_id) {
    return `https://codeforces.com/contest/${contest_id}/problem/${task_id}`;
  }

  get_problem(contest_id, task_id) {
    return this.get_problem_from_url(this.convert_to_url(contest_id, task_id));
  }

  /**
  * fetching problem date from url, including testcases
  * 
  * @param {String} problem_url
  * @return {ProblemData} problem_data with testcases
  */
  get_problem_from_url(url) {
    const call_back = (html) => {
      const $ = cheerio.load(html);
    
      let test_data = new ProblemData();
      let current_test = new TestCase();
      
    };
    return new Promise((resolve, reject) => {
      get_html_data(url)
      .then(call_back)
      .then(obj => {
          obj.url = url;
          resolve(obj);
        })
        .catch(err => reject(err));
    });
  }
}

module.exports = { Codeforces };