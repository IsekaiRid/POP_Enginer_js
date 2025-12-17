const fs = require('fs');
const path = require('path');
const { compile } = require('./compiler/index.cjs');
const { dialog, shell, clipboard } = require('electron');

class CoreCompiler {
    constructor(projectPath) {
        this.projectPath = path.join(process.cwd(), 'projects', projectPath);
        this.projectFile = path.join(this.projectPath, 'project.json');
        this.astBundle = { config: [], main: [] };
        this.currentProcessingFile = null;
    }

    validate() {
        if (!fs.existsSync(this.projectFile)) {
            throw new Error('project.json tidak ditemukan di folder project.');
        }
        this.meta = JSON.parse(fs.readFileSync(this.projectFile, 'utf8'));
    }

    compileAll() {
        this.validate();
        const cfg = (this.meta.config_scripts || []).map(f => this.toAbsolute(f));
        const main = (this.meta.main_scripts || []).map(f => this.toAbsolute(f));

        this.astBundle.config = cfg.map(file => {
            this.currentProcessingFile = file;
            return this.compileFile(file);
        });

        this.astBundle.main = main.map(file => {
            this.currentProcessingFile = file;
            return this.compileFile(file);
        });

        return this.astBundle;
    }

    compileFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File tidak ditemukan: ${filePath}`);
        }
        return compile(filePath);
    }

    toAbsolute(rel) {
        return path.resolve(this.projectPath, rel);
    }

    static handleLaunch(projectPath) {
        const core = new CoreCompiler(projectPath);
        try {
            const bundle = core.compileAll();
            console.log(JSON.stringify(bundle, null, 2));
            return core.compileAll();
        } catch (err) {
            // 1. EKSTRAKSI KHUSUS BARIS GAME (Dari Message)
            // Mencari pola "(line:col)" di message, misal: "(6:13)"
            const gameCoordMatch = err.message.match(/\((\d+):(\d+)\)/);

            let gameLine = '1';
            let gameCol = '1';

            if (gameCoordMatch) {
                gameLine = gameCoordMatch[1]; // Mengambil 6
                gameCol = gameCoordMatch[2];  // Mengambil 13
            }

            // 2. EKSTRAKSI KHUSUS BARIS COMPILER (Dari Stack)
            // Kita cari baris 15 di Parser.cjs hanya untuk info debugger
            const compilerMatch = err.stack ? err.stack.match(/Parser\.cjs:(\d+):(\d+)/) : null;
            const compLine = compilerMatch ? compilerMatch[1] : 'unknown';

            const targetFile = core.currentProcessingFile || core.projectFile;
            const cleanMessage = err.message.replace(/\(\d+:\d+\)/, '').trim();

            // 3. FORMAT DETAIL (Visual Scannable)
            const detailText = [
                `📢 Pesan: ${cleanMessage}`,
                '',
                '--- LOKASI SCRIPT GAME ---',
                `📂 File  : ${path.basename(targetFile)}`,
                `📍 Baris : ${gameLine}`,
                `🎯 Kolom : ${gameCol}`,
                '',
                '--- INTERNAL SYSTEM ---',
                `Stop point: Parser.cjs [Line ${compLine}]`,
                `Project: ${projectPath}`
            ].join('\n');

            dialog.showMessageBox({
                type: 'error',
                title: 'Syntax Error Terdeteksi',
                message: 'Gagal Meluncurkan Project',
                detail: detailText,
                buttons: [`Buka ${path.basename(targetFile)} (Baris ${gameLine})`, 'Salin Log', 'Tutup'],
                defaultId: 0,
                cancelId: 2,
                noLink: true
            }).then(result => {
                if (result.response === 0) {
                    // Pastikan membuka targetFile dengan koordinat game (6:13)
                    const vscodeUri = `vscode://file/${targetFile}:${gameLine}:${gameCol}`;
                    shell.openExternal(vscodeUri);
                } else if (result.response === 1) {
                    clipboard.writeText(`Error: ${err.message}\nFile: ${targetFile}\nLine: ${gameLine}\nStack: ${err.stack}`);
                }
            });

            return null;
        }
    }
}

module.exports.CoreCompiler = CoreCompiler;