/**
 * Asserts that a condition is true, otherwise throws an error with the specified message.
 * @param {boolean} condition - The condition to be checked.
 * @param {string} [message] - The error message to be thrown if the condition is false.
 * @throws {Error} Throws an error if the condition is false.
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

// export the assert function
module.exports = assert;