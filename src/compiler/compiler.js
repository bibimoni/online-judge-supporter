import { Verdict } from "../test/verdict.js";
import { loadConfigFile, getConfig } from "../config/load_config.js";
import { expandArgumentWithPath, validateFilePath } from "./utils.js";
import { fileName as fileNameOf, extension as extensionOf } from "../path.js";
import { Exception } from "../error_handler/error.js";
import { supportedLanguages } from "./library.js";
import { spawn, execSync } from "child_process";
import { TestCase } from "../test/testcase.js";
const successExitCode = 0;
class Compiler {
  constructor({ filePath }) {
    loadConfigFile();
    this.timeout = getConfig()["timeout"];
    this.settings = this.getLanguageSettings(filePath);
    this.run = expandArgumentWithPath(this.settings["run"], filePath);
    this.build = expandArgumentWithPath(this.settings["build"], filePath);
    this.debug = expandArgumentWithPath(this.settings["debug"], filePath);
    this.filePath = filePath;
  }
  /**
   * expand placeholders in an argument (or an array of arguments) of the program
   *
   * @param {String|Array<String>} argv
   * @returns {Array<String>} arguments that can be given to runTest
   */
  expandArguments(argv) {
    return [].concat(argv ?? []).map((arg) => expandArgumentWithPath(arg, this.filePath));
  }
  buildFile({ debug }) {
    const buildCmd = debug ? this.debug : this.build;
    if (buildCmd && buildCmd.length > 0) {
      try {
        execSync(buildCmd, { stdio: "inherit" });
      }
      catch (e) {
        throw Exception.buildFailed(e.message);
      }
    }
  }
  // wrap the output for runTest (a helper function)
  #wrapper(output, verdict, error = "", exitCode = null) {
    return {
      output: output,
      error: error,
      verdict: verdict,
      exitCode: exitCode,
    };
  }
  /**
   * run test with the given testcase
   *
   * @param {TestCase} testcase
   * @param {Object} option, if multiTest is true,
   * it will returns UNKNOWN verdict. argv (an array of strings) will be
   * passed to the program as arguments.
   * @returns {Object} result, returns Verdict in "verdict", output as "output",
   * the stderr of the program as "error" and the exit code as "exitCode".
   * argv is used as it is, so expand it first if you need placeholders.
   */
  async runTest(testcase, { multiTest = false, argv = [] } = {}) {
    const input = testcase.input;
    const child = spawn(this.run, argv, {
      shell: true,
    });
    let output = "";
    let error = "";
    child.stdout.on("data", (data) => {
      output += data.toString();
    });
    child.stderr.on("data", (data) => {
      error += data.toString();
    });
    if (input) {
      child.stdin.write(input);
    }
    // without this a program that reads until EOF waits for the timeout
    child.stdin.end();
    let timeoutId = null;
    let exitCode = null;
    try {
      const runPromise = new Promise((resolve) => {
        child.on("close", resolve);
      });
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          child.kill();
          reject();
        }, this.timeout);
      });
      exitCode = await Promise.race([runPromise, timeoutPromise]);
    }
    catch (_) {
      return this.#wrapper(output, Verdict.TLE, error, exitCode);
    }
    finally {
      clearTimeout(timeoutId);
    }
    if (exitCode !== successExitCode) {
      return this.#wrapper(output, Verdict.RE, error, exitCode);
    }
    if (multiTest) {
      return this.#wrapper(output, Verdict.UNKNOWN, error, exitCode);
    }
    return this.#wrapper(output, TestCase.checkOutput(testcase.output, output) ? Verdict.AC : Verdict.WA, error, exitCode);
  }
  /**
   * run the program with the terminal attached, so it reads stdin as it is
   * typed (a key without enter, an interactive problem, `while (cin >> n)`)
   * and its output shows up as soon as it flushes
   *
   * @returns {Promise<Number|null>} the exit code of the program
   */
  runInteractive() {
    return new Promise((resolve) => {
      const child = spawn(this.run, [], {
        shell: true,
        stdio: "inherit",
      });
      // a program that waits for EOF (`while (cin >> n)`) only ends when the
      // parent's stdin is closed, which is what Ctrl + D sends
      child.on("exit", (code) => {
        resolve(code);
      });
    });
  }
  runTestWithDebug(input) {
    return new Promise((resolve) => {
      const child = spawn(this.run, [], {
        shell: true,
        timeout: this.timeout,
      });
      if (input) {
        child.stdin.write(input);
      }
      // without this a program that reads until EOF waits for the timeout
      child.stdin.end();
      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);
      child.on("exit", () => {
        resolve();
      });
    });
  }
  getLanguageSettings(filePath) {
    if (!validateFilePath(filePath)) {
      throw Exception.noSourceFile(filePath);
    }
    const fileName = fileNameOf(filePath);
    if (!fileName || fileName.length === 0) {
      throw Exception.fileNotFound(fileName);
    }
    const extension = extensionOf(fileName);
    if (!extension || extension.length === 0) {
      throw Exception.invalidFileFormat(fileName);
    }
    if (!supportedLanguages.includes(extension)) {
      throw Exception.unsupportedFileExtension(extension);
    }
    let config = getConfig();
    return config["extension"][extension];
  }
}
export { Compiler };
export default {
  Compiler
};
