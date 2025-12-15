const fs = require('fs');
const path = require('path');
const { compile } = require('./compiler/index.cjs'); // path ke index.js tadi

class CoreCompiler {
    constructor(projectPath) {
        this.projectPath = path.join(process.cwd(), 'projects', projectPath);
        this.projectFile = path.join(this.projectPath, 'project.json');
        this.astBundle = { config: [], main: [] };
    }

    // ---------- validasi ----------
    validate() {
        console.log('[CoreCompiler] projectPath :', this.projectPath);
        console.log('[CoreCompiler] projectFile :', this.projectFile);
        console.log('[CoreCompiler] exists?     :', fs.existsSync(this.projectFile));

        if (!fs.existsSync(this.projectFile)) {
            throw new Error('project.json tidak ditemukan di folder project.');
        }
        this.meta = JSON.parse(fs.readFileSync(this.projectFile, 'utf8'));
        if (!this.meta.config_scripts && !this.meta.main_scripts) {
            throw new Error('Tidak ada script .pop.js yang tercantum.');
        }
    }

    // ---------- kompilasi ----------
    compileAll() {
        this.validate();
        const cfg = (this.meta.config_scripts || []).map(f => this.toAbsolute(f));
        const main = (this.meta.main_scripts || []).map(f => this.toAbsolute(f));

        this.astBundle.config = cfg.map(file => this.compileFile(file));
        this.astBundle.main = main.map(file => this.compileFile(file));

        return this.astBundle;
    }

    compileFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File tidak ditemukan: ${filePath}`);
        }
        return compile(filePath); // panggil fungsi dari index.js
    }

    toAbsolute(rel) {
        return path.resolve(this.projectPath, rel);
    }

    // ---------- launch handler ----------
    static handleLaunch(projectPath) {
        try {
            const core = new CoreCompiler(projectPath);
            const bundle = core.compileAll();

            // tampilkan SELURUH isi AST tanpa [Object]
            console.log('✅ Kompilasi selesai:');
            console.log(JSON.stringify(bundle, null, 2)); // 2 = indentasi

            return bundle;
        } catch (err) {
            console.error('❌ Gagal meluncurkan:', err.message);
            alert(`Gagal meluncurkan:\n${err.message}`);
            return null;
        }
    }
}

module.exports.CoreCompiler = CoreCompiler;