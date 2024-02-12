/**
 * @class DocumentManager - Manages the documents in the system
 */
class DocumentManager extends DataManager {

    constructor() {
        super();
        this.#init();
    }

    /**
     * Initializes the DocumentManager class
     */
    async #init() {
        super.setDao(new DocumentDao());
    }
    
    /**
     * Returns all the object
     * @returns {Array} - An array of all the object
     */
    async getAll() {
        let toReturn = [];
        let data;

        // we try to get the data
        try {
            data = await super.getAll();
        } catch (e) {
            console.log(e);
        }

        // if no error was thrown and the data is defined we return what the function needs to
        if (data !== undefined) {
            data.forEach(doc => {
                toReturn.push(new PoDocument(doc))
            });

            return toReturn;
        }

        return null;
    }

    /**
     * Returns the object with the given id
     * @param {number | string} id identifier of the object
     * @returns object with the given id
     */
    async getById(id) {
        let data;

        try {
            data = await this.getById(id);
        } catch (e) {
            console.log(e);
        }

        // if no error was thrown and the data is defined we return what the function needs to
        if (data !== undefined) {
            return new PoDocument(data);
        }

        return null;
    }

    /**
     * Returns the object with the given name
     * @param {string} name name of the object
     */
    async add(object) {
        let data;

        try {
            data = await this.add(object);
        } catch (e) {
            console.log(e);
        }

        // depending on what appened we either reload the page or return a message
        if (data) { }  // TODO message popup that reload the view
    }

    /**
     * Adds a version to the given document
     * @param {number | string} documentId document identifier
     * @param {version} version version to add to the document 
     */
    async addVersion(documentId, version) {
        let dao = await this.getDao();
        let data;

        try {
            data = await dao.addVersion(documentId, version);
        } catch (e) {
            console.log(e);
        }

        // depending on the api call, either tell the element was added, or return an error message
        if (data) { } // TODO message popup that reload the view / error message
    }


    /**
     * Updates the given object
     * @param {object} object Object to update
     */
    async update(object) {
        let data;
        try {
            data = await this.update(object);
        } catch (e) {
            console.log(e);
        }

        if (data) { } // TODO update view / reload page
    }

    /**
     * Deletes the object with the given id
     * @param {number | string} id identifier of the object to delete  
     */
    async delete(id) {
        let data;

        try {
            data = await this.delete(id);
        } catch (e) {
            console.log(e);
        }

        if (data) { } // TODO update view / reload page
    }


}
