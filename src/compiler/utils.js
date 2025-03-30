const validateFileDirectory = (fileDirectory) => {
  return fileDirectory && fs.existsSync(fileDirectory);
};

const getFileNameFromPath = (fileDirectory) => {
  return fileDirectory.split("/").reverse()[0];
}

const getFileExtension = (fileName) => {
  return fileName.split(".").reverse()[0]; 
};

module.exports = { 
  validateFileDirectory,
  getFileNameFromPath,
  getFileExtension,
};
