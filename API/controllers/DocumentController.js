/**
 * Express router for handling document-related routes.
 * @module DocumentController
 */

const express = require('express');
const router = express.Router();
const DocumentManager = require('../model/Managers/DocumentManager');
const { storeDocument, upload, deleteOriginal } = require('../model/FileStore');
const { handle } = require('./functionHandler');

/**
 * Route for getting all documents.
 * @name GET /documents
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
router.get('/', handle(async (req, res) => {
    res.status(200).json(await DocumentManager.getAll());
}));

/**
 * Route for getting all archived documents.
 * @name GET /documents
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
router.get('/archived', handle(async (req, res) => {
    res.status(200).json(await DocumentManager.getAllArchived());
}));

/**
 * Route for getting a specific document by ID.
 * @name GET /documents/:id
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
router.get('/:id', handle(async (req, res) => {
    return res.status(200).send(await DocumentManager.getById(req.params.id));
}));

/**
 * Route for creating a new document.
 * @name POST /documents
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
router.post('/', upload.single('file'), storeDocument, deleteOriginal, handle(async (req, res) => {
    req.body.filePath = req.filePath;
    await DocumentManager.add(req.body);                    // Store the document in the database | multer middleware stored the file in Docs folder and the path in req.filePath
    res.status(201).send('Document created successfully');  // Send success response

}));

/**
 * Route for updating a document by ID. => only its title can be updated, the other fields are not editable and won't be updated
 * @name PUT /documents/:id
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
router.put('/:id', handle(async (req, res) => {
    await DocumentManager.updateTitle(req.params.id, req.body.name);
    res.status(200).send('Document updated successfully');
}));

/**
 * Route for adding a new version to a document by ID.
 * @name POST /documents/:id
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
router.post('/:id', upload.single('file'), storeDocument, deleteOriginal, handle(async (req, res) => {
    await DocumentManager.addVersion(req.params.id, req.body.date, req.filePath);
    res.status(200).send('Version added successfully');
}));

/**
 * Route for archiving a document by ID.
 * @name PUT /documents/:id
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
router.put('/archived/:id', handle(async (req, res) => {
    await DocumentManager.unarchive(req.params.id);
    res.status(200).send('Document restored successfully');
}));

/**
 * Route for archiving a document by ID.
 * @name DELETE /documents/:id
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
router.delete('/:id', handle(async (req, res) => {
    await DocumentManager.archive(req.params.id);
    res.status(204).send('Document archived successfully');
}));

/**
 * Route for deleting a document by ID.
 * @name DELETE /documents/archived/:id
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
router.delete('/archived/:id', handle(async (req, res) => {
    await DocumentManager.deleteArchivedDoc(req.params.id);
    res.status(204).send('Document deleted successfully');
}));

/**
 * Route for getting a PDF file of a document by ID.
 * @name GET /documents/:id/view/:date
 * @function 
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
router.get('/:id/view/:date', handle(async (req, res) => {

    const pdf = await DocumentManager.getPdf(req.params.id, req.params.date);

    // set the response headers that are required for a PDF file
    res.setHeader('Content-Length', pdf.size);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${pdf.filename}`);

    // pipe the file stream to the response
    pdf.file.pipe(res);
}));

/**
 * Route for getting a PDF file of a document by ID.
 * @name GET /documents/:id/view
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise that resolves when the response is sent.
 */
router.get('/:id/view', handle(async (_, res) => {
    // redirect to the latest version
    res.redirect(`view/latest`);
}));

module.exports = router;