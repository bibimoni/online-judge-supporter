import * as cheerio from "cheerio";
import { getHtmlDataWithCookieJar, getHtmlWithRequest } from "./fetcher.js";
import { TestCase } from "../test/testcase.js";
import { ProblemData } from "../test/problem_data.js";
import { Exception } from "../error_handler/error.js";
import { connect } from "puppeteer-real-browser";
import { timeoutDuration } from "../config/load_config.js";

const vnoj_sample_input_regex = /^Sample Input [0-9]+/;
const vnoj_sample_output_regex = /^Sample Output [0-9]+/;

const SUCCESS = 200;
class Vnoj {
  constructor() {
    this.name = "vnoj";
    this.baseUrl = "https://oj.vnoi.info";
    this.homePage = "https://oj.vnoi.info/user";
    this.loginUrl = "https://oj.vnoi.info/accounts/login/";
  }
  /**
   * create a full url to task (https://atcoder.jp/contests/abc397/tasks/abc397_e)
   *
   * @param {String} contest_id
   * @param {String} task_id
   */
  convertToUrl(task_id) {
    return `${this.baseUrl}/problem/${task_id}`;
  }
  getProblem(task_id) {
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
      let current_test = new TestCase();

      $("h4")
        .filter((_, el) => {
          let name = $(el).text();
          if (vnoj_sample_input_regex.test(name)) {
            current_test.input = $(el).next().text();
          } else if (vnoj_sample_output_regex.test(name)) {
            current_test.output = $(el).next().text();
            test_data.addTestCase(current_test);
            current_test = new TestCase();
          }
        });

      test_data.url = url;
      /*
        * missing memory limit, time limit and name
        */
      return test_data;
    };
    return new Promise((resolve, reject) => {
      this.getHtmlWithLogin(url)
        .then(call_back)
        .then((obj) => {
          obj.url = url;
          resolve(obj);
        })
        .catch((err) => reject(err));
    });
  }
  async getHtmlWithLogin(url) {
    let res;
    try {
      // res = await getHtmlDataWithCookieJar(this.name, url, this.baseUrl);
      res = await getHtmlWithRequest(this.name, url, this.baseUrl);
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
        res = await page.waitForNavigation({ timeout: timeoutDuration });
      } catch (err) {
        browser.close();
        throw err;
      }
      if (res.url() !== this.homePage) {
        await browser.close();
        throw Exception.loginFailed(this.homePage);
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
export { Vnoj };
export default {
  Vnoj
};
