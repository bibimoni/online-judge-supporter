const { Logger } = require('../logger');
const { Creator } = require('../../file_creator/creator');
const path = process.cwd();
const createFileCommand = (program) =>  {
  program
    .command('create')
    .description('Create a new file')
    .alias('c')
    .argument('<filename>', 'Name of the file code for single file(a.rs, b.cpp, c.py, ...), for multi file ([a-g].cpp .py, .rs, ...')
    .option('-c, --contest <contest_id>', 'Create a new file with the given')
    .action((file_name, options)=>{
      try {
        var result = undefined;
        if(options.contest !== undefined){
          result = Creator.createContest(path, options.contest, file_name);
          if(result === true)Logger.logSuccessSpinner(`Contest ${options.contest} created successfully`);
          else Logger.logErrorSpinner(`${result}`);
          return ;
        }
        result = Creator.createProblem(path, file_name);
        if(result === true) Logger.logSuccessSpinner(`File ${file_name} created successfully`);
        else Logger.logErrorSpinner(result);
      }catch (error) {
        Logger.logErrorSpinner(error.message);
      }
    });
};

module.exports = { createFileCommand };