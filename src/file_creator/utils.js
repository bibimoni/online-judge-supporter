const fs = require('fs-extra');
const { mode } = require('../config/load_config');

const createFolder = async (filePath, folderName) => {
  await fs.ensureDir(`${filePath}/${folderName}/`, mode);
};

module.exports = { createFolder };
