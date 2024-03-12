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
        return (
            await query(
                'INSERT INTO user (first_name, last_name, identifier) VALUES (?, ?, ?)',
                [user.first_name, user.last_name, user.email]
            )
        ).insertId;
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
 * @param {number} userVersionId - The ID of the user version to archive.
 * @returns {Promise<void>} A promise that resolves when the user is successfully archived.
 * @throws {Error} If the user version ID is missing or not a number.
 */
async function archive(userVersionId) {

    assert(userVersionId, '[UserQueries.archive] The user version ID is required');

    userVersionId = parseInt(userVersionId);
    assert(userVersionId, '[UserQueries.archive] The user version ID must be a number');

    return await executeWithCleanup(async (query) => {

        // get the user ID from the user version ID
        const userId = await UserVersionQueries.getUserId(userVersionId);

        // archive the user
        return await query('UPDATE user SET archived_date = NOW() WHERE id = ?', [userId]);

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

        return await query('DELETE FROM user WHERE id = ?', [id]);

    });

}

// #endregion


module.exports = {
    add,

    getById,
    getByEmail,
    getByDocId,
    getArchived,

    archive,
    
    deleteArchived
};
