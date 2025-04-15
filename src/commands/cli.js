const { Command } = require('commander');
const program = new Command();
const { downloadCommand } = require('./sub_commands/download');

const setupCli = () => {
  program
    .name("online-judge-supporter")
    .description("CLI that supports competitve programming on online judges")
    .version("0.0.1")

  downloadCommand(program);
  
  program.parse(process.argv);
};

module.exports = { setupCli };