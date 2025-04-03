const { TestCase } = require('./testcase');

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
  
  /**
  * remove testcase from `tests`
  *
  * @param {TestCase}
  * @return {TestCase} or undefined when not found
  */
  removeTestCase(test) {
    let returnTestcase = undefined;  
    let index = this._tests.indexOf(test);
    if (index > -1) {
      returnTestcase = this._tests[index];
      this._tests.splice(index, 1);
    }
    return returnTestcase;
  }
  
  /**
  * same with removeTestCase but you provide index (starts with 0)
  */
  removeTestCaseAt(index) {
    let returnTestcase = undefined;
    if (index < 0 || index >= this._tests.length) {
      returnTestcase = this._tests[index];
      this._tests.splice(index, 1);
    }
    return returnTestcase;
  }
  
  addTestCase(test) {
    this._tests ??= [];
    this._tests.push(test);
  }

  get testCases() {
    return this._tests;
  }
};

module.exports = { ProblemData };
