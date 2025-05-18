import { Command } from "commander";
import { downloadCommand } from "./sub_commands/download.js";
import { testCommand } from "./sub_commands/test.js";
import { loginCommand } from "./sub_commands/login.js";
import { infoCommand } from "./sub_commands/info.js";
import package$0 from "../../package.json" with { type: "json" };
import { Logger } from "./logger.js";
const program = new Command();
const version = package$0.version;
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
export { setupCli };
export default {
  setupCli
};
