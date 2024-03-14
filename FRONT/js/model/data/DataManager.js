/**
 * @class DataManager - Class for managing the data in the system
 */
class DataManager {

    /**
     * @private @member {Dao} #dao - The data access object
     */
     #dao;

    /**
     * Returns the data access object in the system (singleton pattern for the dao object)
     * @returns {Dao} The data access object
     */
     async getDao() {
        if (this.#dao === undefined)
            throw Error('The dao isn\'t set');
        return this.#dao;
    }

    /**
     * Allows to set the data access object in the system (can only be set once)
     * @param {? extends Dao} dao The data access object
     * @throws {Error} If the dao object has already been set
     */
     setDao(dao) {
        if (this.#dao === undefined)
            this.#dao = dao;
        else
            throw new Error('The dao object has already been set');
    }

    /**
     * Returns all the object
     * @returns {Array} - An array of all the object
     */
     async getAll(archived = false) {
        let dao = await this.getDao();
        return await dao.getAll(archived);
    }

    /**
     * Returns the object with the given id
     * @param {number | string} id identifier of the object
     * @returns object with the given id
     */
     async getById(id) {
        let dao = await this.getDao();
        return await dao.getById(id);
    }

    /**
     * Returns the object with the given name
     * @param {string} name name of the object
     */
     async add(object) {
        let dao = await this.getDao();
        await dao.add(object);
    }

    /**
     * Updates the given object
     * @param {object} object Object to update
     */
     async update(object) {
        let dao = await this.getDao();
        await dao.update(object);
    }

    /**
     * Deletes the object with the given id
     * @param {number | string} id identifier of the object to delete  
     */
     async delete(id) {
        let dao = await this.getDao();
        await dao.delete(id);
    }
}