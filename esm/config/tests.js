import { loadConfigFile, getConfig } from "./load_config.js";
const test1 = () => {
  loadConfigFile();
};
const test2 = () => {
  loadConfigFile();
  console.log(getConfig());
};
test2();
