const { TestCase } = require('./test/testcase');

class ProblemData {
  constructor({ name, url, memoryLimit, timeLimit, tests = [] } = {}) {
    this.initialize(name, url, memoryLimit, timeLimit, tests);
  }
  initialize(name, url, memoryLimit, timeLimit, tests = []) {
    this._name = name;
    this._url = url;
    this._memoryLimit = memoryLimit;
    this._timeLimit = timeLimit;
    this._tests = tests;
  }

  editInput(index, input) {
    this._tests[index].input = input;
  }

  editOutput(index, output) {
    this._tests[index].output = output;
  }

  set name(name) {
    this._name = name;
  }

  get name() { 
    return this._name 
  }
  
  set url(url) {
    this._url = url;
  }

  set memoryLimit(memoryLimit) {
    this._memoryLimit = memoryLimit;
  }

  set timeLimit(timeLimit) {
    this._timeLimit = timeLimit;
  }

  addTestCase(test) {
    this._tests ??= [];
    this._tests.push(test);
  }

  get testCases() {
    return this._tests;
  }
};

const wrapper = (responseStatus, testcase) => {
  if (testcase == undefined) {
    return {
      "status": responseStatus
    };
  }
  return {
    "status": responseStatus,
    "testcase": testcase
  };
};

module.exports = { ProblemData, wrapper };
