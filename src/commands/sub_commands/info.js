const { Logger } = require("../logger");
const { configFolder, configDir } = require('../../config/load_config');
const chalk = require('chalk');

const infoCommand = (program) => {
  program
    .command('info')
    .description(`Show files path`)
    .action(() => {
      Logger.logInfoSpinner(`Config file path: ${chalk.cyanBright(configDir)}`);
      Logger.logInfoSpinner(`Cookies directory ${chalk.cyanBright(configFolder)}`);
    });
};

module.exports = { infoCommand };