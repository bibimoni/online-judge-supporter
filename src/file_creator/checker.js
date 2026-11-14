import fs from "fs-extra";
import { checkerMiddleName } from "../config/load_config.js";
import { getFileNameFromPath, getBaseFileName } from "../compiler/utils.js";
import { formatDirPath } from "./utils.js";

// the checker is built by Compiler, so it only supports compiled languages
const checkerExtension = "cpp";
class Checker {
  /**
   * find the checker of a source file, the checker is named
   * `<problem>__Checker.cpp` and is placed next to the source file
   *
   * @param {String} filePath path to the source file
   * @returns {String|null} path to the checker, or null if there is none
   */
  static find(filePath) {
    let baseName = getBaseFileName(getFileNameFromPath(filePath));
    // a bare file name has no directory, so it's in the current directory
    let dir = formatDirPath(filePath.slice(0, -getFileNameFromPath(filePath).length)) || "./";
    let checkerPath = `${dir}${baseName}${checkerMiddleName}.${checkerExtension}`;
    return fs.existsSync(checkerPath) ? checkerPath : null;
  }
}
export { Checker };
export default {
  Checker
};
