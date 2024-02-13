/**
 * @class Popup is an abstract class to create popups
 */
class Popup {

    /**
     * The unique identifier for the popup.
     * @type {string}
     */
    static id = 'popup';

    /**
     * Constructor for the Popup class
     * @param {string} id id of the popup (should be the one from the file template)
     * @param {string} path Path from the root to the popup template 
     */
    constructor(id, path) {
        this.id = id;
        this.path = path;

        // get the popup container
        this.popupContainer = document.getElementById('popupContainer');
    }

    /**
     * Function to get the popup element FROM the DOM
     * @returns {HTMLElement} the popup element
     */
    getPopup() {
        return document.getElementById(this.id);
    }

    /**
     * Function to get the content of the popup FROM the file
     * @returns {Promise<string>} the content of the popup
     */
    async getContent() {
        return Utils.readLocalFile(this.path);
    }

    /**
     * Initialize the popup
     * Add the content to the popupContainer and add the event listener to the close button
     * Add a call to this function at the end of the constructor of the specific popup
     */
    async init() {
        // get the content of the popup and add it to the popup container
        const content = await this.getContent();
        this.popupContainer.innerHTML += content;

        // set the initiated variable to true to avoid multiple initiations
        this.initiated = true;
    }

    /**
     * Add a listener to the close button of the popup
     */
    addCloseListener() {
        // get the close button and add the listener to close the popup
        let close = this.getPopup().querySelector('.button.close');

        // clone the close button to remove the listener
        let newClose = close.cloneNode(true);

        // replace the close button with the new close button
        close.parentNode.replaceChild(newClose, close);

        // add the listener to the new close button
        newClose.addEventListener('click', () => this.close());
    }

    /**
     * Open the popup
     */
    async open() {
        // check if the popup is already initiated or not and initiate it if not
        if (!this.initiated)
            await this.init();

        // check if the close listener is already added or not and add it if not
        this.addCloseListener();

        // open the popup
        this.getPopup().classList.remove('disabled');
        
    }

    /**
     * Close the popup
     */
    close() {
        this.getPopup().classList.add('disabled');
        this.popupContainer.classList.add('disabled');
    }
}