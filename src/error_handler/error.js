class Exception {
  static canNotCreateFile() { return new Error("Can't not create file");
  }

  static NoSourceFile(fileName) {
    return new Error(`No source file with name: ${fileName}`);
  }

  static NoTestFileAvailable(fileName) {
    return new Error(`No test file for source file: ${fileName}`);
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
