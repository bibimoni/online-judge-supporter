class Exception {
  static canNotCreateFile() { 
    return new Error("Can't not create file");
  }

  static noSourceFile(fileDirectory) {
    return new Error(`No source file with name: ${fileDirectory}`);
  }

  static noTestAvailable(fileName) {
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

  static canNotReadTestFile(fileName) {
    return new Error(`Can't read test file with name ${fileName}`);
  }

  static unsupportedUrl(url) {
    return new Error(`Unsupported URL: ${url}`);
  }

  static buildFailed(message) {
    return new Error(`Build failed: ${message}`);
  }
}

module.exports = { Exception };
