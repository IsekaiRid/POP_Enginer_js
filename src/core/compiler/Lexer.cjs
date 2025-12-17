// lexer.js
const TokenType = require('./TokenType.cjs')

class Token {
  constructor(type, value, line = 1, col = 1) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.col = col;
  }
  toString() { return `${this.type}: ${JSON.stringify(this.value)}`; }
}

class Lexer {
  constructor(input) {
    this.input = input;
    this.pos = 0;
    this.line = 1;
    this.col = 1;
    this.tokens = [];
  }

  // ---------- helpers ----------
  peek(offset = 0) { return this.input[this.pos + offset] || '\0'; }
  advance() {
    const ch = this.input[this.pos++];
    if (ch === '\n') { this.line++; this.col = 1; }
    else this.col++;
    return ch;
  }
  skipWhitespace() {
    while (/[ \t\r]/.test(this.peek())) this.advance();
  }
  readString(quote) {
    let val = '';
    this.advance(); // buka quote
    while (this.peek() !== quote && this.peek() !== '\0') {
      val += this.advance();
    }
    if (this.peek() === quote) this.advance(); // tutup quote
    else throw new Error(`Unclosed string at ${this.line}:${this.col}`);
    return val;
  }
  readComment() {
    while (this.peek() !== '\n' && this.peek() !== '\0') this.advance();
  }
  readIdentifier() {
    let id = '';
    while (/[a-zA-Z0-9_]/.test(this.peek())) id += this.advance();
    return id;
  }
  readIndent() {
    let spaces = 0;
    while (this.peek() === ' ' || this.peek() === '\t') {
      this.advance();
      spaces++;
    }
    return spaces;
  }

  // ---------- tokenize ----------
  tokenize() {
    while (this.peek() !== '\0') {
      this.skipWhitespace();

      if (this.peek() === '\n') {
        this.tokens.push(new Token(TokenType.NEWLINE, '\\n', this.line, this.col));
        this.advance();
        continue;
      }

      // comment //
      if (this.peek() === '/' && this.peek(1) === '/') {
        this.readComment();
        continue;
      }

      // string "..." atau '...'
      if (this.peek() === '"' || this.peek() === "'") {
        const quote = this.peek();
        const val = this.readString(quote);
        this.tokens.push(new Token(TokenType.STRING, val, this.line, this.col));
        continue;
      }

      // identifier / keyword
      if (/[a-zA-Z_]/.test(this.peek())) {
        const id = this.readIdentifier();
        const kw = {
          let: TokenType.LET,
          label: TokenType.LABEL,
          menu: TokenType.MENU,
          jump: TokenType.JUMP,
          show: TokenType.SHOW,
          at: TokenType.AT,

          //new Update
          play: TokenType.PLAY,
          music: TokenType.MUSIC,
          stop: TokenType.STOP,
          sound: TokenType.SOUND,
        }[id];
        this.tokens.push(new Token(kw || TokenType.IDENTIFIER, id, this.line, this.col));
        continue;
      }



      // single char tokens
      const map = {
        ':': TokenType.COLON,
        '=': TokenType.EQUALS,
        '/': TokenType.SLASH,
        '.': TokenType.DOT,
        ';': TokenType.SEMICOLON,
      };
      const ch = this.advance();
      if (map[ch]) {
        this.tokens.push(new Token(map[ch], ch, this.line, this.col));
        continue;
      }

      throw new Error(`Unexpected char "${ch}" at ${this.line}:${this.col}`);
    }

    this.tokens.push(new Token(TokenType.EOF, null, this.line, this.col));
    return this.tokens;
  }
}

module.exports = { Lexer, Token };