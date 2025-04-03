class TokenType {
  static #float_token_regex = /^[1-9](\d+)?(\.\d+)$/;
  static #int_token_regex = /^[1-9](\d+)?$/;
  static #float_token_epsilon = 1e-9;
  static #_FLOAT = 0;
  static #_INT = 1;
  static #_STRING = 2;
  static #_UNKNOWN = 3;

  static get FLOAT() { return this.#_FLOAT; }
  static get INT() { return this.#_INT; }
  static get STRING() { return this.#_STRING; }
  static get UNKNOWN() { return this.#_UNKNOWN; }
 
  static #validateNumber(token) { 
    return isFinite(token) 
    // length of string === length of number (disable for now)
      // && parseFloat(token).toString() === token; 
  }

  /**
   * not an infinite number, only contains number
   */
  static #isInt(token) { 
    return this.#validateNumber(token) 
      && TokenType.#int_token_regex.test(token); 
  }

  /**
   * not an isFinite float, have the form of d.d
   */
  static #isFloat(token) { 
    return this.#validateNumber(token) 
      && TokenType.#float_token_regex.test(token); 
  }

  static #isString(token) { 
    return token.length > 0 && (typeof token) === "string"; 
  }
  
  static #isUnknown(token) { 
    return token.length === 0 
    || (
      !this.#isInt(token) 
      && !this.#isFloat(token) 
      && !this.#isString(token)
    ); 
  }

  static #sameType(token1, token2) {
    return token2.tokenType === token1.tokenType;
  }

  static #cmpInt(token1, token2) {
    return TokenType.#cmpString(token1, token2);
  }
  
  static #cmpFloat(token1, token2) {
    return TokenType.#sameType(token1, token2) && Math.abs(token1.token - token2.token) < TokenType.#float_token_epsilon;
  }
  
  static #cmpString(token1, token2) {
    return TokenType.#sameType(token1, token2) && token1.token === token2.token;
  }
  /**
  * compare 2 tokens base on the type of the first token
  *
  * @param {Token} token1 
  * @param {Token} token2 
  */
  static cmp(token1, token2) {
    switch (token1.tokenType) {
      case TokenType.FLOAT:
        return TokenType.#cmpFloat(token1, token2);
      case TokenType.INT:
        return TokenType.#cmpInt(token1, token2);
      case TokenType.STRING:
        return TokenType.#cmpString(token1, token2);
    }
    return false;
  }
  
  /**
  * retrieve the token type of a string
  *
  * @param {String} token
  */
  static getTokenType(tokenStr, { experiment = false } = {}) {
    if (experiment) {
      if (TokenType.#isUnknown(tokenStr)) {
        return TokenType.UNKNOWN;
      } else if (TokenType.#isFloat(tokenStr)) {
        return TokenType.FLOAT;
      } else if (TokenType.#isInt(tokenStr)) {
        return TokenType.INT;
      } else if (TokenType.#isString(tokenStr)) {
        return TokenType.STRING;
      }
    } else if (TokenType.#isString(tokenStr)) {
      // for now we only compare each token to be 
      // exactly the same
      return TokenType.STRING;
    }
    // unreachable()!
    return TokenType.UNKNOWN;
  }
}

class Token {
  #_token = undefined; // tyoe is the same as TokenType
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

  cmp(otherToken) {
    console.log(this.log(), otherToken.log());
    return TokenType.cmp(this, otherToken);
  }
}

module.exports = { Token, TokenType };
