const { Command } = require('commander');
const program = new Command();

const downloadCommand = (program) => {
  program
    .command('download')
    .description('Download testcases from url or input file/path')
    .alias('d')
};
