const { createSpinner } = require("nanospinner");
const { Logger } = require("../logger");
const { Crawler } = require("../../parser/crawler");
const { Exception } = require("../../error_handler/error");
const { Creator } = require("../../file_creator/creator");
const path = process.cwd();

const downloadCommand = (program) => {
  program
    .command("download")
    .description(`Download testcases from url`)
    .alias("d")
    .argument(
      "<url>",
      `url to the problem page (currently supports atcoder, codeforces)`,
    )
    .argument("[name]", `problem shortname (a, b, c, test, ...)`)
    .action(async (url, name) => {
      let crawler = new Crawler();
      const spinner = createSpinner();
      spinner.start({
        text: Logger.access(`Downloading testcases from ${url}`),
      });
      try {
        const problemData = await crawler.getProblemFromUrl(url);
        name ??= Crawler.getProblemShortName(problemData.name);
        Logger.logSuccessSpinner(`Testcase downloaded from ${url}`, {
          spinner: spinner,
        });
        Creator.generateTestFile(path, problemData, {
          fileName: name,
          onFileCreate: Logger.logFileSpinner,
          onFolderCreate: Logger.logFolderSpinner,
        });
      } catch (_) {
        Logger.logErrorSpinner(Exception.unsupportedUrl(url).message, {
          spinner: spinner,
        });
      }
    });
};

module.exports = { downloadCommand };
