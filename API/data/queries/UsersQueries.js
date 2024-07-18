const UserVersionQueries = require('./UsersVersionsQueries');
const assert = require('../../model/Asserter');
const executeWithCleanup = require('../databaseCleanup');

// #region CREATE

/**
 * Adds a new user to the database.
 * @param {Object} user - The user object to be added.
 * @param {string} user.first_name - The first name of the user.
 * @param {string} user.last_name - The last name of the user.
 * @param {string} user.email - The email of the user.
 * @returns {Promise<number>} - A promise that resolves to the ID of the newly added user.
 * @throws {AssertionError} - If the user object or any required fields are missing or invalid.
 */
async function add(user) {

    // Check if the user is provided
    assert(user, '[UserQueries.add] The user is required');
    assert(user.first_name, '[UserQueries.add] The first name is required');
    assert(user.last_name, '[UserQueries.add] The last name is required');

    // trim first & last name to remove leading and trailing spaces and check if the name is not empty
    user.first_name = user.first_name.trim();
    assert(user.first_name, '[UserQueries.add] The first name is required');

    user.last_name = user.last_name.trim();
    assert(user.last_name, '[UserQueries.add] The last name is required');

    assert(user.email, '[UserQueries.add] The email is required');
    assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.identifier), '[UserQueries.add] The email is not valid');

    return await executeWithCleanup(async (query) => {

        const result = await query(
            'INSERT INTO user (first_name, last_name, identifier) VALUES (?, ?, ?)',
            [user.first_name, user.last_name, user.email]
        );

        assert(result, '[UserQueries.add] The user was not added');

        return result.insertId;
    });

}

// #endregion

// #region READ

/**
 * Retrieves signed users depending on the document ID.
 * Only gets the last version of the document signed for each user.
 *
 * @param {number} id - The document ID.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of user objects.
 * @throws {Error} - If the document ID is missing or not a number.
 */
async function getByDocId(id) {

    assert(id, '[UserQueries.getByDocId] The document ID is required');

    id = parseInt(id);
    assert(id, '[UserQueries.getByDocId] The document ID must be a number');

    return await executeWithCleanup(async (query) => {

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

        return await query(queryStr, [id, id]);

    });

}

/**
 * Retrieves a user by their ID.
 *
 * @param {number} id - The ID of the user.
 * @returns {Promise<Object>} A promise that resolves to the user object.
 * @throws {Error} If the ID is missing or not a number.
 */
async function getById(id) {

    assert(id, '[UserQueries.getById] The ID is required');

    id = parseInt(id);
    assert(id, '[UserQueries.getById] The ID must be a number');

    return await executeWithCleanup(async (query) => {

        return await query('SELECT * FROM user WHERE id = ?', [id]);

    });

}

/**
 * Retrieves a user by their email.
 * @param {string} email - The email of the user.
 * @returns {Promise<Object>} A promise that resolves to the user object.
 * @throws {Error} If the email is missing or not valid.
 */
async function getByEmail(email) {

    assert(email, '[UserQueries.getByEmail] The email is required');
    assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), '[UserQueries.getByEmail] The email is not valid');

    return await executeWithCleanup(async (query) => {

        const user = (await query('SELECT * FROM user WHERE identifier = ? AND archived_date IS NULL', [email]))[0];

        assert(user, '[UserQueries.getByEmail] User not found');

        return user;

    });

}

/**
 * Retrieves all users along with their display names and the number of document signed.
 * @returns {Promise<Array<
 * {
 *      id: number, 
 *      display_name: string, 
 *      docs_signatures: [{id: number}], 
 *      docs_waiting: [{id: number}],
 *       docs_outdated: [{id: number}]
 * }
 * >>} A promise that resolves to an array of user objects.
 */
async function getAll() {

    return await executeWithCleanup(async (query) => {

        const users = await query(`
        SELECT
            u.id,
            u.identifier email,
            CONCAT(u.first_name, ' ', u.last_name) AS display_name
        FROM
            user u
        WHERE
            u.archived_date IS NULL;
        `);

        for (let user of users) {
            let signedDocId = await getSignedDocId(user.id);
            let waitingDocId = await getWaitingDocId(user.id);
            let toUpdateDocId = await getToUpdateDocId(user.id);

            let toUpdateDocIdList = toUpdateDocId.map(doc => doc.doc_id);

            signedDocId = signedDocId.map(doc => {
                doc.toUpdate = toUpdateDocIdList.includes(doc.id);
                doc.latest_version_id = toUpdateDocId.find(docToUpdate => docToUpdate.doc_id === doc.id) ? toUpdateDocId.find(docToUpdate => docToUpdate.doc_id === doc.id).ver_id : null;
                return doc;
            });

            user.docs_signatures = signedDocId;
            user.docs_waiting = waitingDocId;
        }

        return users;

    });

}

/**
 * Retrieves the signed document ID for a given user.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Array<{id: number}>>} - A promise that resolves to an array of objects containing the signed document ID.
 */
async function getSignedDocId(userId) {
    return await executeWithCleanup(async (query) => {
        return await query(`
        SELECT
            v.doc_id AS id,
            uv.id AS user_version_id,
            d.file_name AS title,
            uv.date
        FROM 
            user_version uv
        LEFT JOIN version v ON uv.version_id = v.id
        LEFT JOIN document d ON v.doc_id = d.id
        WHERE 
            uv.user_id = ?
            AND uv.signature IS NOT NULL
            AND d.archived_date IS NULL
        AND uv.date = (
            SELECT MIN(uv_inner.date)
            FROM user_version uv_inner
            JOIN version v_inner ON uv_inner.version_id = v_inner.id
            WHERE v_inner.doc_id = v.doc_id AND uv_inner.user_id = uv.user_id
        );

        `, [userId]);
    });
}

/**
 * Retrieves the waiting document ID for a given user.
 *
 * @param {number} userId - The ID of the user.
 * @returns {Promise<number>} - A promise that resolves to the waiting document ID.
 */
async function getWaitingDocId(userId) {
    return await executeWithCleanup(async (query) => {
        return await query(`
        SELECT DISTINCT
            v.doc_id id,
            d.file_name title,
            uv.signing_token
        FROM 
            user_version uv
        LEFT JOIN version v ON uv.version_id = v.id
        LEFT JOIN document d ON v.doc_id = d.id
        WHERE uv.user_id = ?
            AND uv.signature IS NULL
            AND d.archived_date IS NULL;
        `, [userId]);
    });

}

/**
 * Retrieves the document IDs that need to be updated for a given user.
 * 
 * @param {number} userId - The ID of the user.
 * @returns {Promise<number[]>} - A promise that resolves to an array of document IDs.
 */
async function getToUpdateDocId(userId) {
    return await executeWithCleanup(async (query) => {
        return await query(`
        WITH SignedDocs AS (
            -- Sélectionner tous les documents signés au moins une fois par un utilisateur spécifié (u)
            SELECT DISTINCT uv.user_id, v.doc_id
            FROM version v
            JOIN user_version uv ON v.id = uv.version_id
            JOIN user u ON uv.user_id = u.id
            JOIN document d ON v.doc_id = d.id
            WHERE uv.signature IS NOT NULL
            AND d.archived_date IS NULL
            AND u.id = ? 
        ),
        LastVersions AS (
            -- Sélectionner la dernière version de chaque document
            SELECT v.id, v.doc_id, v.created_date AS last_created_date
            FROM version v
            JOIN document d ON v.doc_id = d.id
            WHERE d.archived_date IS NULL
            AND v.created_date = (
                SELECT MAX(v2.created_date)
                FROM version v2
                WHERE v2.doc_id = v.doc_id
            )
        ),
        LastSignedVersions AS (
            -- Sélectionner les versions signées par l'utilisateur spécifié, pour chaque document
            SELECT uv.user_id, v.doc_id, MAX(v.created_date) AS last_signed_date
            FROM version v
            JOIN user_version uv ON v.id = uv.version_id
            GROUP BY uv.user_id, v.doc_id
        )
        -- Sélectionner les documents dont la dernière version n'est pas signée par l'utilisateur spécifié mais où au moins une autre version l'est
        SELECT ld.doc_id, lv.id ver_id
        FROM SignedDocs ld
        JOIN LastSignedVersions lsv ON ld.doc_id = lsv.doc_id AND ld.user_id = lsv.user_id
        LEFT JOIN version v ON lsv.doc_id = v.doc_id AND lsv.last_signed_date = v.created_date
        LEFT JOIN LastVersions lv ON ld.doc_id = lv.doc_id
        WHERE v.id IS NULL OR lv.last_created_date != lsv.last_signed_date;
        
        `, [userId]);
    });

}

/**
 * Retrieves archived users from the database.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of user objects.
 */
async function getArchived() {

    return await executeWithCleanup(async (query) => {

        return await query('SELECT * FROM user WHERE archived_date IS NOT NULL');

    });

}

// #endregion

// #region UPDATE

/**
 * Archives a user by setting the archived_date field to the current date and time.
 * @param {number} userId - The ID of the user to archive.
 * @returns {Promise<void>} A promise that resolves when the user is successfully archived.
 * @throws {Error} If the user version ID is missing or not a number.
 */
async function archive(userId) {

    assert(userId, '[UserQueries.archive] The user version ID is required');

    userId = parseInt(userId);
    assert(userId, '[UserQueries.archive] The user ID must be a number');

    return await executeWithCleanup(async (query) => {

        // archive the user
        return await query('UPDATE user SET archived_date = NOW() WHERE id = ?', [userId]);

    });

}

/**
 * Unarchives a user by setting the archived_date to null.
 * @param {number} id - The ID of the user to unarchive.
 * @returns {Promise<void>} - A promise that resolves when the user is unarchived.
 * @throws {Error} - If the user ID is missing or not a number.
 */
async function unarchive(id) {

    assert(id, '[UserQueries.unarchive] The user ID is required');

    id = parseInt(id);
    assert(id, '[UserQueries.unarchive] The user ID must be a number');

    return await executeWithCleanup(async (query) => {

        return await query('UPDATE user SET archived_date = NULL WHERE id = ?', [id]);

    });

}

// #endregion

// #region DELETE

/**
 * Deletes an archived user by ID.
 * @param {number} id - The ID of the user to delete.
 * @returns {Promise<number>} A promise that resolves to the number of rows affected by the deletion.
 * @throws {Error} If the ID is missing or not a number.
 */
async function deleteArchived(id) {

    assert(id, '[UserQueries.deleteArchived] The ID is required');

    id = parseInt(id);
    assert(id, '[UserQueries.deleteArchived] The ID must be a number');

    return await executeWithCleanup(async (query) => {

        return await query('DELETE FROM user WHERE id = ? AND archived_date IS NOT NULL', [id]);

    });

}

// #endregion


module.exports = {
    add,

    getById,
    getByEmail,
    getByDocId,
    getAll,
    getArchived,

    archive,
    unarchive,

    deleteArchived
};
