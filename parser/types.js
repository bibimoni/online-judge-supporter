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
    this._tests = this._tests ?? [];
    this._tests.push(test);
  }
};

class TestCase {
  constructor({ input, output } = {}) {
    this._input = input;
    this._output = output;
  }

  set input(input) {
    this._input = input;
  }
  set output(output) {
    this._output = output;
  }
}

module.exports = { TestCase, ProblemData };
