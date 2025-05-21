import * as cheerio from "cheerio";
import { getHtmlData, getHtmlDataBypass, getHtmlDataWithCookieJar, getHtmlWithRequest } from "./fetcher.js";
import { TestCase } from "../test/testcase.js";
import { ProblemData } from "../test/problem_data.js";
import { connect } from "puppeteer-real-browser";
import { Exception } from "../error_handler/error.js";
import { timeoutDuration } from "../config/load_config.js";

const codeforces_tl_ml_regex = /(\d+\.\d+|\d+)/;
const SUCCESS = 200;

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
          if ($(input).children().length) {
            let multi_test = false;
            let previousLineState = "test-example-line-odd"; // the first subtest class is odd
            let currentMultiInput = "";
            $(input).children().each((_, single_test) => {
              current_input += $(single_test).text() + '\n';
              if (!multi_test) {
                multi_test = true;
              }
              else {
                const currentLineState = $(single_test).attr('class').split(' ')[1];
                if (currentLineState != previousLineState) {
                  small_unit_tests.push(new TestCase({ input: currentMultiInput }));
                  previousLineState = currentLineState;
                  currentMultiInput = $(single_test).text() + '\n';
                }
                else {
                  currentMultiInput += $(single_test).text() + '\n';
                }
              }
            });
            if (currentMultiInput.length > 0) {
              small_unit_tests.push(new TestCase({ input: currentMultiInput }));
            }
          }
          else {
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
      // getHtmlDataBypass(url)
      this.getHtmlWithLogin(url)
        // getHtmlData(url)
        .then(call_back)
        .then(obj => {
          obj.url = url;
          resolve(obj);
        })
        .catch(err => reject(err));
    });
  }
  async getHtmlWithLogin(url) {
    let res;
    try {
      // res = await getHtmlDataWithCookieJar(this.name, url, this.baseUrl);
      res = await getHtmlWithRequest(this.name, url);
    } catch (err) {
      throw Exception.notLoggedIn(this.baseUrl);
    }
    if (res.status !== SUCCESS) {
      throw Exception.notLoggedIn(this.baseUrl);
    }
    return res.content;
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
