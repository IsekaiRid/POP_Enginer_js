// formatter.js
const vscode = require('vscode');

function formatPopScript(text) {
    const lines = text.split('\n');
    let formatted = [];
    let indentLevel = 0;
    const indentSize = 4;
    const indent = () => ' '.repeat(indentLevel * indentSize);

    for (let line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
            formatted.push('');
            continue;
        }

        // Label reset indent
        if (trimmed.startsWith('label')) {
            indentLevel = 0;
            formatted.push(trimmed);
            indentLevel = 1; // otomatis indent untuk isi label
            continue;
        }

        // Menu naikkan indent untuk opsi di bawahnya
        if (trimmed === 'menu:') {
            formatted.push(indent() + trimmed);
            indentLevel++;
            continue;
        }

        // Opsi pilihan → pakai indent saat ini
        if (trimmed.startsWith('"') && trimmed.includes(':') && !trimmed.startsWith('label')) {
            formatted.push(indent() + trimmed);
            continue;
        }

        // Perintah atau dialog karakter → pakai indent saat ini
        if (
            /^\w+\s*:/.test(trimmed) ||                 // karakter: "dialog"
            trimmed.startsWith('show') ||
            trimmed.startsWith('hide') ||
            trimmed.startsWith('jump') ||
            trimmed.startsWith('call') ||
            trimmed.startsWith('scene') ||
            trimmed.startsWith('let') ||
            trimmed.startsWith('const') ||
            trimmed.startsWith('var')
        ) {
            formatted.push(indent() + trimmed);
            continue;
        }

        // Baris lainnya → pakai indent saat ini
        formatted.push(indent() + trimmed);
    }

    return formatted.join('\n');
}

module.exports = { formatPopScript };