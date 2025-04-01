const { Verdict } = require('../test/verdict');
const { loadConfigFile, getConfig } = require('../config/load_config');
const { 
  expandArgumentWithPath, 
  validateFilePath, 
  getFileNameFromPath, 
  getFileExtension 
} = require('./utils');
const { Exception } = require('../error_handler/error')
const { supportedLanguages } = require('./library');

class Compiler {
  constructor({ filePath } = {}) {
    this.settings = this.getLanguageSettings(filePath);
    this.run = expandArgumentWithPath(this.settings["run"], filePath);
    this.build = expandArgumentWithPath(this.settings["build"], filePath);
    this.debug = expandArgumentWithPath(this.settings["debug"], filePath);
    this.filePath = filePath;
  }

  getLanguageSettings(filePath) { 
    if (!validateFilePath(filePath)) { 
      throw Exception.noSourceFile(filePath); 
    } 
    const fileName = getFileNameFromPath(filePath); 
    if (!fileName || fileName.length === 0) { 
      throw Exception.fileNotFound(fileName); 
    } 
    const extension = getFileExtension(fileName); 
    if (!extension || extension.length === 0) { 
      throw Exception.invalidFileFormat(fileName); 
    } 
    if (!supportedLanguages.includes(extension)) { 
      throw Exception.unsupportedFileExtension(extension); 
    } 
    loadConfigFile(); 
    let config = getConfig(); 
    return config["extension"][extension]; 
  }
}
module.exports = { Compiler };
