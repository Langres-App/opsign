/**
 * @class UserManager - A class to manage the users.
 */
class UserManager {

    /**
     * The user data access object.
     * @private
     */
    #userDao;
    #users;
    #archivedUsers;

    /**
     * Represents a UserManager object.
     * @constructor
     */
    constructor() {
        this.#userDao = new UserDao();
    }


    /**
     * Adds a user to the system.
     * @param {Object} user - The user object to be added.
     * @returns {Promise} A promise that resolves with the added user.
     */
    async addUser(user) {
        return await this.#userDao.add(user);
    }

    async getAll(archived = false) {
        if (!archived) {
            if (!this.#users) {
                this.#users = await this.#userDao.getAll(archived);
            }
            return this.#users;
        } else {
            if (!this.#archivedUsers) {
                this.#archivedUsers = await this.#userDao.getAll(archived);
            }
            return this.#archivedUsers;
        }
    }

    async getById(id, archived = false) {
        id = parseInt(id);
        if (Number.isNaN(id)) throw new Error('Invalid ID');

        if (archived) {
            if (!this.#archivedUsers) {
                this.#archivedUsers = await this.#userDao.getAll(archived);
            }
            return this.#archivedUsers.find(user => user.id === id);
        } else {
            if (!this.#users) {
                this.#users = await this.#userDao.getAll(archived);
            }
            return this.#users.find(user => user.id === id);
        }
    }

    /**
     * Retrieves all users associated with a given document ID.
     * 
     * @param {string} docId - The ID of the document.
     * @returns {Promise<Array<SignedUser>>} - A promise that resolves to an array of SignedUser objects.
     */
    async getAllByDocId(docId) {
        const toReturn = [];

        // get the users
        let users = await this.#userDao.getById(docId);

        // create the signed users and add them to the list
        users.forEach(user => {
            toReturn.push(new SignedUser(user.id, user.displayName, user.version_date, user.signed_date));
        });

        return toReturn;
    }

    /**
     * Retrieves a user by their email.
     * @param {string} email - The email of the user.
     * @returns {Promise<User|null>} - A promise that resolves to the user object if found, or null if not found.
     */
    async getByEmail(email) {
        try {
            return await this.#userDao.getByEmail(email);
        } catch (_) {
            return null;
        }
    }

    /**
     * Retrieves the document and user name using the provided token.
     * @param {string} token - The token used for authentication.
     * @returns {Promise} A promise that resolves to the document and user name.
     */
    async getDocAndUserName(token) {
        try {
            return await this.#userDao.getDocAndUserName(token);
        } catch (e) {
            if (e.message.includes('404')) {
                alert('Le token de signature est invalide.\nVeuillez réessayer.');

                // reload the page and remove the token from the url
                window.location = window.location.pathname;
            }
        }
    }

    /**
     * Generates a signing link for the given user.
     * @param {Object} body - The user data.
     * @param {string} body.email - The email of the user.
     * @returns {Promise<string>} The signing link.
     */
    async generateSigningLink(body) {
        if (!this.links) this.links = [];

        let link = this.links[body.email];

        if (!link) {
            const resp = await this.#userDao.generateSigningLink(body);

            if (resp.status === 409) {
                throw new Error('L\'utilisateur à déjà été invité à signer ce document. Si la signature n\'a pas encore été effectuée, vous trouverez le lien sur son profile dans l\'onglet Utilisateurs.');
            }
            if (resp.status !== 200) {
                throw new Error('Erreur lors de la génération du lien de signature');
            }

            link = await resp.text();
            this.links[body.email] = link;

        }

        return window.location.origin + '/posign/visual/pages/signing.html?token=' + link;

    }

    async signDocument(token, blob) {
        const response = await this.#userDao.signDocument(token, blob);
        if (response.status !== 200) {
            throw new Error('Error signing the document');
        }

        return await response.blob();
    }

    /**
     * Prints the PDF document with the user signature.
     * @param {string} docId - The ID of the document.
     * @param {string} userId - The ID of the user.
     * @returns {Promise<void>} - A promise that resolves when the PDF document is printed.
     */
    async print(uvId) {
        const signedDocBlob = await this.#userDao.print(uvId);

        // open the signed document
        const link = URL.createObjectURL(signedDocBlob);
        window.open(link, '_blank');
    }

    /**
     * Archives a user so that he doesn't appear when looking for people who signed a document. (soft delete)
     * @param {string} userId - The ID of the user to archive.
     * @returns {Promise} A promise that resolves when the user is archived.
     */posign
    async archive(userId) {
        return await this.#userDao.archive(userId);
    }

    /**
     * Unarchives a user with the specified ID.
     * @param {number} id - The ID of the user to unarchive.
     * @returns {Promise<void>} - A promise that resolves when the user is unarchived.
     */
    async unarchive(id) {
        try {
            this.#userDao.unarchive(id);
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Deletes a user by their ID.
     *
     * @param {number} userId - The ID of the user to delete.
     * @returns {Promise} A promise that resolves when the user is deleted.
     */
    async delete(userId) {
        return await this.#userDao.delete(userId);
    }

    async deleteSignatures(userId, docId) {
        return await this.#userDao.deleteAllSignatures(userId, docId);
    }

    async deleteSignatureToken(userId, token) {
        return await this.#userDao.deleteSignatureToken(token, userId);
    }
}