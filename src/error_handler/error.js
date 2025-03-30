class Exception {
  static canNotCreateFile() {
    return new Error("Can't not create file");
  }

  static noSourceFile(fileDirectory) {
    return new Error(`No source file with name: ${fileDirectory}`);
  }

  static noTestFileAvailable(fileName) {
    return new Error(`No test file for source file: ${fileName}`);
  }

  static fileNotFound(fileName) {
    return new Error(`File: ${fileName} Not Found`)
  }
  
  static testFileNotFound(fileName, fileIndex) {
    return new Error(`Test number ${fileIndex} is not available for source file: ${fileName}`)
  }

  static noBinaryFile(fileName) {
    return new Error(`No binary file found for source file: ${fileName}`);
  }

  static invalidFileFormat(fileName) {
    return new Error(`Can't not get file extension from: ${fileName}`)
  }

  static unsupportedFileExtension(extension) {
    return new Error(`The .${extension} extension is not supported`);
  }
}

module.exports = { Exception };
