class MainUserDocSignedTemplateManager extends TemplateManager {
    constructor(container = null) {
        super(container);
        this.path = 'visual/templates/UserSignedDocTemplate.html';
    }

    async addSignedDocs(docs = []) {
        for (let doc of docs) {
            await this.#addDoc(doc);
        }
    }

    async #addDoc(doc) {
        let values = [];

        const date = new Date(doc.date).toLocaleDateString();

        values['id'] = doc.id;      // doc id
        values['Title'] = doc.title; // doc name
        values['Date'] = date;  // sig date

        await super.addTemplate(values);
    }

    onUpdateClick(callback) {
        super.onClick(callback, 'update-signature', 'doc', '.signed-docs');
    }

    onDocClick(callback) {
        super.onClick(callback, 'see-document', 'doc', '.signed-docs');
    }

    onDeleteClick(callback) {
        super.onClick(callback, 'delete-signature', 'doc', '.signed-docs');
    }
}