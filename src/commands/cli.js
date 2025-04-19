const { Command } = require("commander");
const program = new Command();
const { downloadCommand } = require("./sub_commands/download");
const { testCommand } = require("./sub_commands/test");
const version = require("../../package.json").version;
const { Logger } = require("./logger");

const setupCli = () => {
  program
    .name("online-judge-supporter")
    .description("CLI that supports competitve programming on online judges")
    .version(version)
    .configureOutput({
      writeOut: (str) => Logger.logInfoSpinner(str),
      writeErr: (str) => Logger.logErrorSpinner(str),
    });
  Logger.logDefaultSpinner();

  downloadCommand(program);
  testCommand(program);

  program.parse(process.argv);
};

module.exports = { setupCli };
