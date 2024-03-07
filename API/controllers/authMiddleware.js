const { userIsLogged } = require("../data/queries/AuthorizedUserQueries");

/**
 * Middleware function to require authentication.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
async function requireAuth(req, res, next) {
    // Check if the request has the authorization header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Bearer ') === -1) {
        return res.status(401).json({ message: 'Unauthorized!' })
    }

    // if the request has the authorization header, check if the token is valid (if so, isLoggedIn will increase the duration of the token)
    if (!await userIsLogged(req.headers.authorization.split('Bearer ')[1])) {
        return res.status(401).json({ message: 'Wrong or outdated Token, please log in!' })
    }

    // if the token is valid, call the next middleware function
    return next();

}

module.exports = requireAuth;