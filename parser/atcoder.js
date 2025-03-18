const cheerio = require('cheerio');
const { get_html_data } = require('./fetcher');
const { ProblemData, TestCase } = require('./types');

const atcoder_sample_input_regex = /^Sample Input [0-9]+$/;
const atcoder_sample_output_regex = /^Sample Output [0-9]+$/;
const atcoder_tl_ml_regex = /Time Limit:\s*(\d+).*\/\s*Memory Limit:\s*(\d+)/;

class Atcoder {
  constructor() {
    this.name = "Atcoder";
  }
  /** 
   * create a full url to task (https://atcoder.jp/contests/abc397/tasks/abc397_e)
   * 
   * @param {String} contest_id 
   * @param {String} task_id 
   */
  convert_to_url(contest_id, task_id) {
    return `https://atcoder.jp/contests/${contest_id}/tasks/${task_id}`;
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
      $('.lang-en').find('.part').filter((_, el) => {
        let name = $(el).find('h3').text();
        if (atcoder_sample_input_regex.test(name)) {
          current_test.input = $(el).find('pre').text();
        } else if (atcoder_sample_output_regex.test(name)) {
          current_test.output = $(el).find('pre').text();
          test_data.addTestCase(current_test);
          current_test = new TestCase();
        }
      });
    
      const tl_ml = $('#task-statement').prev().text();
      const [, timeLimit, memoryLimit] = tl_ml.match(atcoder_tl_ml_regex);
      test_data.timeLimit = parseInt(timeLimit);
      test_data.memoryLimit = parseInt(memoryLimit);
    
      const name = $('#contest-nav-tabs').next().find('span').contents().first().text();
      test_data.name = name;
      
      return test_data;
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

module.exports = { Atcoder };