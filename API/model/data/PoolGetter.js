const mysql = require('mysql');

/**
 * Retrieves a connection pool for MySQL database.
 * @returns {Object} The MySQL connection pool.
 */
function getPool() {
    return mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });
}

// Export the function
module.exports = getPool;