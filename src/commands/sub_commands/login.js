import { Crawler } from "../../parser/crawler.js";
import { Logger } from "../logger.js";
import { createSpinner } from "nanospinner";
const loginCommand = (program) => {
  program
    .command('login')
    .description(`Login to competitive sites`)
    .alias('l')
    .argument('<url>', 'site url to login')
    .action(async (url) => {
      const crawler = new Crawler();
      const spinner = createSpinner();
      spinner.start({
        text: Logger.access(`Logging in: ${url}`),
      });
      try {
        await crawler.login(url);
        Logger.logSuccessSpinner(`Logged in to ${url} successfully!`, {
          spinner: spinner,
        });
      }
      catch (err) {
        Logger.logErrorSpinner(err.message, {
          spinner: spinner,
        });
      }
    });
};
export { loginCommand };
export default {
  loginCommand
};
