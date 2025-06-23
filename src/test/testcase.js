import { TokenType, Token } from "./token.js";
import { getConfig, loadConfigFile } from "../config/load_config.js";
import { Exception } from "../error_handler/error.js";
import fs from "fs-extra";
import path from "path";
import { mode, ansPrefixTestName, inputPrefixTestName, multiTestFolderPrefix, testFolderPrefix } from "../config/load_config.js";
import { validateFilePath, getFileNameFromPath, getDirectoryFromPath, getBaseFileName } from "../compiler/utils.js";
import { getTestIndexFromTestName } from "./utils.js";

class TestCase {
  constructor({ input, output } = {}) {
    this._input = input;
    this._output = output;
    this._isMultiTest = false;
  }
  /**
   * Push a small testcase to the complete test
   *
   * @param {TestCase} test that is part of a complete test. This test param won't have output
   */
  addMultiTestCase(test) {
    this._isMultiTest = true;
    this._testcases ??= [];
    test.input = `1\n` + test.input;
    this._testcases.push(test);
  }

  /**
    * Add small testcase without adding the number of test (=1) before the input
    *
    * @param {TestCase} test that is part of a complete test. This test param won't have output
    */
  addMultiTestCaseWithoutTestCount(test) {
    this._isMultiTest = true;
    this._testcases ??= [];
    test.input = test.input;
    this._testcases.push(test);
  }
  /**
   *
   * @param {index} index
   * @returns a reference to the array containing multiple extracted testcases.
   */
  multiTestCaseAt(index) {
    return this._testcases[index];
  }
  set input(input) {
    this._input = input;
  }
  set output(output) {
    this._output = output;
  }
  get input() {
    return this._input;
  }
  get output() {
    return this._output;
  }
  get multiTestCase() {
    return this._testcases;
  }
  get isMultiTest() {
    return this._isMultiTest;
  }
  /**
   * extarct value to an array of tokens, each will have a type
   * please don't change the order of these if statements cause it may break
   *
   * @param {String} string that need to be tokenize
   * @return {[...Token]} an array of Token-s
   */
  static extractToken(value) {
    let outputTokens = value.split(/\s+/).filter((token) => token.length > 0);
    let tokens = [];
    // Load config to enable experiment mode
    loadConfigFile();
    let config = getConfig();
    outputTokens.forEach((tokenStr) => {
      let tokenType = TokenType.getTokenType(tokenStr, {
        experiment: config["testComparatorExperiment"],
      });
      if (tokenType === TokenType.FLOAT) {
        tokens.push(new Token(parseFloat(tokenStr), TokenType.FLOAT));
      }
      else if (tokenType === TokenType.INT) {
        tokens.push(new Token(parseInt(tokenStr), TokenType.INT));
      }
      else if (tokenType === TokenType.STRING) {
        tokens.push(new Token(tokenStr, TokenType.STRING));
      }
      // if it reaches here, then wtf
    });
    return tokens;
  }
  /**
   * compare `this` TestCase to other TestCase
   *
   * @param {boolean} if this is `true` consider `this.output` is the expected
   * output and vice versa
   * @praram {String} output
   * @return {boolean} tell wether or not
   * the testcase is correct (in compare to the expected testcase)
   */
  checkOutput(otherOutput, flag = false) {
    if (!flag) {
      return TestCase.checkOutput(this.output, otherOutput);
    }
    else {
      return TestCase.checkOutput(otherOutput, this.output);
    }
  }
  /**
   * compare two output to check if it's correct
   *
   * @param {String} expectedOutput
   * @param {String} output
   * @returns {boolean} result, if true then output is
   * correct (in compare to expected output) and vise versa
   */
  static checkOutput(expectedOutput, output) {
    let expectedTokens = this.extractToken(expectedOutput);
    let tokens = this.extractToken(output);
    if (expectedTokens.length !== tokens.length) {
      return false;
    }
    return expectedTokens.reduce((currentStatus, token, index) => {
      return currentStatus & token.cmp(tokens[index]);
    }, true);
  }
  static getTestCasesFromDirectory(filePath) {
    if (!validateFilePath(filePath)) {
      throw Exception.noSourceFile(filePath);
    }
    const fileName = getFileNameFromPath(filePath);
    if (!fileName || fileName.length === 0) {
      throw Exception.fileNotFound(fileName);
    }
    const testCaseFolder = `${getDirectoryFromPath(filePath)}${testFolderPrefix}${getBaseFileName(fileName)}/`;
    let testcases = {};
    const inputRegex = new RegExp(`^${inputPrefixTestName}([0-9]+)$`);
    const ansRegex = new RegExp(`^${ansPrefixTestName}([0-9]+)$`);
    const multiRegex = new RegExp(`^${multiTestFolderPrefix}([0-9]+)$`);
    const indexPosition = 1;
    fs.ensureDirSync(testCaseFolder, mode);
    fs.readdirSync(testCaseFolder, { withFileTypes: true }).forEach((file) => {
      if (file.isFile()) {
        const index = getTestIndexFromTestName(file.name, [inputRegex, ansRegex], indexPosition);
        if (index === undefined) {
          return;
        }
        testcases[index] ??= new TestCase();
        testcases[index].input =
          TestCase.#readTestContent(file, inputRegex) ?? testcases[index].input;
        testcases[index].output =
          TestCase.#readTestContent(file, ansRegex) ?? testcases[index].output;
        testcases[index].fileName = file.name;
      }
    });
    fs.readdirSync(testCaseFolder, { withFileTypes: true }).forEach((file) => {
      if (!file.isFile()) {
        const indexFile = getTestIndexFromTestName(file.name, [multiRegex], indexPosition);
        if (indexFile === undefined) {
          return;
        }
        const multiTestFolder = `${testCaseFolder}${file.name}/`;
        fs.readdirSync(multiTestFolder, { withFileTypes: true }).forEach((file) => {
          if (file.isFile()) {
            const input = TestCase.#readTestContent(file, inputRegex);
            if (input === undefined) {
              return;
            }
            testcases[indexFile].addMultiTestCaseWithoutTestCount(new TestCase({ input: input }));
          }
        });
      }
    });
    return testcases;
  }
  static #readTestContent(file, regex) {
    if (regex.test(file.name)) {
      // FUCK! Why did they change from path to parentPath
      const filePath = `${path.normalize(file.parentPath)}${file.name}`;
      try {
        return fs.readFileSync(filePath, { encoding: "utf8" });
      }
      catch {
        throw Exception.canNotReadTestFile(file.name);
      }
    }
    return undefined;
  }
}
export { TestCase };
export default {
  TestCase
};
