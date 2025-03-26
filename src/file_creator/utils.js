const fs = require('fs-extra');
const mode = 0o2775;

const createFolder = async (filePath, folderName) => {
  await fs.ensureDir(`${filePath}/${folderName}/`, mode);
};

module.exports = { createFolder };
