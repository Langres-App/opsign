const queries = require('../../data/queries/DocumentsQueries');
const versionQueries = require('../../data/queries/VersionQueries');
const assert = require('../Asserter');
const path = require('path');
const fs = require('fs');
const { changeFolderAndFilesNames } = require('../FileStore');

/**
 * Retrieves all documents.
 * @returns {Promise<Array>} A promise that resolves to an array of documents.
 */
async function getAll() {

    return await queries.getAll();

}

/**
 * Retrieves all archived documents.
 * @returns {Promise<Array>} A promise that resolves to an array of archived documents.
 */
async function getAllArchived() {
    
        return await queries.getAllArchived();

}

/**
 * Retrieves a document by its ID.
 * @param {number} id - The ID of the document to retrieve.
 * @returns {Promise<Object>} A promise that resolves to the retrieved document.
 * @throws {Error} If the required fields are not present or if the ID is not a number.
 */
async function getById(id) {

    // Check if the required fields are present
    assert(id, 'Document ID is required');
    id = parseInt(id);
    assert(Number(id), 'Document ID must be a number');

    return await queries.getById(id);

}

/**
 * Retrieves a document version by its ID.
 *
 * @param {number} id - The ID of the document version to retrieve.
 * @returns {Promise<Object>} - A promise that resolves to the document version object.
 * @throws {Error} - If the required fields are not present or if the document ID is not a number.
 */
async function getVersionById(id) {

    // Check if the required fields are present
    assert(id, 'Document ID is required');
    id = parseInt(id);
    assert(Number(id), 'Document ID must be a number');

    return await versionQueries.getById(id);


}

/**
 * Adds a document to the system.
 * @param {Object} data - The data of the document to be added.
 * @param {string} data.title - The title of the document.
 * @param {string} data.date - The created date of the document.
 * @param {string} data.file_path - The file path of the document.
 * @returns {Promise} A promise that resolves with the result of adding the document.
 */
async function add(data) {

    // Check if the required fields are present
    assert(data.title, '[DocumentManager.add] The file name is required');
    assert(data.date, '[DocumentManager.add] The created date is required');
    assert(data.filePath, '[DocumentManager.add] The file path is required');

    return await queries.add(data, data.filePath);

}

/**
 * Adds a new version to a document.
 * @param {string} docId - The ID of the document.
 * @param {Date} versionDate - The date of the new version.
 * @param {string} filePath - The file path of the new version.
 * @returns {Promise} A promise that resolves with the result of adding the version.
 * @throws {Error} If any of the required fields are missing.
 */
async function addVersion(docId, versionDate, filePath) {

    // Check if the required fields are present
    assert(docId, '[DocumentManager.addVersion] The document ID is required');
    assert(versionDate, '[DocumentManager.addVersion] The created date is required');
    assert(filePath, '[DocumentManager.addVersion] The file path is required');

    return await queries.addVersion(docId, versionDate, filePath);

}

/**
 * Updates the title of a document.
 * @param {number} id - The ID of the document.
 * @param {string} title - The new title for the document.
 * @returns {Promise<void>} - A promise that resolves when the title is updated.
 * @throws {Error} - If the document ID is missing, the document is not found, or the document ID is not a number.
 */
async function updateTitle(id, title) {

    // Check if the required fields are present
    assert(id, '[DocumentManager.updateTitle] Document ID is required');

    let doc = await getById(id);
    assert(doc, '[DocumentManager.updateTitle] Document not found');

    const oldName = doc.name;

    // change id to number
    id = parseInt(id);
    assert(Number(id), '[DocumentManager.updateTitle] Document ID must be a number');

    changeFolderAndFilesNames(path.join(__dirname, '../Docs', oldName), title);
    await queries.rename(id, title);

}

/**
 * Archives a document by its ID.
 * @param {number} id - The ID of the document to be archived.
 * @returns {Promise<void>} - A promise that resolves when the document is successfully archived.
 * @throws {Error} - If the document ID is not provided or is not a number.
 */
async function archive(id) {

    // Check if the required fields are present
    assert(id, '[DocumentManager.archive] Document ID is required');

    id = parseInt(id);
    assert(Number(id), '[DocumentManager.archive] Document ID must be a number');

    await queries.archive(id);

}

/**
 * Unarchives a document by its ID.
 * @param {number} id - The ID of the document to unarchive.
 * @returns {Promise<void>} - A promise that resolves when the document is unarchived.
 * @throws {Error} - If the required fields are not present or if the document ID is not a number.
 */
async function unarchive(id) {

    // Check if the required fields are present
    assert(id, '[DocumentManager.unarchive] Document ID is required');

    id = parseInt(id);
    assert(Number(id), '[DocumentManager.unarchive] Document ID must be a number');

    await queries.unarchive(id);

}

/**
 * Retrieves the PDF path for a document.
 * @param {number} id - The ID of the document.
 * @param {Date} [date] - The optional date for which to retrieve the PDF path.
 * @returns {Promise<string>} The PDF path.
 * @throws {Error} If the document ID is missing or not a number, or if the document is not found.
 */
async function getPdfPath(id, date = undefined) {

    // Check if the required fields are present
    assert(id, '[DocumentManager.getPdfPath] Document ID is required');

    id = parseInt(id);
    assert(Number(id), '[DocumentManager.getPdfPath] Document ID must be a number');

    const doc = await getById(id);
    assert(doc, '[DocumentManager.getPdfPath] Document not found');

    return await queries.getPdfPath(id, date);

}

/**
 * Retrieves a PDF file and its information based on the provided ID and date.
 * @param {string} id - The ID of the PDF file.
 * @param {Date} [date] - The date associated with the PDF file (optional).
 * @returns {Promise<{file: ReadStream, size: number, filename: string}>} - The PDF file, its size, and filename.
 * @throws {AssertionError} If the file path is missing or the file does not exist.
 */
async function getPdf(id, date = undefined) {

    const filePath = await getPdfPath(id, date);

    // check if the file exists
    assert(filePath, '[DocumentManager.getPdf] The file path is required');
    assert(fs.existsSync(filePath), '[DocumentManager.getPdf] The file does not exist');

    // create a read stream to read the file
    const file = fs.createReadStream(filePath);
    const stat = fs.statSync(filePath);

    // get the filename from the file path
    const pathParts = filePath.split('/');
    const fileName = pathParts[pathParts.length - 1];

    // replace special characters in the filename with underscores (to prevent errors when loading the file) but keeps [] and spaces and - and let the .pdf
    let filename = fileName.replace(/[^a-zA-Z0-9\[\]\s.-]/g, '_');

    // If filename contains spaces, surround it with double quotes
    if (filename.includes(' ')) {
        filename = `"${filename}"`;
    }

    return {
        file,
        size: stat.size,
        filename
    };

}

/**
 * Deletes an archived document by its ID.
 * @param {number} id - The ID of the document to be deleted.
 * @returns {Promise<void>} - A promise that resolves when the document is deleted.
 * @throws {Error} - If the required fields are not present or if the document ID is not a number.
 */
async function deleteArchivedDoc(id) {
    
    // Check if the required fields are present
    assert(id, '[DocumentManager.delete] Document ID is required');

    id = parseInt(id);
    assert(Number(id), '[DocumentManager.delete] Document ID must be a number');

    // First, get the document to be deleted
    const doc = await getById(id);

    // delete the document from the database
    await queries.deleteArchivedDoc(id);

    /* If deleteArchivedDoc throw an error (couldn't delete) the physical delete don't happen */

    // delete physical file
    const filePath = path.join(__dirname, '../../Docs', doc.name);
    fs.rm(filePath, { recursive: true }, (err) => {
        if (err) {
            console.log(err);
            throw new Error('Error while deleting the document');
        }
    });

}

module.exports = {
    getPdf,
    getAll,
    getById,
    add,
    addVersion,
    updateTitle,
    archive,
    unarchive,
    getPdfPath,
    getVersionById,
    getAllArchived,
    deleteArchivedDoc,
}