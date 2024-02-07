/**
 * @class Version - This class is used to represent a version of a document.
 * @constructs Version - This constructor creates a new Version object.
 * @param {number} id - The id of the version.
 */
class Version {


    // The id of the version from the database. 
    #id;

    // the path to the version file.
    #path;

    // the date of the version.
    #addDate;

    // the preview of the version.
    #preview;

    /**
     * Constructor for the Version class
     * @param {number} id Database id of the version
     * @param {string} addDate Date of the version
     */
    constructor(id = null, addDate = null) {
        this.#id = id;
        this.#path = null;
        this.#addDate = addDate;
        this.#preview = Utils.getRelativePathToRoot() + "img/Plastic_Omnium.svg";
    }

    /**
     * returns the id of the version
     * @returns {number} the id of the version
     */
    getId() {
        return this.#id;
    }

    /**
     * Returns the path of the version
     * @returns {string} the path of the version
     */
    getPath() {
        return this.#path;
    }

    /**
     * Set the path of the version
     * @param {string} path the path of the version
     */
    setPath(path) {
        this.#path = path;
    }

    /**
     * returns the date of the version
     * @returns {string} the date of the version
     */
    getAddDate() {
        return this.#addDate;
    }

    /**
     * Set the date of the version
     * @param {string} addDate the date of the version
     */
    setAddDate(addDate) {
        this.#addDate = addDate;
    }

    /**
     * returns the preview of the version
     * @returns {string} the preview of the version
     */
    getPreview() {
        return this.#preview;
    }
}