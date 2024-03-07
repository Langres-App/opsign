const express = require('express');
const { blobUpload } = require('../model/FileStore');
const handle = require('./functionHandler');
const router = express.Router();
const UserManager = require('../model/Managers/UserManager');
const { getSignedDocument } = require('../model/Managers/SignedDocumentManager');

/**
 * GET /users/:id
 * @description Get signed users by document ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - The promise that resolves when the signed users are retrieved.
 */
router.get('/:id', handle(async (req, res) => {
    res.status(200).send(await UserManager.getByDocId(req.params.id));
}));

/**
 * GET /users?email=:email
 * @description Get user by email.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - The promise that resolves when the user is retrieved.
 */
router.get('', handle(async (req, res) => {
    let data = await UserManager.getByEmail(req.query.email);
    res.status(200).send({ first_name: data.first_name, last_name: data.last_name });
}));

/**
 * GET /users/signingData/:token
 * @description Get signing data by token.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - The promise that resolves when the signing data is retrieved.
 */
router.get('/signingData/:token', handle(async (req, res) => {
    const data = await UserManager.getSigningPageData(req.params.token);
    res.status(200).send(data);
}));

/**
 * POST /users
 * @description Create a new user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - The promise that resolves when the user is created.
 */
router.post('/', handle(async (req, res) => {

    if (req.body.identifier != undefined) {
        req.body.email = req.body.identifier;
    }

    await UserManager.add(req.body);
    res.status(200).send('User created successfully');
}));

/**
 * DELETE /users/:id
 * @description Archive a user by user_version ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - The promise that resolves when the user is archived.
 */
router.delete('/:id', handle(async (req, res) => {
    await UserManager.archive(req.params.id);
    res.status(200).send('User archived successfully');
}));

/**
 * POST /users/generateSigningToken
 * @description Generate a signing token for a user and document.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - The promise that resolves when the signing token is generated.
 */
router.post('/generateSigningToken', handle(async (req, res) => {
    const token = await UserManager.generateSigningToken(req.body.email, req.body.documentId);
    res.status(200).send(token);
}));

/**
 * POST /users/sign/:token
 * @description Sign a document.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void} - The response indicating that the endpoint is not implemented.
 */
router.post('/sign/:token', blobUpload.single('blob'), handle(async (req, res) => {

    // send the signed document
    const signedDoc = await UserManager.sign(req.params.token, req.file.buffer);

    // send the signed document as a response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachement; filename="${signedDoc.docName}"`);
    res.send(signedDoc.pdf);
}));

/**
 * GET /users/signedDocument/:id
 * @description Get a signed document by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - The promise that resolves when the signed document is retrieved.
 */
router.get('/signedDocument/:id', handle(async (req, res) => {
    // get the signed document
    const signedDoc = await getSignedDocument(req.params.id);

    // send the signed document as a response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${signedDoc.docName}"`);

    res.send(signedDoc.pdf);
}));

module.exports = router;
