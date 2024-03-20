const getPool = require("./PoolGetter");
const util = require('util');
const { createTables } = require("./TableCreation");

/**
 * Executes a database operation with cleanup.
 * @param {Function} handler - The handler function that performs the database operation.
 * @returns {Promise} A promise that resolves with the result of the database operation.
 * @throws {Error} If an error occurs during the database operation.
 */
async function executeWithCleanup(handler) {
    let pool;

    try {
        // make the query async
        pool = getPool();
        const query = util.promisify(pool.query).bind(pool);

        // Create the tables if they don't exist
        await createTables(query);

        return await handler(query);
    } catch (error) {
        throw error;
    }
    finally {
        
        // Check if the pool is already closed before attempting to close it
        if (pool && pool._closed === false) {
            pool.end();
        }
    }
}

module.exports = executeWithCleanup;