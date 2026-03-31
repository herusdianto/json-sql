/**
 * Common utility functions
 */

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show status message with auto-hide
 * @param {string} message - Message to display
 * @param {string} type - Message type ('success' or 'error')
 */
function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
    status.classList.remove('hidden');

    setTimeout(() => {
        status.classList.add('hidden');
    }, 3000);
}

/**
 * Convert string to snake_case
 * @param {string} str - String to convert
 * @returns {string} Snake case string
 */
function toSnakeCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
        .toLowerCase();
}

/**
 * Quote SQL identifier based on database type
 * @param {string} identifier - Identifier to quote
 * @param {string} dbType - Database type (mysql, postgres, sqlite, mssql)
 * @returns {string} Quoted identifier
 */
function quoteIdentifier(identifier, dbType) {
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

/**
 * Format value for SQL
 * @param {*} value - Value to format
 * @param {string} dbType - Database type
 * @returns {string} Formatted SQL value
 */
function formatValue(value, dbType) {
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

/**
 * Infer SQL type from value
 * @param {*} value - Value to infer type from
 * @param {string} dbType - Database type
 * @returns {string} SQL type
 */
function inferSqlType(value, dbType) {
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
