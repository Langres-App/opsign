const assert = require('../../model/Asserter');
const executeWithCleanup = require('../databaseCleanup');
const versionQueries = require('./VersionQueries');

// #region CREATE

/**
 * Creates a document in the database.
 * @param {Object} data - The data of the document.
 * @param {string} file_path - The file path of the document.
 * @throws {Error} If an error occurs while creating the document.
 */
async function add(data, file_path) {

    // Check if the required fields are present
    assert(data.title, '[DocumentQueries.add] The file name is required');
    assert(data.date, '[DocumentQueries.add] The created date is required');
    assert(file_path, '[DocumentQueries.add] The file path is required');

    return await executeWithCleanup(async (query) => {
        // Insert the document into the database
        const documentQuery = 'INSERT INTO document (file_name) VALUES (?)';

        // Get the result of the query
        const result = await query(documentQuery, [data.title]);

        return await versionQueries.add({ docId: result.insertId, filePath: file_path, date: data.date });
    });
}

/**
 * Adds a new version of a document.
 * @param {string} docId - The ID of the document.
 * @param {string} date - The created date of the version.
 * @param {string} file_path - The file path of the version.
 * @returns {Promise} A promise that resolves with the added version.
 */
async function addVersion(docId, date, file_path) {

    // Check if the required fields are present
    assert(docId, '[DocumentsQueries.addVersion] The document ID is required');
    assert(date, '[DocumentsQueries.addVersion] The created date is required');
    assert(file_path, '[DocumentsQueries.addVersion] The file path is required');

    return await versionQueries.add({ docId: docId, filePath: file_path, date });

}

// #endregion

// #region READ

/**
 * Retrieves all documents from the database.
 * @returns {Promise<Array<Object>>} An array of documents with their versions.
 */
async function getAll() {

    return await executeWithCleanup(async (query) => {

        const toReturn = [];

        // Create the query string
        let queryStr = 'SELECT * FROM document WHERE archived_date IS NULL';

        // Get the document by ID
        const documents = await query(queryStr);

        for (const document of documents) {
            const versions = await versionQueries.getAll(document.id);

            // Add the document to the return object
            toReturn.push({
                id: document.id,
                name: document.file_name,
                versions
            });
        }
        // Return the array
        return toReturn;

    });

}

/**
 * Retrieves all archived documents from the database.
 * @returns {Promise<Array<Object>>} An array of archived documents, each containing the document ID, name, and versions.
 */
async function getAllArchived() {

    return await executeWithCleanup(async (query) => {

        const toReturn = [];

        // Create the query string
        let queryStr = 'SELECT * FROM document WHERE archived_date IS NOT NULL';

        // Get the document by ID
        const documents = await query(queryStr);

        for (const document of documents) {
            const versions = await versionQueries.getAll(document.id);

            // Add the document to the return object
            toReturn.push({
                id: document.id,
                name: document.file_name,
                versions
            });
        }
        // Return the array
        return toReturn;

    });
}

/**
 * Retrieves a document by its ID.
 * @param {number} id - The ID of the document to retrieve.
 * @returns {Promise<Object>} A promise that resolves to an object representing the document.
 * @throws {Error} If the document ID is not provided or is not a number.
 */
async function getById(id) {

    // Check if the required fields are present
    assert(id, '[DocumentsQueries.getById] Document ID is required');
    id = parseInt(id);
    assert(Number(id), '[DocumentsQueries.getById] Document ID must be a number');

    return await executeWithCleanup(async (query) => {
        // Create the query string
        let queryStr = 'SELECT * FROM document WHERE id = ?';

        // Get the document by ID
        const document = (await query(queryStr, [id]))[0];

        // Get all versions for the document
        const versions = await versionQueries.getAll(document.id);

        // Return the array
        return {
            id: document.id,
            name: document.file_name,
            versions
        };
    });
}

/**
 * Retrieves the PDF path for a document.
 * @param {string} id - The ID of the document.
 * @param {string} [date] - The date for which to retrieve the PDF path. If not provided, the latest version will be used.
 * @returns {Promise<string>} The PDF path.
 */
async function getPdfPath(id, date = undefined) {

    // Check if the required fields are present
    assert(id, '[DocumentsQueries.getPdfPath] The document ID is required');

    // if date is provided, get the pdf path for the given date, else get the latest version
    return date && date.toLowerCase() !== 'latest'
        ? await versionQueries.getPdfPath(id, date)
        : (await versionQueries.getLatest(id)).file_path;
}

// #endregion

// #region UPDATE

/**
 * Renames a document with the specified ID to the given title.
 * @param {number} id - The ID of the document to rename.
 * @param {string} title - The new title for the document.
 * @returns {Promise<void>} A Promise that resolves when the document is renamed.
 */
async function rename(id, title) {

    return await executeWithCleanup(async (query) => {
        // Check if the required fields are present
        assert(id, '[DocumentsQueries.rename] The document ID is required');
        assert(title, '[DocumentsQueries.rename] The file name is required');

        // get the old name for to change the folder and files names
        const old = await getById(id);
        const oldTitle = old.name;

        // Update the document name
        const documentQuery = 'UPDATE document SET file_name = ? WHERE id = ?';
        await query(documentQuery, [title, id]);

        // Update the version file paths
        await versionQueries.updatePathes(id, oldTitle, title);
    });

}

/**
 * Archives a document by setting the archived_date to the current date.
 * @param {number} id - The ID of the document to be archived.
 * @returns {Promise<void>} - A promise that resolves when the document is successfully archived.
 */
async function archive(id) {

    // Check if the required fields are present
    assert(id, '[DocumentsQueries.archive] The document ID is required');

    return await executeWithCleanup(async (query) => {

        // Archive the document by setting the archived_date to the current date
        const documentQuery = 'UPDATE document SET archived_date = ? WHERE id = ?';
        await query(documentQuery, [new Date(), id]);

    });

}

/**
 * Unarchives a document by setting the archived_date to null.
 * @param {number} id - The ID of the document to unarchive.
 * @returns {Promise<void>} - A promise that resolves when the document is unarchived.
 */
async function unarchive(id) {

    // Check if the required fields are present
    assert(id, '[DocumentsQueries.unarchive] The document ID is required');

    return await executeWithCleanup(async (query) => {

        // Archive the document by setting the archived_date to the current date
        const documentQuery = 'UPDATE document SET archived_date = NULL WHERE id = ?';
        await query(documentQuery, [id]);

    });


}

// #endregion

// #region DELETE

/**
 * Deletes an archived document by ID.
 * @param {number} id - The ID of the document to delete.
 * @returns {Promise<void>} - A Promise that resolves when the document is deleted.
 * @throws {Error} - If the document ID is not provided.
 */
async function deleteArchivedDoc(id) {

    // Check if the required fields are present
    assert(id, '[DocumentsQueries.deleteArchivedDoc] The document ID is required');

    return await executeWithCleanup(async (query) => {

        // Delete the document by ID
        const documentQuery = 'DELETE FROM document WHERE id = ? AND archived_date IS NOT NULL';
        await query(documentQuery, [id]);
        
    });
    
}

// #endregion

module.exports = {
    add,
    addVersion,

    getAll,
    getAllArchived,
    getById,
    getPdfPath,

    rename,
    archive,
    unarchive,

    deleteArchivedDoc,
};
