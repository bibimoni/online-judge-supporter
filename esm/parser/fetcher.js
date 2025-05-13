import * as axios from "axios";
import puppeteer from "puppeteer-extra";
import { wrapperRes } from "./utils.js";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { loadCookieJar } from "../config/load_config.js";
import { connect } from "puppeteer-real-browser";
import { Exception } from "../error_handler/error.js";
const SUCCESS = 200;
const timeoutDuration = 100 * 1000;

puppeteer.use(StealthPlugin());

// fetch the html of a page
const getHtmlData = (url) => {
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then(({ data }) => resolve(data))
      .catch((err) => reject(wrapperRes(err.response?.status)));
  });
};
// try to bypass cloudflare, this fetches significantly slower than the axios version
// only use when the axios version doesn't work.
const getHtmlDataBypass = async (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      const response = await page.goto(url, { waitUntil: "networkidle2" });
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
        reject(wrapperRes(wrongRequestStatus));
      }
    }
    catch (err) {
      reject(wrapperRes(err.response?.status));
    }
  });
};
const login = async (loginUrl, homePage) => {
  try {
    const { page, browser } = await connect({
      headless: false,
    });
    await page.goto(loginUrl, { waitUntil: 'networkidle2' });
    const res = await page.waitForNavigation({ timeout: timeoutDuration });
    if (res.url() !== homePage) {
      await browser.close();
      throw Exception.loginFailed(homePage);
    }
    const cookies = await browser.cookies();
    await browser.close();
    return cookies;
  }
  catch (error) {
    throw error;
  }
};
/**
 * getHtml with puppeteer using cookie
 *
 * @param {String} url
 * @param {CookieJar} jar
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
        resolve({ status: res.status, content: html });
      }
      else {
        reject(wrapperRes(wrongRequestStatus));
      }
    }
    catch (err) {
      reject(wrapperRes(err.response?.status));
    }
  });
};

export { getHtmlData };
export { getHtmlDataBypass };
export { login };
export { getHtmlDataWithCookieJar };
export default {
  getHtmlData,
  getHtmlDataBypass,
  login,
  getHtmlDataWithCookieJar
};
