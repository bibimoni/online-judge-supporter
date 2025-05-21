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
import { formatDirPath, captureUserInput } from "./utils.js";
import {
  multiTestFolderPrefix,
  inputPrefixTestName,
  ansPrefixTestName,
  testFolderPrefix,
} from "../config/load_config.js";
import {
  getFileNameFromPath,
  getBaseFileName,
  getDirectoryFromPath
} from '../compiler/utils.js';
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

    if (!fs.existsSync(`${default_path}/${contest_id}`)) {
      try {
        fs.mkdirSync(`${default_path}/${contest_id}`);
      } catch {
        throw Exception.canNotCreateFolder(`${default_path}/${contest_id}`);
      }
    }
    loadConfigFile();
    let config = getConfig();
    if (config["extension"][extension_file] === undefined) {
      throw Exception.languageNotFound(extension_file);
    }
    let config_languages = config["extension"][extension_file]["template"];

    let file_created = [];
    if (param.search("-") === -1) {
      file_created.push(`${param.split(".")[0]}.${extension_file}`);
      if (config_languages === "") {
        fs.writeFileSync(`${default_path}/${contest_id}/${param.split(".")[0]}.${extension_file}`, '');
      } else {
        fs.copyFileSync(`${config_languages}`, `${default_path}/${contest_id}/${param.split(".")[0]}.${extension_file}`);
      }
    } else {
      param = param.split(".")[0];
      if (param.split("-")[0].charCodeAt(0) > param.split("-")[1].charCodeAt(0)) {
        throw Exception.canNotCreateFile();
      }
      for (let i = param.split("-")[0].charCodeAt(0); i <= param.split("-")[1].charCodeAt(0); i++) {
        file_created.push(`${String.fromCharCode(i)}.${extension_file}`);
        if (config_languages === "") {
          fs.writeFileSync(`${default_path}/${contest_id}/${String.fromCharCode(i)}.${extension_file}`, '');
        } else {
          fs.copyFileSync(`${config_languages}`, `${default_path}/${contest_id}/${String.fromCharCode(i)}.${extension_file}`);
        }
      }
    }

    on_file_created(file_created);
  }
  /**
   * Creates a file for a specific problem based on the provided parameters.
   * @param {String} default_path - The default path where the problem file will be created.
   * @param {String} param - A string containing the problem name and file extension in the format "problemName.extension".
   */
  static createProblem(default_path, param, { on_file_created = () => { } }) {
    if (!problem_regex.test(param)) {
      console.log(param);
      throw Exception.invalidFile(param);
    }
    let extension_file = param.split(".")[1];
    loadConfigFile();
    let config = getConfig();
    if (config["extension"][extension_file] === undefined) {
      throw Exception.languageNotFound(extension_file);
    }
    let config_languages = config["extension"][extension_file]["template"];
    let file_created = [];
    if (param.search("-") === -1) {
      file_created.push(`${param.split(".")[0]}.${extension_file}`);
      if (config_languages === "") {
        fs.writeFileSync(`${default_path}/${param.split(".")[0]}.${extension_file}`, '');
      } else {
        fs.copyFileSync(`${config_languages}`, `${default_path}/${param.split(".")[0]}.${extension_file}`);
      }
    } else {
      param = param.split(".")[0];
      if (param.split("-")[0].charCodeAt(0) > param.split("-")[1].charCodeAt(0)) {
        throw Exception.canNotCreateFile();
      }
      for (let i = param.split("-")[0].charCodeAt(0); i <= param.split("-")[1].charCodeAt(0); i++) {
        file_created.push(`${String.fromCharCode(i)}.${extension_file}`);
        if (config_languages === "") {
          fs.writeFileSync(`${default_path}/${String.fromCharCode(i)}.${extension_file}`, '');
        } else {
          fs.copyFileSync(`${config_languages}`, `${default_path}/${String.fromCharCode(i)}.${extension_file}`);
        }
      }
    }

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
    testDir = formatDirPath(testDir);
    let problemShortName;
    if (!fileName || fileName.length === 0) {
      problemShortName = Crawler.getProblemShortName(problemData.name).toLowerCase();
    }
    else {
      problemShortName = fileName;
    }
    // await createFolder(testDir, problemShortName);
    const testFolderPath = `${testDir}${testFolderPrefix}${problemShortName}`;
    await fs.ensureDir(testFolderPath, mode);
    let index = testcaseStartIndex;
    problemData.testCases.forEach((test) => {
      // find testcase number
      let multiInputPath = `${testFolderPath}/${multiTestFolderPrefix}${index}/`;
      let inputPath = `${testFolderPath}/${inputPrefixTestName}${index}`;
      let outputPath = `${testFolderPath}/${ansPrefixTestName}${index}`;
      while (fs.existsSync(multiInputPath) ||
        fs.existsSync(inputPath) ||
        (fs.existsSync(outputPath) && test.isMultiTest)) {
        index += 1;
        multiInputPath = `${testFolderPath}/${multiTestFolderPrefix}${index}/`;
        inputPath = `${testFolderPath}/${inputPrefixTestName}${index}`;
        outputPath = `${testFolderPath}/${ansPrefixTestName}${index}`;
      }
      fs.writeFileSync(inputPath, test.input);
      onFileCreate(`${testFolderPrefix}${problemShortName}/${inputPrefixTestName}${index}`, test.input, "input");
      fs.writeFileSync(outputPath, test.output);
      onFileCreate(`${testFolderPrefix}${problemShortName}/${ansPrefixTestName}${index}`, test.output, "output");
      if (test.isMultiTest) {
        fs.ensureDir(multiInputPath, mode);
        onFolderCreate(`${testFolderPrefix}${problemShortName}/${multiTestFolderPrefix}${index}/`);
        test.multiTestCase.forEach(async (mutliTest, multiTestIndex) => {
          const multiTestPath = `${multiInputPath}${inputPrefixTestName}${multiTestIndex}`;
          fs.writeFileSync(multiTestPath, mutliTest.input);
          // multiTest trigger
          // onFileCreate(`${testFolderPrefix}${problemShortName}/${multiTestFolderPrefix}${index}/${inputPrefixTestName}${multiTestIndex}`, '', 'multitest input');
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
    return await Creator.generateTestFile(getDirectoryFromPath(filePath), problemData, {
      fileName: getBaseFileName(getFileNameFromPath(filePath)),
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
  static async addTestCase(filePath, fileName, { onBeginInput = () => { }, onEndInput = () => { }, onBeginOutput = () => { }, onEndOutput = () => { }, onFileCreate = () => { }, onFolderCreate = () => { }, } = {}) {
    let problemData = new ProblemData();
    let test = new TestCase();
    onBeginInput();
    test.input = await captureUserInput();
    onEndInput();
    onBeginOutput();
    test.output = await captureUserInput();
    onEndOutput();
    problemData.addTestCase(test);
    Creator.generateTestFileWithFilePath(`${filePath}${fileName}`, problemData, {
      fileName: fileName,
      onFileCreate: onFileCreate,
      onFolderCreate: onFolderCreate,
    });
  }
}
export { Creator };
export default {
  Creator
};
