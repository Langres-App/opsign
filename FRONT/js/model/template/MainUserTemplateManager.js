/**
 * @class MainUserTemplateManager - This class is responsible for managing the main user template
 */
class MainUserTemplateManager extends TemplateManager {

    /**
     * Constructor of the MainUserTemplateManager
     * @param {HTMLElement} container Container of the template manager
     */
    constructor(container = null) {
        super(container);
        this.path = 'visual/templates/MainUserTemplate.html';
    }

    /**
     * Adds multiple users to the template manager.
     * @param {Array} users - An array of user objects to be added.
     * @returns {Promise} - A promise that resolves when all users have been added.
     */
    async addUsers(users = []) {
        for (let user of users) {
            await this.#addUser(user);
        }
    }

    /**
     * Add a user to the container
     * @param {Object} user User to be added to the container
     * @param {number} user.id - The ID of the user.
     * @param {string} user.display_name - The display name of the user.
     * @param {number} user.num_doc_signatures - The number of documents signed by the user.
     * @returns Promise<void>
     */
    async #addUser(user) {
        // values is a map that contains the values to be replaced in the template, 
        // the key is the name of the variable in the template and the value is the value to replace
        let values = [];

        values['id'] = user.id;
        values['DisplayName'] = user.display_name;
        values['Signed'] = user.num_doc_signatures < 10 ? '0' + user.num_doc_signatures : user.num_doc_signatures;
        values['Outdated'] = 'XX'; // TODO: replace with the correct value
        values['Waiting'] = 'XX'; // TODO: replace with the correct value

        // call parent method to add the document to the container
        await super.addTemplate(values);
    }

    /**
     * Handles the user click event.
     *
     * @param {Function} callback - The callback function to be executed when the user is clicked.
     * @returns {void}
     */
    onUserClicked(callback) {
        super.onClick(callback, '', 'main-user-element', '#mainBody');
    }
}