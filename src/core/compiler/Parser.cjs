// parser.js
const { Lexer } = require('./Lexer.cjs');
const TokenType = require('./TokenType.cjs');

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
        this.current = this.tokens[0];
    }

    // ---------- helpers ----------
    consume(type, msg) {
        if (this.current.type !== type) {
            throw new Error(`${msg} (${this.current.line}:${this.current.col})`);
        }
        const tok = this.current;
        this.pos++;
        this.current = this.tokens[this.pos] || { type: TokenType.EOF };
        return tok;
    }
    skipNewlines() {
        while (this.current.type === TokenType.NEWLINE) this.consume(TokenType.NEWLINE, '');
    }

    skipOptionalSemicolon() {
        if (this.current.type === TokenType.SEMICOLON) {
            this.consume(TokenType.SEMICOLON, '');
        }
    }

    // ---------- top level ----------
    parse() {
        const ast = [];
        while (this.current.type !== TokenType.EOF) {
            this.skipNewlines();
            if (this.current.type === TokenType.EOF) break;
            ast.push(this.parseStmt());
        }
        return ast;
    }

    parseStmt() {
        switch (this.current.type) {
            case TokenType.LET: return this.parseLet();
            case TokenType.LABEL: return this.parseLabel();
            case TokenType.MENU: return this.parseMenu();
            case TokenType.JUMP: return this.parseJump();
            case TokenType.SHOW: return this.showStmt();
            //update
            case TokenType.PLAY: return this.parsePlay();
            case TokenType.STOP: return this.parseStop();

            case TokenType.IDENTIFIER: return this.parseDialogueOrShortcut();
            case TokenType.STRING: return this.parseDialogueOrShortcut();
            default: throw new Error(`Unexpected token ${this.current.type} at ${this.current.line}:${this.current.col}`);
        }
    }


    parseLet() {
        this.consume(TokenType.LET, 'Expected let');
        const id = this.consume(TokenType.IDENTIFIER, 'Expected var name').value;
        this.consume(TokenType.EQUALS, 'Expected =');
        const val = this.consume(TokenType.STRING, 'Expected string').value;
        this.skipNewlines();
        this.skipOptionalSemicolon();
        return { type: 'let', id, value: val };
    }

    parseLabel() {
        this.consume(TokenType.LABEL, 'Expected label');
        const name = this.consume(TokenType.IDENTIFIER, 'Expected label name').value;
        this.consume(TokenType.COLON, 'Expected : after label');
        this.skipNewlines();
        const body = [];
        while (
            this.current.type !== TokenType.EOF &&
            this.current.type !== TokenType.LABEL &&
            this.current.type !== TokenType.NEWLINE
        ) {
            body.push(this.parseStmt());
        }
        return { type: 'label', name, body };
    }

    parseDialogueOrShortcut() {
        const speakerTok =
            this.current.type === TokenType.STRING
                ? this.consume(TokenType.STRING, 'Expected speaker')
                : this.consume(TokenType.IDENTIFIER, 'Expected speaker');

        this.consume(TokenType.COLON, 'Expected : after speaker');
        const text = this.consume(TokenType.STRING, 'Expected dialogue text').value;
        this.skipNewlines();
        return { type: 'dialogue', speaker: speakerTok.value, text };
    }

    parseMenu() {
        this.consume(TokenType.MENU, 'Expected menu');
        this.consume(TokenType.COLON, 'Expected : after menu');
        this.skipNewlines();

        const choices = [];
        while (this.current.type === TokenType.STRING) {   // "Pilihan 1":
            const text = this.consume(TokenType.STRING, 'Expected choice text').value;
            this.consume(TokenType.COLON, 'Expected : after choice text');
            this.skipNewlines();

            // body tiap pilihan (bisa dialogue / jump / show)
            const body = [];
            while (
                this.current.type !== TokenType.EOF &&
                this.current.type !== TokenType.NEWLINE &&
                this.current.type !== TokenType.STRING      // choice berikutnya
            ) {
                body.push(this.parseStmt());
            }
            choices.push({ text, body });
            this.skipNewlines();
        }

        return { type: 'menu', choices };
    }

    parseJump() {
        this.consume(TokenType.JUMP, 'Expected jump');
        const label = this.consume(TokenType.IDENTIFIER, 'Expected label name after jump').value;
        this.skipNewlines();
        return { type: 'jump', label };
    }

    showStmt() {
        this.consume(TokenType.SHOW, 'Expected show');
        const asset = this.consume(TokenType.IDENTIFIER, 'Expected asset name').value;

        let pos = null;
        if (this.current.type === TokenType.AT) {
            this.consume(TokenType.AT, '');              // consume 'at'
            pos = this.consume(TokenType.IDENTIFIER, 'Expected position').value;
        }
        this.skipNewlines();
        return { type: 'show', asset, position: pos };
    }

    parsePlay() {
        this.consume(TokenType.PLAY, 'Expected play');

        // Tentukan jenis audio (music atau sound)
        const audioType = this.consume(TokenType.MUSIC, 'Expected music after play').value;

        // Ambil identifier atau string untuk path/asset
        let asset;
        if (this.current.type === TokenType.STRING) {
            asset = this.consume(TokenType.STRING, 'Expected music path').value;
        } else {
            asset = this.consume(TokenType.IDENTIFIER, 'Expected music asset name').value;
        }

        this.skipNewlines();
        return {
            type: 'play',
            audioType: 'music',
            asset: asset
        };
    }

    parseStop() {
        this.consume(TokenType.STOP, 'Expected stop');
        this.consume(TokenType.MUSIC, 'Expected music after stop');
        this.skipNewlines();
        return { type: 'stop', audioType: 'music' };
    }
}


module.exports = { Parser };