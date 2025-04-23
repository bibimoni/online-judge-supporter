const { loadConfigFile, getConfig } = require('./load_config');

const test1 = () => {
  loadConfigFile();
};

const test2 = () => {
  loadConfigFile();
  console.log(getConfig());
}
test2();
