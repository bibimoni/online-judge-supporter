import { Atcoder } from "./atcoder.js";
import { Vnoj } from "./vnoj.js";
const atcoder = new Atcoder();
const test1 = async () => {
  await atcoder.login('https://atcoder.jp/login');
};
// test1();
const test2 = async (url) => {
  // const res = await atcoder.getHtmlWithLogin(url);
  const res = await atcoder.getProblemFromUrl(url);
  console.log(res);
};
test2('https://atcoder.jp/contests/agc001/tasks/agc001_a');
const test3 = async (url) => {
  const vnoj = new Vnoj();
  await vnoj.getProblemFromUrl('https://oj.vnoi.info/problem/bedao_m26_a');
}

// test3();
