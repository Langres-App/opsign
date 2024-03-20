class MainUserDocWaitingTemplateManager extends TemplateManager {
    constructor(container = null) {
        super(container);
        this.path = 'visual/templates/UserWaitingDocTemplate.html';
    }

    async addWaitingDocs(docs = []) {
        for (let doc of docs) {
            await this.#addDoc(doc);
        }
    }

    async #addDoc(doc) {
        let values = [];

        values['id'] = doc.id;          // doc id
        values['Title'] = doc.title;    // doc name

        await super.addTemplate(values);
    }

    onEmailClick(callback) {
        super.onClick(callback, 'mail', 'doc', '.signed-docs');
    }

    onCopyClick(callback) {
        super.onClick(callback, 'copy', 'doc', '.signed-docs');
    }

    onDeleteClick(callback) {
        super.onClick(callback, 'delete', 'doc', '.signed-docs');
    }
}