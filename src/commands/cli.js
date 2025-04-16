const { Command } = require('commander');
const program = new Command();
const { downloadCommand } = require('./sub_commands/download');
const version = require('../../package.json').version;

const setupCli = () => {
  program
    .name("online-judge-supporter")
    .description("CLI that supports competitve programming on online judges")
    .version(version);

  downloadCommand(program);
  
  program.parse(process.argv);
};

module.exports = { setupCli };