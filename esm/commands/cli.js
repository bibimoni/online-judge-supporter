import { Command } from "commander";
import { downloadCommand } from "./sub_commands/download.js";
import { testCommand } from "./sub_commands/test.js";
import { loginCommand } from "./sub_commands/login.js";
import { infoCommand } from "./sub_commands/info.js";
import package$0 from "../../package.json" with { type: "json" };
import { Logger } from "./logger.js";
const program = new Command();
const version = package$0.version;
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
    program.parse(process.argv);
};
export { setupCli };
export default {
    setupCli
};
