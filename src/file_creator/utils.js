import { getConfig } from "../config/load_config.js";
import { supportedLanguages } from "../compiler/library.js";
import { join, directory, baseName, exists } from "../path.js";
import readline from "readline";
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
    for (const extension of extensions) {
        let companionPath = join(directory(filePath), `${baseName(filePath)}${middle}.${extension}`);
        if (exists(companionPath)) {
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
export { captureUserInput };
export { findCompanionFile };
export default {
    captureUserInput,
    findCompanionFile
};
