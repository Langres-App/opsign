/**
 * @class MessagePopup extends Popup - Represents a message popup with editable title and content
 */
class MessagePopup extends Popup {
    constructor() {
        super('message-popup', 'visual/popups/MessagePopup.html');
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