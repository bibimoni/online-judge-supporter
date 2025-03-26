const { Crawler } = require('./parser/crawler');
const { generate_test_file } = require('./file_creator/generate_testcase.js');
const crawler = new Crawler();

// crawler.getProblem('codeforces', '3075', 'A')
//   .then(item => console.log(JSON.stringify(item, null, 2)))
//   .catch(err => console.log(err));
//
// crawler.getProblem('codeforces', '1321', 'C')
//   .then(item => console.log(JSON.stringify(item, null, 2)))
//   .catch(err => console.log(err));
const dir = "/Users/distiled/Dev/online-judge-supporter";

crawler.getProblem('atcoder', 'abc398', 'abc398_d')
  .then(item => generate_test_file(dir, item["testcase"]))
  .catch(err => console.log(err));



