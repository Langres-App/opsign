/**
 * Express router for handling document-related routes.
 * @module DocumentController
 */

const express = require('express');
const router = express.Router();
const { getDocuments, changeDocumentName, addVersion, archiveDocument } = require('../model/data/DocumentsQueries');
const { createTables } = require('../model/data/TableCreation');

/**
 * Route for getting all documents.
 * @name GET /documents
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
router.get('/', async (req, res) => {
    await createTables();
    try {
        res.status(200).send(await getDocuments());
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * Route for getting a specific document by ID.
 * @name GET /documents/:id
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
router.get('/:id', async (req, res) => {
    await createTables();
    try {
        res.status(200).send(await getDocuments(req.params.id));
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * Route for creating a new document.
 * @name POST /documents
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
router.post('/', async (req, res) => {
    await createTables();
    try {
        const file_path = 'BLANK_FILE_PATH'; // TODO: await storeDocument(req.body.title, req.body.file);
        await createDocument(req.body, file_path);
        res.status(201).send('Document created successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * Route for updating a document by ID. => only its title can be updated, the other fields are not editable and won't be updated
 * @name PUT /documents/:id
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
router.put('/:id', async (req, res) => {
    await createTables();
    try {
        await changeDocumentName(req.params.id, req.body);
        res.status(200).send('Document updated successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * Route for adding a new version to a document by ID.
 * @name POST /documents/:id
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
router.post('/:id', async (req, res) => {
    await createTables();
    try {
        const file_path = 'BLANK_FILE_PATH_FROM_ADD_VERSION'; // TODO: await storeDocument(req.body.title, req.body.file);
        await addVersion(req.params.id, req.body, file_path);
        res.status(200).send('Version added successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * Route for archiving a document by ID.
 * @name DELETE /documents/:id
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
router.delete('/:id', async (req, res) => {
    await createTables();
    try {
        await archiveDocument(req.params.id);
        res.status(200).send('Document deleted successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;