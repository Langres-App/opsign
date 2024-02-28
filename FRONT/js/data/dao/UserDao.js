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
     * Retrieves all users. Not implemented because we need to specify the document.
     * @returns {Promise} A promise that resolves with the list of users.
     */
    async getAll() {
        return Error('NOT IMPLEMENTED');
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
        return super.delete(userId);
    }


}