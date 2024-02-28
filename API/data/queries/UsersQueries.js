const util = require('util');
const assert = require('../../model/Asserter');
const getPool = require('../PoolGetter');
const { generateRandomToken } = require('../../model/Utils');


async function getUserById(id) {

    assert(id, 'Id is required');

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

async function getSignedUsers(id) {
    // database pool
    const pool = getPool();

    // Promisify the pool query method to allow for async/await
    const query = util.promisify(pool.query).bind(pool);

    try {

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

async function generateSigningToken(user_id, doc_id) {
    assert(user_id, 'user_id is required');
    assert(doc_id, 'doc_id is required');

    const existingTokens = await getSigningTokens();

    let token = generateRandomToken(10, false);

    while (existingTokens.includes(token)) {
        token = generateRandomToken(10, false);
    }

    // database pool
    const pool = getPool();

    // Promisify the pool query method to allow for async/await
    const query = util.promisify(pool.query).bind(pool);

    try {
        // Insert the user into the database
        await query('INSERT INTO user_version (user_id, version_id, signing_token) VALUES (?, ?, ?)', [user_id, doc_id, token]);

        return token;

    } catch (err) {
        console.log(err);
        throw err;
    } finally {
        // Close the pool
        pool.end();
    }
}

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

        for (let i = 0; i < tokens.length; i++) {
            tokenList.push(tokens[i].token);
        }

        return tokenList;
    }
    catch (e) {
        console.log(e);
    }

}

async function signDoc(user_id, version_id, blob) {
    assert(user_id, 'user_id is required');
    assert(version_id, 'version_id is required');
    assert(blob, 'blob is required');

    // database pool
    const pool = getPool();

    // Promisify the pool query method to allow for async/await
    const query = util.promisify(pool.query).bind(pool);

    try {
        // Insert the user into the database
        await query('UPDATE user_version SET date = NOW(), signing_token = NULL, signature = ? WHERE user_id = ? AND version_id = ?', [blob, user_id, version_id]);

    } catch (err) {
        console.log(err);
        throw err;
    } finally {
        // Close the pool
        pool.end();
    }
}

module.exports = {
    getSignedUsers, getUserById, getUser, addUser, signDoc, generateSigningToken
};
