
const fs   = require('fs');
const path = require('path');
const { Lexer }  = require('./Lexer.cjs');
const { Parser } = require('./Parser.cjs');

function compile(filePath, options = {}) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const source = fs.readFileSync(filePath, 'utf8');
  const lexer  = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast    = parser.parse();

  if (options.out) {
    fs.writeFileSync(options.out, JSON.stringify(ast, null, 2), 'utf8');
    console.log(`AST saved → ${options.out}`);
  }
  return ast;
}

// ---------- CLI ----------
if (require.main === module) {
  const args = process.argv.slice(2);
  const inputFile = args[0];
  if (!inputFile) {
    console.error('Usage: node index.js <file.pop.js> [output.json]');
    process.exit(1);
  }
  const outFile = args[1] || null;
  try {
    compile(inputFile, { out: outFile });
  } catch (e) {
    console.error('Compile error:', e.message);
    process.exit(1);
  }
}

// ---------- API ----------
module.exports = { compile };