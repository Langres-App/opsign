/**
 * @class SignedUserTemplateManager - Template manager for the SignedUser
 */
class SignedUserTemplateManager extends TemplateManager {

    /**
     * Constructor of the SignedUserTemplateManager
     * @param {HTMLElement} container Container of the template manager
     */
    constructor(container = null) {
        super(container);
        this.path = 'visual/templates/ListUserTemplate.html';
    }

    /**
     * Adds signed users to the template manager.
     * @param {Array} users - The array of signed users to add.
     * @returns {Promise} - A promise that resolves when all signed users are added.
     */
    async addSignedUsers(users) {
        // add the users to the container
        for (let user of users) {
            await this.addSignedUser(user);
        }
    }

    /**
     * Add a SignedUser to the container
     * @param {SignedUser} user User to be added to the container
     * @returns Promise<void>
     */
    async addSignedUser(user) {
        // values is a map that contains the values to be replaced in the template, 
        // the key is the name of the variable in the template and the value is the value to replace
        let values = [];

        // check if the passed parameter is a SignedUser object
        if (user instanceof SignedUser) {
            values['id'] = user.getId();
            values['DisplayName'] = user.getDisplayName();
            values['SignedDate'] = user.getSignedDate();
            values['DocumentDate'] = user.getDocDate().replace(/-/g, '/');
        }

        // call parent method to add the user to the container
        await super.addTemplate(values);
    }

    /**
     * Action to be performed when the see button is clicked
     * @param {CallableFunction} callback function to be called when the archive button is clicked
     */
    onSeeClicked(callback) {
        super.onClick(callback, 'print', 'user-signed-element', '#list');
    }

    /**
     * Action to be performed when the see button is clicked
     * @param {CallableFunction} callback function to be called when the archive button is clicked
     */
    onArchiveClicked(callback) {
        super.onClick(callback, 'archive', 'user-signed-element', '#list');
    }

}