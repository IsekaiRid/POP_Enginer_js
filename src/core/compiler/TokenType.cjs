// TokenType.js
// Semua jenis token yang dikenali lexer

const TokenType = {
  // Literals
  STRING:      'STRING',      // "..." atau '...'
  IDENTIFIER:  'IDENTIFIER',  // nama var, label, speaker, asset

  // Keywords
  LET:         'LET',         // let
  LABEL:       'LABEL',       // label
  MENU:        'MENU',        // menu
  JUMP:        'JUMP',        // jump
  SHOW:        'SHOW',        // show
  AT:          'AT',          // at

  // Symbols
  COLON:       'COLON',       // :
  EQUALS:      'EQUALS',      // =
  SLASH:       'SLASH',       // /
  DOT:         'DOT',         // .
  NEWLINE:     'NEWLINE',     // \n (akan kita jadikan token)
  INDENT:      'INDENT',      // spasi/tab di awal baris (untuk block menu/choice)
  DEDENT:      'DEDENT',      // kurang spasi

  // Special
  EOF:         'EOF',         // akhir file
  COMMENT:     'COMMENT',     // // ... (skip saat lexer)

  SEMICOLON: 'SEMICOLON',
};

// Ekspor supaya bisa dipakai di file lain
if (typeof module !== 'undefined') module.exports = TokenType;