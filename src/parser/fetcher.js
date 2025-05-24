import axios from "axios";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { loadCookieJar, timeoutDuration } from "../config/load_config.js";
import { Exception } from "../error_handler/error.js";
import { gotScraping } from "got-scraping"

const SUCCESS = 200;

puppeteer.use(StealthPlugin());

// fetch the html of a page
const getHtmlData = (url) => {
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then(({ data }) => resolve(data))
      .catch((err) => reject(err));
  });
};

// try to bypass cloudflare, this fetches significantly slower than the axios version
// only use when the axios version doesn't work.
const getHtmlDataBypass = async (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      const response = await page.goto(url, { waitUntil: "networkidle2", timeout: timeoutDuration });
      const html = await page.content();
      await browser.close();
      let wrongRequestStatus;
      let request_ok = response
        .request()
        .redirectChain()
        .reduce((acc, res) => {
          if (res.response().status() != SUCCESS) {
            wrongRequestStatus = res.response().status();
          }
          return res.response().status() & acc;
        }, true);
      if (request_ok) {
        resolve(html);
      }
      else {
        reject(Exception.canNotFetchData(url));
      }
    }
    catch (err) {
      reject(err);
    }
  });
};
/**
 * getHtml with puppeteer using cookie
 *
 * @param {String} url (atcoder, codeforces) ?
 * @param {String} testUrl (to check if user login)
 * @param {String} jar Url of cookie jar 
 * @returns Axios Responses
 */
const getHtmlDataWithCookieJar = async (siteName, testUrl, cookieUrl) => {
  let jar;
  try {
    jar = loadCookieJar(siteName);
  }
  catch (err) {
    throw err;
  }

  return new Promise(async (resolve, reject) => {
    try {
      let browser = await puppeteer.launch({ headless: false });
      const toughCookies = await jar.getCookies(cookieUrl);
      const ppCookies = toughCookies.map(c => ({
        name: c.key,
        value: c.value,
        domain: c.domain,
        path: c.path,
        expires: c.expires instanceof Date ? c.expires.getTime() / 1000 : -1,
        httpOnly: c.httpOnly,
        secure: c.secure,
        sameSite: c.sameSite === 'strict' ? 'Strict' : 'Lax'
      }));
      // Sets cookie in the default context
      const page = await browser.newPage();
      await page.setCookie(...ppCookies);
      const response = await page.goto(testUrl, { waitUntil: "networkidle2" });
      const html = await page.content();
      await browser.close();
      let wrongRequestStatus;
      let request_ok = response
        .request()
        .redirectChain()
        .reduce((acc, res) => {
          if (res.response().status() != SUCCESS) {
            wrongRequestStatus = res.response().status();
          }
          return res.response().status() & acc;
        }, true);
      if (request_ok) {
        resolve({ status: SUCCESS, content: html });
      }
      else {
        reject(Exception.canNotFetchData(testUrl));
      }
    }
    catch (err) {
      reject(err);
    }
  });
};

const getHtmlWithRequest = async (siteName, url, cookieUrl) => {
  let jar;
  try {
    jar = loadCookieJar(siteName);
  }
  catch (err) {
    throw err;
  }

  return new Promise(async (resolve, reject) => {
    try {
      const res = await gotScraping({
        url,
        cookieJar: jar,
        followRedirect: false
      });
      if (res.statusCode >= 300) {
        reject(Exception.canNotFetchData(url));
      }
      resolve({ status: SUCCESS, content: res.body });
    }
    catch (err) {
      reject(err);
    }
  });
}

const getHtmlWithLogin = async (url, site) => {
  let res;
  try {
    res = await getHtmlWithRequest(site.name, url);
  } catch (err) {
    throw Exception.notLoggedIn(site.baseUrl);
  }
  if (res.status !== SUCCESS) {
    throw Exception.notLoggedIn(site.baseUrl);
  }
  return res.content;
}

export { getHtmlWithLogin };
export { getHtmlWithRequest };
export { getHtmlData };
export { getHtmlDataBypass };
export { getHtmlDataWithCookieJar };
export default {
  getHtmlWithLogin,
  getHtmlData,
  getHtmlDataBypass,
  getHtmlDataWithCookieJar,
  getHtmlWithRequest
};
