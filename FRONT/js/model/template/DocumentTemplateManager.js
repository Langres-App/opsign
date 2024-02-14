/**
 * @class DocumentTemplateManager - This class is responsible for managing the document template
 */
class DocumentTemplateManager extends TemplateManager {

    /**
     * Constructor of the SignedUserTemplateManager
     * @param {HTMLElement} container Container of the template manager
     */
    constructor(container = null) {
        super(container);
        this.path = 'visual/templates/DocumentTemplate.html';
    }

    /**
     * Adds multiple documents to the container.
     * @param {Array} documents - The array of documents to be added.
     * @returns {Promise} A promise that resolves when all documents have been added.
     */
    async addDocuments(documents = []) {
        // add the documents to the container
        for (let doc of documents) {
            await this.addDocument(doc);
        }
    }

    /**
     * Add a PoDocument to the container
     * @param {PoDocument} document Document to be added to the container
     * @returns Promise<void>
     */
    async addDocument(document) {
        // values is a map that contains the values to be replaced in the template, 
        // the key is the name of the variable in the template and the value is the value to replace
        let values = [];

        // check if the passed parameter is a Document object
        if (document instanceof PoDocument) {
            values['id'] = document.getId();
            values['Title'] = document.getFileName();
            const lastVer = document.getLastVersion();

            // check if the last version exsists and is a Version object
            if (!lastVer || !(lastVer instanceof Version)) return;

            values['Date'] = lastVer.getAddDate();
            values['Preview'] = lastVer.getPreview();
        }

        // call parent method to add the document to the container
        await super.addTemplate(values);
    }

    onDocumentClicked(callback) {
        super.onClick(callback, '', 'document', '#list');
    }
}