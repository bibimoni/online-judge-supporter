const fs = require('fs-extra');
const { Crawler } = require('../parser/crawler');
const { ProblemData } = require('../test/problem_data')
const { getConfig, loadConfigFile, mode } = require('../config/load_config');
const { createFolder } = require('./utils');
const {
  multiTestFolderName,
  inputPrefixTestName,
  ansPrefixTestName,
} = require('../config/load_config');
const {
  getFileNameFromPath,
  getBaseFileName,
  getDirectoryFromPath
} = require('../compiler/utils');

class Creator {
  static createContest(default_path, contest_id, number_of_problems, extension_file) {
    // Check if user has existing folder path
    if (!fs.existsSync(`${default_path}/${contest_id}`)) {
      fs.mkdirSync(`${default_path}/${contest_id}`);
    }
    loadConfigFile();
    let config = getConfig();
    let config_languages = config["languages"][0][extension_file]["template"];

    // Create the problems with number of problems
    for (let i = 65; i - 65 < number_of_problems; i++) {
      // Create a folder for each problem
      // Check if user has existing template files path
      if (config_languages === "") {
        fs.writeFileSync(`${default_path}/${contest_id}/${String.fromCharCode(i)}.${extension_file}`);
      } else {
        fs.copyFileSync(`${config_languages}`, `${default_path}/${contest_id}/${String.fromCharCode(i)}.${extension_file}`);
      }
    }
    //notify the user that the contest has been created
    console.log("Contest created successfully");
  }
  static createProblem(default_path, problem_id, extension_file) {
    // Check if user has existing folder path
    loadConfigFile();
    let config = getConfig();
    let config_languages = config["languages"][0][extension_file]["template"];

    if (config_languages === "") {
      fs.writeFileSync(`${default_path}/${problem_id}.${extension_file}`);
    } else {
      fs.copyFileSync(`${config_languages}`, `${default_path}/${problem_id}.${extension_file}`);
    }
    console.log("Problem created successfully");

  }

  /**
  * generate a folder containing tests from given problemData
  * the folder have the problem name containing with inputs, outputs 
  * and theirs index, also generate a multitest folder if supported
  *
  * @param {String} testFolder directory that will contain the test file
  * @param {ProblemData} problemData crawlered data
  * @param {String} fileName, if provided use this as the test folder name
  * otherwise use the problemData' short name
  */
  static async generateTestFile(testDir, problemData, { fileName = "" } = {}) {
    let problemShortName;
    if (!fileName || fileName.length === 0) {
      problemShortName = Crawler.getProblemShortName(problemData.name).toLowerCase();
    }
    else {
      problemShortName = fileName;
    }
    await createFolder(testDir, problemShortName);
    const testFolderPath = `${testDir}${problemShortName}`;
    let index = 0;
    problemData.testCases.forEach(async (test, index) => {
      const inputPath = `${testFolderPath}/${inputPrefixTestName}${index}`;
      await fs.writeFile(inputPath, test.input);

      const outputPath = `${testFolderPath}/${ansPrefixTestName}${index}`;
      await fs.writeFile(outputPath, test.output);
      if (test.isMultiTest) {
        const multiInputPath = `${testFolderPath}/${multiTestFolderName}_${index}/`;
        fs.ensureDir(multiInputPath, mode);
        test.multiTestCase.forEach(async (mutliTest, multiTestIndex) => {
          const multiTestPath = `${multiInputPath}${inputPrefixTestName}${multiTestIndex}`;
          await fs.writeFile(multiTestPath, mutliTest.input);
        })
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
  */
  static async generateTestFileWithFilePath(filePath, problemData) {
    console.log(getFileNameFromPath(filePath), "filename");
    return await Creator.generateTestFile(getDirectoryFromPath(filePath), problemData, {
      fileName: getBaseFileName(getFileNameFromPath(filePath))
    });
  }
}

module.exports = { Creator };
