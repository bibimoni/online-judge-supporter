import { Logger } from "../logger.js";
import { configFolder, configDir } from "../../config/load_config.js";
import chalk from "chalk";
const infoCommand = (program) => {
    program
        .command('info')
        .description(`Show files path`)
        .action(() => {
        Logger.logInfoSpinner(`Config file path: ${chalk.cyanBright(configDir)}`);
        Logger.logInfoSpinner(`Cookies directory ${chalk.cyanBright(configFolder)}`);
    });
};
export { infoCommand };
export default {
    infoCommand
};
