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
        // query string to retrieve signed users depending on the document ID (only get the last version of the document signed for each user)
        let queryStr = `
        SELECT uv.id id, CONCAT(u.first_name, ' ', u.last_name) displayName, uv.date signed_date, v.created_date version_date
        FROM user u
        JOIN user_version uv ON u.id = uv.user_id
        JOIN version v ON uv.version_id = v.id
        JOIN 
            (
                SELECT user_id, MAX(v.created_date) max_version_date
                    FROM user_version uv
                    JOIN version v ON uv.version_id = v.id
                    WHERE v.doc_id = ? AND uv.date IS NOT NULL
                    GROUP BY user_id
            ) max_versions 
            ON uv.user_id = max_versions.user_id 
            AND v.created_date = max_versions.max_version_date
        WHERE 
            v.doc_id = ? AND uv.date IS NOT NULL
            AND u.archived_date IS NULL;`;

        if (!id) {
            throw new Error('No ID provided');
        }


        // Get all users
        const users = await query(queryStr, [id, id]);

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

    // database pool
    const pool = getPool();

    // Promisify the pool query method to allow for async/await
    const query = util.promisify(pool.query).bind(pool);



    try {
        // get the last version id of the document
        const last_version_id = await getLastVersion(query, doc_id);

        // check if the user don't already have a token for this document
        let queryStr = `
            SELECT signing_token token
            FROM user_version
            WHERE user_id = (SELECT id FROM user WHERE identifier = ?)
            AND version_id = ?;`;

        const result = await query(queryStr, [user_identifier, last_version_id]);

        // if the user already have a token for this document, return it
        if (result.length > 0) {
            return result[0].token;
        }


        // generate a unique and random token
        let token = generateRandomToken(10, false);
        while (existingTokens.includes(token)) {
            token = generateRandomToken(10, false);
        }

        // get the user id thanks to the user identifier
        const user = await getUser(user_identifier);
        const user_id = user.id;


        // Insert the value into the database
        await query('INSERT INTO user_version (user_id, version_id, signing_token) VALUES (?, ?, ?)', [user_id, last_version_id, token]);

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

async function getLastVersion(query, doc_id) {

    // get a list containing only the last version id of the document
    let last_version_id = await query('SELECT id FROM version WHERE doc_id = ? ORDER BY created_date DESC LIMIT 1', [doc_id]);

    // verify the last_version_id are not null
    assert(last_version_id, 'last_version_id is required');

    // get the id from the result
    last_version_id = last_version_id[0].id;
    assert(last_version_id, 'last_version_id is required');

    return last_version_id;
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
        throw e;
    }
    finally {
        pool.end();
    }

}

/**
 * Signs a document for a specific user and version.
 * @param {string} signingToken - The signing token for the user.
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
        assert(user_version_id.id, 'user_version_id is required');

        // update the value into the database
        await query('UPDATE user_version SET date = NOW(), signature = ?, signing_token = NULL WHERE id = ?', [blob, user_version_id.id]);

        return user_version_id.id;

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

        assert(result.length > 0, 'Token not found');

        // extract the token value from the result
        if (result.length > 1) throw new Error('Token duplicate found');

        return result[0];
    }
    catch (e) {
        console.log(e);
        throw e;
    }
    finally {
        pool.end();
    }
}

/**
 * Retrieves signing data based on the provided token.
 * @param {string} token - The signing token.
 * @returns {Promise<Object>} - A promise that resolves to the signing data object.
 */
async function getSigningData(token) {
    // database pool
    const pool = getPool();

    // Promisify the pool query method to allow for async/await
    const query = util.promisify(pool.query).bind(pool);

    try {
        // get the signing data from the database
        let queryStr = `
        SELECT CONCAT(u.first_name, ' ', u.last_name) userName, d.file_name docName, v.doc_id docId, v.created_date docDate
        FROM user_version uv
        JOIN version v ON uv.version_id = v.id
        JOIN document d ON v.doc_id = d.id
        JOIN user u ON uv.user_id = u.id
        WHERE signing_token = ?;`;

        // Get all the data needed
        const result = await query(queryStr, [token]);

        assert(result.length > 0, 'Signing Data not found');

        return result[0];
    }
    catch (e) {
        console.log(e);
        throw e;
    }
    finally {
        pool.end();
    }

}

/**
 * Retrieves signing user data based on the provided ID.
 * @param {number} id - The ID of the user.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the display name and signed date of the user.
 * @throws {Error} - If there is an error while retrieving the user data.
 */
async function getSigningUserData(id) {
    // database pool
    const pool = getPool();

    // Promisify the pool query method to allow for async/await
    const query = util.promisify(pool.query).bind(pool);

    try {
        let queryStr = `
        SELECT CONCAT(u.first_name, ' ', u.last_name) displayName, uv.date signed_date
        FROM user_version uv
        JOIN user u ON uv.user_id = u.id
        WHERE uv.id = ?;`;

        // Get the user data
        const result = await query(queryStr, [id]);

        assert(result.length > 0, 'Signing user data not found');

        return result[0];
    }
    catch (e) {
        console.log(e);
        throw e;
    }
    finally {
        pool.end();
    }
}

/**
 * Retrieves the signature of a signing user based on the provided ID.
 *
 * @param {number} id - The ID of the user.
 * @returns {string} The signature of the user.
 */
async function getSigningUserImage(id) {
    // database pool
    const pool = getPool();

    // Promisify the pool query method to allow for async/await
    const query = util.promisify(pool.query).bind(pool);

    try {
        // get the signature from the database
        let queryStr = `
        SELECT signature
        FROM user_version
        WHERE id = ?;`;

        // Get all tokens
        const result = await query(queryStr, [id]);

        assert(result.length > 0, 'Signature not found');

        return result[0].signature;
    }
    catch (e) {
        console.log(e);
        throw e;
    }
    finally {
        pool.end();
    }
}

/**
 * Retrieves the document path for a given ID from the database.
 * @param {number} id - The ID of the document.
 * @returns {string} The document path.
 * @throws {Error} If the document is not found or an error occurs during the retrieval process.
 */
async function getDocumentPath(id) {
    // database pool
    const pool = getPool();

    // Promisify the pool query method to allow for async/await
    const query = util.promisify(pool.query).bind(pool);

    try {
        // get the document path from the database
        let queryStr = `
        SELECT file_path path
        FROM user_version uv
        JOIN version v ON uv.version_id = v.id
        WHERE uv.id = ?;`;

        // Get all tokens
        const result = await query(queryStr, [id]);

        // check if the result is not null
        assert(result, 'result is required');
        assert(result.length > 0, 'File not found');

        return result[0].path;
    }
    catch (e) {
        console.log(e.message);
        throw e;
    }
    finally {
        pool.end();
    }
}

/**
 * Archives a user by setting the archived_date to the current date and time.
 * @param {number} id - The ID of the user to be archived.
 * @returns {Promise<void>} - A promise that resolves when the user is successfully archived.
 */
async function archiveUser(id) {
    // database pool
    const pool = getPool();

    // Promisify the pool query method to allow for async/await
    const query = util.promisify(pool.query).bind(pool);

    try {
        // archive the user
        await query('UPDATE user SET archived_date = NOW() WHERE id = ?', [id]);

    } catch (err) {
        console.log(err);
        throw err;
    } finally {
        // Close the pool
        pool.end();
    }

}

/**
 * Retrieves archived users from the database.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of archived user objects.
 * @throws {Error} If there is an error retrieving the archived users.
 */
async function getArchivedUsers() {
    // database pool
    const pool = getPool();

    // Promisify the pool query method to allow for async/await
    const query = util.promisify(pool.query).bind(pool);

    try {
        // archive the user
        const resp = await query('SELECT * FROM user WHERE archived_date IS NOT NULL');

        // check if the result is not null
        assert(resp, 'resp is required');

        // return the result
        return resp;
    } catch (err) {
        console.log(err);
        throw err;
    } finally {
        // Close the pool
        pool.end();
    }
}

async function deleteArchivedUser(id) {
    // database pool
    const pool = getPool();

    // Promisify the pool query method to allow for async/await
    const query = util.promisify(pool.query).bind(pool);

    try {
        // get the user & check if it has been 5 years since it was archived
        const user = await query('SELECT * FROM user WHERE id = ? AND archived_date IS NOT NULL', [id]);

        // check if the result is not null
        assert(user, 'user is required');
        assert(user.length > 0, 'User not found');

        // check for the 5 years
        const twSec = 20000;
        const fiveYears = 157680000000;
        const currentDate = new Date();
        const archivedDate = new Date(user[0].archived_date);
        const diff = archivedDate - currentDate;

        assert(diff < twSec, 'The user has not been archived for 5 years');

        // delete the user
        await query('DELETE FROM user WHERE id = ?', [id]);

        // archive the user
        await query('DELETE FROM user WHERE id = ?', [id]);

    } catch (err) {
        console.log(err);
        throw err;
    } finally {
        // Close the pool
        pool.end();
    }

}

module.exports = {
    getSignedUsers,
    getUserById,
    getUser,
    addUser,
    signDoc,
    generateSigningToken,
    getSigningData,
    getSigningUserData,
    getSigningUserImage,
    getDocumentPath,
    archiveUser,
    getArchivedUsers,
    deleteArchivedUser
};
