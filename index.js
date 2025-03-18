const { Crawler } = require('./parser/crawler');

const crawler = new Crawler();

crawler.get_problem('atcoder', 'abc397', 'abc397_e')
  .then(item => console.log(item))
  .catch(err => console.log(err));
