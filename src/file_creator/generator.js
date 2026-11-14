import { generatorMiddleName } from "../config/load_config.js";
import { findCompanionFile } from "./utils.js";

class Generator {
  /**
   * find the generator of a source file, the generator is named
   * `<problem>__Generator.<ext>` and is placed next to the source file
   *
   * @param {String} filePath path to the source file
   * @returns {String|null} path to the generator, or null if there is none
   */
  static find(filePath) {
    return findCompanionFile(filePath, generatorMiddleName);
  }
}
export { Generator };
export default {
  Generator
};
