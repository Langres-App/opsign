const express = require('express');
const assert = require('../model/Asserter');
const { getUser, addUser, generateSigningToken, getSignedUsers, signDoc } = require('../data/queries/UsersQueries');
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
router.post('/sign', async (req, res) => {
    try {
        signDoc(req.query.token, req.body);
        res.status(200).send('Document signed successfully');
        // TODO: send a link to the signed document
    } catch (e) {
        console.log(e.message);
        res.status(500).send(e.message);
    }
});

module.exports = router;
