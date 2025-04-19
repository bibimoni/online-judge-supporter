const { Verdict } = require("../test/verdict");
const { loadConfigFile, getConfig } = require("../config/load_config");
const {
  expandArgumentWithPath,
  validateFilePath,
  getFileNameFromPath,
  getFileExtension,
} = require("./utils");
const { Exception } = require("../error_handler/error");
const { supportedLanguages } = require("./library");
const { spawn, execSync } = require("child_process");
const { TestCase } = require("../test/testcase");
const readline = require("readline");
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

  buildFile({ debug }) {
    const buildCmd = debug ? this.debug : this.build;
    if (buildCmd && buildCmd.length > 0) {
      try {
        execSync(buildCmd, { stdio: "inherit" });
      } catch (e) {
        throw Exception.buildFailed(e.message);
      }
    }
  }

  // wrap the output for runTest (a helper function)
  #wrapper(output, verdict) {
    return {
      output: output,
      verdict: verdict,
    };
  }

  /**
   * run test with the given testcase
   *
   * @param {TestCase} testcase
   * @param {Object} option, if multiTest is true,
   * it will returns UNKNOWN verdict.
   * @returns {Object} result, returns Verdict in "verdict" and output as "output".
   */
  async runTest(testcase, { multiTest = false } = {}) {
    const input = testcase.input;
    const child = spawn(this.run, [], {
      shell: true,
    });

    let output = "";
    child.stdout.on("data", (data) => {
      output += data.toString();
    });
    if (input) {
      child.stdin.write(input);
    }

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
    } catch (_) {
      return this.#wrapper(output, Verdict.TLE);
    } finally {
      clearTimeout(timeoutId);
    }
    if (exitCode !== successExitCode) {
      return this.#wrapper(output, Verdict.RE);
    }
    if (multiTest) {
      return this.#wrapper(output, Verdict.UNKNOWN);
    }
    return this.#wrapper(
      output,
      TestCase.checkOutput(testcase.output, output) ? Verdict.AC : Verdict.WA,
    );
  }

  runInteractive() {
    return new Promise((resolve) => {
      const child = spawn(this.run, [], {
        shell: true,
      });

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);

      rl.on("line", (line) => {
        child.stdin.write(line + "\n");
      });

      child.on("exit", () => {
        rl.close();
        resolve();
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
    const fileName = getFileNameFromPath(filePath);
    if (!fileName || fileName.length === 0) {
      throw Exception.fileNotFound(fileName);
    }
    const extension = getFileExtension(fileName);
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
module.exports = { Compiler };
