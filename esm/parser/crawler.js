import { Atcoder } from "./atcoder.js";
import { Codeforces } from "./codeforces.js";
import utils from "./utils.js";
import { Exception } from "../error_handler/error.js";
import { login } from "./fetcher.js";
import { saveCookie } from "../config/load_config.js";
const { wrapper } = utils;
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
     * IN LOWER CASE
     * @param {String} problem name (D - bonfire)
     */
    static getProblemShortName(name) {
        const match = name.match(/([a-zA-Z0-9])+/);
        return (match ? match[0] : "").toLowerCase();
    }
    /**
     * get problem data with url
     *
     * @param {String} url
     * @returns {Promise <ProblemData>}>} problem data with testcases and status code
     */
    getProblemFromUrl(url) {
        for (const site of this.map.values()) {
            if (url.startsWith(site.baseUrl)) {
                return site.getProblemFromUrl(url);
            }
        }
        return new Promise.reject(Exception.unsupportedUrl(url));
    }
    /**
     * login to a site by open browser and login
     * @param {String} url can be site baseUrl or site loginUrl
     */
    async login(url) {
        for (const site of this.map.values()) {
            if (url.startsWith(site.baseUrl) && site.loginUrl) {
                try {
                    const cookies = await login(site.loginUrl);
                    saveCookie(site.name, cookies);
                }
                catch (err) {
                    throw err;
                }
                return;
            }
        }
        throw Exception.unsupportedUrl(url);
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
            this.map
                .get(site)
                .getProblem(contest_id, problem_id)
                .then((item) => resolve(wrapper(SUCCESS, item)))
                .catch((err) => reject(err));
        });
    }
}
export { Crawler };
export default {
    Crawler
};
