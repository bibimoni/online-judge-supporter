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
};

class TestCase {
  constructor({ input, output } = {}) {
    this._input = input;
    this._output = output;
  }

  /**
   * Push a small testcase to the complete test
   * 
   * @param {TestCase} test that is part of a complete test. This test param won't have output 
   */
  addMultiTestCase(test) {
    this._testcases ??= [];
    this._testcases.push(test);
  }

  /**
   * 
   * @param {index} index 
   * @returns a reference to the array containing multiple extracted testcases.
   */
  multiTestCaseAt(index) {
    return this._testcases[index];
  }

  set input(input) {
    this._input = input;
  }
  set output(output) {
    this._output = output;
  }
}

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

module.exports = { TestCase, ProblemData, wrapper };
