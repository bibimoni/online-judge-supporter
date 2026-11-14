import path from "node:path";
import fs from "fs-extra";
import { testFolderPrefix, multiTestFolderPrefix, inputPrefixTestName, ansPrefixTestName } from "./config/load_config.js";

// one place for every path the tool builds, so no call site joins with a
// hardcoded "/" (it breaks on Windows and it's easy to get the separators
// wrong when a folder and a file name are pasted together)
const fileName = (filePath) => {
  return path.basename(filePath);
};
const directory = (filePath) => {
  return path.dirname(filePath);
};
const extension = (filePath) => {
  return path.extname(filePath).slice(1);
};
const baseName = (filePath) => {
  return path.basename(filePath, path.extname(filePath));
};
const withoutExtension = (filePath) => {
  return path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath)));
};
// re-exported so call sites import the paths from one module
const join = path.join;
const exists = (filePath) => fs.existsSync(filePath);
/**
 * the folder that holds the testcases of a problem, next to the solution
 *
 * @param {String} filePath path to the solution
 * @returns {String}
 */
const testFolder = (filePath) => {
  return join(directory(filePath), `${testFolderPrefix}${baseName(filePath)}`);
};
/**
 * a testcase file inside a test folder (see `testFolder` or `multiTestFolder`)
 *
 * @param {String} folder that holds the testcase files
 * @param {String} prefix inputPrefixTestName or ansPrefixTestName
 * @param {Number|String} index of the testcase
 */
const testFile = (folder, prefix, index) => {
  return join(folder, `${prefix}${index}`);
};
/**
 * the folder that holds the small testcases of a multitest testcase
 *
 * @param {String} filePath path to the solution
 * @param {Number|String} index of the multitest testcase
 */
const multiTestFolder = (filePath, index) => {
  return join(testFolder(filePath), `${multiTestFolderPrefix}${index}`);
};
export { join, fileName, directory, extension, baseName, withoutExtension, exists, testFolder, testFile, multiTestFolder };
export default {
  join,
  fileName,
  directory,
  extension,
  baseName,
  withoutExtension,
  exists,
  testFolder,
  testFile,
  multiTestFolder,
};
