class DocumentManager {

    static #dao;

    static async #init() {
        if (DocumentManager.#dao === undefined) {
            await Utils.addScript('js/data/dao/Dao.js');
            await Utils.addScript('js/data/dao/DocumentDao.js');
            DocumentManager.#dao = new DocumentDao();
        }
    }

    static async #getDao() {
        await DocumentManager.#init();
        return DocumentManager.#dao;
    }
    
    static async getAllDocuments() {
        let dao = await DocumentManager.#getDao();
        return await dao.getAll();
    }

    static async getDocumentById(id) {
        let dao = await DocumentManager.#getDao();
        return await dao.getById(id);
    }
    
    static async addDocument(document) {
        let dao = await DocumentManager.#getDao();
        await dao.add(document);
    }

    static async updateDocument(document) {
        let dao = await DocumentManager.#getDao();
        await dao.update(document);
    }

    static async addVersionToDocument(documentId, version) {
        let dao = await DocumentManager.#getDao();
        await dao.addVersion(documentId, version);
    }

    static async deleteDocument(id) {
        let dao = await DocumentManager.#getDao();
        await dao.delete(id);
    }

}