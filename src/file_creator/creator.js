const fs = require('fs-extra');
const { Crawler } = require('../parser/crawler');
const { json } = require('stream/consumers');
const { homedir } = require("os");
const { dirname } = require("path");
const { Exception } = require("../exception/exception");

let configName = "online-judge-supporter_config.json";
let configDir = `${homedir()}/${configName}`;
const defaultConfigName = "_default_config.json";
const defaultConfigDir = `${dirname(dirname(__dirname))}/${defaultConfigName}`;
const { getConfig, loadConfigFile } = require('../config/load_config');
const problem_regex = /((^{[a-z]+-[a-z]+})|(^{[A-Z]+-[A-Z]+})|(^[\w-]+)).([a-z]+)$/;

class Creator {
	
	/**
	 * 
	 * @param {*} default_path 
	 * @param {*} contest_id 
	 * @param {*} param
	 */
  	static createContest(default_path, contest_id, param) {
		if(!problem_regex.test(param)){
			throw new Error("Invalid format for contest creation. Please use correct format");
		}
		
		let number_of_problems =  - param.split("-")[0].charCodeAt(1) + 1;
		let extension_file = param.split(".")[1];
		
		if(!fs.existsSync(`${default_path}/${contest_id}`)){
			fs.mkdirSync(`${default_path}/${contest_id}`);
		}
		loadConfigFile();
		let config = getConfig();
		let config_languages = config["languages"][0][extension_file]["template"];
		
		for(let i = 65; i - 65 < number_of_problems; i++){
			if(config_languages === ""){
				fs.writeFileSync(`${default_path}/${contest_id}/${String.fromCharCode(i)}.${extension_file}`);
			}else {
				fs.copyFileSync(`${config_languages}`, `${default_path}/${contest_id}/${String.fromCharCode(i)}.${extension_file}`);
			}
		}
		console.log("Contest created successfully");
	}
	static createProblem(default_path, param) {
		if(!problem_regex.test(param)){
			throw new Error("Invalid format for problem creation. Please use correct format");
		}
		let problem_name = param.split(".")[0];
		let extension_file = param.split(".")[1];
		loadConfigFile();
		let config = getConfig();
		let config_languages = config["languages"][0][extension_file]["template"];

		try{
			if(config_languages === ""){
				fs.writeFileSync(`${default_path}/${problem_name}.${extension_file}`);
			}else {
				fs.copyFileSync(`${config_languages}`, `${default_path}/${problem_name}.${extension_file}`);
			}
		}catch (error){
			throw new Error(error);
		}
		console.log("Problem created successfully");

	}

	static async generate_test_file(filePath, testcase) {
    let problemShortName = Crawler.getProblemShortName(testcase.name).toLowerCase();
    await createFolder(filePath, problemShortName); 

    const testFolderPath = `${filePath}/${problemShortName}/`;
    testcase.testCases.forEach(async (test, index) => {
      const inputPath = `${testFolderPath}/${problemShortName}.in${index}`;
      await fs.writeFile(inputPath, test.input); 

      const outputPath = `${testFolderPath}/${problemShortName}.ans${index}`;
      await fs.writeFile(outputPath, test.output); 
    });
  }
	
}
module.exports = { Creator };
