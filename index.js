const { get_atcoder_samples } = require('./parser/crawler');

get_atcoder_samples('https://atcoder.jp/contests/abc397/tasks/abc397_e')
  .then(item => console.log(item));
