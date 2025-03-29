const { TestCase } = require('./testcase');
const { Crawler } = require('../parser/crawler');

const test1 = (site, contest_id, problem_id) => {
  const crawler = new Crawler();

  crawler.getProblem(site, contest_id, problem_id)
    .then(item => {
      const tests = item["testcase"].testCases;
      tests.forEach(test => {
        console.log(typeof test.output);
        TestCase.extractToken(test.output).forEach(token => console.log(token.log()));
      })
    })
    .catch(err => console.log(err));
};

const test2 = () => {
  // 3.0000 vs 3.0001 ? => wrong
  let output1 = "5 6 11 abc 3.00000000000001"; 
  let output2 = "5 6 11 abc 3.00000000000000"; 
  
  return TestCase.checkOutput(output1, output2);
};

// test1('atcoder', 'arc195', 'arc195_c');
console.log(test2());
