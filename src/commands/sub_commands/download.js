const { createSpinner } = require('nanospinner');
const { Logger } = require('../logger');
const { Crawler } = require('../../parser/crawler');
const { Exception } = require('../../error_handler/error');
const { Creator } = require('../../file_creator/creator');
const path = process.cwd();

const downloadCommand = (program) => {
  program
    .command('download')
    .description(`Download testcases from url`)
    .alias('d')
    .argument('<name>', `problem shortname (a, b, c, test, ...)`)
    .argument('<url>', `url to the problem page (currently supports atcoder, codeforces)`)
    .action(async (name, str) => {
      let crawler = new Crawler();
      const spinner = createSpinner();
      spinner.info({ text: Logger.defaultInfo(), mark: 'i' });
      spinner.start({ text: Logger.access(`Downloading testcases from ${str}`) });
      try {
        const problemData = await crawler.getProblemFromUrl(str);
        spinner.success({ text: Logger.success(`Testcase downloaded from ${str}`) });
        Creator.generateTestFile(path, problemData, {
          fileName: name,
          onFileCreate: Logger.logFileSpinner,
          onFolderCreate: Logger.logFolderSpinner
        });
      } catch (_) {
        spinner.error({ text: Logger.error(Exception.unsupportedUrl(str).message) });
      }
    });
};

module.exports = { downloadCommand };
