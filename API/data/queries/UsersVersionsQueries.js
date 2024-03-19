const assert = require('./../../model/Asserter')
const executeWithCleanup = require("../databaseCleanup");

// #region CREATE

/**
 * Adds a signing token for a user and version.
 * @param {number} userId - The ID of the user.
 * @param {number} versionId - The ID of the version.
 * @param {string} token - The signing token.
 * @returns {Promise<void>} A promise that resolves when the signing token is added.
 * @throws {AssertionError} If the user ID, version ID, or token is missing or invalid.
 */
async function addSigningToken(userId, versionId, token) {

    // check if the user_id and version_id are not null
    assert(userId, '[UserQueries.addSigningToken] The user ID is required');
    userId = parseInt(userId);
    assert(userId, '[UserQueries.addSigningToken] The user ID must be a number');

    assert(versionId, '[UserQueries.addSigningToken] The version ID is required');
    versionId = parseInt(versionId);
    assert(versionId, '[UserQueries.addSigningToken] The version ID must be a number');

    assert(token, '[UserQueries.addSigningToken] The token is required');

    return await executeWithCleanup(async (query) => {

        await query('INSERT INTO user_version (user_id, version_id, signing_token) VALUES (?, ?, ?)', [userId, versionId, token]);

    });

}

// #endregion

// #region READ

/**
 * Retrieves a user version by its ID.
 * @param {number} id - The ID of the user version to retrieve.
 * @returns {Promise<Object>} A promise that resolves to the user version object.
 * @throws {Error} If the user ID is not provided.
 */
async function getById(id) {

    assert(id, '[UserQueries.getById] The user ID is required');

    return await executeWithCleanup(async (query) => {

        let queryStr = `
        SELECT *
        FROM user_version uv
        WHERE uv.id = ?;`;

        const result = await query(queryStr, [id]);

        assert(result, '[UserQueries.getById] There was a problem querying the database for the user version ID');
        assert(result.length > 0, '[UserQueries.getById] There was a problem querying the database for the user version ID');

        return result[0];

    });

}

/**
 * Retrieves signing user data based on the provided user ID.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Object>} A promise that resolves to an object containing the signing user's display name and signed date.
 * @throws {Error} If the user ID is not provided.
 */
async function getSigningUserData(userId) {

    assert(userId, '[UserQueries.getSigningUserData] The user ID is required');

    return await executeWithCleanup(async (query) => {

        let queryStr = `
            SELECT CONCAT(u.first_name, ' ', u.last_name) displayName, uv.date signed_date
            FROM user_version uv
            JOIN user u ON uv.user_id = u.id
            WHERE uv.id = ?;`;

            const result = await query(queryStr, [userId]);
    
            assert(result, '[UserQueries.getSigningUserData] There was a problem querying the database for the signing user data');
            assert(result.length > 0, '[UserQueries.getSigningUserData] There was a problem querying the database for the signing user data');
    
            return result[0];

    });

}

/**
 * Retrieves the signature of a user version based on the provided user version ID.
 * @param {number} userVersionId - The ID of the user version.
 * @returns {Promise<string>} The signature of the user version.
 * @throws {Error} If the user version ID is not provided or is not valid.
 */
async function getSigningUserImage(userVersionId) {

    assert(userVersionId, '[UserQueries.getSigningUserImage] The user version ID is required');

    return await executeWithCleanup(async (query) => {

        let queryStr = `
            SELECT signature
            FROM user_version
            WHERE id = ?;`;

        const response = await query(queryStr, [userVersionId]);

        assert(response.length > 0, '[UserQueries.getSigningUserImage] The user version ID is not valid');

        return response[0].signature;

    });
}

/**
 * Retrieves signing page data based on the provided token.
 * @param {string} token - The signing token.
 * @returns {Promise<Object>} A promise that resolves to an object containing the signing page data.
 */
async function getSigningPageData(token) {

    assert(token, '[UserQueries.getSigningPageData] The token is required');

    return await executeWithCleanup(async (query) => {

        let queryStr = `
        SELECT CONCAT(u.first_name, ' ', u.last_name) userName, d.file_name docName, v.doc_id docId, v.created_date docDate
        FROM user_version uv
        JOIN version v ON uv.version_id = v.id
        JOIN document d ON v.doc_id = d.id
        JOIN user u ON uv.user_id = u.id
        WHERE signing_token = ?;`;

        const result = await query(queryStr, [token]);

        assert(result, '[UserQueries.getSigningPageData] There was a problem querying the database for the signing page data');
        assert(result.length > 0, '[UserQueries.getSigningPageData] There was a problem querying the database for the signing page data');

        return result[0];

    });

}

/**
 * Retrieves the user version ID based on the provided user ID and version ID.
 * @param {number} userId - The ID of the user.
 * @param {number} versionId - The ID of the version.
 * @returns {Promise<number>} The ID of the user version.
 * @throws {Error} If the user ID or version ID is not provided.
 */
async function getUserVersionId(userId, versionId) {

    assert(userId, '[UserQueries.getUserVersionId] The user ID is required');
    assert(versionId, '[UserQueries.getUserVersionId] The version ID is required');

    return await executeWithCleanup(async (query) => {

        const result = await query('SELECT id FROM user_version WHERE user_id = ? AND version_id = ?', [userId, versionId]);

        assert(result.length > 0, '[UserQueries.getUserVersionId] There was a problem querying the database for the user version ID');

        return result[0].id;

    });

}

/**
 * Retrieves the user version ID based on the provided token.
 * @param {string} token - The token used to identify the user version.
 * @returns {Promise<number>} The ID of the user version.
 * @throws {Error} If the token is missing or not valid.
 */
async function getUserVersionIdByToken(token) {

    assert(token, '[UserQueries.getUserVersionIdByToken] The token is required');

    return await executeWithCleanup(async (query) => {

        const response = await query('SELECT id FROM user_version WHERE signing_token = ?', [token]);

        assert(response.length > 0, '[UserQueries.getUserVersionIdByToken] The token is not valid');

        return response[0].id;

    });

}

/**
 * Retrieves the signing tokens from the user_version table.
 * @returns {Promise<Array<string>>} A promise that resolves to an array of signing tokens.
 */
async function getSigningTokens() {

    return await executeWithCleanup(async (query) => {

        let queryStr = `
        SELECT signing_token token
        FROM user_version 
        WHERE signing_token IS NOT NULL;`;

        const tokens = await query(queryStr);

        let tokenList = [];

        for (let i = 0; i < tokens.length; i++) {
            tokenList.push(tokens[i].token);
        }

        return tokenList;

    });

}

/**
 * Retrieves the signature image for a given user ID.
 *
 * @param {number} userId - The ID of the user.
 * @returns {Promise<string>} A promise that resolves to the signature image.
 * @throws {Error} If the user ID is not provided.
 */
async function getSignatureImage(userId) {

    assert(userId, '[UserQueries.getSignatureImage] The user ID is required');

    return await executeWithCleanup(async (query) => {

        let queryStr = `
        SELECT signature
        FROM user_version
        WHERE user_id = ?;`;

        const result = await query(queryStr, [userId]);

        assert(result.length > 0, '[UserQueries.getSignatureImage] There was a problem querying the database for the signature image');

        return result[0].signature;

    });

}

/**
 * Retrieves the file path associated with a given user version ID.
 * @param {number} userVersionId - The ID of the user version.
 * @returns {Promise<string>} A promise that resolves to the file path.
 * @throws {Error} If the user version ID is not provided.
 */
async function getDocumentPath(userVersionId) {

    assert(userVersionId, '[UserQueries.getDocumentPath] The user version ID is required');

    return await executeWithCleanup(async (query) => {

        let queryStr = `
        SELECT file_path
        FROM version
        WHERE id = (SELECT version_id FROM user_version WHERE id = ?);`;

        const result = await query(queryStr, [userVersionId]);

        assert(result.length > 0, '[UserQueries.getDocumentPath] There was a problem querying the database for the document path');

        return result[0].file_path;

    });

}

/**
 * Retrieves the user ID associated with the given user version ID.
 * @param {number} userVersionId - The ID of the user version.
 * @returns {Promise<number>} - A promise that resolves to the user ID.
 */
async function getUserId(userVersionId) {

    assert(userVersionId, '[UserQueries.getUserId] The user version ID is required');

    return await executeWithCleanup(async (query) => {

        let queryStr = `
        SELECT user_id
        FROM user_version
        WHERE id = ?;`;

        const result = await query(queryStr, [userVersionId]);

        assert(result.length > 0, '[UserQueries.getUserId] There was a problem querying the database for the user ID');

        return result[0].user_id;

    });

}

// #endregion

// #region UPDATE

/**
 * Signs a document with the provided token and blob.
 * @param {string} token - The signing token.
 * @param {string} blob - The document blob.
 * @returns {Promise<void>} - A promise that resolves when the document is signed.
 */
async function signDoc(token, blob) {

    assert(token, '[UserQueries.signDoc] The token is required');
    assert(blob, '[UserQueries.signDoc] The blob is required');

    return await executeWithCleanup(async (query) => {

        let queryStr = `
        UPDATE user_version
        SET signature = ?, date = NOW(), signing_token = NULL
        WHERE signing_token = ?;`;

        await query(queryStr, [blob, token]);

    });

}

// #endregion


module.exports = {
    addSigningToken,

    getSigningUserData,
    getSigningPageData,
    getUserVersionId,
    getSigningUserImage,
    getUserVersionIdByToken,
    getSigningTokens,
    getSignatureImage,
    getDocumentPath,
    getUserId,
    getById,

    signDoc,
};