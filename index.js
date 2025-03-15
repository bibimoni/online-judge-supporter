const { get_data } = require('./parser/crawler');

get_data('https://atcoder.jp/contests/abc397/tasks/abc397_e')
  .then(item => console.log(item));