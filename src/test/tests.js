import { TestCase } from "./testcase.js";
import { Crawler } from "../parser/crawler.js";
import { Creator } from "../file_creator/creator.js";
const test1 = (site, contest_id, problem_id) => {
    const crawler = new Crawler();
    crawler.getProblem(site, contest_id, problem_id)
        .then(item => {
        const tests = item["testcase"].testCases;
        tests.forEach(test => {
            console.log(typeof test.output);
            TestCase.extractToken(test.output).forEach(token => console.log(token.log()));
        });
    })
        .catch(err => console.log(err));
};
const test2 = () => {
    // 3.0000 vs 3.0001 ? => wrong
    let output1 = "5\n6 11 abc 3.00000000000001";
    let output2 = "5 6 11 abc 3.00000000000000";
    return TestCase.checkOutput(output1, output2);
};
// test1('atcoder', 'arc195', 'arc195_c');
// console.log(test2());
const test3 = () => {
    const dir = `${__dirname}/../../src`;
    console.log(dir);
    console.log(TestCase.getTestCasesFromDirectory(dir));
};
// test3()
const test4 = async () => {
    // const crawler = new Crawler();
    // const problemData = await crawler.getProblem('atcoder', 'arc195', 'arc195_c');
    const dir = `${__dirname}/../../testdir/`;
    // await Creator.generateTestFile(dir, problemData["testcase"]);
    console.log(TestCase.getTestCasesFromDirectory(`${dir}/c.cpp`));
};
// test4();
const test5 = async () => {
    // const crawler = new Crawler();
    // const problemData = await crawler.getProblem('codeforces', '2091', 'f');
    const dir = `${__dirname}/../../testdir/c_2.cpp`;
    // await Creator.generateTestFileWithFilePath(dir, problemData["testcase"]);
    console.log(TestCase.getTestCasesFromDirectory(`${dir}`));
};
test5();
