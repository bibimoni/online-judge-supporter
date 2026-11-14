import { Logger } from "../logger.js";
import { Compiler } from "../../compiler/compiler.js";
import { TestCase } from "../../test/testcase.js";
import { Exception } from "../../error_handler/error.js";
import { Verdict } from "../../test/verdict.js";
import { createSpinner } from "nanospinner";
import { Creator } from "../../file_creator/creator.js";
import { captureUserInput } from "../../file_creator/utils.js";
import { testcaseStartIndex } from "../../config/load_config.js";
import { Stress } from "../../test/stress.js";

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
    if (result["verdict"] === Verdict.RE) {
      Logger.errorOutput(result["error"]);
    }
    else if (!multiTest && result["verdict"] === Verdict.WA) {
      Logger.diff(testcase.output, result["output"]);
    }
    else {
      Logger.output(result["output"]);
    }
  }
};
// the testcase is not built by hands, the generator builds it with the
// index as the seed so the same index always gives the same testcase
const startJudgingWithStress = async (stress, { index = null, testcase = null } = {}) => {
  const spinner = createSpinner();
  Logger.logInfoSpinner(`Testcase ${index} (built by the generator)`);
  spinner.start({ text: Logger.info(`Running...`) });
  const result = await stress.judge({
    seed: index === null ? null : parseInt(index),
    testcase: testcase,
  });
  Logger.logVerdict(result["verdict"], { spinner: spinner });
  if (result["verdict"] === Verdict.AC) {
    return;
  }
  Logger.input(result["output"]);
  // without a checker the answer of the good solution is the only thing to
  // compare with, so show the difference line by line
  if (result["error"]) {
    Logger.errorOutput(result["error"]);
    Logger.answer(result["expected"]);
  }
  else if (result["expected"]) {
    Logger.diff(result["expected"], result["solutionOutput"]);
  }
};
// judge the solution with the testcase typed by hands, the good solution
// builds the answer so the testcase is saved and can be found again
const startStressJudging = async (stress) => {
  Logger.logInfoSpinner("Enter Input (press Ctrl + C to exit)");
  const testcase = { input: await captureUserInput() };
  const spinner = createSpinner();
  spinner.start({ text: Logger.info(`Running...`) });
  const result = await stress.judge({ testcase: testcase });
  Logger.logVerdict(result["verdict"], { spinner: spinner });
  if (result["verdict"] === Verdict.AC) {
    return;
  }
  if (result["verdict"] !== Verdict.RE) {
    Logger.input(result["output"]);
  }
  if (result["error"]) {
    Logger.errorOutput(result["error"]);
    Logger.answer(result["expected"]);
  }
  else if (result["expected"]) {
    Logger.diff(result["expected"], result["solutionOutput"]);
  }
};
const startJudgeWithDebug = async (testcase, compiler) => {
  Logger.logInfoSpinner(`Input file: ${testcase.fileName}`);
  Logger.input(testcase.input);
  await compiler.runTestWithDebug(testcase.input);
};

const addTestCaseManually = async (fileName) => {
  await Creator.addTestCase(path, fileName, {
    onBeginInput: () => {
      Logger.logInfoSpinner("Enter Input (press Ctrl + C to exit)");
    },
    onBeginOutput: () => {
      Logger.logInfoSpinner("Enter Expected output (press Ctrl + C to exit)");
    },
    onNoInput: () => {
      Logger.logInfoSpinner("Empty input, no testcase was added");
    },
    onFileCreate: Logger.logFileSpinner,
    onFolderCreate: Logger.logFolderSpinner,
  });
};
const viewTestCase = (testcase) => {
  Logger.logInfoSpinner(`Testcase ${testcase.fileName}`);
  Logger.input(testcase.input);
  testcase.output ??= "";
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
      if (options.debug && options.view) {
        // this will cause frustration if user want to use debug but not view, but accidentally leave it as it is, so i warn them
        Logger.logErrorSpinner(`Please don't use debug with view!`);
        return;
      }
      const filePath = `${fileName}`;
      let compiler;
      try {
        compiler = new Compiler({ filePath: filePath });
      } catch (err) {
        Logger.logErrorSpinner(err.message)
        return;
      }
      if (options.interactive) {
        try {
          compiler.buildFile({ debug: options.debug });
        } catch (_) {
          Logger.logVerdict(Verdict.CE);
          return;
        }
        await compiler.runInteractive();
        return;
      }
      if (options.add) {
        await addTestCaseManually(fileName);
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
        multiTestEntry = parseInt(multiTestIndex) - testcaseStartIndex;
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
      // a testcase typed by hands, or a testcase built by the generator, see Stress
      let stress = null;
      if (!options.interactive && !options.view && !options.add) {
        try {
          stress = Stress.find(filePath);
        } catch (_) {
          stress = null;
        }
        // missing files only matter when the testcase is built by the stress
        // helper, a testcase from the test folder is complete on its own
        const missing = stress?.missingFiles();
        if (missing && (testEntry === null || stress.isGenerated())) {
          Logger.logErrorSpinner(missing.message);
          return;
        }
      }
      // typing a testcase is always allowed, -t is only for the ones built by the generator
      if (stress?.isGenerated() && options.multi_test) {
        Logger.logErrorSpinner("A testcase built by the generator has no multitest, please remove -m/--multi_test");
        return;
      }
      if (stress?.isGenerated()) {
        // the generator builds the testcase from the index, a testcase in the
        // test folder is only used when it was typed
        try {
          compiler.buildFile({ debug: options.debug });
          stress.good.buildFile({ debug: false });
          stress.generator?.buildFile({ debug: false });
          stress.checker?.buildFile({ debug: false });
        } catch (_) {
          Logger.logVerdict(Verdict.CE);
          return;
        }
        const generated = testcases[testEntry]?.isMultiTest ? null : testcases[testEntry];
        if (options.debug) {
          // show the program's own output and stderr instead of judging it
          const built = await stress.generate({ index: testIndex, testcase: generated });
          if (built === null) {
            Logger.logVerdict(Verdict.CRASH);
            return;
          }
          await startJudgeWithDebug({ ...built, fileName: `generated (seed ${testIndex})` }, compiler);
          return;
        }
        await startJudgingWithStress(stress, {
          index: testIndex,
          testcase: generated,
        });
        return;
      }
      // the testcase is typed and its answer is built by the good solution, see Stress
      if (stress?.good && testEntry === null) {
        try {
          compiler.buildFile({ debug: options.debug });
          stress.good.buildFile({ debug: false });
          stress.checker?.buildFile({ debug: false });
        } catch (_) {
          Logger.logVerdict(Verdict.CE);
          return;
        }
        await startStressJudging(stress);
        return;
      }
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
        // Since multitestCaseAt always start with '0' and it also being used for other purposes so i need to do some workaround here
        if (multiTestEntry !== null && !testOne.multiTestCaseAt(multiTestEntry)) {
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
