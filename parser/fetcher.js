const axios = require('axios');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

// fetch the html of a page
const getHtmlData = (url) => {
  return new Promise((resolve, reject) => {
    axios.get(url)
      .then(({ data }) => resolve(data))
      .catch(err => reject([err.response?.status, err.response?.headers]));
  })
};

// try to bypass cloudflare, this fetches significantly slower than the axios version
// only use when the axios version doesn't work.
const getHtmlDataBypass = async (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({ headless: "new" });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle2" });
      const html = await page.content();
      await browser.close();
      resolve(html);
    } catch (err) {
      reject(err);
    }
  })
};


module.exports = { getHtmlData, getHtmlDataBypass };
