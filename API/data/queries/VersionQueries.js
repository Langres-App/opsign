const assert = require("../../model/Asserter");
const executeWithCleanup = require("../databaseCleanup")

// #region CREATE

/**
 * Adds a new version to the database.
 * @param {Object} data - The data for the new version.
 * @param {string} data.docId - The document ID.
 * @param {string} data.filePath - The file path.
 * @param {string} data.date - The created date.
 * @returns {Promise} A promise that resolves with the result of the database operation.
 */
async function add(data) {

    // Check if the required fields are present
    assert(data.docId, '[VersionQueries.add] The document ID is required');
    assert(data.filePath, '[VersionQueries.add] The file path is required');
    assert(data.date, '[VersionQueries.add] The created date is required');

    return await executeWithCleanup(async (query) => {
        let queryStr = 'INSERT INTO version (doc_id, file_path, date) VALUES (?, ?, ?)';
        return await query(queryStr, [data.docId, data.filePath, data.date]);
    });
}

// #endregion

// #region READ

/**
 * Retrieves all versions of a document based on the document ID.
 * @param {string} docId - The ID of the document.
 * @returns {Promise<Array>} - A promise that resolves to an array of versions.
 */
async function getAll(docId) {

    assert(docId, '[VersionQueries.getAll] The document ID is required');

    return await executeWithCleanup(async (query) => {
        let queryStr = 'SELECT * FROM version WHERE doc_id = ?';
        return await query(queryStr, [docId]);
    });

}

/**
 * Retrieves a version by its ID.
 * @param {number} id - The ID of the version to retrieve.
 * @returns {Promise<Object>} A promise that resolves to the version object.
 * @throws {Error} If the version ID is not provided.
 */
async function getById(id) {

    assert(id, '[VersionQueries.getById] The version ID is required');

    return await executeWithCleanup(async (query) => {
        let queryStr = 'SELECT * FROM version WHERE id = ?';
        return (await query(queryStr, [id]))[0];
    });

}

/**
 * Retrieves the latest version of a document based on the document ID.
 * @param {string} docId - The ID of the document.
 * @returns {Promise<Object>} - A promise that resolves to the latest version of the document.
 */
async function getLatest(docId) {

    assert(docId, '[VersionQueries.getLatest] The document ID is required');

    return await executeWithCleanup(async (query) => {
        let queryStr = 'SELECT * FROM version WHERE doc_id = ? ORDER BY created_date DESC LIMIT 1';
        return (await query(queryStr, [docId]))[0];
    });

}

/**
 * Retrieves the file path of a PDF document based on its ID and created date.
 * @param {string} id - The document ID.
 * @param {string} date - The created date of the document.
 * @returns {Promise<string>} The file path of the PDF document.
 */
async function getPdfPath(id, date) {

    assert(id, '[VersionQueries.getPdfPath] The document ID is required');
    assert(date, '[VersionQueries.getPdfPath] The created date is required');

    return await executeWithCleanup(async (query) => {

        let queryStr = 'SELECT file_path FROM version WHERE doc_id = ? AND created_date = ?';
        return (await query(queryStr, [id, date]))[0].file_path;
    });

}

// #endregion

// #region UPDATE

/**
 * Updates the file paths in the 'version' table for a given document ID.
 * Replaces occurrences of the old name with the new name in the file paths.
 *
 * @param {string} docId - The document ID.
 * @param {string} newName - The new name to replace in the file paths.
 * @returns {Promise} A promise that resolves with the result of the update operation.
 */
async function updatePathes(docId, newName) {

    // Check if the required fields are present
    assert(docId, '[VersionQueries.updatePathes] The document ID is required');
    assert(newName, '[VersionQueries.updatePathes] The new name is required');

    return await executeWithCleanup(async (query) => {
        let queryStr = 'UPDATE version SET file_path = REPLACE(file_path, ?, ?) WHERE doc_id = ?';
        return await query(queryStr, [newName, docId, newName]);
    });

}

// #endregion


module.exports = {
    add,

    getAll,
    getById,
    getLatest,
    getPdfPath,

    updatePathes,
}