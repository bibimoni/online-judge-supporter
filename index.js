const { Crawler } = require('./parser/crawler');

const crawler = new Crawler();

// crawler.getProblem('atcoder', 'abc320', 'abc320_d')
//   .then(item => console.log(item))
//   .catch(err => console.log(err));

crawler.getProblem('codeforces', '2075', 'A')
  .then(item => console.log(JSON.stringify(item, null, 2)))
  .catch(err => console.log(err));

crawler.getProblem('codeforces', '1321', 'C')
  .then(item => console.log(JSON.stringify(item, null, 2)))
  .catch(err => console.log(err));