import { Logger } from '../logger.js';
import { Creator } from '../../file_creator/creator.js';
const path = process.cwd();
const createFileCommand = (program) => {
  program
    .command('create')
    .description('Create a new file')
    .alias('c')
    .argument('<filename>', 'Name of the file code for single file(a.rs, b.cpp, c.py, ...), for multi file ([a-g].cpp .py, .rs, ...')
    .option('-c, --contest <contest_id>', 'Create a new file with the given')
    .action((file_name, options) => {
      try {

        if (options.contest !== undefined) {
          Creator.createContest(path, options.contest, file_name, { on_file_created: Logger.logFileCreated });

        } else {
          Creator.createProblem(path, file_name, { on_file_created: Logger.logFileCreated });

        }
      } catch (error) {
        Logger.logErrorSpinner(error.message);

      }
    });
};
export { createFileCommand };
export default {
  createFileCommand
};
