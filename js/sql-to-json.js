/**
 * SQL to JSON Converter - Convert SQL INSERT statements to JSON
 * 100% Client-side processing
 */

class SqlToJsonConverter {
    constructor() {
        this.tableCount = 0;
        this.rowCount = 0;
        this.generatedJson = '';
        this.init();
    }

    init() {
        this.sqlInput = document.getElementById('sql-input');
        this.outputContainer = document.getElementById('json-container');
        // Restore from localStorage if available
        restoreSqlToJsonFromLocalStorage(() => this.convert());
        this.bindAutoConvert();
        this.bindClearButton();
        this.bindFormatButton();
    }

    bindClearButton() {
        const clearBtn = document.getElementById('clear-sql-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clear());
        }
    }

    bindFormatButton() {
        const formatBtn = document.getElementById('format-sql-btn');
        if (formatBtn) {
            formatBtn.addEventListener('click', () => this.formatSql());
        }
    }

    bindAutoConvert() {
        const sqlInput = document.getElementById('sql-input');
        if (sqlInput) {
            sqlInput.addEventListener('input', () => this.convert());
        }
    }

    clear() {
        document.getElementById('sql-input').value = '';
        document.getElementById('json-container').innerHTML = '<div class="empty-state"><p>JSON output will appear here...</p></div>';
        document.getElementById('json-stats').classList.add('hidden');
        showStatus('Cleared!', 'success');
        saveSqlToJsonToLocalStorage();
    }

    formatSql() {
        const sqlInput = document.getElementById('sql-input');
        try {
            // Basic SQL formatting
            let formatted = sqlInput.value
                .replace(/\s+/g, ' ')
                .replace(/\s*;\s*/g, ';\n')
                .replace(/\s*,\s*/g, ', ')
                .replace(/\s*\(\s*/g, ' (')
                .replace(/\s*\)\s*/g, ') ')
                .replace(/\s*=\s*/g, ' = ')
                .trim();
            sqlInput.value = formatted;
            showStatus('SQL formatted!', 'success');
        } catch (e) {
            showStatus('Error formatting SQL: ' + e.message, 'error');
        }
    }

    convert() {
        const sqlInput = document.getElementById('sql-input').value.trim();

        if (!sqlInput) {
            showStatus('Please enter SQL to convert', 'error');
            return;
        }

        try {
            this.resetCounters();
            const result = this.parseSql(sqlInput);
            this.generatedJson = JSON.stringify(result, null, 2);
            this.renderJson();
            this.updateStats();
            showStatus('Conversion successful!', 'success');
            saveSqlToJsonToLocalStorage();
        } catch (e) {
            showStatus('Error: ' + e.message, 'error');
        }
    }

    parseSql(sql) {
        const results = {};
        const statements = this.splitStatements(sql);

        statements.forEach(statement => {
            const trimmed = statement.trim();
            if (!trimmed) return;

            // Parse INSERT statements
            const insertMatch = trimmed.match(/INSERT\s+(?:IGNORE\s+)?INTO\s+[`"\[]?([^`"\]\s]+)[`"\]]?\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/gi);
            
            if (insertMatch) {
                insertMatch.forEach(match => {
                    const parsed = this.parseInsertStatement(match);
                    if (parsed) {
                        if (!results[parsed.table]) {
                            results[parsed.table] = [];
                        }
                        results[parsed.table].push(parsed.row);
                    }
                });
            }
        });

        // Update counters
        this.tableCount = Object.keys(results).length;
        this.rowCount = Object.values(results).reduce((sum, rows) => sum + rows.length, 0);

        return results;
    }

    splitStatements(sql) {
        const statements = [];
        let current = '';
        let inString = false;
        let stringChar = '';
        let inParen = 0;

        for (let i = 0; i < sql.length; i++) {
            const char = sql[i];
            const prevChar = i > 0 ? sql[i - 1] : '';

            if (!inString && (char === '"' || char === "'" || char === '`')) {
                inString = true;
                stringChar = char;
            } else if (inString && char === stringChar && prevChar !== '\\') {
                inString = false;
            } else if (!inString && char === '(') {
                inParen++;
            } else if (!inString && char === ')') {
                inParen--;
            } else if (!inString && char === ';' && inParen === 0) {
                statements.push(current);
                current = '';
                continue;
            }
            current += char;
        }

        if (current.trim()) {
            statements.push(current);
        }

        return statements;
    }

    parseInsertStatement(statement) {
        // Match INSERT INTO table (columns) VALUES (values)
        const regex = /INSERT\s+(?:IGNORE\s+)?INTO\s+[`"\[]?([^`"\]\s]+)[`"\]]?\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i;
        const match = statement.match(regex);

        if (!match) return null;

        const table = match[1];
        const columns = match[2].split(',').map(col => col.trim().replace(/[`"\[\]]/g, ''));
        const values = this.parseValues(match[3]);

        const row = {};
        columns.forEach((col, index) => {
            row[col] = values[index];
        });

        return { table, row };
    }

    parseValues(valuesStr) {
        const values = [];
        let current = '';
        let inString = false;
        let stringChar = '';
        let inParen = 0;

        for (let i = 0; i < valuesStr.length; i++) {
            const char = valuesStr[i];
            const prevChar = i > 0 ? valuesStr[i - 1] : '';

            if (!inString && (char === '"' || char === "'" || char === '`')) {
                inString = true;
                stringChar = char;
            } else if (inString && char === stringChar && prevChar !== '\\') {
                inString = false;
            } else if (!inString && char === '(') {
                inParen++;
            } else if (!inString && char === ')') {
                inParen--;
            } else if (!inString && char === ',' && inParen === 0) {
                values.push(this.parseValue(current.trim()));
                current = '';
                continue;
            }
            current += char;
        }

        if (current.trim()) {
            values.push(this.parseValue(current.trim()));
        }

        return values;
    }

    parseValue(value) {
        // Remove surrounding quotes
        if ((value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith('`') && value.endsWith('`'))) {
            value = value.slice(1, -1);
        }

        // Handle NULL
        if (value.toUpperCase() === 'NULL') {
            return null;
        }

        // Handle boolean
        if (value.toUpperCase() === 'TRUE') {
            return true;
        }
        if (value.toUpperCase() === 'FALSE') {
            return false;
        }

        // Handle numbers
        if (!isNaN(value) && value !== '') {
            return Number(value);
        }

        // Handle JSON strings (arrays/objects)
        if ((value.startsWith('[') && value.endsWith(']')) ||
            (value.startsWith('{') && value.endsWith('}'))) {
            try {
                return JSON.parse(value);
            } catch (e) {
                // Not valid JSON, return as string
            }
        }

        return value;
    }

    renderJson() {
        const container = document.getElementById('json-container');
        container.innerHTML = '';

        const box = document.createElement('div');
        box.className = 'json-box';
        box.innerHTML = `
            <div class="json-box-header">
                <span class="json-name">JSON Output</span>
                <div class="json-box-actions">
                    <button class="copy-btn" data-code="${escapeHtml(this.generatedJson)}">Copy</button>
                    <button class="download-btn" data-code="${escapeHtml(this.generatedJson)}" data-filename="output.json">Download</button>
                </div>
            </div>
            <textarea class="json-code" readonly>${escapeHtml(this.generatedJson)}</textarea>
        `;
        container.appendChild(box);

        this.bindJsonBoxButtons();
    }

    bindJsonBoxButtons() {
        document.querySelectorAll('.json-box .copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const code = btn.getAttribute('data-code');
                const textarea = document.createElement('textarea');
                textarea.innerHTML = code;
                const decodedCode = textarea.value;

                navigator.clipboard.writeText(decodedCode)
                    .then(() => showStatus('Copied to clipboard!', 'success'))
                    .catch(() => showStatus('Failed to copy', 'error'));
            });
        });

        document.querySelectorAll('.json-box .download-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const code = btn.getAttribute('data-code');
                const filename = btn.getAttribute('data-filename');

                const textarea = document.createElement('textarea');
                textarea.innerHTML = code;
                const decodedCode = textarea.value;

                const blob = new Blob([decodedCode], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showStatus(`Downloaded ${filename}!`, 'success');
            });
        });
    }

    resetCounters() {
        this.tableCount = 0;
        this.rowCount = 0;
    }

    updateStats() {
        document.getElementById('json-table-count').textContent = this.tableCount;
        document.getElementById('json-row-count').textContent = this.rowCount;
        document.getElementById('json-stats').classList.remove('hidden');
    }
}
