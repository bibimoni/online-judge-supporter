import fs from "fs-extra";
import { homedir } from "os";
import * as toughCookie from "tough-cookie";
let configName = "online-judge-supporter_config.json";
let configDirName = "config-online-judge-supporter";
let configDir = `${homedir()}/${configName}`;
let configFolder = `${homedir()}/.local/${configDirName}/`;
const defaultConfigName = "_default_config.json";
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const defaultConfigDir = `${dirname(dirname(__dirname))}/${defaultConfigName}`;

const { CookieJar } = toughCookie;
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
  // only apply config with the config is a valid string
  try {
    let o = JSON.parse(jsonPlain);
    if (o && Array.isArray(o)) {
      config = o[0];
    }
    else if (o && typeof o == "object") {
      config = o;
    }
  }
  catch { }
};
/**
 * return the config defined by the user
 */
const getConfig = () => {
  return config;
};
const saveCookie = (site, cookies) => {
  fs.ensureDirSync(configFolder);
  const jar = new CookieJar();
  cookies.forEach(ck => {
    let str = `${ck.name}=${ck.value}; Domain=${ck.domain}; Path=${ck.path}`;
    if (typeof ck.expires === 'number' && ck.expires > 0) {
      const date = new Date(ck.expires * 1000).toUTCString();
      str += `; Expires=${date}`;
    }
    if (ck.secure)
      str += `; Secure`;
    if (ck.httpOnly)
      str += `; HttpOnly`;
    jar.setCookieSync(str, `https://${ck.domain}`);
  });
  const serialized = jar.serializeSync();
  const cookieFilePath = `${configFolder}${site}.json`;
  fs.writeFileSync(cookieFilePath, JSON.stringify(serialized, null, 2), 'utf-8');
};
const loadCookie = (site) => {
  const cookieFilePath = `${configFolder}${site}.json`;
  try {
    const text = fs.readFileSync(cookieFilePath, 'utf-8');
    const cookies = JSON.parse(text);
    return cookies;
  }
  catch (err) {
    throw err;
  }
};
const loadCookieJar = (site) => {
  try {
    const savedCookies = loadCookie(site);
    return CookieJar.fromJSON(savedCookies);
  }
  catch (err) {
    throw err;
  }
};
export { mode };
export { multiTestFolderPrefix };
export { testFolderPrefix };
export { ansPrefixTestName };
export { outputPrefixTestName };
export { inputPrefixTestName };
export { getConfig };
export { loadConfigFile };
export { testcaseStartIndex };
export { saveCookie };
export { loadCookieJar };
export { configFolder };
export { configDir };
export default {
  mode,
  multiTestFolderPrefix,
  testFolderPrefix,
  ansPrefixTestName,
  outputPrefixTestName,
  inputPrefixTestName,
  getConfig,
  loadConfigFile,
  testcaseStartIndex,
  saveCookie,
  loadCookieJar,
  configFolder,
  configDir
};
