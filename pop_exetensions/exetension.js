const vscode = require('vscode');
const { formatPopScript } = require('./formatter'); // <-- tambahan

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('POP Script Language Extension is now active!');

    // === DIAGNOSTIC COLLECTION (existing) ===
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('popjs');
    context.subscriptions.push(diagnosticCollection);

    if (vscode.window.activeTextEditor) {
        updateDiagnostics(vscode.window.activeTextEditor.document, diagnosticCollection);
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                updateDiagnostics(editor.document, diagnosticCollection);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document === vscode.window.activeTextEditor?.document) {
                updateDiagnostics(e.document, diagnosticCollection);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(doc => {
            diagnosticCollection.delete(doc.uri);
        })
    );

    // === FORMATTER (new) ===
    const formatter = vscode.languages.registerDocumentFormattingEditProvider('popjs', {
        provideDocumentFormattingEdits(document) {
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );
            const formatted = formatPopScript(document.getText());
            return [vscode.TextEdit.replace(fullRange, formatted)];
        }
    });

    context.subscriptions.push(formatter);

    // === AUTO FORMAT ON SAVE (optional) ===
    const onSave = vscode.workspace.onWillSaveTextDocument(e => {
        if (e.document.languageId === 'popjs') {
            e.waitUntil(
                vscode.commands.executeCommand('editor.action.formatDocument')
            );
        }
    });

    context.subscriptions.push(onSave);
}

// === DIAGNOSTIC FUNCTIONS (existing) ===
function updateDiagnostics(document, diagnosticCollection) {
    if (!document.fileName.endsWith('.pop.js')) return;

    const diagnostics = [];
    const text = document.getText();
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('//')) continue;
        if (trimmedLine.startsWith('"') || trimmedLine.startsWith("'")) continue;

        checkMissingColon(line, i, diagnostics, document);
        checkIncompleteCommand(line, i, diagnostics, document);
        checkWrongSceneFormat(line, i, diagnostics, document);
        checkMissingAt(line, i, diagnostics, document);
        checkUnclosedString(line, i, diagnostics, document);
        checkUnknownText(line, i, diagnostics, document);
    }

    diagnosticCollection.set(document.uri, diagnostics);
}

// --- semua fungsi diagnostic tetap ada di bawah ini ---
function checkMissingColon(line, lineNumber, diagnostics, document) {
    const trimmed = line.trim();
    const keywords = ['label', 'if', 'elif', 'else', 'while', 'for', 'menu'];
    for (const keyword of keywords) {
        const regex = new RegExp(`^\\s*${keyword}\\s+[^:]*$`, 'i');
        if (regex.test(line) && !line.includes(':')) {
            const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                `Missing colon after '${keyword}' statement`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.source = 'POP Script';
            diagnostics.push(diagnostic);
            return;
        }
    }
}

function checkIncompleteCommand(line, lineNumber, diagnostics, document) {
    const trimmed = line.trim();
    if (trimmed === 'scene' || trimmed === 'show' || trimmed === 'hide') {
        const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
        const diagnostic = new vscode.Diagnostic(
            range,
            `Incomplete command: '${trimmed}' requires arguments`,
            vscode.DiagnosticSeverity.Error
        );
        diagnostic.source = 'POP Script';
        diagnostics.push(diagnostic);
    }
}

function checkWrongSceneFormat(line, lineNumber, diagnostics, document) {
    const sceneRegex = /^\s*scene\s+(?!bg\s)/i;
    if (sceneRegex.test(line) && !line.includes('bg')) {
        const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
        const diagnostic = new vscode.Diagnostic(
            range,
            "Scene command must use 'bg' keyword: scene bg <name>",
            vscode.DiagnosticSeverity.Error
        );
        diagnostic.source = 'POP Script';
        diagnostics.push(diagnostic);
    }
}

function checkMissingAt(line, lineNumber, diagnostics, document) {
    const showRegex = /^\s*show\s+[a-zA-Z_][a-zA-Z0-9_]*\s+(?!at\b|$)\w+/i;
    if (showRegex.test(line)) {
        const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
        const diagnostic = new vscode.Diagnostic(
            range,
            "Show command must use 'at' keyword: show <character> at <position>",
            vscode.DiagnosticSeverity.Error
        );
        diagnostic.source = 'POP Script';
        diagnostics.push(diagnostic);
    }
}

function checkUnclosedString(line, lineNumber, diagnostics, document) {
    let cleanLine = line.replace(/\\["']/g, '');
    const doubleQuoteMatches = cleanLine.match(/"[^"]*"/g);
    if (doubleQuoteMatches) {
        doubleQuoteMatches.forEach(match => {
            cleanLine = cleanLine.replace(match, '""');
        });
    }
    const singleQuoteMatches = cleanLine.match(/'[^']*'/g);
    if (singleQuoteMatches) {
        singleQuoteMatches.forEach(match => {
            cleanLine = cleanLine.replace(match, "''");
        });
    }
    const remainingDoubleQuotes = (cleanLine.match(/"/g) || []).length;
    const remainingSingleQuotes = (cleanLine.match(/'/g) || []).length;
    if (remainingDoubleQuotes % 2 !== 0 || remainingSingleQuotes % 2 !== 0) {
        const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
        const diagnostic = new vscode.Diagnostic(
            range,
            'Unclosed string: missing closing quote',
            vscode.DiagnosticSeverity.Error
        );
        diagnostic.source = 'POP Script';
        diagnostics.push(diagnostic);
    }
}

function checkUnknownText(line, lineNumber, diagnostics, document) {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (trimmed.startsWith('#')) return;
    if (trimmed.startsWith('/*') || trimmed.startsWith('//')) return;
    if (trimmed.startsWith('"') || trimmed.startsWith("'")) return;

    const validPatterns = [
        /^\s*label\s+/i,
        /^\s*scene\s+/i,
        /^\s*show\s+/i,
        /^\s*hide\s+/i,
        /^\s*jump\s+/i,
        /^\s*call\s+/i,
        /^\s*return\s*$/i,
        /^\s*menu\s*:/i,
        /^\s*if\s+/i,
        /^\s*elif\s+/i,
        /^\s*else\s*:/i,
        /^\s*while\s+/i,
        /^\s*for\s+/i,
        /^\s*let\s+/i,
        /^\s*const\s+/i,
        /^\s*var\s+/i,
        /^\s*play\s+/i,
        /^\s*stop\s+/i,
        /^\s*pause\s+/i,
        /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:/
    ];

    let isValid = false;
    for (const pattern of validPatterns) {
        if (pattern.test(line)) {
            isValid = true;
            break;
        }
    }

    if (!isValid && trimmed.length > 0) {
        const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
        const diagnostic = new vscode.Diagnostic(
            range,
            'Unknown text: This line does not follow POP Script syntax. Use proper format or add quotes for narrator text.',
            vscode.DiagnosticSeverity.Warning
        );
        diagnostic.source = 'POP Script';
        diagnostic.code = 'unknown-text';
        diagnostics.push(diagnostic);
    }
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};