const { Crawler } = require('../parser/crawler');
const { createFolder } = require('./utils.js');
const fs = require('fs-extra');

const generate_test_file = async (filePath, testcase) => {
  let problemShortName = Crawler.getProblemShortName(testcase.name).toLowerCase();
  await createFolder(filePath, problemShortName); 

  const testFolderPath = `${filePath}/${problemShortName}/`;
  testcase.testCases.forEach(async (test, index) => {
    const inputPath = `${testFolderPath}/${problemShortName}.in${index}`;
    await fs.writeFile(inputPath, test.input); 

    const outputPath = `${testFolderPath}/${problemShortName}.out${index}`;
    await fs.writeFile(outputPath, test.output); 
  });
};

module.exports = { generate_test_file };
