const assert = require('../Asserter');
const queries = require('../../data/queries/AuthorizedUserQueries');

/**
 * Checks if the user is authenticated based on the provided token.
 * @param {string} token - The authentication token.
 * @returns {boolean} - Returns true if the user is authenticated, false otherwise.
 */
async function check(token) {

    // Check if the user exists (if not, throw an error for the controller to catch)
    await userExist();

    if (!token || token === 'null' || !token.includes('Bearer ')) {
        return false;
    }

    // Get the token from the header
    token = token.split('Bearer ')[1];

    // Check if the user is logged in
    return await userIsLogged(token);

}

/**
 * Checks if a user exists.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the user exists or not.
 */
async function userExist() {

    return await queries.userExist();

}

/**
 * Checks if a user is logged in.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the user is logged in.
 */
async function userIsLogged(token) {

    return await queries.userIsLogged(token);

}

/**
 * Logs in a user with the provided username and password.
 * @param {Object} data - The login data.
 * @param {string} data.username - The username.
 * @param {string} data.password - The password.
 * @returns {Promise} A promise that resolves with the login result.
 * @throws {Error} If the username or password is missing.
 * @throws {Error} If the user does not exist.
 */
async function login(data) {

    // check for the username and password
    assert(data.username, '[AuthManager.login] The username is required');
    assert(data.password, '[AuthManager.login] The password is required');

    // Check if the user exists, if not throw an error with 'Bad credentials' so that no information is leaked
    assert(await userExist(), 'Bad credentials');

    return await queries.login(data);

}

/**
 * Registers a new user.
 * @param {Object} data - The user data.
 * @param {string} data.username - The username.
 * @param {string} data.password - The password.
 * @returns {Promise} A promise that resolves with the created user.
 * @throws {Error} If the username or password is missing.
 * @throws {Error} If the user already exists.
 */
async function register(data) {

    assert(data.username, '[AuthManager.login] The username is required');
    assert(/^[a-z0-9-]+\.[a-z0-9]+$/i.test(data.username), '[AuthManager.login] The username is invalid');

    assert(data.password, '[AuthManager.login] The password is required');
    assert(data.password.length >= 4, '[AuthManager.login] The password is not long enough, must be at least 4 characters long');

    // clean the username and password from any leading or trailing spaces
    data.username = data.username.trim();
    data.password = data.password.trim();

    await queries.createUser(data);

    // Check if the user exists, if not throw an error with 'Bad credentials' so that no information is leaked
    assert(await userExist(), 'Bad credentials');

    return await login(data);



}

module.exports = {
    check,
    login,
    register,

    // exported for testing purposes
    userExist,
    userIsLogged,
    queries
};