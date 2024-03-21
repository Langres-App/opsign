/**
 * @class Dao - This class is the parent class of all the dao classes. It contains the basic CRUD operations.
 */
class Dao {
    /**
     * Create a new Dao object to interact with the api (CRUD operations)
     * @param {string} endpoint endpoint of the api to use
     */
    constructor(endpoint) {
        // set the url of the api
        this.url = '/posignapi/';

        // check if the endpoint is defined
        if (endpoint === undefined) {
            throw new Error("You must provide an endpoint");
        }

        // set the endpoint
        this.endpoint = endpoint;
    }

    /**
     * Returns the URL of the Dao.
     * @returns {string} The URL of the Dao.
     */
    getUrl() {
        return this.url;
    }

    /**
     * Retrieves the endpoint of the DAO.
     * @returns {string} The endpoint of the DAO.
     */
    getEndpoint() {
        return this.endpoint;
    }

    /**
     * Retrieves all data from the server.
     * @param {boolean} [archived=false] - Indicates whether to query the archived data.
     * @returns {Promise<any>} - A promise that resolves to the retrieved data.
     */
    async getAll(archived = false) {
        let response = await fetch(this.url + this.endpoint + (archived ? '/archived' : ''), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + AuthManager.getToken()
            },
        });

        if (response.status === 200) {
            let result = await response.json();
            return result;
        }

        return null;

    }

    /**
     * Get an object by its id
     * @param {number} id Id of the object to get
     * @returns The object with the given id as a json object
     */
    async getById(id) {
        let response = await fetch(this.url + this.endpoint + "/" + id, {
            headers: {
                'Authorization': 'Bearer ' + AuthManager.getToken()
            }
        });
        let data = await response.json();
        return data;
    }

    /**
     * Add an object to the database
     * @param {object} data The data to add to the database
     * @returns The result of the add request
     */
    async add(data) {
        let response = await fetch(this.url + this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + AuthManager.getToken()
            },
            body: JSON.stringify(data)
        });

        return response;
    }

    /**
     * Update an object in the database
     * @param {object} data Data to update (must contain an id field)
     * @returns The result of the update request
     */
    async update(data) {
        let response = await fetch(this.url + this.endpoint + "/" + data.id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + AuthManager.getToken()
            },
            body: JSON.stringify(data)
        });

        return response;
    }

    /**
     * Unarchives a document with the specified ID.
     * @param {number} id - The ID of the document to unarchive.
     * @returns {Promise<Response>} - A Promise that resolves to the response from the server.
     */
    async unarchive(id) {
        let response = await fetch(this.url + this.endpoint + '/' + id + '/unarchive', {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + AuthManager.getToken()
            }
        });

        return response;
    }

    /**
     * Delete an object from the database
     * @param {number} id Id of the object to delete
     * @param {boolean} [archived=false] - Indicates whether to delete the archived data.
     * @returns the result of the delete request
     */
    async delete(id, archived = false) {
        let response = await fetch(this.url + this.endpoint + "/" + id + (archived ? '/archived' : ''), {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + AuthManager.getToken()
            }
        });

        return response;
    }
}