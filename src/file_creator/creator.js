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
const { json } = require('stream/consumers');
const { homedir } = require("os");
const { dirname } = require("path");
const { Exception } = require("../error_handler/error");

let configName = "online-judge-supporter_config.json";
let configDir = `${homedir()}/${configName}`;
const defaultConfigName = "_default_config.json";
const defaultConfigDir = `${dirname(dirname(__dirname))}/${defaultConfigName}`;
const problem_regex = /((^{[a-z]+-[a-z]+})|(^{[A-Z]+-[A-Z]+})|(^[\w-]+)).([a-z]+)$/;

class Creator {
	
  /**
   *  Creates a folder for the contest or problem based on the provided parameters.
   * 
   * @param {String} default_path - The default path where the contest or problem files will be created.
   * @param {String} contest_id - The unique identifier for the contest.
   * @param {String} param - A string parameter that specifies the format or details of the contest or problem.
   */
  	static createContest(default_path, contest_id, param) {
		if(!problem_regex.test(param)){
			throw Exception.InvalidContestFormat(param);
		}
		
		let number_of_problems =  - param.split("-")[0].charCodeAt(1) + 1;
		let extension_file = param.split(".")[1];
		
		if(!fs.existsSync(`${default_path}/${contest_id}`) && false){
			try {
        fs.mkdirSync(`${default_path}/${contest_id}`);
      }catch { 
        throw Exception.CanNotCreateFolder(`${default_path}/${contest_id}`);
      }
		}
		loadConfigFile();
		let config = getConfig();
    if(config["extension"][extension_file] === undefined){
      throw Exception.LanguageNotFound(extension_file);
    }
    let config_languages = config["extension"][extension_file]["template"];
    
		
		for(let i = 65; i - 65 < number_of_problems; i++){
			if(config_languages === ""){
				fs.writeFileSync(`${default_path}/${contest_id}/${String.fromCharCode(i)}.${extension_file}`);
			}else {
				fs.copyFileSync(`${config_languages}`, `${default_path}/${contest_id}/${String.fromCharCode(i)}.${extension_file}`);
			}
		}
		console.log("Contest created successfully");
	}
  /**
   * Creates a file for a specific problem based on the provided parameters.
   * @param {String} default_path - The default path where the problem file will be created.
   * @param {String} param - A string containing the problem name and file extension in the format "problemName.extension".
   */
	static createProblem(default_path, param) {
		if(!problem_regex.test(param)){
			throw Exception.InvalidFileName(param);
		}
		let problem_name = param.split(".")[0];
		let extension_file = param.split(".")[1];
		loadConfigFile();
		let config = getConfig();
    if(config["extension"][0][extension_file] === undefined){
      throw Exception.LanguageNotFound(extension_file);
    }
		let config_languages = config["languages"][extension_file]["template"];
		if(config_languages === ""){
      fs.writeFileSync(`${default_path}/${problem_name}.${extension_file}`);
    }else {
      fs.copyFileSync(`${config_languages}`, `${default_path}/${problem_name}.${extension_file}`);
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
