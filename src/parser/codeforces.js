import * as cheerio from "cheerio";
import { getHtmlWithLogin } from "./fetcher.js";
import { TestCase } from "../test/testcase.js";
import { ProblemData } from "../test/problem_data.js";
import { connect } from "puppeteer-real-browser";
import { Exception } from "../error_handler/error.js";
import { timeoutDuration } from "../config/load_config.js";

const codeforces_tl_ml_regex = /(\d+\.\d+|\d+)/;

class Codeforces {
  constructor() {
    this.name = "codeforces";
    this.baseUrl = "https://codeforces.com";
    this.homePage = "https://codeforces.com/";
    this.loginUrl = "https://codeforces.com/enter";
    this.submitLoginButton = ".submit"; // class name of the submit button
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
  /**
   * read the text of an input/output block of a sample. Codeforces uses three
   * markups for the same thing and `.text()` gets all of them wrong:
   *   - one div per line (`test-example-line`): glued, "1","2","10" -> "1210"
   *   - one line with <br> between the lines: glued, "3 7<br>2 1" -> "3 72 1"
   *   - plain text: already has its newlines, return it as is
   *
   * @param {cheerio.CheerioAPI} $ the loaded document, not a module global
   * @param {cheerio.Cheerio} pre the pre element of the sample
   * @returns {String}
   */
  static readSampleText($, pre) {
    const lineElements = pre
      .children()
      .filter((_, child) => child.tagName !== 'br');
    // div per line
    if (lineElements.length > 0) {
      const lines = [];
      lineElements.each((_, line) => lines.push($(line).text()));
      return lines.join("\n");
    }
    // plain text, but <br> is a line break that text() drops
    const lines = [];
    pre.contents().each((_, node) => {
      lines.push(node.type === 'tag' && node.tagName === 'br' ? "\n" : $(node).text());
    });
    return lines.join("");
  }
  /**
   * the odd/even class codeforces puts on a sample line, which tells where one
   * subtest of a multitest sample ends and the next begins
   *
   * @param {cheerio.Cheerio} line
   * @returns {String|null} the class, or null when the line has none
   */
  static lineState(line) {
    const className = line.attr('class');
    if (!className) {
      return null;
    }
    const state = className.split(' ')[1];
    return state ? state : null;
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
      test_data.timeLimit = parseFloat($('.time-limit').contents().filter(function() {
        return this.type == 'text';
      })
        .text().trim().match(codeforces_tl_ml_regex)[0]);
      test_data.memoryLimit = parseFloat($('.memory-limit').contents().filter(function() {
        return this.type == 'text';
      })
        .text().trim().match(codeforces_tl_ml_regex)[0]);
      $('.sample-test').each((_, test) => {
        $(test).find('.input pre').each((_, input) => {
          let test = new TestCase();
          let small_unit_tests = [];
          let current_input = "";
          // only a div per line can be split into subtests, a sample written
          // with <br> or plain text has no line elements to tell them apart
          const lineElements = $(input)
            .children()
            .filter((_, child) => child.tagName !== 'br');
          if (lineElements.length > 1) {
            let previousLineState = "test-example-line-odd"; // the first subtest class is odd
            let currentMultiInput = "";
            lineElements.each((_, single_test) => {
              const line = $(single_test).text();
              current_input += line + '\n';
              // a line without the class belongs to the current subtest
              const currentLineState = Codeforces.lineState($(single_test));
              if (currentLineState !== null && currentLineState != previousLineState) {
                small_unit_tests.push(new TestCase({ input: currentMultiInput }));
                previousLineState = currentLineState;
                currentMultiInput = line + '\n';
              }
              else {
                currentMultiInput += line + '\n';
              }
            });
            if (currentMultiInput.length > 0) {
              small_unit_tests.push(new TestCase({ input: currentMultiInput }));
            }
          }
          else {
            current_input = Codeforces.readSampleText($, $(input));
          }
          test.input = current_input;
          small_unit_tests.forEach((small_test) => test.addMultiTestCase(small_test));
          test_data.addTestCase(test);
        });
        $(test).find('.output pre').each((index, output) => {
          test_data.editOutput(index, Codeforces.readSampleText($, $(output)));
        });
      });
      return test_data;
    };
    return new Promise((resolve, reject) => {
      getHtmlWithLogin(url, this)
        .then(call_back)
        .then(obj => {
          obj.url = url;
          resolve(obj);
        })
        .catch(err => reject(err));
    });
  }

  async login() {
    try {
      const { page, browser } = await connect({
        headless: false,
      });
      let res;
      try {
        await page.goto(this.loginUrl, { waitUntil: 'networkidle2' });
        await page.waitForNavigation({ timeout: timeoutDuration }); // move out of Cloudflare
        await page.waitForNavigation({ timeout: timeoutDuration }); // wait... checkforbrowser
        await page.goto(this.loginUrl, { waitUntil: 'networkidle2' });
        await page.waitForSelector(this.submitLoginButton, { timeout: timeoutDuration });
        res = await page.waitForNavigation({ timeout: timeoutDuration });
      } catch (err) {
        throw err;
      }
      if (res.url() !== this.homePage) {
        await browser.close();
        throw Exception.loginFailed(res.url());
      }
      const cookies = await browser.cookies();
      await browser.close();
      return cookies;
    }
    catch (error) {
      throw error;
    }
  }
}
export { Codeforces };
export default {
  Codeforces
};
