import chalk from "chalk";
import package$0 from "../../package.json" with { type: "json" };
import { createSpinner } from "nanospinner";
import { Verdict } from "../test/verdict.js";
const version = package$0.version;
// split an output into lines, ignore the line ending of the last line
const splitLines = (value) => {
  const lines = (value ?? "").split(/\r?\n/);
  if (lines[lines.length - 1] === "") {
    lines.pop();
  }
  return lines;
};
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
  static diff(expected, output) {
    console.log(`${chalk.green("Expected:")}\n${expected}`);
    console.log(`${chalk.red("Ouput:")}\n${output}`);
    const expectedLines = splitLines(expected);
    const outputLines = splitLines(output);
    const lineCount = Math.max(expectedLines.length, outputLines.length);
    const lineNumberSize = String(lineCount).length;
    // pad both columns so the difference is easy to spot
    const expectedWidth = Math.max(...expectedLines.map((line) => line.length), "expected".length);
    const outputWidth = Math.max(...outputLines.map((line) => line.length), 0);
    const expectedColumn = (line, size) =>
      `${line ?? chalk.grey("(missing)")}${" ".repeat(size - (line?.length ?? 0))}`;
    console.log(chalk.bold("Difference:"));
    console.log(`${" ".repeat(lineNumberSize)}   ${chalk.green("expected")}${" ".repeat(expectedWidth - "expected".length + 1)}| ${chalk.red("output")}`);
    console.log(`${"─".repeat(lineNumberSize)}──${"─".repeat(expectedWidth + 1)}┼${"─".repeat(outputWidth + 1)}`);
    for (let index = 0; index < lineCount; index++) {
      const expectedLine = expectedLines[index];
      const outputLine = outputLines[index];
      const differing = expectedLine !== outputLine;
      const marker = differing ? chalk.red("<") : " ";
      const lineNumber = String(index + 1).padStart(lineNumberSize, " ");
      console.log(`${lineNumber} ${marker} ${expectedColumn(expectedLine, expectedWidth)}| ${outputLine ?? chalk.grey("(missing)")}`);
    }
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
      case Verdict.CRASH:
        Logger.logErrorSpinner(chalk.red("CRASH"), { spinner: spinner });
        break;
      case Verdict.UNKNOWN:
        Logger.logErrorSpinner(chalk.grey("UNKNOWN"), { spinner: spinner });
        break;
      default:
        Logger.logErrorSpinner("Unknown error", { spinner: spinner });
    }
  }
}
export { Logger };
export default {
  Logger
};
