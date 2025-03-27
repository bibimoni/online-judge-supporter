const fs = require("fs-extra");
const { homedir } = require("os");
let configName = "online-judge-supporter_config.json";
let configDir = `${homedir()}/${configName}`;
const defaultConfigName = "_default_config.json";
const { dirname } = require("path");
const defaultConfigDir = `${dirname(dirname(__dirname))}/${defaultConfigName}`;

let config = JSON.parse(fs.readFileSync(defaultConfigDir, 'utf8')); // init as default

/**
 *  the user may be able to change the config without exiting the program
 *  so this function should be invoked everytime the config change
 */
const loadConfigFile = () => {
  // check if the config exists, if not, clone the default config to it
  if (!fs.existsSync(configDir)) {
    fs.copySync(defaultConfigDir, configDir);
  }

  // only apply config with the config is a valid string
  try {
    let o = JSON.parse(fs.readFileSync(configDir, 'utf8'));
    if (o && typeof o == 'object') {
      config = o;
    }
  } catch {}
}

/**
 * return the config defined by the user
 */
const getConfig = () => {
  return config;
}

module.exports = { getConfig, loadConfigFile };
