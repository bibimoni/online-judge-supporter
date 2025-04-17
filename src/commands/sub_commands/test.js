const { Logger } = require('../logger');
const { Compiler } = require('../../compiler/compiler');
const path = process.cwd();
const { TestCase } = require('../../test/testcase');
const { Exception } = require('../../error_handler/error');
const { Verdict } = require('../../test/verdict');

const testCommand = (program) =>  {
  program
    .command('test')
    .description('Test source file with testcases')
    .alias('t')
    .argument('<filename>', 'Name of the source code (a.rs, b.cpp, c.py, ...)') 
    .option('-t, --test <index>', 'test index (starts from 1)')
    .action((fileName, options) => {
      const filePath = `${path}/${fileName}`;
      const testIndex = options.test;
      let testEntry = undefined;
      if (testIndex) {
        testEntry = (parseInt(testIndex) - 1).toString();
      }
      try {
        const compiler = new Compiler({ filePath: filePath });
        compiler.buildFile();
        const testcases = TestCase.getTestCasesFromDirectory(filePath);
        if (Object.keys(testcases).length === 0) {
          Logger.logErrorSpinner(Exception.noTestAvailable(fileName).message);
          return;
        } if (testEntry && !testcases[testEntry]) {
          Logger.logErrorSpinner(Exception.testFileNotFound(fileName, testIndex).message);
          return;
        }
      } catch (_) {
        Logger.logVerdict(Verdict.CE);
      }
    });
};

module.exports = { testCommand };