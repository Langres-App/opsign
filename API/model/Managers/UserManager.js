const UserQueries = require('../../data/queries/UsersQueries');
const UserVersionQueries = require('../../data/queries/UsersVersionsQueries');
const VersionQueries = require('../../data/queries/VersionQueries');
const utils = require('../../model/Utils');
const assert = require('../Asserter');

/**
 * Adds a new user.
 * 
 * @param {Object} user - The user object to be added.
 * @param {string} user.first_name - The first name of the user.
 * @param {string} user.last_name - The last name of the user.
 * @param {string} user.email - The email of the user.
 * @returns {Promise} A promise that resolves with the added user.
 * @throws {AssertionError} If the user or any required fields are missing or invalid.
 */
async function add(user) {

    // Check if the user is provided
    assert(user, '[UserManager.add] The user is required');
    assert(user.first_name, '[UserManager.add] The first name is required');
    user.first_name = user.first_name.trim();
    assert(user.first_name.length > 2, '[UserManager.add] The first name is required');
    console.log(user.first_name);

    assert(user.last_name, '[UserManager.add] The last name is required');
    user.last_name = user.last_name.trim();
    assert(user.last_name.length > 2, '[UserManager.add] The last name is required');

    assert(user.email, '[UserManager.add] The email is required');
    assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email), '[UserManager.add] The email is not valid');

    try {
        return await UserQueries.add(user);
    } catch (e) {
        return e;
    }

}

/**
 * Retrieves a user by their ID.
 *
 * @param {number} id - The ID of the user.
 * @returns {Promise<Object>} A promise that resolves to the user object.
 * @throws {Error} If the ID is not provided or is not a number.
 */
async function getById(id) {

    // Check if the ID is provided
    assert(id, '[UserManager.getById] The ID is required');

    id = parseInt(id);
    assert(id, '[UserManager.getById] The ID must be a number');

    return await UserVersionQueries.getById(id);

}

/**
 * Retrieves a user by their email address.
 *
 * @param {string} email - The email address of the user.
 * @returns {Promise<Object>} A promise that resolves to the user object.
 * @throws {Error} If the email is missing or not valid.
 */
async function getByEmail(email) {

    assert(email, '[UserManager.getByEmail] The email is required');

    // check if the mail follow the email pattern
    assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), '[UserManager.getByEmail] The email is not valid');

    return await UserQueries.getByEmail(email);

}

/**
 * Retrieves a user by document ID.
 *
 * @param {number} id - The document ID of the user.
 * @returns {Promise<Object>} - A promise that resolves to the user object.
 * @throws {Error} - If the document ID is missing or not a number.
 */
async function getByDocId(id) {

    assert(id, '[UserManager.getByDocId] The document ID is required');

    id = parseInt(id);
    assert(id, '[UserManager.getByDocId] The document ID must be a number');

    return await UserQueries.getByDocId(id);

}

/**
 * Retrieves all users along with their display names and the number of document signed.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of user objects.
 */
async function getAll() {

    return await UserQueries.getAll();

}

/**
 * Retrieves archived users.
 * @returns {Promise<Array>} A promise that resolves to an array of archived users.
 */
async function getArchived() {

    return await UserQueries.getArchived();

}

/**
 * Retrieves signing page data based on the provided token.
 * @param {string} token - The token used to retrieve the signing page data.
 * @returns {Promise<Object>} The signing page data.
 * @throws {Error} If the token is not provided or if no data is found for the given token.
 */
async function getSigningPageData(token) {

    assert(token, '[UserManager.getSigningPageData] The token is required');

    const toReturn = await UserVersionQueries.getSigningPageData(token);

    assert(toReturn, 'Data not found for the given token');

    // transform it to DD-MM-YYYY
    toReturn.docDate = toReturn.docDate.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' });

    return toReturn;

}

/**
 * Archives a user by their version ID.
 *
 * @param {number} userVersionId - The version ID of the user to archive.
 * @returns {Promise} A promise that resolves when the user is successfully archived.
 * @throws {Error} If the userVersionId is missing or not a number.
 */
async function archive(userVersionId) {

    assert(userVersionId, '[UserManager.archive] The userVersionId is required');

    userVersionId = parseInt(userVersionId);
    assert(userVersionId, '[UserManager.archive] The userVersionId must be a number');

    return await UserQueries.archive(userVersionId);

}

/**
 * Unarchives a user by ID.
 *
 * @param {number} id - The ID of the user to unarchive.
 * @returns {Promise} A promise that resolves when the user is unarchived.
 * @throws {Error} If the user ID is missing or not a number.
 */
async function unarchive(id) {

    assert(id, '[UserManager.unarchive] The user ID is required');

    id = parseInt(id);
    assert(id, '[UserManager.unarchive] The user ID must be a number');

    return await UserQueries.unarchive(id);


}

/**
 * Generates a signing token for a user and a document.
 * @param {string} data - The data of the user.
 * @param {string} documentId - The ID of the document.
 * @returns {Promise<string>} The generated signing token.
 */
async function generateSigningToken(data, documentId) {

    const user = await UserQueries.getByEmail(data.email);

    assert(user, '[UserManager.generateSigningToken] The user is required'); // may check the addUser from the front

    const userId = user.id;

    assert(data.email, '[UserManager.generateSigningToken] The email is required');
    assert(documentId, '[UserManager.generateSigningToken] The documentId is required');

    // Generate a random token
    const tokens = await UserVersionQueries.getSigningTokens();

    let token = null;
    while (token == null || tokens.includes(token)) {
        token = utils.generateRandomToken(5, false);
    }

    const versionId = (await VersionQueries.getLatest(documentId)).id;

    // Add the token to the database
    await UserVersionQueries.addSigningToken(userId, versionId, token);

    // Return the token
    return token;

}

/**
 * Signs a document with the given token and signature.
 * @param {string} token - The token used to identify the document.
 * @param {string} signature - The signature to be applied to the document.
 * @returns {Promise<string>} The signed document.
 */
async function sign(token, signature) {

    assert(token, '[UserManager.sign] The token is required');
    assert(signature, '[UserManager.sign] The signature is required');

    // Get the user version ID
    const userVersionId = await UserVersionQueries.getUserVersionIdByToken(token);

    // Sign the document
    await UserVersionQueries.signDoc(token, signature);


    const signedDocManager = require('./SignedDocumentManager');
    return await signedDocManager.getSignedDocument(userVersionId);

}

/**
 * Retrieves a version by its ID.
 *
 * @param {number} versionId - The ID of the version to retrieve.
 * @returns {Promise<Object>} A promise that resolves to the retrieved version object.
 * @throws {Error} If the version ID is missing or not a number.
 */
async function getVersion(versionId) {

    assert(versionId, '[UserManager.getVersion] The version ID is required');

    versionId = parseInt(versionId);
    assert(versionId, '[UserManager.getVersion] The version ID must be a number');

    return await VersionQueries.getById(versionId);

}

/**
 * Retrieves signing user data based on the provided user version ID.
 *
 * @param {number} userVersionId - The ID of the user version.
 * @returns {Promise<Object>} A promise that resolves to the signing user data.
 * @throws {Error} If the userVersionId is missing or not a number.
 */
async function getSigningUserData(userVersionId) {

    assert(userVersionId, '[UserManager.getSigningUserData] The userVersionId is required');

    userVersionId = parseInt(userVersionId);
    assert(userVersionId, '[UserManager.getSigningUserData] The userVersionId must be a number');

    return await UserVersionQueries.getSigningUserData(userVersionId);


}

async function getSigningUserImage(userVersionId) {

    assert(userVersionId, '[UserManager.getSigningUserImage] The userVersionId is required');

    userVersionId = parseInt(userVersionId);
    assert(userVersionId, '[UserManager.getSigningUserImage] The userVersionId must be a number');

    return await UserVersionQueries.getSigningUserImage(userVersionId);

}

/**
 * Deletes a user by their ID.
 *
 * @param {number} id - The ID of the user to delete.
 * @returns {Promise} A promise that resolves when the user is deleted.
 * @throws {Error} If the user ID is missing or not a number.
 */
async function deleteArchived(id) {

    assert(id, '[UserManager.deleteUser] The user ID is required');

    id = parseInt(id);
    assert(id, '[UserManager.deleteUser] The user ID must be a number');

    return await UserQueries.deleteArchived(id);

}

/**
 * Deletes archived users whose archived date is older than 5 years.
 * @returns {Promise<void>} A promise that resolves when all archived users have been deleted.
 */
async function autoDeleteArchivedUsers() {

    // Get all archived users
    const archivedUsers = await getArchived();

    // Get the current date and the date 5 years ago
    const now = new Date().getTime();
    const fiveYearsAgo = now - (5 * 365 * 24 * 60 * 60 * 1000);

    console.log(`[${new Date().toLocaleString()}] - Checking for archived users to delete...`);

    // Loop through the archived users
    for (const user of archivedUsers) {
        try {
            // check if their archived date is older that 5 years, if so delete them
            if (new Date(user.archived).getTime() < fiveYearsAgo) {
                await deleteArchived(user.id);
                console.log(`[${new Date().toLocaleString()}] - User ${user.firstName} ${user.last_name} has been deleted`);
            }
        } catch (error) {
            console.error(`Error deleting user with ID ${user.id}: ${error.message}`);
        }
    }

    // Log the end of the process
    console.log(`[${new Date().toLocaleString()}] - Finished checking for archived users`);
}

/**
 * Deletes a signature by document ID.
 *
 * @param {string} docId - The ID of the document.
 * @returns {Promise} A promise that resolves when the signature is deleted.
 * @throws {Error} If the document ID is not provided.
 */
async function deleteSignatureByDocId(docId, userId) {
    assert(docId, '[UserManager.deleteSignatureByDocId] The document ID is required');
    assert(userId, '[UserManager.deleteSignatureByDocId] The user ID is required');
    return await UserVersionQueries.deleteSignatureByDocId(docId, userId);
}

/**
 * Deletes a signature by token.
 *
 * @param {string} token - The token of the signature to delete.
 * @param {number} userId - The ID of the user.
 * @returns {Promise} A promise that resolves when the signature is deleted.
 */
async function deleteSignatureByToken(token, userId) {
    assert(token, '[UserManager.deleteSignature] The token is required');
    assert(userId, '[UserManager.deleteSignature] The user ID is required');
    return await UserVersionQueries.deleteSignatureByToken(token, userId);
}

module.exports = {
    add,
    generateSigningToken,

    getById,
    getByEmail,
    getByDocId,
    getAll,
    getArchived,
    getSigningPageData,
    getSigningUserData,
    getSigningUserImage,
    getVersion,

    archive,
    unarchive,
    sign,

    deleteArchived,
    autoDeleteArchivedUsers,
    deleteSignatureByDocId,
    deleteSignatureByToken
}