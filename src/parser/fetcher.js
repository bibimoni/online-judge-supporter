const axios = require("axios");
const puppeteer = require("puppeteer-extra");
const { wrapperRes } = require("./utils");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { loadCookieJar } = require("../config/load_config");
const SUCCESS = 200;
const timeoutDuration = 100 * 1000;
const { wrapper } = require('axios-cookiejar-support');
const { connect } = require('puppeteer-real-browser');

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
      const browser = await puppeteer.launch({ headless: "new" });
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
      } else {
        reject(wrapperRes(wrongRequestStatus));
      }
    } catch (err) {
      reject(wrapperRes(err.response?.status));
    }
  });
};

const login = async (loginUrl) => {
  try {
    const { page, browser } = await connect({
      headless: false,
    });
    await page.goto(loginUrl, { waitUntil: 'networkidle2' });
    await page.waitForNavigation({timeout: timeoutDuration });
    const cookies = await browser.cookies();
    await browser.close();
    return cookies;
  } catch (error) {
    throw error;
  }
}

/**
 * check if we have cookie for this site
 * @param {String} siteName 
 * @param {String} testUrl check if when open this url, will get redirect or not
 * @returns {Promise<{ status: number, redirected: boolean, location: string|null }>}
 */
const isLoggedIn = async (siteName, testUrl) => {
  let jar;
  try {
    jar = loadCookieJar(siteName);
  } catch (err) {
    throw err;
  }
  const client = wrapper(axios.create({
    maxRedirects: 0,
    jar,
    withCredentials: true
  }));

  try {
    const res = await client.get(testUrl);
    return { status: res.status, redirected: false, location: null };
  } catch(err) {
    if (err.response && err.response.status >= 300 && err.response.status < 400) {
      return {
        status: err.response.status,
        redirected: true,
        location: err.response.headers.location || null
      };
    }
    throw err;
  }
}

const getHtmlDataWithCookieJar = (url, jar) => {
  return new Promise((resolve, reject) => {
    wrapper(axios.create({
      maxRedirects: 0,
      jar,
      withCredentials: true
    }))
      .get(url)
      .then(({ data }) => resolve(data))
      .catch((err) => reject(wrapperRes(err.response?.status)));
  });
}

module.exports = { 
  getHtmlData, 
  getHtmlDataBypass, 
  login, 
  isLoggedIn,
  getHtmlDataWithCookieJar
};
