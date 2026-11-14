import { checkerMiddleName } from "../config/load_config.js";
import { findCompanionFile } from "./utils.js";

class Checker {
  /**
   * find the checker of a source file, the checker is named
   * `<problem>__Checker.<ext>` and is placed next to the source file
   *
   * @param {String} filePath path to the source file
   * @returns {String|null} path to the checker, or null if there is none
   */
  static find(filePath) {
    return findCompanionFile(filePath, checkerMiddleName);
  }
}
export { Checker };
export default {
  Checker
};
