/**
 * @class PopupManager manages the popups on the page
 */
/**
 * Represents a manager for handling popups.
 */
/**
 * Represents a manager for handling popups.
 */
class PopupManager {

    /**
     * Array containing the popups managed by the PopupManager.
     * @private
     * @type {Array}
     */
    #popups = [];


    /**
     * Array containing the scripts of the popups.
     * @private
     * @type {Array}
     */
    #popupsScripts = [];

    /**
     * Creates a new instance of PopupManager.
     * @constructor
     */
    constructor() {
        // add the popup css to the page
        Utils.addStyleSheet('style/popups/popups.css');

        // add the popups scripts to the page depending on the popups that are used
        // [KEY = id of the popup, VALUE = function to add the popup to the PopupManager]
        this.#popupsScripts['message-popup'] = () => this.#addMessagePopup();
        this.#popupsScripts['document-popup'] = () => this.#addDocumentPopup();
        this.#popupsScripts['clicked-popup'] = () => this.#addDocumentClickedPopup();
        this.#popupsScripts['signing-link-popup'] = () => this.#addSigningLinkPopup();
        this.#popupsScripts['user-clicked-popup'] = () => this.#addUserClickedPopup();

        // create an array to store the popups
        this.#popups = [];
    }

    
    /**
     * Adds a message popup to the popup manager.
     * @private
     * @async
     */
    async #addMessagePopup() {
        await this.initialize();
       
        if (!this.#popups['message-popup']) {
            this.#addPopup(new MessagePopup());
        }
    }

    
    /**
     * Adds a document popup to the PopupManager.
     * @private
     * @async
     */
    async #addDocumentPopup() {
        await this.initialize();

        if (!this.#popups['document-popup']) {
            this.#addPopup(new AddDocumentPopup());
        }
    }

    
    /**
     * Adds a document clicked popup.
     * @private
     * @async
     */
    async #addDocumentClickedPopup() {
        await this.initialize();

        if (!this.#popups['clicked-popup']) {
            this.#addPopup(new DocumentClickedPopup());
        }
    }

    /**
     * Adds a signing link popup.
     * @private
     * @async
     */
    async #addSigningLinkPopup() {
        await this.initialize();

        if (!this.#popups['signing-link-popup']) {
            this.#addPopup(new SigningLinkPopup());
        }
    }

    /**
     * Adds a user clicked popup.
     * @private
     * @async
     */
    async #addUserClickedPopup() {
        await this.initialize();

        if (!this.#popups['user-clicked-popup']) {
            this.#addPopup(new UserClickedPopup());
        }
    }

    
    /**
     * Initializes the PopupManager.
     * @returns {Promise<void>} A promise that resolves once the initialization is complete.
     */
    async initialize() {
        if (this.initialized) return;
        this.initialized = true;

        // take the body element
        let body = document.querySelector('main');

        // add a div with the id popupContainer
        let popupContainer = Utils.createHTMLElement('div', 'popupContainer', 'disabled');

        // add a div with the id popup
        body.appendChild(popupContainer);

        this.popupContainer = document.getElementById('popupContainer');

        // on container clicked, close the popup if the click is outside the popup
        this.popupContainer.addEventListener('click', (e) => {
            if (e.target === this.popupContainer) {
                this.#closeAll();
            }
        });
    }

    /**
     * Open a popup with a specific id, throw an error if the popup does not exist
     * @param {string} id id of the popup to open
     * @param {Array} dataMap Array of data to add to the popup
     * @returns Promise<void>
     */
    async open(id, dataMap = []) {
        // we check if the script is already added to the page
        if (!this.#popupsScripts[id]) {
            throw new Error('Popup with id ' + id + ' does not exist');
        }

        // we wait for the script to be added to the page before opening the popup
        await this.#popupsScripts[id]();

        // open the popup and remove the disabled class from the popupContainer
        this.popupContainer.classList.remove('disabled');
        await this.#popups[id].open(dataMap);

        return this.#popups[id];
    }

    /**
     * Add a popup to the PopupManager
     * @param {? extends Popup} popup Popup to add to the PopupManager
     */
    #addPopup(popup) {
        this.#popups[popup.id] = popup;
    }

    /**
     * Close all the popups and the container (blur)
     */
    #closeAll() {
        for (let popup in this.#popups) {
            this.#popups[popup].close();
        }
    }

    /**
     * Retrieves a popup by its ID.
     * @param {string} id - The ID of the popup.
     * @returns {Object} - The popup object.
     * @throws {Error} - If the popup with the specified ID does not exist.
     */
    getPopup(id) {
        let popup = this.#popups[id];
        // check if the popup exists
        if (popup) {
            return popup;
        }

        // if the popup does not exist, we throw an error
        throw new Error('Popup with id ' + id + ' does not exist');
    }
}