/**
 * @class DocumentManager - Manages the documents in the system
 */
class DocumentManager extends DataManager {

    /**
     * The documents that are currently in the system (cached)
     */
    #documents = [];

    /**
     * Represents a DocumentManager object.
     * @constructor
     */
    constructor() {
        super();
        this.#init();
    }

    /**
     * Caches the provided documents.
     * 
     * @param {Array} documents - The documents to be cached.
     * @returns {void}
     */
    #cacheDocuments(documents) {
        this.#documents = documents;
    }

    /**
     * Retrieves the documents stored in the DocumentManager.
     * @returns {Array} An array of documents.
     */
    getDocuments() {
        return this.#documents;
    }

    /**
     * Retrieves a document by its ID FROM THE CACHE.
     * @param {string} id - The ID of the document.
     * @returns {Document|null} - The document object if found, or null if not found.
     */
    getDocument(id) {
        for (let doc of this.#documents) {
            if (doc.getId() == id) {
                return doc;
            }
        }
        return null;
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

        // if the documents are already loaded, we return them
        if (this.#documents.length > 0) {
            return this.#documents;
        }

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

            this.#cacheDocuments(toReturn);

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

        // if the documents are already loaded, we return the one with the given id
        for (let doc of this.#documents) {
            if (doc.getId() == id) {
                return doc;
            }
        }

        let data;

        try {
            data = await super.getById(id);
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
            data = await super.add(object);
        } catch (e) {
            console.log(e);
        }

        // depending on what appened we either reload the page or return a message
        if (data) { }  // TODO: message popup that reload the view
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
        if (data) { } // TODO: message popup that reload the view / error message
    }


    /**
     * Updates the given object
     * @param {object} object Object to update
     */
    async update(object) {
        let data;
        try {
            data = await super.update(object);
        } catch (e) {
            console.log(e);
        }

        if (data && data.status === 200) {
            window.location.reload();
        }
    }

    /**
     * archive the object with the given id
     * @param {number | string} id identifier of the object to delete  
     */
    async archive(id) {
        await super.delete(id);
    }

}
