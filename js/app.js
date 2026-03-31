/**
 * Main application initialization
 */

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
