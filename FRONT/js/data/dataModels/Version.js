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

    // file
    #file;

    // the date of the version.
    #addDate;

    // the preview of the version.
    #preview;

    /**
     * Constructor for the Version class
     * @param {number} id Database id of the version
     * @param {string} addDate Date of the version
     */
    constructor(data = null) {
        if (data == null) {
            return;
        }
        this.#id = data.id;
        this.#path = data.file_path;
        this.#file = null;
        this.#addDate = new Date(data.created_date).toLocaleDateString();
        this.#preview = Utils.getRelativePathToRoot() + "img/Plastic_Omnium.svg";
    }

    /**
     * Get the version as a json object
     * @returns {object} the version as a json object
     */
    toJSON() {
        return {
            id: this.#id,
            path: this.#path,
            addDate: this.#addDate,
            preview: this.#preview
        };
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
     * Retrieves the file associated with this version.
     * @returns {string} The file associated with this version.
     */
    getFile() {
        return this.#file;
    }

    /**
     * Sets the file for the Version object.
     * @param {string} file - The file to set.
     */
    setFile(file) {
        this.#file = file;
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