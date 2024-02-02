/**
 * @class PopupManager manages the popups on the page
 * @property {Array} popups array to store the popups
 * @property {HTMLElement} popupContainer the container of the popups
 */
class PopupManager {
    constructor() {
        // add the popup css to the page
        Utils.addStyleSheet('style/popups/popups.css');

        // create an array to store the popups
        this.popups = [];
        this.initialize();

        // add the abstract popup parent class to the page and add the specific popups when the parent class is loaded
        Utils.addScript('js/model/popups/Popup.js', () => {
            // when the Popup class is loaded, add the specific popup to the page
            Utils.addScript('js/model/popups/MessagePopup.js', () => this.addPopup(new MessagePopup()));                    // actual Popup
            Utils.addScript('js/model/popups/AddDocumentPopup.js', () => this.addPopup(new AddDocumentPopup()));            // actual Popup
            Utils.addScript('js/model/popups/DocumentClickedPopup.js', () => this.addPopup(new DocumentClickedPopup()));    // actual Popup
        });

    }

    /**
     * Initialize the PopupManager by adding the popupContainer to the page
     */
    async initialize() {
        // take the body element
        let body = document.querySelector('main');

        // add a div with the id popupContainer
        let popupContainer = Utils.createHTMLElement('div', 'popupContainer', 'disabled');

        // add a div with the id popup
        body.appendChild(popupContainer);

        this.popupContainer = popupContainer;
    }

    /**
     * Open a popup with a specific id, throw an error if the popup does not exist
     * @param {string} id id of the popup to open
     * @returns {void}
     */
    open(id) {
        this.popupContainer.classList.remove('disabled');
        if (this.popups[id] === undefined) {
            throw new Error('Popup with id ' + id + ' does not exist');
        }
        this.popups[id].open();
    }

    /**
     * Add a popup to the PopupManager
     * @param {? extends Popup} popup Popup to add to the PopupManager
     */
    addPopup(popup) {
        this.popups[popup.id] = popup;
    }
}