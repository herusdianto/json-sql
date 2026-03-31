/**
 * JSON to SQL Converter - Convert JSON to SQL INSERT statements
 * 100% Client-side processing
 */

class JsonToSqlConverter {
    constructor() {
        this.tableCount = 0;
        this.rowCount = 0;
        this.statementCount = 0;
        this.generatedSql = '';
        this.init();
    }

    init() {
        // Cache frequently used DOM elements
        this.jsonInput = document.getElementById('json-input');
        this.optionsForm = document.querySelector('.settings-section');
        this.outputContainer = document.getElementById('sql-container');
        // Restore from localStorage if available
        this.restoreFromLocalStorage();
        // Remove convert button and auto-trigger convert on input changes
        this.bindAutoConvert();
        this.bindClearButton();
        this.bindFormatButton();
        this.bindExampleButton();
        this.bindGlobalActions();
        this.initThemeToggle();
        this.bindTableNameChange();
        this.setCurrentYear();
    }

    setCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // ==================== Theme Toggle ====================
    initThemeToggle() {
        const themeSwitch = document.getElementById('theme-switch');
        const themeIcon = document.getElementById('theme-icon');

        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        this.updateThemeIcon(themeIcon, savedTheme);

        themeSwitch.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            const newTheme = isDark ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(themeIcon, newTheme);
        });
    }

    updateThemeIcon(iconElement, theme) {
        iconElement.innerHTML = theme === 'dark'
            ? `<svg class="sun-icon" viewBox="0 0 24 24" width="28" height="28"><path d="M12 7a5 5 0 100 10 5 5 0 000-10zM2 13h2a1 1 0 100-2H2a1 1 0 100 2zm18 0h2a1 1 0 100-2h-2a1 1 0 100 2zM11 2v2a1 1 0 102 0V2a1 1 0 10-2 0zm0 18v2a1 1 0 102 0v-2a1 1 0 10-2 0zM5.99 4.58a1 1 0 10-1.41 1.41l1.06 1.06a1 1 0 101.41-1.41L5.99 4.58zm12.37 12.37a1 1 0 10-1.41 1.41l1.06 1.06a1 1 0 101.41-1.41l-1.06-1.06zm1.06-10.96a1 1 0 10-1.41-1.41l-1.06 1.06a1 1 0 101.41 1.41l1.06-1.06zM7.05 18.36a1 1 0 10-1.41-1.41l-1.06 1.06a1 1 0 101.41 1.41l1.06-1.06z"></path></svg>`
            : `<svg class="moon-icon" viewBox="0 0 24 24" width="28" height="28"><path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"></path></svg>`;
    }

    // ==================== Button Bindings ====================
    bindClearButton() {
        const clearBtn = document.getElementById('clear-btn');
        clearBtn.addEventListener('click', () => this.clear());
    }

    bindFormatButton() {
        const formatBtn = document.getElementById('format-btn');
        formatBtn.addEventListener('click', () => this.formatJson());
    }

    bindExampleButton() {
        const exampleBtn = document.getElementById('example-btn');
        exampleBtn.addEventListener('click', () => this.loadExample());
    }

    bindTableNameChange() {
        const tableNameInput = document.getElementById('table-name');
        tableNameInput.addEventListener('input', () => {
            // Update download all filename based on table name
        });
    }

    bindGlobalActions() {
        // Global actions removed - using individual copy/download buttons in sql-box
    }

    // ==================== Auto Convert Bindings ====================
    bindAutoConvert() {
        const inputs = [
            document.getElementById('table-name'),
            document.getElementById('json-input'),
            document.getElementById('use-insert-ignore'),
            document.getElementById('use-on-duplicate'),
            document.getElementById('use-quotes'),
            document.getElementById('use-batch'),
            document.getElementById('include-create'),
            document.getElementById('use-semicolon'),
            document.getElementById('use-snake-case'),
            document.getElementById('db-mysql'),
            document.getElementById('db-postgres'),
            document.getElementById('db-sqlite'),
            document.getElementById('db-mssql')
        ];
        inputs.forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.convert());
                input.addEventListener('change', () => this.convert());
            }
        });
        // Also trigger convert after loading example
        const exampleBtn = document.getElementById('example-btn');
        if (exampleBtn) {
            exampleBtn.addEventListener('click', () => {
                setTimeout(() => this.convert(), 100); // Wait for example to load
            });
        }
    }

    // ==================== Core Functions ====================
    clear() {
        document.getElementById('json-input').value = '';
        document.getElementById('sql-container').innerHTML = '<div class="empty-state"><p>SQL statements will appear here...</p></div>';
        document.getElementById('stats').classList.add('hidden');
        this.showStatus('Cleared!', 'success');
        this.saveToLocalStorage();
    }

    loadExample() {
        const exampleJson = [
            {
                "id": 1,
                "firstName": "John",
                "lastName": "Doe",
                "email": "john.doe@example.com",
                "age": 30,
                "active": true,
                "salary": 75000.50,
                "createdAt": "2024-01-15T10:30:00Z"
            },
            {
                "id": 2,
                "firstName": "Jane",
                "lastName": "Smith",
                "email": "jane.smith@example.com",
                "age": 25,
                "active": true,
                "salary": 65000.75,
                "createdAt": "2024-02-20T14:45:00Z"
            },
            {
                "id": 3,
                "firstName": "Bob",
                "lastName": "Johnson",
                "email": "bob.johnson@example.com",
                "age": 35,
                "active": false,
                "salary": 85000.25,
                "createdAt": "2024-03-10T09:15:00Z"
            }
        ];

        document.getElementById('json-input').value = JSON.stringify(exampleJson, null, 2);
        document.getElementById('table-name').value = 'users';

        // Set options checked state
        document.getElementById('use-insert-ignore').checked = false;
        document.getElementById('use-on-duplicate').checked = false;
        document.getElementById('use-quotes').checked = true;
        document.getElementById('use-batch').checked = true;
        document.getElementById('include-create').checked = false;
        document.getElementById('use-semicolon').checked = true;
        document.getElementById('use-snake-case').checked = false;
        document.getElementById('db-mysql').checked = true;

        this.showStatus('Example JSON loaded!', 'success');

        // Trigger convert after loading example
        setTimeout(() => this.convert(), 100);
        this.saveToLocalStorage();
    }

    formatJson() {
        const jsonInput = document.getElementById('json-input');
        try {
            const parsed = JSON.parse(jsonInput.value);
            jsonInput.value = JSON.stringify(parsed, null, 2);
            this.showStatus('JSON formatted!', 'success');
        } catch (e) {
            this.showStatus('Invalid JSON: ' + e.message, 'error');
        }
    }

    convert() {
        const jsonInput = document.getElementById('json-input').value.trim();
        const tableName = document.getElementById('table-name').value.trim() || 'table';

        if (!jsonInput) {
            this.showStatus('Please enter JSON to convert', 'error');
            return;
        }

        try {
            const jsonObj = JSON.parse(jsonInput);
            this.resetCounters();

            const options = this.getOptions();

            // Generate SQL
            this.generatedSql = this.generateSql(tableName, jsonObj, options);

            // Render SQL
            this.renderSql();

            this.updateStats();
            this.showStatus('Conversion successful!', 'success');
            this.saveToLocalStorage();
        } catch (e) {
            this.showStatus('Error: ' + e.message, 'error');
        }
    }

    renderSql() {
        const container = document.getElementById('sql-container');
        container.innerHTML = '';

        const box = document.createElement('div');
        box.className = 'sql-box';
        box.innerHTML = `
            <div class="sql-box-header">
                <span class="sql-name">SQL Output</span>
                <div class="sql-box-actions">
                    <button class="copy-btn" data-code="${encodeURIComponent(this.generatedSql)}">Copy</button>
                    <button class="download-btn" data-code="${encodeURIComponent(this.generatedSql)}" data-filename="output.sql">Download</button>
                </div>
            </div>
            <textarea class="sql-code" readonly>${this.escapeHtml(this.generatedSql)}</textarea>
        `;
        container.appendChild(box);

        // Bind copy/download buttons
        this.bindSqlBoxButtons();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    bindSqlBoxButtons() {
        document.querySelectorAll('.sql-box .copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const code = btn.getAttribute('data-code');
                // Decode URL-encoded string
                const decodedCode = decodeURIComponent(code);

                navigator.clipboard.writeText(decodedCode)
                    .then(() => this.showStatus('Copied to clipboard!', 'success'))
                    .catch(() => this.showStatus('Failed to copy', 'error'));
            });
        });

        document.querySelectorAll('.sql-box .download-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const code = btn.getAttribute('data-code');
                const filename = btn.getAttribute('data-filename');

                // Decode URL-encoded string
                const decodedCode = decodeURIComponent(code);

                const blob = new Blob([decodedCode], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                this.showStatus(`Downloaded ${filename}!`, 'success');
            });
        });
    }


    resetCounters() {
        this.tableCount = 0;
        this.rowCount = 0;
        this.statementCount = 0;
    }

    getOptions() {
        return {
            useInsertIgnore: document.getElementById('use-insert-ignore').checked,
            useOnDuplicate: document.getElementById('use-on-duplicate').checked,
            useQuotes: document.getElementById('use-quotes').checked,
            useBatch: document.getElementById('use-batch').checked,
            includeCreate: document.getElementById('include-create').checked,
            useSemicolon: document.getElementById('use-semicolon').checked,
            useSnakeCase: document.getElementById('use-snake-case').checked,
            dbType: document.querySelector('input[name="db-type"]:checked')?.value || 'mysql'
        };
    }

    generateSql(tableName, jsonObj, options) {
        let sql = '';
        const quotedTable = options.useQuotes ? this.quoteIdentifier(tableName, options.dbType) : tableName;

        // Generate CREATE TABLE if requested
        if (options.includeCreate && Array.isArray(jsonObj) && jsonObj.length > 0) {
            sql += this.generateCreateTable(tableName, jsonObj[0], options);
            sql += '\n\n';
        }

        // Generate INSERT statements
        if (Array.isArray(jsonObj)) {
            if (options.useBatch && jsonObj.length > 0) {
                // Batch insert
                sql += this.generateBatchInsert(tableName, jsonObj, options);
            } else {
                // Individual inserts
                jsonObj.forEach(row => {
                    sql += this.generateInsertStatement(tableName, row, options);
                    sql += '\n';
                });
            }
            this.rowCount = jsonObj.length;
        } else if (typeof jsonObj === 'object' && jsonObj !== null) {
            // Single object
            sql += this.generateInsertStatement(tableName, jsonObj, options);
            this.rowCount = 1;
        }

        this.tableCount = 1;
        this.statementCount = sql.split(';').filter(s => s.trim()).length;

        return sql;
    }

    generateCreateTable(tableName, sampleRow, options) {
        const quotedTable = options.useQuotes ? this.quoteIdentifier(tableName, options.dbType) : tableName;
        let sql = `CREATE TABLE ${quotedTable} (\n`;

        const columns = [];
        Object.keys(sampleRow).forEach(key => {
            const columnName = options.useSnakeCase ? this.toSnakeCase(key) : key;
            const quotedKey = options.useQuotes ? this.quoteIdentifier(columnName, options.dbType) : columnName;
            const sqlType = this.inferSqlType(sampleRow[key], options.dbType);
            columns.push(`    ${quotedKey} ${sqlType}`);
        });

        sql += columns.join(',\n');
        sql += '\n)';

        if (options.useSemicolon) {
            sql += ';';
        }

        return sql;
    }

    generateBatchInsert(tableName, rows, options) {
        if (rows.length === 0) return '';

        const quotedTable = options.useQuotes ? this.quoteIdentifier(tableName, options.dbType) : tableName;
        const columns = Object.keys(rows[0]);
        const quotedColumns = columns.map(col => {
            const columnName = options.useSnakeCase ? this.toSnakeCase(col) : col;
            return options.useQuotes ? this.quoteIdentifier(columnName, options.dbType) : columnName;
        });

        let sql = '';

        if (options.useInsertIgnore) {
            sql += `INSERT IGNORE INTO ${quotedTable} (${quotedColumns.join(', ')})\nVALUES\n`;
        } else {
            sql += `INSERT INTO ${quotedTable} (${quotedColumns.join(', ')})\nVALUES\n`;
        }

        const valueRows = rows.map(row => {
            const values = columns.map(col => this.formatValue(row[col], options.dbType));
            return `(${values.join(', ')})`;
        });

        sql += valueRows.join(',\n');

        if (options.useOnDuplicate) {
            const updateClauses = columns.map(col => {
                const columnName = options.useSnakeCase ? this.toSnakeCase(col) : col;
                const quotedCol = options.useQuotes ? this.quoteIdentifier(columnName, options.dbType) : columnName;
                return `${quotedCol} = VALUES(${quotedCol})`;
            });
            sql += `\nON DUPLICATE KEY UPDATE ${updateClauses.join(', ')}`;
        }

        if (options.useSemicolon) {
            sql += ';';
        }

        return sql;
    }

    generateInsertStatement(tableName, row, options) {
        const quotedTable = options.useQuotes ? this.quoteIdentifier(tableName, options.dbType) : tableName;
        const columns = Object.keys(row);
        const quotedColumns = columns.map(col => {
            const columnName = options.useSnakeCase ? this.toSnakeCase(col) : col;
            return options.useQuotes ? this.quoteIdentifier(columnName, options.dbType) : columnName;
        });
        const values = columns.map(col => this.formatValue(row[col], options.dbType));

        let sql = '';

        if (options.useInsertIgnore) {
            sql = `INSERT IGNORE INTO ${quotedTable} (${quotedColumns.join(', ')}) VALUES (${values.join(', ')})`;
        } else {
            sql = `INSERT INTO ${quotedTable} (${quotedColumns.join(', ')}) VALUES (${values.join(', ')})`;
        }

        if (options.useOnDuplicate) {
            const updateClauses = columns.map(col => {
                const columnName = options.useSnakeCase ? this.toSnakeCase(col) : col;
                const quotedCol = options.useQuotes ? this.quoteIdentifier(columnName, options.dbType) : columnName;
                return `${quotedCol} = VALUES(${quotedCol})`;
            });
            sql += ` ON DUPLICATE KEY UPDATE ${updateClauses.join(', ')}`;
        }

        if (options.useSemicolon) {
            sql += ';';
        }

        return sql;
    }

    quoteIdentifier(identifier, dbType) {
        switch (dbType) {
            case 'mysql':
                return `\`${identifier}\``;
            case 'postgres':
            case 'sqlite':
                return `"${identifier}"`;
            case 'mssql':
                return `[${identifier}]`;
            default:
                return `"${identifier}"`;
        }
    }

    toSnakeCase(str) {
        return str
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
            .toLowerCase();
    }

    formatValue(value, dbType) {
        if (value === null || value === undefined) {
            return 'NULL';
        }

        if (typeof value === 'boolean') {
            return value ? 'TRUE' : 'FALSE';
        }

        if (typeof value === 'number') {
            return value.toString();
        }

        if (typeof value === 'string') {
            // Escape single quotes
            const escaped = value.replace(/'/g, "''");
            return `'${escaped}'`;
        }

        if (Array.isArray(value) || typeof value === 'object') {
            // Convert to JSON string
            const jsonStr = JSON.stringify(value).replace(/'/g, "''");
            return `'${jsonStr}'`;
        }

        return `'${value}'`;
    }

    inferSqlType(value, dbType) {
        if (value === null || value === undefined) {
            return 'TEXT';
        }

        if (typeof value === 'boolean') {
            switch (dbType) {
                case 'mysql':
                    return 'TINYINT(1)';
                case 'postgres':
                    return 'BOOLEAN';
                case 'sqlite':
                    return 'INTEGER';
                case 'mssql':
                    return 'BIT';
                default:
                    return 'BOOLEAN';
            }
        }

        if (typeof value === 'number') {
            if (Number.isInteger(value)) {
                if (value > 2147483647 || value < -2147483648) {
                    return 'BIGINT';
                }
                return 'INT';
            }
            return 'DECIMAL(10, 2)';
        }

        if (typeof value === 'string') {
            // Check if it's a date
            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                switch (dbType) {
                    case 'mysql':
                        return 'DATETIME';
                    case 'postgres':
                        return 'TIMESTAMP';
                    case 'sqlite':
                        return 'TEXT';
                    case 'mssql':
                        return 'DATETIME2';
                    default:
                        return 'DATETIME';
                }
            }

            if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                return 'DATE';
            }

            // Check length
            if (value.length > 255) {
                return 'TEXT';
            }

            return `VARCHAR(${Math.max(255, value.length + 50)})`;
        }

        if (Array.isArray(value) || typeof value === 'object') {
            return 'TEXT';
        }

        return 'TEXT';
    }

    updateStats() {
        document.getElementById('table-count').textContent = this.tableCount;
        document.getElementById('row-count').textContent = this.rowCount;
        document.getElementById('statement-count').textContent = this.statementCount;
        document.getElementById('stats').classList.remove('hidden');
    }

    showStatus(message, type) {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status ${type}`;
        status.classList.remove('hidden');

        setTimeout(() => {
            status.classList.add('hidden');
        }, 3000);
    }

    // ==================== LocalStorage ====================
    saveToLocalStorage() {
        const data = {
            jsonInput: document.getElementById('json-input').value,
            tableName: document.getElementById('table-name').value,
            options: this.getOptions()
        };
        localStorage.setItem('jsonToSqlData', JSON.stringify(data));
    }

    restoreFromLocalStorage() {
        const saved = localStorage.getItem('jsonToSqlData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.jsonInput) {
                    document.getElementById('json-input').value = data.jsonInput;
                }
                if (data.tableName) {
                    document.getElementById('table-name').value = data.tableName;
                }
                if (data.options) {
                    document.getElementById('use-insert-ignore').checked = data.options.useInsertIgnore;
                    document.getElementById('use-on-duplicate').checked = data.options.useOnDuplicate;
                    document.getElementById('use-quotes').checked = data.options.useQuotes;
                    document.getElementById('use-batch').checked = data.options.useBatch;
                    document.getElementById('include-create').checked = data.options.includeCreate;
                    document.getElementById('use-semicolon').checked = data.options.useSemicolon;
                    document.getElementById('use-snake-case').checked = data.options.useSnakeCase || false;

                    const dbType = data.options.dbType || 'mysql';
                    const dbRadio = document.getElementById(`db-${dbType}`);
                    if (dbRadio) {
                        dbRadio.checked = true;
                    }
                }
                // Auto-trigger convert if JSON input is filled
                if (data.jsonInput) {
                    this.convert();
                }
            } catch (e) {
                console.error('Failed to restore from localStorage:', e);
            }
        }
    }
}

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
        this.restoreFromLocalStorage();
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
        this.showStatus('Cleared!', 'success');
        this.saveToLocalStorage();
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
            this.showStatus('SQL formatted!', 'success');
        } catch (e) {
            this.showStatus('Error formatting SQL: ' + e.message, 'error');
        }
    }

    convert() {
        const sqlInput = document.getElementById('sql-input').value.trim();

        if (!sqlInput) {
            this.showStatus('Please enter SQL to convert', 'error');
            return;
        }

        try {
            this.resetCounters();
            const result = this.parseSql(sqlInput);
            this.generatedJson = JSON.stringify(result, null, 2);
            this.renderJson();
            this.updateStats();
            this.showStatus('Conversion successful!', 'success');
            this.saveToLocalStorage();
        } catch (e) {
            this.showStatus('Error: ' + e.message, 'error');
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
                    <button class="copy-btn" data-code="${this.escapeHtml(this.generatedJson)}">Copy</button>
                    <button class="download-btn" data-code="${this.escapeHtml(this.generatedJson)}" data-filename="output.json">Download</button>
                </div>
            </div>
            <textarea class="json-code" readonly>${this.escapeHtml(this.generatedJson)}</textarea>
        `;
        container.appendChild(box);

        this.bindJsonBoxButtons();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    bindJsonBoxButtons() {
        document.querySelectorAll('.json-box .copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const code = btn.getAttribute('data-code');
                const textarea = document.createElement('textarea');
                textarea.innerHTML = code;
                const decodedCode = textarea.value;

                navigator.clipboard.writeText(decodedCode)
                    .then(() => this.showStatus('Copied to clipboard!', 'success'))
                    .catch(() => this.showStatus('Failed to copy', 'error'));
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
                this.showStatus(`Downloaded ${filename}!`, 'success');
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

    showStatus(message, type) {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status ${type}`;
        status.classList.remove('hidden');

        setTimeout(() => {
            status.classList.add('hidden');
        }, 3000);
    }

    // ==================== LocalStorage ====================
    saveToLocalStorage() {
        const data = {
            sqlInput: document.getElementById('sql-input').value
        };
        localStorage.setItem('sqlToJsonData', JSON.stringify(data));
    }

    restoreFromLocalStorage() {
        const saved = localStorage.getItem('sqlToJsonData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.sqlInput) {
                    document.getElementById('sql-input').value = data.sqlInput;
                    // Auto-trigger convert if SQL input is filled
                    this.convert();
                }
            } catch (e) {
                console.error('Failed to restore from localStorage:', e);
            }
        }
    }
}

// Initialize the converter when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new JsonToSqlConverter();
    new SqlToJsonConverter();
    
    // Mode toggle functionality
    const modeJsonToSql = document.getElementById('mode-json-to-sql');
    const modeSqlToJson = document.getElementById('mode-sql-to-json');
    const jsonToSqlSection = document.getElementById('json-to-sql-section');
    const sqlToJsonSection = document.getElementById('sql-to-json-section');

    if (modeJsonToSql && modeSqlToJson) {
        modeJsonToSql.addEventListener('click', () => {
            modeJsonToSql.classList.add('active');
            modeSqlToJson.classList.remove('active');
            jsonToSqlSection.classList.remove('hidden');
            sqlToJsonSection.classList.add('hidden');
        });

        modeSqlToJson.addEventListener('click', () => {
            modeSqlToJson.classList.add('active');
            modeJsonToSql.classList.remove('active');
            sqlToJsonSection.classList.remove('hidden');
            jsonToSqlSection.classList.add('hidden');
        });
    }
});
