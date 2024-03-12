/**
 * @fileoverview This file contains the AuthController module, which handles authentication-related routes.
 * @module AuthController
 */

const express = require('express');
const { login } = require('../data/queries/AuthorizedUserQueries');
const { handle } = require('./functionHandler');
const AuthManager = require('../model/Managers/AuthManager');
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
router.get('/check', handle(async (req, res) => {
    const result = await AuthManager.check(req.headers.authorization);
    res.status(200).json({ logged: result });
}));

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
router.post('/login', handle(async (req, res) => {
    const result = await AuthManager.login(req.body);
    res.status(200).send(result);
}));

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
router.post('/register', handle(async (req, res) => {
    const result = await AuthManager.register(req.body);
    res.status(201).send(result);
}));

module.exports = router;
