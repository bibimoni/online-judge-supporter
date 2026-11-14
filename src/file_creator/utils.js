import fs from "fs-extra";
import { mode } from "../config/load_config.js";
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
export default {
    formatDirPath,
    captureUserInput
};
