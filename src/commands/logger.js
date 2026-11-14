import chalk from "chalk";
import package$0 from "../../package.json" with { type: "json" };
import { createSpinner } from "nanospinner";
import { Verdict } from "../test/verdict.js";
const version = package$0.version;
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
  static errorOutput(error) {
    console.log(`${chalk.magenta("Error:")}\n${error}`);
  }
  static info(message) {
    return `[${chalk.blue("INFO")}] ${message}`;
  }
  static debug(message) {
    return `[${chalk.bold.hex("#FFA500")("DEBUG")}] ${message}`;
  }
  static error(message) {
    if (!message || typeof message !== 'string') {
      return `[${chalk.red("ERROR")}] Unknown error`;
    }
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
  static logFileSpinner(path, content, type, { spinner = createSpinner() } = {}) {
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
  static logFileCreated(file_created, { spinner = createSpinner() } = {}) {
    for (let message of file_created) {
      spinner.success({ text: Logger.success(`File ${message} created`) });
    }
  }
  /**
   * @param {Number} verdict
   * @param {Object} options note is put after the verdict, use it to say which
   * testcase failed (stress runs want that, it shows how close the solution is)
   */
  static logVerdict(verdict, { spinner = createSpinner(), note = "" } = {}) {
    const suffix = note.length > 0 ? ` ${chalk.grey(note)}` : "";
    switch (verdict) {
      case Verdict.CE:
        Logger.logErrorSpinner(chalk.cyan("CE") + suffix, { spinner: spinner });
        break;
      case Verdict.MLE:
        Logger.logErrorSpinner(chalk.yellow("MLE") + suffix, { spinner: spinner });
        break;
      case Verdict.TLE:
        Logger.logErrorSpinner(chalk.blue("TLE") + suffix, { spinner: spinner });
        break;
      case Verdict.RE:
        Logger.logErrorSpinner(chalk.red("RE") + suffix, { spinner: spinner });
        break;
      case Verdict.WA:
        Logger.logErrorSpinner(chalk.redBright("WA") + suffix, { spinner: spinner });
        break;
      case Verdict.AC:
        Logger.logSuccessSpinner(chalk.green("AC") + suffix, { spinner: spinner });
        break;
      case Verdict.CRASH:
        Logger.logErrorSpinner(chalk.red("CRASH") + suffix, { spinner: spinner });
        break;
      case Verdict.UNKNOWN:
        Logger.logErrorSpinner(chalk.grey("UNKNOWN") + suffix, { spinner: spinner });
        break;
      default:
        Logger.logErrorSpinner("Unknown error" + suffix, { spinner: spinner });
    }
  }
}
export { Logger };
export default {
  Logger
};
