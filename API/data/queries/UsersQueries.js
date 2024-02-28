const util = require('util');
const assert = require('../../model/Asserter');
const getPool = require('../PoolGetter');
const { generateRandomToken } = require('../../model/Utils');


/**
 * Retrieves a user from the database by their ID.
 * @param {number} id - The ID of the user.
 * @returns {Promise<Object>} - A promise that resolves to the user object.
 * @throws {Error} - If the user is not found or if multiple users are found.
 */
async function getUserById(id) {

    assert(id, 'Id is required');

    // Ensure the ID is a number
    id = parseInt(id);
    assert(typeof id === 'number', 'Id must be a number');

    // database pool
    const pool = getPool();

    // Promisify the pool query method to allow for async/await
    const query = util.promisify(pool.query).bind(pool);

    try {
        // Get the user from the database
        const user = await query('SELECT * FROM user WHERE id = ?', [id]);

        if (user.length === 0) {
            throw new Error('User not found');
        }

        if (user.length > 1) {
            throw new Error('Multiple users found');
        }

        return user[0];

    } catch (err) {
        console.log(err);
        throw err;
    } finally {
        // Close the pool
        pool.end();
    }

}

/**
 * Retrieves a user from the database based on the provided identifier.
 * @param {string} identifier - The identifier of the user.
 * @returns {Promise<Object>} - A promise that resolves to the user object.
 * @throws {Error} - If the user is not found or if multiple users are found.
 */
async function getUser(identifier) {

    assert(identifier, 'identifier is required');

    // database pool
    const pool = getPool();

    // Promisify the pool query method to allow for async/await
    const query = util.promisify(pool.query).bind(pool);

    try {
        // Get the user from the database
        const user = await query('SELECT * FROM user WHERE identifier = ?', [identifier]);

        if (user.length === 0) {
            throw new Error('User not found');
        }

        if (user.length > 1) {
            throw new Error('Multiple users found');
        }

        return user[0];

    } catch (err) {
        console.log(err);
        throw err;
    } finally {
        // Close the pool
        pool.end();
    }

}

/**
 * Adds a user to the database.
 * @param {Object} data - The user data.
 * @param {string} data.first_name - The first name of the user.
 * @param {string} data.last_name - The last name of the user.
 * @param {string} data.identifier - The identifier of the user.
 * @returns {number} - The ID of the inserted user.
 * @throws {Error} - If any required data is missing or if there is an error during the database operation.
 */
async function addUser(data) {

    assert(data, 'argument is required');
    assert(data.first_name, 'first name is required');
    assert(data.last_name, 'last name is required');
    assert(data.identifier, 'identifier is required');

    // database pool
    const pool = getPool();

    // Promisify the pool query method to allow for async/await
    const query = util.promisify(pool.query).bind(pool);

    try {
        // Insert the user into the database
        const result = await query('INSERT INTO user (first_name, last_name, identifier) VALUES (?, ?, ?)', [data.first_name, data.last_name, data.identifier]);

        return result.insertId;

    } catch (err) {
        console.log(err);
        throw err;
    } finally {
        // Close the pool
        pool.end();
    }

}

/**
 * Retrieves signed users based on the provided ID.
 * @param {number} id - The ID of the document.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of signed user objects.
 */
async function getSignedUsers(id) {
    // database pool
    const pool = getPool();

    // Promisify the pool query method to allow for async/await
    const query = util.promisify(pool.query).bind(pool);

    try {
        // query string to retrieve signed users depending on the document ID
        let queryStr = `
        SELECT uv.id id, CONCAT(u.first_name, ' ', u.last_name) displayName, uv.date signed_date, v.created_date version_date
        FROM user u
        JOIN user_version uv ON u.id = uv.user_id
        JOIN version v ON uv.version_id = v.id
        WHERE v.doc_id = ? AND uv.date IS NOT NULL
        AND u.archived_date IS NULL;`;

        if (!id) {
            throw new Error('No ID provided');
        }


        // Get all users
        const users = await query(queryStr, [id]);

        return users;

    } catch (err) {
        console.log(err);
    } finally {
        // Close the pool
        pool.end();
    }
}

/**
 * Generates a signing token for a user and inserts it into the database.
 * @param {string} user_identifier - The email of the user.
 * @param {string} doc_id - The ID of the document.
 * @returns {string} The generated signing token.
 * @throws {Error} If user_id or doc_id is missing.
 */
async function generateSigningToken(user_identifier, doc_id) {
    assert(user_identifier, 'user_id is required');
    assert(doc_id, 'doc_id is required');

    // list of existing tokens
    const existingTokens = await getSigningTokens();


    // generate a unique and random token
    let token = generateRandomToken(10, false);
    while (existingTokens.includes(token)) {
        token = generateRandomToken(10, false);
    }

    // database pool
    const pool = getPool();

    // Promisify the pool query method to allow for async/await
    const query = util.promisify(pool.query).bind(pool);

    try {

        // get the user id thanks to the user identifier
        const user = await getUser(user_identifier);
        const user_id = user.id;

        // Insert the value into the database
        await query('INSERT INTO user_version (user_id, version_id, signing_token) VALUES (?, ?, ?)', [user_id, doc_id, token]);

        // return the token to send it to the user
        return token;

    } catch (err) {
        console.log(err);
        throw err;
    } finally {
        // Close the pool
        pool.end();
    }
}

/**
 * Retrieves the signing tokens from the database.
 * @returns {Promise<Array<string>>} An array of signing tokens.
 */
async function getSigningTokens() {
    // database pool
    const pool = getPool();

    // Promisify the pool query method to allow for async/await
    const query = util.promisify(pool.query).bind(pool);

    try {
        let queryStr = `
        SELECT signing_token token
        FROM user_version 
        WHERE signing_token IS NOT NULL;`;

        // Get all tokens
        const tokens = await query(queryStr);

        let tokenList = [];

        // extract the token value from the result
        for (let i = 0; i < tokens.length; i++) {
            tokenList.push(tokens[i].token);
        }

        return tokenList;
    }
    catch (e) {
        console.log(e);
    }

}

/**
 * Signs a document for a specific user and version.
 * @param {string} user_id - The ID of the user.
 * @param {string} version_id - The ID of the version.
 * @param {string} blob - The document blob to be signed.
 * @returns {Promise<void>} - A promise that resolves when the document is signed.
 */
async function signDoc(signingToken, blob) {
    // check if the signingToken and blob are not null
    assert(signingToken, 'signingToken is required');
    assert(blob, 'blob is required');

    // database pool
    const pool = getPool();

    // Promisify the pool query method to allow for async/await
    const query = util.promisify(pool.query).bind(pool);

    try {

        // get the ids thanks to the user identifier
        const user_version_id = await getUserVersionIdByToken(signingToken);

        // verify the user_version_id are not null
        assert(user_version_id, 'user_version_id is required');

        // Insert the value into the database
        await query('UPDATE user_version SET date = NOW(), blob = ? WHERE id = ?', [blob, user_version_id]);

    } catch (err) {
        console.log(err);
        throw err;
    } finally {
        // Close the pool
        pool.end();
    }
}

/**
 * Retrieves the user_version ID associated with a given signing token.
 *
 * @param {string} signingToken - The signing token to search for.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the user ID and version ID.
 * @throws {Error} - If a duplicate token is found.
 */
async function getUserVersionIdByToken(signingToken) {
    // database pool
    const pool = getPool();

    // Promisify the pool query method to allow for async/await
    const query = util.promisify(pool.query).bind(pool);

    try {
        let queryStr = `
        SELECT uv.id
        FROM user_version uv
        WHERE signing_token = ?;`;

        // Get all tokens
        const result = await query(queryStr, [signingToken]);

        // extract the token value from the result
        if (result.length > 1) throw new Error('Token duplicate found');

        return result[0];
    }
    catch (e) {
        console.log(e);
    }
}

module.exports = {
    getSignedUsers, getUserById, getUser, addUser, signDoc, generateSigningToken
};
