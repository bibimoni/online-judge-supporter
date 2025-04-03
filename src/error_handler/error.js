class Exception {
  static CanNotCreateFile() {
    return new Error("Can't not create file");
  }
  static CanNotCreateFolder(dirname) {
    return new Error(`Can't not create folder, no such directory: ${dirname}`);
  }
  static InvalidFileName(fileName) {
    return new Error(`Invalid file name: ${fileName}`);
  }
  static NoSourceFile(fileName) {
    return new Error(`No source file with name: ${fileName}`);
  }
  static LanguageNotFound(language) {
    return new Error(`Language not found: ${language}`);
  }
  static NoTestFileAvailable(fileName) {
    return new Error(`No test file for source file: ${fileName}`);
  }
  static InvalidContestFormat() {
    return new Error("Invalid contest format. Please use correct format");
  }
  static FileNotFound(fileName) {
    return new Error(`File Not Found ${fileName}`)
  }
  
  static TestFileNotFound(fileName, fileIndex) {
    return new Error(`Test number ${fileIndex} is not available for source file: ${fileName}`)
  }

  static NoBinaryFile(fileName) {
    return new Error(`No binary file found for source file: ${fileName}`);
  }
}

module.exports = { Exception };
