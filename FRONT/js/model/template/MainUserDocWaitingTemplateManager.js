/**
 * @class MainUserDocWaitingTemplateManager - class for creating and managing templates for waiting documents
 */
class MainUserDocWaitingTemplateManager extends TemplateManager {

    /**
     * Represents a MainUserDocWaitingTemplateManager.
     * @constructor
     * @param {HTMLElement} [container=null] - The container element for the template manager.
     */
    constructor(container = null) {
        super(container);
        this.path = 'visual/templates/UserWaitingDocTemplate.html';
    }

    /**
     * Adds waiting documents to the template manager.
     * @param {Array} docs - An array of documents to be added.
     * @returns {Promise} - A promise that resolves when all documents have been added.
     */
    async addWaitingDocs(docs = []) {
        for (let doc of docs) {
            await this.#addDoc(doc);
        }
    }

    /**
     * Adds a document to the template manager.
     * @param {Object} doc - The document to be added.
     * @returns {Promise<void>} - A promise that resolves when the document is added.
     */
    async #addDoc(doc) {
        let values = [];

        values['id'] = doc.id;          // doc id
        values['Title'] = doc.title;    // doc name

        await super.addTemplate(values);
    }

    /**
     * Handles the click event on the email icon.
     *
     * @param {Function} callback - The callback function to be executed when the email icon is clicked.
     */
    onEmailClick(callback) {
        super.onClick(callback, 'mail', 'doc', '.signed-docs');
    }

    /**
     * Handles the click event for the "copy" button in the document waiting template manager.
     * @param {Function} callback - The callback function to be executed when the button is clicked.
     */
    onCopyClick(callback) {
        super.onClick(callback, 'copy', 'doc', '.signed-docs');
    }

    /**
     * Handles the click event for the delete button.
     *
     * @param {Function} callback - The callback function to be executed when the delete button is clicked.
     */
    onDeleteClick(callback) {
        super.onClick(callback, 'delete', 'doc', '.signed-docs');
    }
}