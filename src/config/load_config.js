const fs = require("fs-extra");
const { homedir } = require("os");
let configName = "online-judge-supporter_config.json";
let configDir = `${homedir()}/${configName}`;
const defaultConfigName = "_default_config.json";
const { dirname } = require("path");
const defaultConfigDir = `${dirname(dirname(__dirname))}/${defaultConfigName}`;

let config = JSON.parse(fs.readFileSync(defaultConfigDir, "utf8")); // init as default
const mode = 0o2775;
const multiTestFolderPrefix = "__multi_";
const ansPrefixTestName = "ans";
const inputPrefixTestName = "in";
const outputPrefixTestName = "out";
const testFolderPrefix = "__test_";
const testcaseStartIndex = 1;

/**
 *  the user may be able to change the config without exiting the program
 *  so this function should be invoked everytime the config changed
 */
const loadConfigFile = () => {
  // check if the config exists, if not, clone the default config to it
  if (!fs.existsSync(configDir)) {
    fs.copySync(defaultConfigDir, configDir);
  }
  const jsonPlain = fs.readFileSync(configDir, "utf-8");
  // const jsonPlain = jsonPlain.slice(
  //   content.indexOf("{") + 1,
  //   content.lastIndexOf("}"),
  // );
  // only apply config with the config is a valid string
  try {
    let o = JSON.parse(jsonPlain);
    if (o && typeof o == "object") {
      config = o;
    }
  } catch { }
};

/**
 * return the config defined by the user
 */
const getConfig = () => {
  return config;
};

module.exports = {
  mode,
  multiTestFolderPrefix,
  testFolderPrefix,
  ansPrefixTestName,
  outputPrefixTestName,
  inputPrefixTestName,
  getConfig,
  loadConfigFile,
  testcaseStartIndex,
};
