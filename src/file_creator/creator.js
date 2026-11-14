import fs from "fs-extra";
import { Crawler } from "../parser/crawler.js";
import { TestCase } from "../test/testcase.js";
import { ProblemData } from "../test/problem_data.js";
import { Exception } from "../error_handler/error.js";
import {
  getConfig,
  loadConfigFile,
  mode,
  testcaseStartIndex,
} from "../config/load_config.js";
import { captureUserInput } from "./utils.js";
import {
  multiTestFolderPrefix,
  inputPrefixTestName,
  ansPrefixTestName,
  testFolderPrefix,
} from "../config/load_config.js";
import path from "node:path";
import { join, directory, baseName, testFile } from "../path.js";
const problem_regex = /((^[a-z]-[a-z])|(^[A-Z]-[A-Z])|(^[\w]+))\.([a-z]+)$/;

class Creator {
  /**
   *  Creates a folder for the contest or problem based on the provided parameters.
   * 
   * @param {String} default_path - The default path where the contest or problem files will be created.
   * @param {String} contest_id - The unique identifier for the contest.
   * @param {String} param - A string parameter that specifies the format or details of the contest or problem.
   */
  static createContest(default_path, contest_id, param, { on_file_created = () => { } }) {
    if (!problem_regex.test(param)) {
      throw Exception.invalidContestFormat(param);
    }
    let extension_file = param.split(".")[1];

    const contestFolder = join(default_path, contest_id);
    if (!fs.existsSync(contestFolder)) {
      try {
        fs.mkdirSync(contestFolder);
      } catch {
        throw Exception.canNotCreateFolder(contestFolder);
      }
    }
    loadConfigFile();
    let config = getConfig();
    if (config["extension"][extension_file] === undefined) {
      throw Exception.languageNotFound(extension_file);
    }
    let config_languages = config["extension"][extension_file]["template"];

    let file_created = Creator.#writeProblemFiles(contestFolder, param, extension_file, config_languages);
    on_file_created(file_created);
  }
  /**
   * write the source file(s) of a problem into a folder, `a-g.cpp` writes
   * one file per letter, `a.cpp` writes a single file
   *
   * @param {String} folder to write the files into
   * @param {String} param problem name with extension (a.cpp, a-g.cpp)
   * @param {String} extension_file
   * @param {String} template path of the template file, empty for no template
   * @returns {[...String]} names of the created files
   */
  static #writeProblemFiles(folder, param, extension_file, template) {
    let names = [];
    if (param.search("-") === -1) {
      names.push(`${param.split(".")[0]}.${extension_file}`);
    } else {
      param = param.split(".")[0];
      if (param.split("-")[0].charCodeAt(0) > param.split("-")[1].charCodeAt(0)) {
        throw Exception.canNotCreateFile();
      }
      for (let i = param.split("-")[0].charCodeAt(0); i <= param.split("-")[1].charCodeAt(0); i++) {
        names.push(`${String.fromCharCode(i)}.${extension_file}`);
      }
    }
    fs.ensureDirSync(folder, mode);
    names.forEach((name) => {
      const filePath = join(folder, name);
      if (template === "") {
        fs.writeFileSync(filePath, '');
      } else {
        fs.copyFileSync(template, filePath);
      }
    });
    return names;
  }
  /**
   * Creates a file for a specific problem based on the provided parameters.
   * @param {String} default_path - The default path where the problem file will be created.
   * @param {String} param - A string containing the problem name and file extension in the format "problemName.extension".
   */
  static createProblem(default_path, param, { on_file_created = () => { } }) {
    if (!problem_regex.test(param)) {
      throw Exception.invalidFile(param);
    }
    let extension_file = param.split(".")[1];
    loadConfigFile();
    let config = getConfig();
    if (config["extension"][extension_file] === undefined) {
      throw Exception.languageNotFound(extension_file);
    }
    let config_languages = config["extension"][extension_file]["template"];
    let file_created = Creator.#writeProblemFiles(default_path, param, extension_file, config_languages);
    on_file_created(file_created);
  }

  /**
   * generate a folder containing tests from given problemData
   * the folder have the problem name containing with inputs, outputs
   * and theirs index, also generate a multitest folder if supported
   *
   * @param {String} testFolder directory that will contain the test file
   * @param {ProblemData} problemData crawlered data
   * @param {Object} options, if fileName is provided, use it as the test folder name
   * otherwise use the problemData' short name, onFileCreate and onFolderCreate will
   * get invoked when file or folder is created, use logger please.
   */
  static async generateTestFile(testDir, problemData, { fileName = "", onFileCreate = () => { }, onFolderCreate = () => { } } = {}) {
    let problemShortName;
    if (!fileName || fileName.length === 0) {
      problemShortName = Crawler.getProblemShortName(problemData.name).toLowerCase();
    }
    else {
      problemShortName = fileName;
    }
    // the solution file name isn't known here, only the folder and the name it
    // gets from the caller, so build the paths from them
    const testFolderPath = join(testDir, `${testFolderPrefix}${problemShortName}`);
    const shown = (testPath) => path.relative(testDir, testPath);
    await fs.ensureDir(testFolderPath, mode);
    let index = testcaseStartIndex;
    problemData.testCases.forEach((test) => {
      // find a testcase number that isn't taken yet
      const multiInputPath = () => join(testFolderPath, `${multiTestFolderPrefix}${index}`);
      const inputPath = () => join(testFolderPath, `${inputPrefixTestName}${index}`);
      const outputPath = () => join(testFolderPath, `${ansPrefixTestName}${index}`);
      while (fs.existsSync(multiInputPath()) ||
        fs.existsSync(inputPath()) ||
        (fs.existsSync(outputPath()) && test.isMultiTest)) {
        index += 1;
      }
      fs.writeFileSync(inputPath(), test.input);
      onFileCreate(shown(inputPath()), test.input, "input");
      fs.writeFileSync(outputPath(), test.output);
      onFileCreate(shown(outputPath()), test.output, "output");
      if (test.isMultiTest) {
        fs.ensureDirSync(multiInputPath(), mode);
        onFolderCreate(shown(multiInputPath()));
        test.multiTestCase.forEach((mutliTest, multiTestIndex) => {
          const multiTestPath = testFile(multiInputPath(), inputPrefixTestName, multiTestIndex + testcaseStartIndex);
          fs.writeFileSync(multiTestPath, mutliTest.input);
          onFileCreate(shown(multiTestPath), mutliTest.input, "multitest input");
        });
      }
    });
  }
  /**
   * generate a folder containing tests from given problemData
   * the folder have the problem name containing with inputs, outputs
   * and theirs index, also generate a multitest folder if supported
   *
   * @param {String} filePath file path to the source file
   * @param {ProblemData} problemData crawlered data
   * @param {Object} options, if fileName is provided, use it as the test folder name
   * otherwise use the problemData' short name, onFileCreate and onFolderCreate will
   * get invoked when file or folder is created. use logger please.
   */
  static async generateTestFileWithFilePath(filePath, problemData, { onFileCreate = () => { }, onFolderCreate = () => { } } = {}) {
    return await Creator.generateTestFile(directory(filePath), problemData, {
      fileName: baseName(filePath),
      onFileCreate,
      onFolderCreate,
    });
  }
  /**
   * Allow user to add test case manually via the terminal,
   * then automatically add it into the problem's test folder
   *
   * @oaram {String} filePath
   * @param {String} fileName
   * @param {Object} options, there are many options that will be called
   * on certain state of the function
   */
  static async addTestCase(filePath, fileName, { onBeginInput = () => { }, onEndInput = () => { }, onBeginOutput = () => { }, onEndOutput = () => { }, onNoInput = () => { }, onFileCreate = () => { }, onFolderCreate = () => { }, } = {}) {
    let test = new TestCase();
    onBeginInput();
    test.input = await captureUserInput();
    onEndInput();
    // an empty input is not a testcase, don't write it and don't ask for the
    // expected output, so an accidental enter doesn't create a test file
    if (test.input.trim().length === 0) {
      onNoInput();
      return;
    }
    onBeginOutput();
    test.output = await captureUserInput();
    onEndOutput();
    await Creator.addTestCaseToFolder(filePath, fileName, test, {
      onFileCreate: onFileCreate,
      onFolderCreate: onFolderCreate,
    });
  }
  /**
   * add an already built testcase into the problem's test folder
   *
   * @param {String} filePath path to the source file
   * @param {String} fileName name of the source file (used as the test folder name)
   * @param {TestCase} test
   * @param {Object} options onFileCreate and onFolderCreate will get invoked when
   * file or folder is created. use logger please.
   */
  static async addTestCaseToFolder(filePath, fileName, test, { onFileCreate = () => { }, onFolderCreate = () => { } } = {}) {
    let problemData = new ProblemData();
    problemData.addTestCase(test);
    await Creator.generateTestFileWithFilePath(join(filePath, fileName), problemData, {
      fileName: baseName(fileName),
      onFileCreate: onFileCreate,
      onFolderCreate: onFolderCreate,
    });
  }
}
export { Creator };
export default {
  Creator
};
