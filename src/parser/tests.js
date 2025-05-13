import { Atcoder } from "./atcoder.js";
const atcoder = new Atcoder();
const test1 = async () => {
    await atcoder.login('https://atcoder.jp/login');
};
// test1();
const test2 = async (url) => {
    const res = await atcoder.getHtmlWithLogin(url);
};
test2('https://atcoder.jp/contests/agc001/tasks/agc001_a');
