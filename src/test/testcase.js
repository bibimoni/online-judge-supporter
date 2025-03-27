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

  get input() {
    return this._input;
  }
  get output() {
    return this._output;
  }
  
  static extractOutputToken(output) {
    outputTokens.replaceAll("\n", " ");
    let outputTokens = [...output.trim()];
  }
  
  checker(other_testcase) {
    
  }
}

module.exports = { TestCase };
