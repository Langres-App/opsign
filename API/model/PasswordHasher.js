const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * Hashes a password using bcrypt.
 * @param {string} password - The password to be hashed.
 * @returns {Promise<string>} - A promise that resolves to the hashed password.
 */
async function hashPassword(password) {
    return bcrypt.hash(password, saltRounds);
}

/**
 * Compares a password with a hash.
 * @param {string} password - The password to compare.
 * @param {string} hash - The hash to compare against.
 * @returns {Promise<boolean>} - A promise that resolves to true if the password matches the hash, false otherwise.
 */
async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

module.exports = {
    hashPassword,
    comparePassword
};