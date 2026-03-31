/**
 * LocalStorage operations
 */

/**
 * Save JSON to SQL data to localStorage
 */
function saveJsonToSqlToLocalStorage() {
    const data = {
        jsonInput: document.getElementById('json-input').value,
        tableName: document.getElementById('table-name').value,
        options: getJsonToSqlOptions()
    };
    localStorage.setItem('jsonToSqlData', JSON.stringify(data));
}

/**
 * Restore JSON to SQL data from localStorage
 * @param {Function} convertCallback - Callback to trigger conversion after restore
 */
function restoreJsonToSqlFromLocalStorage(convertCallback) {
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
            if (data.jsonInput && convertCallback) {
                convertCallback();
            }
        } catch (e) {
            console.error('Failed to restore from localStorage:', e);
        }
    }
}

/**
 * Get JSON to SQL options from form
 * @returns {Object} Options object
 */
function getJsonToSqlOptions() {
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

/**
 * Save SQL to JSON data to localStorage
 */
function saveSqlToJsonToLocalStorage() {
    const data = {
        sqlInput: document.getElementById('sql-input').value
    };
    localStorage.setItem('sqlToJsonData', JSON.stringify(data));
}

/**
 * Restore SQL to JSON data from localStorage
 * @param {Function} convertCallback - Callback to trigger conversion after restore
 */
function restoreSqlToJsonFromLocalStorage(convertCallback) {
    const saved = localStorage.getItem('sqlToJsonData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.sqlInput) {
                document.getElementById('sql-input').value = data.sqlInput;
                // Auto-trigger convert if SQL input is filled
                if (convertCallback) {
                    convertCallback();
                }
            }
        } catch (e) {
            console.error('Failed to restore from localStorage:', e);
        }
    }
}
