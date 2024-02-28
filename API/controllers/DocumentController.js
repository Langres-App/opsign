/**
 * Express router for handling document-related routes.
 * @module DocumentController
 */

const express = require('express');
const router = express.Router();
const { getDocuments, changeDocumentName, addVersion, archiveDocument, createDocument } = require('../data/queries/DocumentsQueries');
const { createTables } = require('../data/TableCreation');
const { storeDocument, upload, deleteOriginal, changeFolderAndFilesNames } = require('../model/FileStore');
const fs = require('fs');
const { assert, log } = require('console');
const path = require('path');

/**
 * Route for getting all documents.
 * @name GET /documents
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
router.get('/', async (_, res) => {
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

    // Check if the required fields are present
    assert(req.params.id, 'Document ID is required');

    try {
        // change id to number and get the document
        req.params.id = parseInt(req.params.id);
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
router.post('/', upload.single('file'), storeDocument, deleteOriginal, async (req, res) => {
    // This middleware (upload.single('file')) handles the file upload
    await createTables(); // Create database tables (assuming this is an asynchronous operation)
    
    try {
        // Store the document in the database
        await createDocument(req.body, req.filePath);
        res.status(201).send('Document created successfully'); // Send success response
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message); // Send error response if any exception occurs
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
        let doc = await getDocuments(req.params.id);
        if (!doc) {
            throw new Error('Document not found');
        }

        const oldName = doc.name;

        // change id to number
        req.params.id = parseInt(req.params.id);
        
        changeFolderAndFilesNames(path.join(__dirname, '../Docs', oldName), req.body.name);
        await changeDocumentName(req.params.id, req.body.name);
 
        res.status(200).send('Document updated successfully');
    } catch (error) {
        console.log(error);
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
router.post('/:id', upload.single('file'), storeDocument, deleteOriginal, async (req, res) => {
    try {
        const file_path = req.filePath;
        await addVersion(req.params.id, req.body, file_path);
        res.status(200).send('Version added successfully');
    } catch (error) {
        console.log(error);
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
        res.status(204).send('Document archived successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * Route for getting a PDF file of a document by ID.
 * @name GET /documents/pdf/:id
 * @function 
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
router.get('/pdf/:id', async (req, res) => {
    await createTables();
    try {
        if (!req.params.id) {
            throw new Error('Document ID is required');
        }

        // change id to number
        req.params.id = parseInt(req.params.id);

        const doc = await getDocuments(req.params.id);

        // check if the document exists and is not an array
        if (!doc) {
            throw new Error('Document not found');
        }

        if (doc instanceof Array) {
            throw new Error('Multiple documents found');
        }

        // get the versions of the document
        const versions = doc.versions;
        if (versions.length === 0) {
            throw new Error('No versions found');
        }

        // get the latest version of the document
        const latestVersion = versions.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
        // get the file path of the latest version
        const filePath = latestVersion.file_path;

        // check if the file exists
        if (!fs.existsSync(filePath)) {
            throw new Error('File not found');
        }

        // create a read stream to read the file
        const file = fs.createReadStream(filePath);
        const stat = fs.statSync(filePath);

        // replace special characters in the filename with underscores (to prevent errors when loading the file)
        let filename = doc.name.replace(/[^\w\s.-]/g, '_') + '.pdf';

        // If filename contains spaces, surround it with double quotes
        if (filename.includes(' ')) {
            filename = `"${filename}"`;
        }
    
        // set the response headers that are required for a PDF file
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=${filename}`);

        // pipe the file stream to the response
        file.pipe(res);


    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
});

module.exports = router;