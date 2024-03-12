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

            let code;

            let errorMessage = error.message.toLowerCase();

            // Set the status code based on the error message
            if (errorMessage.includes('not found')) {
                code = 404;
            } else if (errorMessage.includes('unauthorized')) {
                code = 401;
            } else if (errorMessage.includes('duplicate')) {
                code = 409;
            } else {
                code = 500;
            }

            // Send the error message to the client with the appropriate status code
            return res.status(code).send(error.message);

        }
    };
}

module.exports = { handle };