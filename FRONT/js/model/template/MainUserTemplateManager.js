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

        // order the user by the number of documents waiting to be signed
        users.sort((a, b) => a.docs_waiting.length - b.docs_waiting.length);

        // add the users to the container
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

        if (!user.archived_date) {
            const signedCount = user.docs_signatures.length;
            const outdatedCount = user.docs_signatures.filter(doc => doc.toUpdate === true).length;
            const waitingCount = user.docs_waiting.length;

            values['DisplayName'] = user.display_name;
            values['Signed'] = signedCount < 10 ? '0' + signedCount : signedCount;
            values['Outdated'] = outdatedCount < 10 ? '0' + outdatedCount : outdatedCount;
            values['Waiting'] = waitingCount < 10 ? '0' + waitingCount : waitingCount;
            values['archived'] = '';
            values['showText'] = 'disabled';
        } else {
            values['DisplayName'] = user.first_name + ' ' + user.last_name;
            values['showText'] = '';
            values['archived'] = 'disabled';
            values['Date'] = new Date(user.archived_date).toLocaleDateString();
        }

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

    /**
     * Handles the click event for the "Unarchive User" button.
     *
     * @param {Function} callback - The callback function to be executed when the button is clicked.
     * @returns {void}
     */
    onUnarchiveUserClicked(callback) {
        super.onClick(callback, 'unarchiveUser', 'main-user-element', '#mainBody');
    }

    /**
     * Handles the click event when the user clicks on the delete user button.
     *
     * @param {Function} callback - The callback function to be executed when the delete user button is clicked.
     * @returns {void}
     */
    onDeleteUserClicked(callback) {
        super.onClick(callback, 'deleteUser', 'main-user-element', '#mainBody');
    }
}