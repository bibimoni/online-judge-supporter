const { Logger } = require('../logger');
const { Compiler } = require('../../compiler/compiler');
const path = process.cwd();
const { TestCase } = require('../../test/testcase');
const { Exception } = require('../../error_handler/error');
const { Verdict } = require('../../test/verdict');
const { createSpinner } = require('nanospinner');

const startJudging = async (testcase, compiler, { multiTest = false } = {}) => {
  const spinner = createSpinner();
  Logger.logInfoSpinner(`Input file: ${testcase.fileName}`);
  spinner.start({ text: Logger.info(`Running...`) })
  const result = await compiler.runTest(testcase, { multiTest: multiTest });
  if (!multiTest) {
    Logger.logVerdict(result["verdict"], { spinner: spinner });
  } else {
    spinner.stop();
  }

  if (result["verdict"] !== Verdict.AC) {
    Logger.input(testcase.input);
    Logger.output(result["output"]);
    if (!multiTest) {
      Logger.answer(testcase.output);
    }
  }
}

const testCommand = (program) => {
  program
    .command('test')
    .description('Test source file with testcases')
    .alias('t')
    .argument('<filename>', 'Name of the source code (a.rs, b.cpp, c.py, ...)')
    .option('-t, --test <index>', 'test index (starts from 1)')
    .option('-m, --multi_test <index>', 'multiple test index (starts from 1)')
    .action(async (fileName, options) => {
      const filePath = `${path}/${fileName}`;
      const testIndex = options.test;
      let testEntry = null;
      if (testIndex) {
        testEntry = (parseInt(testIndex) - 1).toString();
      }

      const multiTestIndex = options.multi_test;
      let multiTestEntry = null;
      if (multiTestIndex) {
        multiTestEntry = parseInt(multiTestIndex) - 1;
      }

      let testcases;
      let testOne;
      try {
        testcases = TestCase.getTestCasesFromDirectory(filePath);
      } catch (e) {
        Logger.logErrorSpinner(e.message);
        return;
      }
      let compiler;
      try {
        if (Object.keys(testcases).length === 0) {
          Logger.logErrorSpinner(Exception.noTestAvailable(fileName).message);
          return;
        } else if (multiTestEntry === null && testEntry !== null && !testcases[testEntry]) {
          Logger.logErrorSpinner(Exception.testFileNotFound(fileName, testIndex).message);
          return;
        } else if (multiTestEntry !== null && testEntry === null) {
          Logger.logErrorSpinner('Please use -m/--multi_test <index> together with -t/-test <index>');
          return;
        }
        if (testEntry !== null) {
          testOne = testcases[testEntry];
        }
        if (multiTestEntry !== null && !testOne.multiTestCaseAt(multiTestEntry)) {
          Logger.logErrorSpinner(Exception.testFileNotFound(fileName, multiTestIndex));
          return;
        } else if (multiTestEntry !== null && testOne.multiTestCaseAt(multiTestEntry)) {
          const multiTestCase = testOne.multiTestCaseAt(multiTestEntry);
          testOne = {
            input: multiTestCase.input,
            output: multiTestCase.output,
            fileName: testOne.fileName
          }
        }
        compiler = new Compiler({ filePath: filePath });
      } catch (e) {
        Logger.logErrorSpinner(e.message);
        return;
      }

      try {
        compiler.buildFile();
      } catch (_) {
        Logger.logVerdict(Verdict.CE);
        return;
      }
      if (testEntry === null) {
        for (const test of Object.values(testcases)) {
          await startJudging(test, compiler);
        }
      } else {
        await startJudging(testOne, compiler, { multiTest: multiTestEntry !== null });
      }
    });
};

module.exports = { testCommand };