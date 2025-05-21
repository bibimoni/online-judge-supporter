class Exception {
  static canNotCreateFile() {
    return new Error("Can't not create file");
  }
  static noSourceFile(fileDirectory) {
    return new Error(`No source file with name: ${fileDirectory}`);
  }
  static canNotCreateFolder(pathFolder) {
    return new Error(`Folder can not create: ${pathFolder}`);
  }
  static noTestAvailable(fileName) {
    return new Error(`No test file for source file: ${fileName}`);
  }
  static fileNotFound(fileName) {
    return new Error(`File: ${fileName} Not Found`);
  }
  static testFileNotFound(fileName, fileIndex) {
    return new Error(`Test number ${fileIndex} is not available for source file: ${fileName}`);
  }
  static noBinaryFile(fileName) {
    return new Error(`No binary file found for source file: ${fileName}`);
  }
  static invalidContestFormat(contest) {
    return new Error(`Invalid contest format : ${fileName}`)
  }
  static invalidFile(fileName) {
    return new Error(`Invalid file format : ${fileName}`)
  }
  static languageNotFound(language) {
    return new Error(`Invalid language : ${language}`)
  }
  static invalidFileFormat(fileName) {
    return new Error(`Can not get file extension from: ${fileName}`)
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
  static notLoggedIn(site) {
    return new Error(`${site} hasn't been logged in`);
  }
  static loginFailed(site) {
    return new Error(`Failed to login into ${site}`);
  }
  static canNotFetchData(site) {
    return new Error(`Failed to fetch from ${site}`);
  }
}
export { Exception };
export default {
  Exception
};
