const { Command } = require('commander');
const program = new Command();
const { downloadCommand } = require('./sub_commands/download');
const { testCommand } = require('./sub_commands/test');
const { createFileCommand } = require('./sub_commands/creator');
const version = require('../../package.json').version;
const { Logger } = require('./logger');
const setupCli = () => {
  program
    .name("online-judge-supporter")
    .description("CLI that supports competitve programming on online judges")
    .version(version);

  Logger.logDefaultSpinner();

  downloadCommand(program);
  testCommand(program);
  createFileCommand(program);
  program.parse(process.argv);
};

module.exports = { setupCli };