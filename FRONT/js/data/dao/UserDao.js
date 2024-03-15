/**
 * @class UserDao - A class to manage the users.
 */
class UserDao extends Dao {

    /**
     * Constructs a new UserDao object.
     * @constructor
     */
    constructor() {
        super('users');
    }

    /**
     * Updates a user. Not implemented because we need to specify the document. and what to do
     * @param {Object} user - The user object to be updated.
     * @returns {Promise} A promise that resolves with the updated user.
     */
    async update(user) {
        return Error('NOT IMPLEMENTED');
    }


    /**
     * Deletes a user. Not implemented because we don't delete users but archive them. (soft delete)
     * @param {Object} user - The user object to be deleted.
     * @returns {Promise} - A promise that resolves with the result of the deletion.
     */
    async delete(user) {
        return Error('NOT IMPLEMENTED');
    }

    async getByEmail(email) {
        let response = await fetch(super.getUrl() + super.getEndpoint() + `?email=${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + AuthManager.getToken()
            },
        });
        let result = await response.json();
        return result;
    }

    async generateSigningLink(body) {
        let response = await fetch(super.getUrl() + super.getEndpoint() + '/generateSigningToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + AuthManager.getToken()
            },
            body: JSON.stringify(body)
        });

        return response;
    }

    async getDocAndUserName(token) {
        let response = await fetch(super.getUrl() + super.getEndpoint() + `/signingData/${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + AuthManager.getToken()
            },
        });

        // if the response is 500, it means that the server had a problem
        if (response.status === 500) {
            throw new Error('Une erreur est survenue lors de la récupération des données de signature. Veuillez réessayer plus tard.');
        }

        // if the response is 404, it means that the token is invalid
        if (response.status === 404) {
            throw new Error('[404] Le token de signature est invalide');
        }

        // else return the json body of the response containing the document and the user name
        let result = await response.json();
        return result;
    }

    async signDocument(token, blob) {
        let formData = new FormData();
        formData.append('blob', blob);


        let response = await fetch(super.getUrl() + super.getEndpoint() + `/sign/${token}`, {
            method: 'POST',
            body: formData
        });

        return response;
    }

    /**
     * Fetches and get the document with the user signature.
     * @param {string} docId - The ID of the document.
     * @param {string} userId - The ID of the user.
     * @returns {Promise<any>} - A promise that resolves with the fetched data.
     */
    async print(docId, userId) {
        let response = await fetch(super.getUrl() + super.getEndpoint() + `?doc=${docId}&user=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + AuthManager.getToken()
            },
        });
        let result = await response.json();
        return result;
    }



    /**
     * Archives a user so that he doesn't appear when looking for people who signed a document. (soft delete)
     * @param {string} userId - The ID of the user to archive.
     * @returns {Promise} A promise that resolves when the user is archived.
     */
    async archive(userId) {
        // To archive a user, we just send the delete request with the
        // user id the server will just set the user as archived.
        return super.delete(userId, false);
    }

    /**
     * Deletes a user by their ID.
     *
     * @param {string} userId - The ID of the user to delete.
     * @returns {Promise} A promise that resolves when the user is deleted.
     */
    async delete(userId) {
        return super.delete(userId, true);
    }

}