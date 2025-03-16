const axios = require('axios');
const cheerio = require('cheerio');

const atcoder_sample_input_regex = /^Sample Input [0-9]+$/;
const atcoder_sample_output_regex = /^Sample Output [0-9]+$/;
const atcoder_tl_ml_regex = /Time Limit:\s*(\d+).*\/\s*Memory Limit:\s*(\d+)/;

// fetch the html of a page
const get_html_data = (url) => {
  return new Promise((resolve, reject) => {
    axios.get(url)
      .then(({ data }) => resolve(data))
      .catch(err => reject(err));
  })
};

// fetching test case from atcoder
// *html may be a large string, need a way to cache ?*
// 
// param: the url,
// return: { "name": String, "url": String, "memoryLimit": Number, 
//           "timeLimit": Number, "tests": [ {"input": "String", "output: String"} ]}
const get_atcoder_samples = (url) => {  
  const call_back = (html) => {
    const $ = cheerio.load(html);
  
    let test_data = {};
    let current_test = {};
    $('.lang-en').find('.part').filter((_, el) => {
      let name = $(el).find('h3').text();
      if (atcoder_sample_input_regex.test(name)) {
        current_test["input"] = $(el).find('pre').text();
      } else if (atcoder_sample_output_regex.test(name)) {
        current_test["output"] = $(el).find('pre').text();
        test_data["tests"] = test_data["tests"] ?? [];
        test_data["tests"].push(current_test);
        current_test = {};
      }
    });
  
    const tl_ml = $('#task-statement').prev().text();
    const [, timeLimit, memoryLimit] = tl_ml.match(atcoder_tl_ml_regex);
    test_data["timeLimit"] = parseInt(timeLimit);
    test_data["memoryLimit"] = parseInt(memoryLimit);
  
    const name = $('#contest-nav-tabs').next().find('span').contents().first().text();
    test_data["name"] = name;
    
    return test_data;
  };
  return new Promise((resolve, reject) => {
    let test_data = {};
    get_html_data(url)
      .then(call_back)
      .then(obj => {
        test_data = obj
        test_data["url"] = url;
        resolve(test_data);
      })
      .catch(err => reject(err));
  });
}

module.exports = { get_atcoder_samples };