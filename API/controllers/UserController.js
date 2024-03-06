const express = require('express');
const assert = require('../model/Asserter');
const { getUser, addUser, generateSigningToken, getSignedUsers, signDoc, getSigningData } = require('../data/queries/UsersQueries');
const { blobUpload } = require('../model/FileStore');
const { getSignedDocument } = require('../model/UserManager');
const router = express.Router();

/**
 * GET /users/:id
 * @description Get signed users by document ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - The promise that resolves when the signed users are retrieved.
 */
router.get('/:id', async (req, res) => {
    try {
        assert(req.params.id, 'Document ID is required');

        res.status(200).send(await getSignedUsers(req.params.id));
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * GET /users?email=:email
 * @description Get user by email.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - The promise that resolves when the user is retrieved.
 */
router.get('', async (req, res) => {
    try {
        assert(req.query.email, 'user email is required');

        let data = await getUser(req.query.email);
        res.status(200).send({ first_name: data.first_name, last_name: data.last_name });
    } catch (error) {
        res.status(404).send(error.message);
    }
});

router.get('/signingData/:token', async (req, res) => {
    try {
        assert(req.params.token, 'token is required');
        const rep = await getSigningData(req.params.token);

        assert(rep, 'No data found for the given token');

        let currentDate = rep.docDate;

        const year = currentDate.getFullYear();
        const month = ('0' + (currentDate.getMonth() + 1)).slice(-2); // Adding 1 because getMonth() returns zero-based month index
        const day = ('0' + currentDate.getDate()).slice(-2);

        rep.docDate = year + '-' + month + '-' + day;

        res.status(200).send(rep);
    } catch (error) {
        res.status(404).send(error.message);
    }
});

/**
 * POST /users
 * @description Create a new user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - The promise that resolves when the user is created.
 */
router.post('/', async (req, res) => {
    try {
        assert(req.body.first_name, 'first name is required');
        assert(req.body.last_name, 'last name is required');
        assert(req.body.identifier, 'identifier is required');

        await addUser(req.body);
        res.status(200).send('User created successfully');
    } catch (error) {
        console.log(error.message);
        res.status(500).send(error.message);
    }
});

/**
 * POST /users/generateSigningToken
 * @description Generate a signing token for a user and document.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - The promise that resolves when the signing token is generated.
 */
router.post('/generateSigningToken', async (req, res) => {
    try {
        assert(req.body.email, 'user email is required');
        assert(req.body.documentId, 'documentId is required');

        let token = await generateSigningToken(req.body.email, req.body.documentId);

        res.status(200).send(token);
    } catch (error) {
        console.log(error.message);
        res.status(500).send(error.message);
    }
});


/**
 * POST /users/sign
 * @description Sign a document.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void} - The response indicating that the endpoint is not implemented.
 */
router.post('/sign/:token', blobUpload.single('blob'), async (req, res) => {
    try {
        // sign the document
        const user_version_id = await signDoc(req.params.token, req.file.buffer);
    
        // send the signed document
        const signedDoc = await getSignedDocument(user_version_id);

        // send the signed document as a response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachement; filename="${signedDoc.docName}"`);
        res.send(signedDoc.pdf);

    } catch (e) {
        console.log(e.message);
        res.status(500).send(e.message);
    }
});

router.get('/signedDocument/:id', async (req, res) => {
    try {
        // get the signed document
        const signedDoc = await getSignedDocument(req.params.id);

        // send the signed document as a response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${signedDoc.docName}"`);

        res.send(signedDoc.pdf);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
