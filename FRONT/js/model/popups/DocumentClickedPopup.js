/**
 * @class DocumentClickedPopup is a class that extends Popup 
 * Represents a popup that appears when a document is clicked in the index
 */
class DocumentClickedPopup extends Popup {

    /**
     * The unique identifier for the clicked popup.
     * @type {string}
     */
    static id = 'clicked-popup';

    /**
     * Represents a DocumentClickedPopup.
     * @constructor
     */
    constructor() {
        super(DocumentClickedPopup.id, 'visual/popups/DocumentClickedPopup.html');
    }


    /**
     * Opens the DocumentClickedPopup and sets the data.
     * @param {Object} dataMap - The data map containing the document id.
     * @throws {Error} Throws an error if the document id is not set.
     * @returns {Promise<void>} A promise that resolves when the popup is opened.
     */
    async open(dataMap = []) {
        // we wait for the super.open to be done before doing anything else 
        // (because open also add the popup to the DOM if not used before and we need to access it to add the data to it)
        await super.open();

        // add the data to the popup
        let docId = dataMap['id'];

        // if the document id is not set, we throw an error
        if (!docId) throw Error('Document id must be set to config the DocumentClickedPopup');

        // get the data from the dataMap
        let popup = this.getPopup();
        popup.setAttribute('data-id', docId);

        // set the title of the popup
        let title = popup.querySelector('#document-popup-title');
        title.innerHTML = "Document n°" + docId;

        // manage the click events
        this.manageClick(dataMap);

    }

    /**
     * Handles the click events for the document popup.
     * @param {Object} dataMap - The data map containing the necessary information.
     */
    manageClick(dataMap) {

        // get the data from the dataMap
        let docId = dataMap['id'];
        let popupManager = dataMap['popupManager'];
        let documentManager = dataMap['manager'];

        // get the buttons
        let buttons = super.getPopup().querySelectorAll('.button:not(#close-button)');

        // replace every button by a clone (which don't have any eventListener)
        buttons.forEach(button => button.replaceWith(button.cloneNode(true)));


        // add the eventListeners to the buttons
        super.getPopup().querySelector('#sign-button').addEventListener('click', async () => {
            super.close();
            let link = await (await Instantiator.getDocumentManager()).generateSigningLink();
            popupManager.open('message-popup', {title: 'Lien généré avec succès', message: `Le lien de signature pour ce document est : ${link}`});
        });

        // signing list button clicked, redirect to the signing list page
        super.getPopup().querySelector('#signing-list-button').addEventListener('click', () => {
            // redirect to the signing list page with the document id
            window.location.href = Utils.getRelativePathToRoot() + 'visual/pages/signedList.html?id=' + docId;
        });

        // add version button clicked, open the document popup with the add version state
        super.getPopup().querySelector('#add-version-button').addEventListener('click', () => {
            super.close();
            popupManager.open('document-popup', {
                state: AddDocumentPopup.state.ADD_VERSION,
                id: docId,
                popupManager, popupManager,
                manager: documentManager
            });
        });

        // update button clicked, open the document popup with the edit state
        super.getPopup().querySelector('#update-button').addEventListener('click', () => {
            super.close();
            popupManager.open('document-popup', {
                state: AddDocumentPopup.state.EDIT,
                id: docId,
                popupManager, popupManager,
                manager: documentManager
            });
        });

        // archive button clicked, archive the document
        super.getPopup().querySelector('#archive-button').addEventListener('click', () => {
            super.close();
            // TODO: archive the document
            popupManager.open('message-popup', {
                title: 'Archivage du document',
                message: 'Le document a bien été archivé'
            });
        });
    }
}