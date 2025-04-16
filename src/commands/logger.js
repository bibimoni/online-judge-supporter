const chalk = require('chalk');
const version = require('../../package.json').version;
const { createSpinner } = require('nanospinner');

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
}

module.exports = { Logger };