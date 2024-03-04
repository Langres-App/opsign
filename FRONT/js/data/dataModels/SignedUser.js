/**
 * @class SignedUser - Represents a user that has signed a document
 * @property {number} id - identifier of the user
 */
class SignedUser {

    // private fields
    // id of the user
    #id;

    // display name of the user
    #displayName;

    // date of the document signed by the user (date of the signature)
    #docDate;

    // date of the signature
    #signedDate;

    /**
     * Create a new SignedUser object
     * @param {number} id identifier of the user
     * @param {string} displayName Display name of the user
     * @param {string} docDate release date of the document
     * @param {string} signedDate date of the signature
     */
    constructor(id = null, displayName = null, docDate = null, signedDate = null) {
        this.#id = id;
        this.#displayName = displayName;
        this.#docDate = new Date(docDate);
        this.#signedDate = new Date(signedDate);
    }

    /**
     * Get the id of the user
     * @returns {number} The id of the user
     */
    getId() {
        return this.#id;
    }

    /**
     * Set the id of the user
     * @param {number} value The id of the user
     */
    getDisplayName() {
        return this.#displayName;
    }

    /**
     * Set the display name of the user
     * @param {string} value The display name of the user
     */
    setDisplayName(value) {
        this.#displayName = value;
    }

    /**
     * Get the date of the document signed by the user
     * @returns {string} The date of the document signed by the user
     */
    getDocDate() {
        return this.#docDate.toLocaleDateString();
    }

    /**
     * Set the date of the document signed by the user
     * @param {string} value The date of the document signed by the user
     */
    getSignedDate() {
        return this.#signedDate.toLocaleDateString();
    }

    /**
     * Set the date of the document signed by the user
     * @param {string} value The date of the document signed by the user
     */
    setSignedDate(value) {
        this.#signedDate = value;
    }
}