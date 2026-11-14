import { Compiler } from "../compiler/compiler.js";
import { TestCase } from "../test/testcase.js";
import { Verdict } from "../test/verdict.js";
import { Generator } from "../file_creator/generator.js";
import { Checker } from "../file_creator/checker.js";
import { Creator } from "../file_creator/creator.js";
import { goodMiddleName } from "../config/load_config.js";
import { fileName, directory, join } from "../path.js";
import { findCompanionFile } from "../file_creator/utils.js";
import { Exception } from "../error_handler/error.js";

// the generator, the checker and the good solution have no expected output,
// so they run with multiTest and get UNKNOWN when they finish normally
const crashed = (result) => result["verdict"] === Verdict.RE || result["verdict"] === Verdict.TLE;
const isWrong = (result) => result["verdict"] === Verdict.WA || result["verdict"] === Verdict.RE;
class Stress {
  /**
   * @param {Object} files found by `Stress.find`
   * @param {Object} options onFileCreate and onFolderCreate are invoked when a
   * testcase is saved, use logger please.
   */
  constructor(files, { onFileCreate = () => { }, onFolderCreate = () => { } } = {}) {
    this.filePath = files["filePath"];
    this.dir = files["dir"];
    this.solution = files["solution"];
    this.generator = files["generator"] ? new Compiler({ filePath: files["generator"] }) : null;
    this.checker = files["checker"] ? new Compiler({ filePath: files["checker"] }) : null;
    this.good = files["good"] ? new Compiler({ filePath: files["good"] }) : null;
    this.onFileCreate = onFileCreate;
    this.onFolderCreate = onFolderCreate;
  }
  /**
   * find the files needed for the stress test, they are all placed next to the
   * source file: `<problem>__Generator.<ext>`, `<problem>__Checker.cpp`
   * and `<problem>__Good.<ext>`
   *
   * @param {String} filePath path to the source file
   * @returns {Stress}
   */
  static find(filePath) {
    return new Stress({
      filePath: filePath,
      dir: directory(filePath),
      solution: new Compiler({ filePath: filePath }),
      generator: Generator.find(filePath),
      checker: Checker.find(filePath),
      good: findCompanionFile(filePath, goodMiddleName),
    });
  }
  /**
   * problems that have a generator are built by it and judged by the checker,
   * the others are typed by hands (it's the only testcase) and judged by the
   * good solution, that is the answer of the testcase
   *
   * @returns {Boolean}
   */
  isGenerated() {
    return this.generator !== null;
  }
  /**
   * tell what is missing before the stress test can start, the checker is not
   * required: without one the output is compared to the answer of the good
   * solution, see `judge`
   *
   * @returns {Error|null}
   */
  missingFiles() {
    return this.good ? null : Exception.noGoodSolution(this.filePath);
  }
  /**
   * run one testcase and judge it, the result of a correct testcase is added
   * into the problem's test folder so it can be found again with `ojs test`
   *
   * @param {Object} options seed for this testcase, limits its time, and
   * testcase typed by hands (without seed the generator builds it)
   * @returns {Object} verdict, the reason is in "error"
   */
  async judge({ seed = null, timeLimit = null, testcase = null } = {}) {
    if (testcase === null) {
      const generated = await this.#generate(seed);
      if (crashed(generated)) {
        return this.#result(Verdict.CRASH, { "error": generated["error"] });
      }
      testcase = { input: generated["output"] };
    }
    else {
      testcase = { input: testcase["input"] };
    }
    // the good solution runs while the solution is running, its answer is
    // needed by the checker and by the diff anyway
    const answer = this.good.runTest(testcase, { multiTest: true });
    let result = await this.#runWithLimit(this.solution, testcase, timeLimit);
    const built = await answer;
    if (crashed(built)) {
      return this.#result(Verdict.CRASH, { "output": testcase.input, "error": built["error"] });
    }
    testcase.output = built["output"];
    if (isWrong(result)) {
      return this.#result(result["verdict"], { "output": testcase.input, "error": result["error"], "expected": testcase.output });
    }
    // the checker owns the verdict when the problem has one, it can accept
    // outputs that a plain comparison rejects (floats, multiple answers)
    if (this.checker) {
      const accepted = await this.#judgeWithChecker(testcase, result["output"]);
      if (accepted["verdict"] !== Verdict.AC) {
        return accepted;
      }
    }
    else if (!TestCase.checkOutput(testcase.output, result["output"])) {
      return this.#result(Verdict.WA, {
        "output": testcase.input,
        "error": result["error"],
        "expected": testcase.output,
        "solutionOutput": result["output"],
      });
    }
    this.#save(testcase);
    return this.#result(Verdict.AC, { "output": testcase.input });
  }
  /**
   * build a testcase without judging it, used by `test -d` which only shows
   * what the program prints
   *
   * @param {Object} options same as `judge`
   * @returns {Object|null} { input, output } or null when the generator failed
   */
  async generate({ index = null, testcase = null } = {}) {
    if (testcase !== null) {
      const answer = await this.good.runTest({ input: testcase["input"] }, { multiTest: true });
      return crashed(answer) ? null : { input: testcase["input"], output: answer["output"] };
    }
    const generated = await this.#generate(index === null ? null : parseInt(index));
    return crashed(generated) ? null : { input: generated["output"], output: undefined };
  }
  /**
   * run a program and count a timeout as its verdict
   */
  async #runWithLimit(compiler, testcase, timeLimit) {
    let timeout = compiler.timeout;
    if (timeLimit !== null) {
      compiler.timeout = timeLimit;
    }
    try {
      return await compiler.runTest(testcase, { multiTest: true });
    }
    finally {
      compiler.timeout = timeout;
    }
  }
  /**
   * build a testcase with the generator
   *
   * @param {Number} seed passed to the generator, start a new random
   * generator when it's null (otherwise the testcase can be reproduced)
   * @returns {Object} the output of the generator
   */
  async #generate(seed) {
    if (seed === null) {
      seed = Math.floor(Math.random() * 1000000000);
    }
    // multiTest, the generator has no expected output to compare with
    return await this.generator.runTest({}, { multiTest: true, argv: [seed.toString()] });
  }
  /**
   * the checker reads the testcase (input, answer and output of the solution,
   * in that order) from stdin, it parses the input itself so it knows where
   * each part ends. exit code 0 means correct, 1 means wrong.
   *
   * @param {String} output of the solution
   * @returns {Object} verdict
   */
  async #judgeWithChecker(testcase, output) {
    let stdin = `${testcase.input}${testcase.output}${output}`;
    let result = await this.checker.runTest({ input: stdin }, { multiTest: true });
    // the checker exits with 1 when the output is wrong, that's a verdict
    // not a crash, only a checker that can't exit at all (TLE) has no verdict
    if (result["verdict"] === Verdict.TLE) {
      return this.#result(Verdict.CRASH, { "output": testcase.input, "error": result["error"] });
    }
    if (result["exitCode"] === 0) {
      return this.#result(Verdict.AC, { "output": testcase.input });
    }
    return this.#result(Verdict.WA, {
      "output": testcase.input,
      "error": result["error"],
      "expected": testcase.output,
    });
  }
  #save(testcase) {
    Creator.addTestCaseToFolder(this.dir, fileName(this.filePath), testcase, {
      onFileCreate: this.onFileCreate,
      onFolderCreate: this.onFolderCreate,
    });
  }
  #result(verdict, { output = "", error = "", expected = "", solutionOutput = "" } = {}) {
    return {
      verdict: verdict,
      output: output,
      error: error,
      expected: expected,
      solutionOutput: solutionOutput,
    };
  }
}
export { Stress };
export default {
  Stress
};
