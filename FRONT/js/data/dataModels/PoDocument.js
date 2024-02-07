/**
 * @class PoDocument - Represents a document in the system
 * @constructs PoDocument - This constructor creates a new PoDocument object.
 * @param {number} id - The id of the document.
 */
class PoDocument {
    
    // The id of the document from the database.
    #id;

    // the name of the file.
    #fileName;

    // the date of the archiving of the document.
    #archivedDate;

    // the versions of the document.
    #versions = [];

    /**
     * Constructor for the PoDocument class
     * @param {number} id Identifier of the document in the database
     * @param {string} fileName Name of the file
     */
    constructor(id = null, fileName = null) {
        this.#id = id;
        this.#fileName = fileName;
        this.#archivedDate = null;
    }

    /**
     * Get the id of the document
     * @returns {number} the id of the document
     */
    getId() {
        return this.#id;
    }

    /**
     * Set the id of the document
     * @returns {string} the name of the file
     */
    getFileName() {
        return this.#fileName;
    }

    /**
     * Set the name of the file 
     * @param {string} fileName Name of the file
     */
    setFileName(fileName) {
        this.#fileName = fileName;
    }

    /**
     * Get the date of the archiving of the document
     * @returns {string} the date of the archiving of the document
     */
    getArchivedDate() {
        return this.#archivedDate;
    }

    /**
     * Set the date of the archiving of the document
     * @param {string} archivedDate Date of the archiving of the document   
     */
    setArchivedDate(archivedDate) {
        this.#archivedDate = archivedDate;
    }

    /**
     * Get the versions of the document
     * @returns {Version[]} the versions of the document
     */
    getVersions() {
        return this.#versions;
    }

    /**
     * Add a version to the document    
     * @param {Version} version Version to add to the document
     */
    addVersion(version) {
        this.#versions.push(version);
    }

    /**
     * Get the last version of the document
     * @returns {Version} the last version of the document
     */
    getLastVersion() {
        return this.#versions[this.#versions.length - 1];
    }
}