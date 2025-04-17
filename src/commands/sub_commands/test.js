const { Logger } = require('../logger');
const { Compiler } = require('../../compiler/compiler');
const path = process.cwd();
const { TestCase } = require('../../test/testcase');
const testCommand = (program) =>  {
  program
    .command('test')
    .description('Test source file with testcases')
    .alias('t')
    .argument('<filename>', 'Name of the source code (a.rs, b.cpp, c.py, ...)') 
    .action(fileName => {
      const filePath = `${path}/${fileName}`;
      try {
        const compiler = new Compiler({ filePath: filePath });
        compiler.buildFile();
      } catch (e) {
        Logger.logErrorSpinner(e.message);
      }
    });
};

module.exports = { testCommand };