/**
 * @class MainUserDocSignedTemplateManager - Manages the template for the signed documents section in the main user page.
 */
class MainUserDocSignedTemplateManager extends TemplateManager {

    /**
     * Represents a MainUserDocSignedTemplateManager.
     * @constructor
     * @param {HTMLElement} [container=null] - The container element for the template manager.
     */
    constructor(container = null) {
        super(container);
        this.path = 'visual/templates/UserSignedDocTemplate.html';
    }

    /**
     * Adds multiple documents to the template manager.
     * @param {Array} docs Documents data to be added to the template
     */
    async addSignedDocs(docs = []) {
        for (let doc of docs) {
            await this.#addDoc(doc);
        }
    }

    /**
     * Adds a document to the template manager.
     *
     * @param {Object} doc - The document to be added.
     * @returns {Promise<void>} - A promise that resolves when the document is added.
     */
    async #addDoc(doc) {
        let values = [];

        const date = new Date(doc.date).toLocaleDateString();

        values['id'] = doc.user_version_id;                 // doc id
        values['Title'] = doc.title;                        // doc name
        values['Date'] = date;                              // sig date
        values['update'] = doc.toUpdate ? '' : 'disabled';  // update button (disabled if the doc is up to date)

        await super.addTemplate(values);
    }

    /**
     * Handles the click event for the "Update" button.
     *
     * @param {Function} callback - The callback function to be executed when the button is clicked.
     */
    onUpdateClick(callback) {
        super.onClick(callback, 'update-signature', 'doc', '.signed-docs');
    }

    /**
     * Handles the click event on a document.
     *
     * @param {Function} callback - The callback function to be executed when the document is clicked.
     */
    onDocClick(callback) {
        super.onClick(callback, 'see-document', 'doc', '.signed-docs');
    }

    /**
     * Handles the click event for the delete button in the signed documents section.
     *
     * @param {Function} callback - The callback function to be executed when the delete button is clicked.
     */
    onDeleteClick(callback) {
        super.onClick(callback, 'delete-signature', 'doc', '.signed-docs');
    }
}