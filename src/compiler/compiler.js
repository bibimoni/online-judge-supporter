const { Verdict } = require('../test/verdict');
const { loadConfigFile, getConfig } = require('../config/load_config');
const { validateFileDirectory, getFileNameFromPath, getFileExtension } = require('./utils');
const { Exception } = require('../error_handler/error')
const fs = require('fs-extra');
const { supportedLanguages } = require('./library');

class Compiler {
  constructor({ fileDirectory } = {}) {
    if (!validateFileDirectory(fileDirectory)) {
      throw Exception.NoSourceFile(fileDirectory); 
    }
    const fileName = getFileNameFromPath(fileDirectory);
    if (!fileName || fileName.length === 0) {
      throw Exception.FileNotFound(fileName);
    }
    const extension = getFileExtension(fileName);
    if (!extension || extension.length === 0) {
      throw Exception.InvalidFileFormat(fileName);
    }
  }

   
}
