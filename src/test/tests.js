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

test1('atcoder', 'arc195', 'arc195_c');
