const chalk = require('chalk');
const version = require('../../package.json').version;
const { createSpinner } = require('nanospinner');
const { Verdict } = require('../test/verdict');

class Logger {
  static info(message) {
    return `[${chalk.blue('INFO')}] ${message}`;
  }
  
  static debug(message) {
    return `[${chalk.bold.hex('#FFA500')('DEBUG')}] ${message}`;
  }

  static error(message) {
    return `[${chalk.red('ERROR')}] ${message}`;
  }
  
  static access(message) {
    return `[${chalk.cyan('ACCESS')}] ${message}`;
  }
  
  static success(message) {
    return `[${chalk.green('SUCCESS')}] ${message}`;
  }

  static defaultInfo() {
    return Logger.info(`Online Judge Supporter ${version}`);
  }

  static logFile(path, content, type) {
    return Logger.info(`Saved ${type} to ${path}\n${content}`);
  }

  static logFileSpinner(path, content, type) {
    createSpinner().info({ text: Logger.logFile(path, content, type), mark: 'i' });
  }

  static logFolder(path) {
    return Logger.info(`Created ${path}`);
  }
  
  static logFolderSpinner(path) {
    createSpinner().info({ text: Logger.logFolder(path), mark: 'i' });
  }
  
  static logInfoSpinner(message) {
    createSpinner().info({ text: Logger.info(message), mark: 'i' });
  }
  static logErrorSpinner(message) {
    createSpinner().error({ text: Logger.error(message) });
  }

  static logSuccessSpinner(message) {
    createSpinner().success({ text: Logger.success(message) });
  }

  static logDefaultSpinner() {
    createSpinner().info({ text: Logger.defaultInfo(), mark: 'i' });
  }

  static logVerdict(verdict) {
    switch (verdict) {
      case Verdict.CE: 
        Logger.logErrorSpinner(chalk.cyan('CE'));
        break;
      case Verdict.MLE:
        Logger.logErrorSpinner(chalk.yellow('MLE'));
        break;
      case Verdict.TLE:
        Logger.logErrorSpinner(chalk.blue('TLE'));
        break;
      case Verdict.RE:
        Logger.logErrorSpinner(chalk.red('RE'));
        break;
      case Verdict.WA:
        Logger.logErrorSpinner(chalk.redBright('WA'));
        break;
      case Verdict.AC:
        Logger.logSuccessSpinner(chalk.green('AC'));
        break;
      case Verdict.UNKNOWN:
        Logger.logErrorSpinner(chalk.grey('UNKNOWN'));
        break;
      default:
        Logger.logErrorSpinner('Unknown error');
    }
  }
}

module.exports = { Logger };