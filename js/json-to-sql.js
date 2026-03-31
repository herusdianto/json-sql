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
        restoreJsonToSqlFromLocalStorage(() => this.convert());
        // Remove convert button and auto-trigger convert on input changes
        this.bindAutoConvert();
        this.bindClearButton();
        this.bindFormatButton();
        this.bindExampleButton();
        this.bindGlobalActions();
        initThemeToggle();
        this.bindTableNameChange();
        this.setCurrentYear();
    }

    setCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
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
        showStatus('Cleared!', 'success');
        saveJsonToSqlToLocalStorage();
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

        showStatus('Example JSON loaded!', 'success');

        // Trigger convert after loading example
        setTimeout(() => this.convert(), 100);
        saveJsonToSqlToLocalStorage();
    }

    formatJson() {
        const jsonInput = document.getElementById('json-input');
        try {
            const parsed = JSON.parse(jsonInput.value);
            jsonInput.value = JSON.stringify(parsed, null, 2);
            showStatus('JSON formatted!', 'success');
        } catch (e) {
            showStatus('Invalid JSON: ' + e.message, 'error');
        }
    }

    convert() {
        const jsonInput = document.getElementById('json-input').value.trim();
        const tableName = document.getElementById('table-name').value.trim() || 'table';

        if (!jsonInput) {
            showStatus('Please enter JSON to convert', 'error');
            return;
        }

        try {
            const jsonObj = JSON.parse(jsonInput);
            this.resetCounters();

            const options = getJsonToSqlOptions();

            // Generate SQL
            this.generatedSql = this.generateSql(tableName, jsonObj, options);

            // Render SQL
            this.renderSql();

            this.updateStats();
            showStatus('Conversion successful!', 'success');
            saveJsonToSqlToLocalStorage();
        } catch (e) {
            showStatus('Error: ' + e.message, 'error');
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
            <textarea class="sql-code" readonly>${escapeHtml(this.generatedSql)}</textarea>
        `;
        container.appendChild(box);

        // Bind copy/download buttons
        this.bindSqlBoxButtons();
    }

    bindSqlBoxButtons() {
        document.querySelectorAll('.sql-box .copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const code = btn.getAttribute('data-code');
                // Decode URL-encoded string
                const decodedCode = decodeURIComponent(code);

                navigator.clipboard.writeText(decodedCode)
                    .then(() => showStatus('Copied to clipboard!', 'success'))
                    .catch(() => showStatus('Failed to copy', 'error'));
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
                showStatus(`Downloaded ${filename}!`, 'success');
            });
        });
    }

    resetCounters() {
        this.tableCount = 0;
        this.rowCount = 0;
        this.statementCount = 0;
    }

    generateSql(tableName, jsonObj, options) {
        let sql = '';
        const quotedTable = options.useQuotes ? quoteIdentifier(tableName, options.dbType) : tableName;

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
        const quotedTable = options.useQuotes ? quoteIdentifier(tableName, options.dbType) : tableName;
        let sql = `CREATE TABLE ${quotedTable} (\n`;

        const columns = [];
        Object.keys(sampleRow).forEach(key => {
            const columnName = options.useSnakeCase ? toSnakeCase(key) : key;
            const quotedKey = options.useQuotes ? quoteIdentifier(columnName, options.dbType) : columnName;
            const sqlType = inferSqlType(sampleRow[key], options.dbType);
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

        const quotedTable = options.useQuotes ? quoteIdentifier(tableName, options.dbType) : tableName;
        const columns = Object.keys(rows[0]);
        const quotedColumns = columns.map(col => {
            const columnName = options.useSnakeCase ? toSnakeCase(col) : col;
            return options.useQuotes ? quoteIdentifier(columnName, options.dbType) : columnName;
        });

        let sql = '';

        if (options.useInsertIgnore) {
            sql += `INSERT IGNORE INTO ${quotedTable} (${quotedColumns.join(', ')})\nVALUES\n`;
        } else {
            sql += `INSERT INTO ${quotedTable} (${quotedColumns.join(', ')})\nVALUES\n`;
        }

        const valueRows = rows.map(row => {
            const values = columns.map(col => formatValue(row[col], options.dbType));
            return `(${values.join(', ')})`;
        });

        sql += valueRows.join(',\n');

        if (options.useOnDuplicate) {
            const updateClauses = columns.map(col => {
                const columnName = options.useSnakeCase ? toSnakeCase(col) : col;
                const quotedCol = options.useQuotes ? quoteIdentifier(columnName, options.dbType) : columnName;
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
        const quotedTable = options.useQuotes ? quoteIdentifier(tableName, options.dbType) : tableName;
        const columns = Object.keys(row);
        const quotedColumns = columns.map(col => {
            const columnName = options.useSnakeCase ? toSnakeCase(col) : col;
            return options.useQuotes ? quoteIdentifier(columnName, options.dbType) : columnName;
        });
        const values = columns.map(col => formatValue(row[col], options.dbType));

        let sql = '';

        if (options.useInsertIgnore) {
            sql = `INSERT IGNORE INTO ${quotedTable} (${quotedColumns.join(', ')}) VALUES (${values.join(', ')})`;
        } else {
            sql = `INSERT INTO ${quotedTable} (${quotedColumns.join(', ')}) VALUES (${values.join(', ')})`;
        }

        if (options.useOnDuplicate) {
            const updateClauses = columns.map(col => {
                const columnName = options.useSnakeCase ? toSnakeCase(col) : col;
                const quotedCol = options.useQuotes ? quoteIdentifier(columnName, options.dbType) : columnName;
                return `${quotedCol} = VALUES(${quotedCol})`;
            });
            sql += ` ON DUPLICATE KEY UPDATE ${updateClauses.join(', ')}`;
        }

        if (options.useSemicolon) {
            sql += ';';
        }

        return sql;
    }

    updateStats() {
        document.getElementById('table-count').textContent = this.tableCount;
        document.getElementById('row-count').textContent = this.rowCount;
        document.getElementById('statement-count').textContent = this.statementCount;
        document.getElementById('stats').classList.remove('hidden');
    }
}
