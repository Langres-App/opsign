const assert = require("../../model/Asserter");
const { hashPassword, comparePassword } = require("../../model/PasswordHasher");
const { generateRandomToken } = require("../../model/Utils");
const executeWithCleanup = require("../databaseCleanup");

// #region CREATE

/**
 * Creates a new user in the database.
 * @param {Object} user - The user object containing the username and password.
 * @param {string} user.username - The username of the user.
 * @param {string} user.password - The password of the user.
 * @returns {Promise<void>} - A promise that resolves when the user is created successfully.
 * @throws {Error} - If there is an error creating the user.
 */
async function createUser(user) {

    assert(user, '[AuthorizedUserQueries.createUser] The user object is required');
    assert(user.username, '[AuthorizedUserQueries.createUser] The username is required');
    assert(user.password, '[AuthorizedUserQueries.createUser] The password is required');

    return await executeWithCleanup(async (query) => {

        // Create the query string
        let queryStr = 'INSERT INTO authorized_user (username, password) VALUES (?, ?)';

        // Insert the user into the database
        await query(queryStr, [user.username, await hashPassword(user.password)]);

    });

}

// #endregion


// #region READ

/**
 * Checks if an authorized user exists in the database.
 * @returns {Promise<boolean>} A promise that resolves to true if a user exists, false otherwise.
 */
async function userExist() {

    return await executeWithCleanup(async (query) => {

        let queryStr = 'SELECT * FROM authorized_user';
        const users = await query(queryStr);

        assert(users.length <= 1, 'There is more than one user in the database');
        assert(users.length >= 0, 'Administrator not found, please register first.');

        return true;

    });

}

/**
 * Checks if a user is logged in based on the provided token.
 * @param {string} token - The user's token.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the user is logged in.
 * @throws {Error} - If there is an error during the query or if there are multiple users with the same token.
 */
async function userIsLogged(token) {

    assert(token, '[AuthorizedUserQueries.userIsLogged] The token is required');
    assert(token !== 'null', '[AuthorizedUserQueries.userIsLogged] The token is required');

    return await executeWithCleanup(async (query) => {

        // Create the query string
        let queryStr = 'SELECT * FROM authorized_user WHERE token = ?';

        // Insert the user into the database
        const users = await query(queryStr, [token]);

        assert(users.length <= 1, 'There is more than one user');

        if (users.length === 0) return false;

        // check if the token is expired
        const expired = users[0].token_expiration < new Date();

        // If not expired, make token last 5 more minutes
        if (!expired) {
            const expiration = new Date();
            expiration.setMinutes(expiration.getMinutes() + 5);
            const updateQuery = 'UPDATE authorized_user SET token_expiration = ? WHERE token = ?';
            await query(updateQuery, [expiration, token]);
        }

        return !expired;

    });

}
// #endregion


// #region UPDATE

/**
 * Authenticates a user by performing a login operation.
 * 
 * @param {Object} user - The user object containing the username and password.
 * @param {string} user.username - The username of the user.
 * @param {string} user.password - The password of the user.
 * @returns {Promise<string>} - A promise that resolves to the authentication token if the login is successful.
 * @throws {Error} - If the user credentials are invalid or if there are multiple users with the same identifier.
 */
async function login(user) {

    assert(user, '[AuthorizedUserQueries.login] The user object is required');
    assert(user.username, '[AuthorizedUserQueries.login] The username is required');
    assert(user.password, '[AuthorizedUserQueries.login] The password is required');

    return await executeWithCleanup(async (query) => {

        // Create the query string
        let queryStr = 'SELECT * FROM authorized_user WHERE username = ?';

        // Insert the user into the database
        const users = await query(queryStr, [user.username]);

        assert(users.length <= 1, 'There is more than one user');
        assert(users.length >= 0, 'No user found');

        assert(await comparePassword(user.password, users[0].password), 'Invalid credentials');

        // Generate a random token & update the user's token in the database
        const token = generateRandomToken(255);
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 5);
        const updateQuery = 'UPDATE authorized_user SET token = ?, token_expiration = ? WHERE username = ?';
        await query(updateQuery, [token, expiration, user.username]);

        return token;

    });

}

// #endregion


module.exports = {
    userExist,
    createUser,
    userIsLogged,
    login
};