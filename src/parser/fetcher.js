const axios = require('axios');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { wrapper } = require('../types');
const SUCCESS = 200;

puppeteer.use(StealthPlugin());

// fetch the html of a page
const getHtmlData = (url) => {
  return new Promise((resolve, reject) => {
    axios.get(url)
      .then(({ data }) => resolve(data))
      .catch(err => reject(wrapper(err.response?.status)));
  })
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
      let request_ok = response.request().redirectChain().reduce((acc, res) => {
        if (res.response().status() != SUCCESS) {
          wrongRequestStatus = res.response().status();
        }
        return res.response().status() & acc;
      }, true);

      if (request_ok) {
        resolve(html);
      } else {
        reject(wrapper(wrongRequestStatus));
      }
    } catch (err) {
      reject(wrapper(err.response?.status));
    }
  })
};


module.exports = { getHtmlData, getHtmlDataBypass };
