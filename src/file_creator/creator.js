const fs = require('fs-extra');
const { Crawler } = require('../parser/crawler');
const { getConfig, loadConfigFile } = require('../config/load_config');
const { createFolder } = require('./utils');

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

  static async generateTestFile(filePath, testcase) {
    let problemShortName = Crawler.getProblemShortName(testcase.name).toLowerCase();
    await createFolder(filePath, problemShortName);

    const testFolderPath = `${filePath}${problemShortName}`;
    testcase.testCases.forEach(async (test, index) => {
      const inputPath = `${testFolderPath}in${index}`;
      await fs.writeFile(inputPath, test.input);

      const outputPath = `${testFolderPath}/ans${index}`;
      await fs.writeFile(outputPath, test.output);
    });
  }
}
module.exports = { Creator };
