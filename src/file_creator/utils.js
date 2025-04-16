const fs = require('fs-extra');
const { mode } = require('../config/load_config');

const createFolder = async (filePath, folderName) => {
  await fs.ensureDir(`${filePath}/${folderName}/`, mode);
};

// ensure directory path to have the finally slash
const formatDirPath = (path) => {
  if (path[path.length - 1] !== '/') {
    return path + '/';
  }
  return path;
}

module.exports = { createFolder, formatDirPath };
