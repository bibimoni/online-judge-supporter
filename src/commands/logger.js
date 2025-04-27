const chalk = require("chalk");
const version = require("../../package.json").version;
const { createSpinner } = require("nanospinner");
const { Verdict } = require("../test/verdict");

class Logger {
  static input(input) {
    console.log(`${chalk.cyanBright("Input:")}\n${input}`);
  }

  static output(output) {
    console.log(`${chalk.red("Ouput:")}\n${output}`);
  }

  static answer(answer) {
    console.log(`${chalk.green("Expected:")}\n${answer}`);
  }

  static info(message) {
    return `[${chalk.blue("INFO")}] ${message}`;
  }

  static debug(message) {
    return `[${chalk.bold.hex("#FFA500")("DEBUG")}] ${message}`;
  }

  static error(message) {
    if (message.startsWith("error: ")) {
      message = message.slice("error: ".length);
    }
    return `[${chalk.red("ERROR")}] ${message}`;
  }

  static access(message) {
    return `[${chalk.cyan("ACCESS")}] ${message}`;
  }

  static success(message) {
    return `[${chalk.green("SUCCESS")}] ${message}`;
  }

  static defaultInfo() {
    return Logger.info(`Online Judge Supporter ${version}`);
  }

  static logFile(path, content, type) {
    return Logger.info(`Saved ${type} to ${path}\n${content}`);
  }

  static logFileSpinner(
    path,
    content,
    type,
    { spinner = createSpinner() } = {},
  ) {
    spinner.info({ text: Logger.logFile(path, content, type), mark: "i" });
  }

  static logFolder(path) {
    return Logger.info(`Created ${path}`);
  }

  static logFolderSpinner(path, { spinner = createSpinner() } = {}) {
    spinner.info({ text: Logger.logFolder(path), mark: "i" });
  }
  
  static logInfoSpinner(message) {
    createSpinner().info({ text: Logger.info(message), mark: 'i' });
  }
  static logErrorSpinner(message, { spinner = createSpinner() } = {}) {
    spinner.error({ text: Logger.error(message) });
  }

  static logSuccessSpinner(message, { spinner = createSpinner() } = {}) {
    spinner.success({ text: Logger.success(message) });
  }

  static logDefaultSpinner({ spinner = createSpinner() } = {}) {
    spinner.info({ text: Logger.defaultInfo(), mark: "i" });
  }

  static logInfoSpinner(message, { spinner = createSpinner() } = {}) {
    spinner.info({ text: Logger.info(message), mark: "i" });
  }

  static logVerdict(verdict, { spinner = createSpinner() } = {}) {
    switch (verdict) {
      case Verdict.CE:
        Logger.logErrorSpinner(chalk.cyan("CE"), { spinner: spinner });
        break;
      case Verdict.MLE:
        Logger.logErrorSpinner(chalk.yellow("MLE"), { spinner: spinner });
        break;
      case Verdict.TLE:
        Logger.logErrorSpinner(chalk.blue("TLE"), { spinner: spinner });
        break;
      case Verdict.RE:
        Logger.logErrorSpinner(chalk.red("RE"), { spinner: spinner });
        break;
      case Verdict.WA:
        Logger.logErrorSpinner(chalk.redBright("WA"), { spinner: spinner });
        break;
      case Verdict.AC:
        Logger.logSuccessSpinner(chalk.green("AC"), { spinner: spinner });
        break;
      case Verdict.UNKNOWN:
        Logger.logErrorSpinner(chalk.grey("UNKNOWN"), { spinner: spinner });
        break;
      default:
        Logger.logErrorSpinner("Unknown error", { spinner: spinner });
    }
  }
}

module.exports = { Logger };
