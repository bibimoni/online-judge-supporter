import fs from "fs-extra";
import { mode, getConfig } from "../config/load_config.js";
import { supportedLanguages } from "../compiler/library.js";
import { getFileNameFromPath, getBaseFileName } from "../compiler/utils.js";
import readline from "readline";
// const createFolder = async (filePath, folderName) => {
//   await fs.ensureDir(`${filePath}/${folderName}/`, mode);
// };
// ensure directory path to have the finally slash
// an empty path is the current directory, so it stays empty
const formatDirPath = (path) => {
    if (path.length === 0) {
        return path;
    }
    if (path[path.length - 1] !== "/") {
        return path + "/";
    }
    return path;
};
/**
 * find the file named `<problem>__<middle>.<extension>` next to the source file,
 * any language in the config can be used
 *
 * @param {String} filePath path to the source file
 * @param {String} middle part of the name that tells what the file is (__Generator, __Good, ...)
 * @returns {String|null} path to the file, or null if there is none
 */
const findCompanionFile = (filePath, middle) => {
    let config = getConfig();
    let extensions = supportedLanguages.filter((extension) => config["extension"][extension]);
    let fileName = getFileNameFromPath(filePath);
    let baseName = getBaseFileName(fileName);
    // a bare file name has no directory, so it's in the current directory
    let dir = formatDirPath(filePath.slice(0, -fileName.length)) || "./";
    for (const extension of extensions) {
        let companionPath = `${dir}${baseName}${middle}.${extension}`;
        if (fs.existsSync(companionPath)) {
            return companionPath;
        }
    }
    return null;
};
const captureUserInput = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        let userInput = "";
        rl.on("line", (input) => {
            userInput += input.toString() + "\n";
        });
        rl.on("close", () => {
            resolve(userInput);
        });
    });
};
export { formatDirPath };
export { captureUserInput };
export { findCompanionFile };
export default {
    formatDirPath,
    captureUserInput,
    findCompanionFile
};
