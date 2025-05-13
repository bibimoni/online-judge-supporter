import fs from "fs-extra";
import { Crawler } from "../parser/crawler.js";
import { ProblemData } from "../test/problem_data.js";
import { getConfig, loadConfigFile, mode, testcaseStartIndex } from "../config/load_config.js";
import { formatDirPath, captureUserInput } from "./utils.js";
import { multiTestFolderPrefix, inputPrefixTestName, ansPrefixTestName, testFolderPrefix } from "../config/load_config.js";
import { getFileNameFromPath, getBaseFileName, getDirectoryFromPath } from "../compiler/utils.js";
import { TestCase } from "../test/testcase.js";
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
            }
            else {
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
        }
        else {
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
