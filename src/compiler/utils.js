const fs = require('fs-extra');

const expandArgumentWithPath = (command, filePath) => {
  if (command === null) {
    return command;
  }
  const fileName = getFileNameFromPath(filePath);
  return expandArgument(command, {
    file: fileName,
    relativeFile: filePath,
    fileBase: getBaseFileName(fileName),
    relativeDir: getDirectoryFromPath(filePath)
  })
};

const expandArgument = (
  command, {
    file,
    relativeFile,
    fileBase,
    relativeDir
  }) => {
  return command.replaceAll("{file}", file)
    .replaceAll("{relative_file}", relativeFile)
    .replaceAll("{file_base}", fileBase)
    .replaceAll("{relative_dir}", relativeDir);
};

const validateFilePath = (filePath) => {
  return filePath && fs.existsSync(filePath);
};

const getFileNameFromPath = (filePath) => {
  return filePath.split("/").reverse()[0];
};

const getDirectoryFromPath = (filePath) => {
  return filePath.slice(0, -getFileNameFromPath(filePath).length);
};

const getFileExtension = (fileName) => {
  return fileName.split(".").reverse()[0]; 
};

const getBaseFileName = (fileName) => {
  return fileName.slice(0, -getFileExtension(fileName).length 
    - (fileName.includes(".") ? 1 : 0));
};

module.exports = { 
  validateFilePath,
  getFileNameFromPath,
  getFileExtension,
  expandArgumentWithPath,
  getDirectoryFromPath,
  getBaseFileName,
};
