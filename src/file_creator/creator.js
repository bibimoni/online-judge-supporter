const fs = require("fs-extra");
const { Crawler } = require("../parser/crawler");
const { ProblemData } = require("../test/problem_data");
const { Exception } = require("../error_handler/error");
const {
  getConfig,
  loadConfigFile,
  mode,
  testcaseStartIndex,
} = require("../config/load_config");
const { formatDirPath, captureUserInput } = require("./utils");
const {
  multiTestFolderPrefix,
  inputPrefixTestName,
  ansPrefixTestName,
  testFolderPrefix,
} = require("../config/load_config");
const {
  getFileNameFromPath,
  getBaseFileName,
  getDirectoryFromPath
} = require('../compiler/utils');

let configName = "online-judge-supporter_config.json";
//let configDir = `${homedir()}/${configName}`;
const defaultConfigName = "_default_config.json";
//const defaultConfigDir = `${dirname(dirname(__dirname))}/${defaultConfigName}`;
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
        return console.log(`Invalid contest format ${param}`)
        //throw Exception.InvalidContestFormat(param);
      }
      let number_of_problems =param.split("-")[1].charCodeAt(0)  - param.split("-")[0].charCodeAt(0) + 1;
      console.log(number_of_problems)
      let extension_file = param.split(".")[1];
      
      if(!fs.existsSync(`${default_path}/${contest_id}`)){
        try {
          fs.mkdirSync(`${default_path}/${contest_id}`);
        }catch { 
          throw Exception.CanNotCreateFolder(`${default_path}/${contest_id}`);
        }
      }
      loadConfigFile();
      let config = getConfig();
      if(config["extension"][extension_file] === undefined){
        console.log("Languague not found");
        return 0;
      }
      let config_languages = config["extension"][extension_file]["template"];
      
      
      for(let i = 65; i - 65 < number_of_problems; i++){
        if(config_languages === ""){
          console.log(config_languages);
          fs.writeFileSync(`${default_path}/${contest_id}/${String.fromCharCode(i)}.${extension_file}`.toString(), '');
        }else {
          fs.copyFileSync(`${config_languages}`, `${default_path}/${contest_id}/${String.fromCharCode(i)}.${extension_file}`);
        }
      }
      return true;
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
    return true;
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
  static async generateTestFile(
    testDir,
    problemData,
    { fileName = "", onFileCreate = () => { }, onFolderCreate = () => { } } = {},
  ) {
    testDir = formatDirPath(testDir);
    let problemShortName;
    if (!fileName || fileName.length === 0) {
      problemShortName = Crawler.getProblemShortName(
        problemData.name,
      ).toLowerCase();
    } else {
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
      while (
        fs.existsSync(multiInputPath) ||
        fs.existsSync(inputPath) ||
        (fs.existsSync(outputPath) && test.isMultiTest)
      ) {
        index += 1;
        multiInputPath = `${testFolderPath}/${multiTestFolderPrefix}${index}/`;
        inputPath = `${testFolderPath}/${inputPrefixTestName}${index}`;
        outputPath = `${testFolderPath}/${ansPrefixTestName}${index}`;
      }

      fs.writeFileSync(inputPath, test.input);
      onFileCreate(
        `${testFolderPrefix}${problemShortName}/${inputPrefixTestName}${index}`,
        test.input,
        "input",
      );
      fs.writeFileSync(outputPath, test.output);
      onFileCreate(
        `${testFolderPrefix}${problemShortName}/${ansPrefixTestName}${index}`,
        test.output,
        "output",
      );

      if (test.isMultiTest) {
        fs.ensureDir(multiInputPath, mode);
        onFolderCreate(
          `${testFolderPrefix}${problemShortName}/${multiTestFolderPrefix}${index}/`,
        );
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
  static async generateTestFileWithFilePath(
    filePath,
    problemData,
    { onFileCreate = () => { }, onFolderCreate = () => { } } = {},
  ) {
    return await Creator.generateTestFile(
      getDirectoryFromPath(filePath),
      problemData,
      {
        fileName: getBaseFileName(getFileNameFromPath(filePath)),
        onFileCreate,
        onFolderCreate,
      },
    );
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
  static async addTestCase(
    filePath,
    fileName,
    {
      onBeginInput = () => { },
      onEndInput = () => { },
      onBeginOutput = () => { },
      onEndOutput = () => { },
      onFileCreate = () => { },
      onFolderCreate = () => { },
    } = {},
  ) {
    let problemData = new ProblemData();
    let test = new TestCase();

    onBeginInput();
    test.input = await captureUserInput();
    onEndInput();

    onBeginOutput();
    test.output = await captureUserInput();
    onEndOutput();

    problemData.addTestCase(test);
    Creator.generateTestFileWithFilePath(
      `${filePath}${fileName}`,
      problemData,
      {
        fileName: fileName,
        onFileCreate: onFileCreate,
        onFolderCreate: onFolderCreate,
      },
    );
  }
}

module.exports = { Creator };
