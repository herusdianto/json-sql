# JSON to SQL Converter

A client-side web tool for converting JSON to SQL INSERT statements.

**100% Client-side - No data sent to server!**

## Features

- ✅ Convert JSON to SQL INSERT statements
- ✅ Support for multiple database types (MySQL, PostgreSQL, SQLite, SQL Server)
- ✅ Generate CREATE TABLE statements
- ✅ Batch insert support
- ✅ INSERT IGNORE support
- ✅ ON DUPLICATE KEY UPDATE support
- ✅ Quote identifiers for different databases
- ✅ Format JSON input
- ✅ Copy to clipboard
- ✅ Download as .sql file
- ✅ Dark/Light mode toggle
- ✅ Responsive design
- ✅ Statistics display (tables, rows, statements count)
- ✅ LocalStorage persistence

## Database Support

| Database | Identifier Quotes | Boolean Type | DateTime Type |
|----------|------------------|--------------|---------------|
| MySQL | \`backticks\` | TINYINT(1) | DATETIME |
| PostgreSQL | "double quotes" | BOOLEAN | TIMESTAMP |
| SQLite | "double quotes" | INTEGER | TEXT |
| SQL Server | [brackets] | BIT | DATETIME2 |

## SQL Options

| Option | Description |
|--------|-------------|
| INSERT IGNORE | Uses INSERT IGNORE instead of INSERT |
| ON DUPLICATE KEY UPDATE | Adds ON DUPLICATE KEY UPDATE clause |
| Quote Identifiers | Wraps table/column names in database-specific quotes |
| Batch Insert | Combines multiple rows into a single INSERT statement |
| Include CREATE TABLE | Generates CREATE TABLE statement based on JSON structure |
| Add Semicolons | Adds semicolons at the end of statements |

## Usage

### Option 1: Open directly in browser

Simply open `public/index.html` in your web browser.

### Option 2: Use a local server

```bash
# Using Python
cd public
python -m http.server 8000

# Using Node.js (http-server)
npx http-server public

# Using PHP
cd public
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Example

### Input JSON
```json
[
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
  }
]
```

### Output SQL (MySQL with batch insert)
```sql
INSERT INTO `users` (`id`, `firstName`, `lastName`, `email`, `age`, `active`, `salary`, `createdAt`)
VALUES
(1, 'John', 'Doe', 'john.doe@example.com', 30, TRUE, 75000.5, '2024-01-15T10:30:00Z'),
(2, 'Jane', 'Smith', 'jane.smith@example.com', 25, TRUE, 65000.75, '2024-02-20T14:45:00Z');
```

### Output SQL (with CREATE TABLE)
```sql
CREATE TABLE `users` (
    `id` INT,
    `firstName` VARCHAR(255),
    `lastName` VARCHAR(255),
    `email` VARCHAR(255),
    `age` INT,
    `active` TINYINT(1),
    `salary` DECIMAL(10, 2),
    `createdAt` DATETIME
);

INSERT INTO `users` (`id`, `firstName`, `lastName`, `email`, `age`, `active`, `salary`, `createdAt`)
VALUES
(1, 'John', 'Doe', 'john.doe@example.com', 30, TRUE, 75000.5, '2024-01-15T10:30:00Z'),
(2, 'Jane', 'Smith', 'jane.smith@example.com', 25, TRUE, 65000.75, '2024-02-20T14:45:00Z');
```

## Type Inference

The converter automatically infers SQL types from JSON values:

| JSON Type | SQL Type |
|-----------|----------|
| `null` | TEXT |
| `boolean` | TINYINT(1) / BOOLEAN / INTEGER / BIT |
| `integer` | INT (or BIGINT for large numbers) |
| `number` | DECIMAL(10, 2) |
| `string` (date/time) | DATETIME / TIMESTAMP / DATETIME2 |
| `string` (date only) | DATE |
| `string` (long) | TEXT |
| `string` (short) | VARCHAR(n) |
| `array` / `object` | TEXT (as JSON string) |

## Technologies Used

- HTML5
- CSS3 (with CSS Variables for theming)
- Vanilla JavaScript (ES6+)
- No external dependencies

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License

## Contributing

Contributions are welcome! Feel free to submit a Pull Request.

## Demo

[https://herusdianto.github.io/json-sql/](https://herusdianto.github.io/json-sql/)

## Created by

[Heru Rusdianto](https://herusdianto.github.io/) with AI Assistance
