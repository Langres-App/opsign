const { createTables } = require("../data/TableCreation");

/**
 * handler middleware.
 * @param {Function} handler - The handler function to be executed.
 * @returns {Function} - The middleware function that handles errors.
 */
function handle(handler) {
    // Return the middleware function
    return async (req, res) => {
        // Execute the handler function
        try {
            // Create the tables if they don't exist
            await createTables();

            // Execute the handler function
            await handler(req, res);
        } catch (error) {

            // Log the error
            console.log(error.message);
            console.log(error);

            // Send the error message to the client with the appropriate status code
            if (error.message.toLowerCase().includes('not found')) {
                return res.status(404).send(error.message);
            }

            return res.status(500).send(error.message);

        }
    };
}

module.exports = handle;