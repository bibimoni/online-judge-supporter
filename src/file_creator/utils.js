const fs = require("fs-extra");
const { mode } = require("../config/load_config");
const readline = require("readline");

// const createFolder = async (filePath, folderName) => {
//   await fs.ensureDir(`${filePath}/${folderName}/`, mode);
// };

// ensure directory path to have the finally slash
const formatDirPath = (path) => {
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
module.exports = { formatDirPath, captureUserInput };
