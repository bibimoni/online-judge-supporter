class TokenType {
  static #_FLOAT = 0;
  static #_INT = 1;
  static #_STRING = 2;
  static #_UNKNOWN = 3;

  static get FLOAT() { return this.#_FLOAT; }
  static get INT() { return this.#_INT; }
  static get STRING() { return this.#_STRING; }
  static get UNKNOWN() { return this.#_UNKNOWN; }
 
  static validateNumber(token) {
    return isFinite(token) && parseFloat(token).toString() === token; 
  }
  static isInt(token) { return this.validateNumber(token) && parseFloat(token) % 1 === 0; }
  static isFloat(token) { return this.validateNumber(token) && parseFloat(token) % 1 !== 0; }
  static isString(token) { return typeof token === "string"; }
  static isUnknown(token) { return token.length === 0 || (!this.isInt(token) && !this.isFloat(token) && !this.isString(token)); }
}

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
    outputTokens.forEach(token => {
      if (TokenType.isUnknown(token)) {
        return;
      } else if (TokenType.isFloat(token)) {
        tokens.push(new Token(parseFloat(token), TokenType.FLOAT)); 
      } else if (TokenType.isInt(token)) {
        tokens.push(new Token(parseInt(token), TokenType.INT)); 
      } else if (TokenType.isString(token)) {
        tokens.push(new Token(token, TokenType.STRING)); 
      }
      // if it reaches here then wtf
    });
    
    return tokens;
  }
  
  check(other_testcase) {
    
  }
}

class Token {
  #_token = undefined;
  #_tokenType = TokenType.UNKNOWN;
  
  constructor(token, tokenType) {
    this.#_token = token;
    this.#_tokenType = tokenType;
  }

  get token() { return this.#_token; } 
  get tokenType() { return this.#_tokenType; }

  log() {
    return `${this.token} ${this.tokenType}`;
  }
}

module.exports = { TestCase, Token };
