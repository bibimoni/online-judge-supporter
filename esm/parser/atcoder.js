import * as cheerio from "cheerio";
import { isLoggedIn, getHtmlDataWithCookieJar } from "./fetcher.js";
import { TestCase } from "../test/testcase.js";
import { ProblemData } from "../test/problem_data.js";
import { loadCookieJar } from "../config/load_config.js";
import { Exception } from "../error_handler/error.js";
const SUCCESS = 200;
const atcoder_sample_input_regex = /^Sample Input [0-9]+$/;
const atcoder_sample_output_regex = /^Sample Output [0-9]+$/;
const atcoder_tl_ml_regex = /\s*Time Limit:\s*([\d.]+)\s*sec\s*\/\s*Memory Limit:\s*(\d+)/;
class Atcoder {
    constructor() {
        this.name = "atcoder";
        this.baseUrl = "https://atcoder.jp";
        this.loginUrl = "https://atcoder.jp/login";
    }
    /**
     * create a full url to task (https://atcoder.jp/contests/abc397/tasks/abc397_e)
     *
     * @param {String} contest_id
     * @param {String} task_id
     */
    convertToUrl(contest_id, task_id) {
        return `https://atcoder.jp/contests/${contest_id}/tasks/${task_id}`;
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
            let current_test = new TestCase();
            $(".lang-en")
                .find(".part")
                .filter((_, el) => {
                let name = $(el).find("h3").text();
                if (atcoder_sample_input_regex.test(name)) {
                    current_test.input = $(el).find("pre").text();
                }
                else if (atcoder_sample_output_regex.test(name)) {
                    current_test.output = $(el).find("pre").text();
                    test_data.addTestCase(current_test);
                    current_test = new TestCase();
                }
            });
            const tl_ml = $("#task-statement")
                .prev()
                .text()
                .replace(/[\t\n]/g, "");
            const [, timeLimit, memoryLimit] = tl_ml.match(atcoder_tl_ml_regex);
            test_data.timeLimit = parseFloat(timeLimit);
            test_data.memoryLimit = parseInt(memoryLimit);
            const name = $("#contest-nav-tabs")
                .next()
                .find("span")
                .contents()
                .first()
                .text();
            test_data.name = name.replace(/[\t\n]/g, "");
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
            res = await isLoggedIn(this.name, url);
        }
        catch (err) {
            throw Exception.notLoggedIn(this.baseUrl);
        }
        if (res.status !== SUCCESS || res.redirected) {
            throw Exception.notLoggedIn(this.baseUrl);
        }
        const jar = loadCookieJar(this.name);
        return getHtmlDataWithCookieJar(url, jar);
    }
}
export { Atcoder };
export default {
    Atcoder
};
