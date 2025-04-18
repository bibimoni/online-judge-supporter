const cheerio = require('cheerio');
const { getHtmlDataBypass } = require('./fetcher');
const { TestCase } = require('../test/testcase');
const { ProblemData } = require('../test/problem_data');
const codeforces_tl_ml_regex = /(\d+\.\d+|\d+)/;

class Codeforces {
  constructor() {
    this.name = "codeforces";
    this.baseUrl = "https://codeforces.com";
  }

  /** 
   * create a full url to task (https://codeforces.com/contest/2075/problem/A)
   * 
   * @param {String} contest_id 
   * @param {String} task_id 
   */
  convertToUrl(contest_id, task_id) {
    return `https://codeforces.com/contest/${contest_id}/problem/${task_id}`;
  }

  getProblem(contest_id, task_id) {
    return this.getProblemFromUrl(this.convertToUrl(contest_id, task_id));
  }

  /**
  * fetching problem date from url, including testcases
  * 
  * @param {String} problem_url
  * @return {ProblemData} problem_data with testcases
  */
  getProblemFromUrl(url) {
    const call_back = (html) => {
      const $ = cheerio.load(html);
      let test_data = new ProblemData();

      test_data.name = $('.title').contents().first().text();

      test_data.timeLimit = parseFloat($('.time-limit').contents().filter(function () {
        return this.type == 'text';
      })
        .text().trim().match(codeforces_tl_ml_regex)[0]);

      test_data.memoryLimit = parseFloat($('.memory-limit').contents().filter(function () {
        return this.type == 'text';
      })
        .text().trim().match(codeforces_tl_ml_regex)[0]);

      $('.sample-test').each((_, test) => {
        $(test).find('.input pre').each((_, input) => {
          let test = new TestCase();
          let small_unit_tests = [];
          let current_input = "";

          if ($(input).children().length) {
            let multi_test = false;
            let previousLineState = "test-example-line-odd" // the first subtest class is odd
            let currentMultiInput = "";
            $(input).children().each((_, single_test) => {
              current_input += $(single_test).text() + '\n';
              if (!multi_test) {
                multi_test = true;
              } else {
                const currentLineState = $(single_test).attr('class').split(' ')[1];
                if (currentLineState != previousLineState) {
                  small_unit_tests.push(new TestCase({ input: currentMultiInput }));
                  previousLineState = currentLineState;
                  currentMultiInput = $(single_test).text() + '\n';
                } else {
                  currentMultiInput += $(single_test).text() + '\n';
                }
              }
            });
            if (currentMultiInput.length > 0) {
              small_unit_tests.push(new TestCase({ input: currentMultiInput }));
            }
          } else {
            current_input = $(input).text();
          }
          test.input = current_input;
          small_unit_tests.forEach((small_test) => test.addMultiTestCase(small_test));
          test_data.addTestCase(test);
        });

        $(test).find('.output pre').each((index, output) => {
          test_data.editOutput(index, $(output).text());
        });
      });

      return test_data;
    };
    return new Promise((resolve, reject) => {
      getHtmlDataBypass(url)
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
