/**
 * @fileoverview This file contains the AuthController module, which handles authentication-related routes.
 * @module AuthController
 */

const express = require('express');
const { userExist, userIsLogged, createUser, login } = require('../data/queries/AuthorizedUserQueries');
const router = express.Router();

/**
 * Route handler for checking if a user is logged in.
 * @name GET /check
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object containing the logged status of the user.
 * @throws {Object} The error object if an error occurs.
 */
router.get('/check', async (req, res) => {
    try {
        const exist = await userExist();

        if (!exist) {
            res.status(404).send({ data: 'No user found' });
        } else {
            // get token from header 
            if (req.headers.authorization) {
                let token = req.headers.authorization.split('Bearer ')[1];
                if (token && token !== "null") {
                    res.status(200).send({ logged: await userIsLogged(token) });
                } else { 
                    res.status(200).send({ logged: false });
                }
            } else {
                res.status(200).send({ logged: false });
            }
        }
    } catch (error) {
        res.status(500).send({ data: error.message });
    }
});

/**
 * Route handler for user login.
 * @name POST /login
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object containing the login result.
 * @throws {Object} The error object if an error occurs.
 */
router.post('/login', async (req, res) => {
    try {
        const result = await login(req.body); 
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ data: error.message });
    }
});

/**
 * Route handler for user registration.
 * @name POST /register
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object containing the registration result.
 * @throws {Object} The error object if an error occurs.
 */
router.post('/register', async (req, res) => {
    try {
        await createUser(req.body);
        const result = await login(req.body);
 
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send({ data: error.message }); 
    }
});

module.exports = router;
