import fs from "fs-extra";
import { getConfig, generatorMiddleName } from "../config/load_config.js";
import { supportedLanguages } from "../compiler/library.js";
import { getFileNameFromPath, getBaseFileName } from "../compiler/utils.js";
import { formatDirPath } from "./utils.js";

class Generator {
  /**
   * find the generator of a source file, the generator is named
   * `<problem>__Generator.<ext>` and is placed next to the source file
   *
   * @param {String} filePath path to the source file
   * @returns {String|null} path to the generator, or null if there is none
   */
  static find(filePath) {
    let config = getConfig();
    let extensions = supportedLanguages.filter((ext) => config["extension"][ext]);
    let baseName = getBaseFileName(getFileNameFromPath(filePath));
    // a bare file name has no directory, so it's in the current directory
    let dir = formatDirPath(filePath.slice(0, -getFileNameFromPath(filePath).length)) || "./";
    for (const extension of extensions) {
      let generatorPath = `${dir}${baseName}${generatorMiddleName}.${extension}`;
      if (fs.existsSync(generatorPath)) {
        return generatorPath;
      }
    }
    return null;
  }
}
export { Generator };
export default {
  Generator
};
