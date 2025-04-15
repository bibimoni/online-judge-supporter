const { Command } = require('commander');
const program = new Command();
const path = process.cwd();

const isHttpsUrl = (url) => {
  return url.startswith("https://");
};

const extractContestFromPath = (path) => {

};

const downloadCommand = (program) => {
  program
    .command('download')
    .description(`Download testcases from url or input file/path (currently support codeforces and atcoder supports source file (If you use source file name, remember to put it on this structure: <online_judge>/<contest_id>/<source_file>)
      `)
    .alias('d')
    .argument(
      '<string>', `url or source file name (x.cpp/x.rs)
    `)
    .action(str => {
      console.log(str);
      console.log(path);
    });
};

module.exports = { downloadCommand };
