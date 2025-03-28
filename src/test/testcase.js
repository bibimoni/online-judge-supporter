const { Verdict } = require('./verdict');
const { TokenType, Token } = require("./token");
const { getConfig, loadConfigFile } = require('../config/load_config');

class TestCase {
  constructor({ input, output } = {}) {
    this._input = input;
    this.Output = output;
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
    this.Output = output;
  }

  get input() {
    return this._input;
  }
  get output() {
    return this.Output;
  }
 
  /**
   * extarct value to an array of tokens, each will have a type 
   * please don't change the order of these if statements cause it may break
   *
   * @param {String} string that need to be tokenize
   * @return {[...Token]} an array of Token-s
   */
  static extractToken(value) {
    value.replaceAll("\n", " ");
    let outputTokens = value.split(/\s+/).filter(token => token.length > 0);
    let tokens = [];
    // load config to enable experiment mode 
    loadConfigFile(); 
    let config = getConfig();

    outputTokens.forEach(tokenStr => {
      let tokenType = TokenType.getTokenType(tokenStr, { 
        experiment : config["testComparatorExperiment"] 
      });
      if (tokenType === TokenType.FLOAT) {
        tokens.push(new Token(parseFloat(tokenStr), TokenType.FLOAT)); 
      } else if (tokenType === TokenType.INT) {
        tokens.push(new Token(parseInt(tokenStr), TokenType.INT)); 
      } else if (tokenType === TokenType.STRING) {
        tokens.push(new Token(tokenStr, TokenType.STRING)); 
      } 
      // if it reaches here then wtf
    });
    
    return tokens;
  }
  
  /**
  * compare `this` TestCase to other TestCase
  *
  * @param {boolean} if this is `true` consider `this.output` is the expected
  * output and vice versa
  * @praram {TestCase}
  * @return {boolean} tell wether or not
  * the testcase is correct (in compare to the expected testcase)
  */
  checkOutput(otherTestcase, flag = false) {
    if (!flag) {
      return TestCase.checkOutput(this.output, otherTestcase.output);
    } else {
      return TestCase.checkOutput(otherTestcase.output, this.output);
    }
  }
  
  static checkOutput(expectedOutput, output) { 
    let expectedTokens = this.extractToken(expectedOutput);
    let tokens = this.extractToken(output);
    if (expectedTokens.length !== tokens.length) {
      return false;
    }
    return expectedTokens.reduce(
      (currentStatus, token, index) => currentStatus & token.cmp(tokens[index]),
      true
    );
  }
}

module.exports = { TestCase };
