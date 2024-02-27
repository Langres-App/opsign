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
        // TODO: slanlp0033.ad.ponet will be env variable
        this.url = "http://slanlp0033.ad.ponet/charteapi/";

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
     * Get all the objects in the database
     * @returns All the objects in the database
     */
    async getAll() {
        let response = await fetch(this.url + this.endpoint);
        let data = await response.json();
        return data;
    }

    /**
     * Get an object by its id
     * @param {number} id Id of the object to get
     * @returns The object with the given id as a json object
     */
    async getById(id) {
        let response = await fetch(this.url + this.endpoint + "/" + id);
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
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        let result = await response.json();
        return result;
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
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        return response;
    }

    /**
     * Delete an object from the database
     * @param {number} id Id of the object to delete
     * @returns the result of the delete request
     */
    async delete(id) {
        let response = await fetch(this.url + this.endpoint + "/" + id, {
            method: 'DELETE'
        });

        return response;
    }
}