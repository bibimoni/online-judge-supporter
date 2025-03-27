const fs = require('fs');
const { Crawler } = require('../parser/crawler');
const { json } = require('stream/consumers');
const crawler = new Crawler();
class Creator {
  constructor() {
    this.name = "creator";
  }
  createContest() {
    var text;
    let ans = crawler.getProblem('codeforces', '1321', 'C').then(
      function() {
        
        //return item;
        return new Promise((resolve, reject) => {
          resolve(ans);
        }
        );
      }
    );
    text = ans;
    text = JSON.parse(text);
    return text;
  }
}
module.exports = { Creator };