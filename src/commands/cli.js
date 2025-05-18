const { Command, createCommand } = require("commander");
const program = new Command();
const { downloadCommand } = require("./sub_commands/download");
const { testCommand } = require("./sub_commands/test");
const { loginCommand } = require("./sub_commands/login");
const { infoCommand } = require("./sub_commands/info");
const version = require("../../package.json").version;
const { Logger } = require("./logger");
const { createFileCommand } = require("./sub_commands/creator");

const setupCli = () => {
  program
    .name("online-judge-supporter")
    .description("CLI that supports competitve programming on online judges")
    .version(version)
    .alias('ojs')
    .configureOutput({
      writeOut: (str) => Logger.logInfoSpinner(str),
      writeErr: (str) => Logger.logErrorSpinner(str),
    });
  Logger.logDefaultSpinner();

  infoCommand(program);
  downloadCommand(program);
  testCommand(program);
  loginCommand(program);
  createFileCommand(program);
  program.parse(process.argv);
};

module.exports = { setupCli };
