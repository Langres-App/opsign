/**
 * @class PopupManager manages the popups on the page
 */
class PopupManager {

    #popups = [];
    #popupsScripts = [];

    constructor() {
        // add the popup css to the page
        Utils.addStyleSheet('style/popups/popups.css');

        // add the popups scripts to the page depending on the popups that are used
        // [KEY = id of the popup, VALUE = function to add the popup to the PopupManager]
        this.#popupsScripts['message-popup'] = () => this.#addMessagePopup();
        this.#popupsScripts['document-popup'] = () => this.#addDocumentPopup();
        this.#popupsScripts['clicked-popup'] = () => this.#addDocumentClickedPopup();

        // create an array to store the popups
        this.#popups = [];
    }

    /**
     * Add the script to the page and Add the message popup to the PopupManager
     * @returns Promise<void>
     */
    async #addMessagePopup() {
        await this.initialize();
        await Utils.addScript('js/model/popups/Popup.js');
        await Utils.addScript('js/model/popups/MessagePopup.js');
        if (!this.#popups['message-popup']) {
            this.#addPopup(new MessagePopup());
        }
    }

    /**
     * Add the script to the page and Add the add document popup to the PopupManager
     */
    async #addDocumentPopup() {
        await this.initialize();
        await Utils.addScript('js/model/popups/Popup.js');
        await Utils.addScript('js/model/popups/AddDocumentPopup.js');
        if (!this.#popups['document-popup']) {
            this.#addPopup(new AddDocumentPopup());
        }
    }

    /**
     * Add the script to the page and Add the document clicked popup to the PopupManager
     */
    async #addDocumentClickedPopup() {
        await this.initialize();
        await Utils.addScript('js/model/popups/Popup.js');
        await Utils.addScript('js/model/popups/DocumentClickedPopup.js');
        if (!this.#popups['clicked-popup']) {
            this.#addPopup(new DocumentClickedPopup());
        }
    }

    /**
     * Initialize the PopupManager by adding the popupContainer to the page
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
     * @returns Promise<void>
     */
    async open(id) {
        // we check if the script is already added to the page
        if (!this.#popupsScripts[id]) {
            throw new Error('Popup with id ' + id + ' does not exist');
        }

        // we wait for the script to be added to the page before opening the popup
        await this.#popupsScripts[id]();

        // check if the popup to be added to the PopupManager
        if (!this.#popups[id]) {
            throw new Error('Popup with id ' + id + ' does not exist');
        }

        // open the popup and remove the disabled class from the popupContainer
        this.popupContainer.classList.remove('disabled');
        this.#popups[id].open();
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
}