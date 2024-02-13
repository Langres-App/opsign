/**
 * @class MessagePopup extends Popup - Represents a message popup with editable title and content
 */
class MessagePopup extends Popup {

    /**
     * The unique identifier for the message popup.
     * @type {string}
     */
    static id = 'message-popup';

    /**
     * Represents a MessagePopup object.
     * @constructor
     */
    constructor() {
        super(MessagePopup.id, 'visual/popups/MessagePopup.html');
    }
    
    /**
     * Opens the message popup.
     * @param {Object} dataMap - The data map containing data to add to the popup.
     * @returns {Promise<void>} - A promise that resolves when the popup is opened.
     */
    async open(dataMap = []) {
        await super.open();

        // add the data to the popup if it exists
        if (dataMap['title']) this.setTitle(dataMap['title']);
        else this.setTitle('');
        
        if (dataMap['message']) this.setMessage(dataMap['message']);
        else this.setMessage('');
    }

    /**
     * Set the title of the message popup
     * @param {HTML} title html code to put in the title (can be a string or a HTMLElement)
     */
    setTitle(title) {
        let titleContainer = document.getElementById('message-popup-title');
        titleContainer.innerHTML = title;
    }

    /**
     * Set the message of the message popup
     * @param {string || HTMLElement} message the message to put in the popup (can be a string or an HTMLElement) 
     */
    setMessage(message) {
        let messageContainer = document.getElementById('message-popup-content');
        messageContainer.innerHTML = message;
    }


}