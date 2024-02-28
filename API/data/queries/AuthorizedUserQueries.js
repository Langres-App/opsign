const assert = require("../../model/Asserter");
const { hashPassword, comparePassword } = require("../../model/PasswordHasher");
const { generateRandomToken } = require("../../model/Utils");
const getPool = require("../PoolGetter");
const util = require('util');

/**
 * Checks if an authorized user exists in the database.
 * @returns {Promise<boolean>} A promise that resolves to true if a user exists, false otherwise.
 */
async function userExist() {
    // make the query async
    const pool = getPool();
    const query = util.promisify(pool.query).bind(pool);

    try {
        // Update the document name
        const documentQuery = 'SELECT * FROM authorized_user';
        // check that there is at max a single user
        const users = await query(documentQuery);
        if (users.length > 1) {
            throw new Error('There is more than one user in the database');
        }

        // If there is no user, return false
        return users.length === 1;
    } catch (err) {
        console.log(err);
        // throw the error for the controller to catch
        throw err;
    } finally {
        // Close the pool
        pool.end();
    }
}

/**
 * Creates a new user in the database.
 * @param {Object} user - The user object containing the username and password.
 * @param {string} user.username - The username of the user.
 * @param {string} user.password - The password of the user.
 * @returns {Promise<void>} - A promise that resolves when the user is created successfully.
 * @throws {Error} - If there is an error creating the user.
 */
async function createUser(user) {
    // make the query async
    const pool = getPool();
    const query = util.promisify(pool.query).bind(pool);

    // Check that there is no user in the database
    if (await userExist()) {
        throw new Error('There is already a user in the database');
    }

    // Check that the user object is valid
    assert(user.username, 'username is required');
    assert(user.password, 'password is required');

    try {
        // Create the query string
        let queryStr = 'INSERT INTO authorized_user (username, password) VALUES (?, ?)';

        // Insert the user into the database
        await query(queryStr, [user.username, await hashPassword(user.password)]);
    } catch (err) {
        console.log(err);
        // throw the error for the controller to catch
        throw err;
    } finally {
        // Close the pool
        pool.end();
    }
}


/**
 * Checks if a user is logged in based on the provided token.
 * @param {string} token - The user's token.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the user is logged in.
 * @throws {Error} - If there is an error during the query or if there are multiple users with the same token.
 */
async function userIsLogged(token) {
    // make the query async
    const pool = getPool();
    const query = util.promisify(pool.query).bind(pool);

    // Check that the token is valid
    assert(token, 'token is required');
    assert(token !== 'null', 'token is required');

    // Check that there is a user in the database
    if (!await userExist()) return false;

    try {
        // Create the query string
        let queryStr = 'SELECT * FROM authorized_user WHERE token = ?';

        // Insert the user into the database
        const users = await query(queryStr, [token]);

        if (users.length > 1) {
            throw new Error('There is more than one user');
        }

        if (users.length === 0) {
            return false;
        }

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

    } catch (err) {
        console.log(err);
        // throw the error for the controller to catch
        throw err;
    } finally {
        // Close the pool 
        pool.end();
    }
}

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

    // make the query async
    const pool = getPool();
    const query = util.promisify(pool.query).bind(pool);

    if (!await userExist()) {
        throw new Error('No user found');
    }

    // Check that the user object is valid
    assert(user.username, 'username is required');
    assert(user.password, 'password is required');

    try {
        // Create the query string
        let queryStr = 'SELECT * FROM authorized_user WHERE username = ?';

        // Insert the user into the database
        const users = await query(queryStr, [user.username]);

        if (users.length > 1) {
            throw new Error('There is more than one user');
        }

        if (!await comparePassword(user.password, users[0].password)) {
            throw new Error('Invalid credentials');
        }

        // Generate a random token & update the user's token in the database
        const token = generateRandomToken(255);
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 5);
        const updateQuery = 'UPDATE authorized_user SET token = ?, token_expiration = ? WHERE username = ?';
        await query(updateQuery, [token, expiration, user.username]);

        return { "token": token };

    } catch (err) {
        console.log(err);
        // throw the error for the controller to catch
        throw err;
    } finally {
        // Close the pool
        pool.end();
    }
}

module.exports = {
    userExist,
    createUser,
    userIsLogged,
    login
};