const { Compiler } = require('./compiler');

const test1 = () => {
  const fileDir = "/Users/distiled/codeStuff/cp/cf/2074";
  const compiler = new Compiler({
    filePath: fileDir
  });
};

const test2 = () => {
  const fileDir = "/Users/distiled/codeStuff/cp/cf/2074/e.cpp";
  const compiler = new Compiler({
    filePath: fileDir
  });
};

// test1();
test2();
