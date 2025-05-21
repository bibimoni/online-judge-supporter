import { Logger } from "../logger.js";
import { Compiler } from "../../compiler/compiler.js";
import { TestCase } from "../../test/testcase.js";
import { Exception } from "../../error_handler/error.js";
import { Verdict } from "../../test/verdict.js";
import { createSpinner } from "nanospinner";
import { Creator } from "../../file_creator/creator.js";
import { formatDirPath } from "../../file_creator/utils.js";
const path = process.cwd();
const startJudging = async (testcase, compiler, { multiTest = false } = {}) => {
  const spinner = createSpinner();
  Logger.logInfoSpinner(`Input file: ${testcase.fileName}`);
  spinner.start({ text: Logger.info(`Running...`) });
  const result = await compiler.runTest(testcase, { multiTest: multiTest });
  if (!multiTest) {
    Logger.logVerdict(result["verdict"], { spinner: spinner });
  }
  else {
    spinner.stop();
  }
  if (result["verdict"] !== Verdict.AC) {
    Logger.input(testcase.input);
    Logger.output(result["output"]);
    if (!multiTest) {
      Logger.answer(testcase.output);
    }
  }
};
const startJudgeWithDebug = async (testcase, compiler) => {
  Logger.logInfoSpinner(`Input file: ${testcase.fileName}`);
  await compiler.runTestWithDebug(testcase.input);
};
const addTestCaseManually = (fileName) => {
  Creator.addTestCase(formatDirPath(path), fileName, {
    onBeginInput: () => {
      Logger.logInfoSpinner("Enter Input (press Ctrl + C to exit)");
    },
    onBeginOutput: () => {
      Logger.logInfoSpinner("Enter Expected output (press Ctrl + C to exit)");
    },
    onFileCreate: Logger.logFileSpinner,
    onFolderCreate: Logger.logFolderSpinner,
  });
};
const viewTestCase = (testcase) => {
  Logger.logInfoSpinner(`Testcase ${testcase.fileName}`);
  Logger.input(testcase.input);
  Logger.output(testcase.output);
};
const testCommand = (program) => {
  program
    .command("test")
    .description("Test source file with testcases")
    .alias("t")
    .argument("<filename>", "Name of the source code (a.rs, b.cpp, c.py, ...)")
    .option("-t, --test <index>", "test index (starts from 1)")
    .option("-m, --multi_test <index>", "multiple test index (starts from 1)")
    .option("-i, --interactive", "enable interactive mode (input manually)")
    .option("-d, --debug", "build code with debug flag")
    .option("-a, --add", "add testcase to the current problem")
    .option("-v, --view", "view testcase")
    .action(async (fileName, options) => {
      // const filePath = `${path}/${fileName}`;
      const filePath = `${fileName}`;
      if (options.add) {
        addTestCaseManually(fileName);
        return;
      }
      const testIndex = options.test;
      let testEntry = null;
      if (testIndex) {
        testEntry = parseInt(testIndex).toString();
      }
      const multiTestIndex = options.multi_test;
      let multiTestEntry = null;
      if (multiTestIndex) {
        multiTestEntry = parseInt(multiTestIndex);
      }
      let testcases;
      let testOne;
      try {
        testcases = TestCase.getTestCasesFromDirectory(filePath);
      }
      catch (e) {
        Logger.logErrorSpinner(e.message);
        return;
      }
      let compiler;
      try {
        if (Object.keys(testcases).length === 0) {
          Logger.logErrorSpinner(Exception.noTestAvailable(fileName).message);
          return;
        }
        else if (multiTestEntry === null &&
          testEntry !== null &&
          !testcases[testEntry]) {
          Logger.logErrorSpinner(Exception.testFileNotFound(fileName, testIndex).message);
          return;
        }
        else if (multiTestEntry !== null && testEntry === null) {
          Logger.logErrorSpinner("Please use -m/--multi_test <index> together with -t/-test <index>");
          return;
        }
        if (testEntry !== null) {
          testOne = testcases[testEntry];
        }
        if (multiTestEntry !== null &&
          !testOne.multiTestCaseAt(multiTestEntry)) {
          Logger.logErrorSpinner(Exception.testFileNotFound(fileName, multiTestIndex).message);
          return;
        }
        else if (multiTestEntry !== null &&
          testOne.multiTestCaseAt(multiTestEntry)) {
          const multiTestCase = testOne.multiTestCaseAt(multiTestEntry);
          testOne = {
            input: multiTestCase.input,
            output: multiTestCase.output,
            fileName: testOne.fileName,
          };
        }
        compiler = new Compiler({ filePath: filePath });
      }
      catch (e) {
        Logger.logErrorSpinner(e.message);
        return;
      }
      if (options.view) {
        Logger.logInfoSpinner("Lisiting testcases");
        if (testEntry === null) {
          for (const test of Object.values(testcases)) {
            viewTestCase(test);
          }
        }
        else {
          viewTestCase(testOne);
        }
        return;
      }
      try {
        compiler.buildFile({ debug: options.debug });
      }
      catch (_) {
        Logger.logVerdict(Verdict.CE);
        return;
      }
      if (options.interactive) {
        await compiler.runInteractive();
        return;
      }
      if (testEntry === null) {
        for (const test of Object.values(testcases)) {
          if (!options.interactive && options.debug) {
            await startJudgeWithDebug(test, compiler);
          }
          else {
            await startJudging(test, compiler);
          }
        }
      }
      else {
        if (!options.interactive && options.debug) {
          await startJudgeWithDebug(testOne, compiler);
        }
        else {
          await startJudging(testOne, compiler, {
            multiTest: multiTestEntry !== null,
          });
        }
      }
    });
};
export { testCommand };
export default {
  testCommand
};
