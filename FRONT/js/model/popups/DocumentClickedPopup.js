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
     * Array of actions for the document clicked popup.
     * @type {Array<Object>}
     */
    #actions = [
        {
            name: 'Voir le document',
            id: 'view-document-button',
            admin_only: false,
            action: (_, docId) => {
                super.close();
                // open a new page with the same root page path 
                window.open(`/posignapi/documents/${docId}/view/latest`, '_blank');
            },
            archive_button: false
        },
        {
            name: 'Signer le document',
            id: 'sign-document-button',
            admin_only: false,
            action: (_, __) => { 
                window.location.href = Utils.getRelativePathToRoot() + 'visual/pages/signing.html';
             },
            archive_button: false
        },
        {
            name: 'Signataires',
            id: 'sign-button',
            admin_only: false,
            action: (_, docId) => {
                // redirect to the signing list page with the document id
                window.location.href = Utils.getRelativePathToRoot() + 'visual/pages/signedList.html?id=' + docId;
            },
            archive_button: false
        },
        {
            name: 'Générer un lien de signature',
            id: 'signing-link-button',
            admin_only: true,
            action: (dataMap, _) => {
                const popupManager = dataMap['popupManager'];

                // open the generation of the signing link popup
                super.close();
                popupManager.open('signing-link-popup', dataMap);
            },
            archive_button: false
        },
        {
            name: 'Nouvelle Version',
            id: 'add-version-button',
            admin_only: true,
            action: (dataMap, docId) => {
                const popupManager = dataMap['popupManager'];

                super.close();
                popupManager.open('document-popup', {
                    state: AddDocumentPopup.state.ADD_VERSION,
                    id: docId,
                    popupManager: dataMap['popupManager'],
                    manager: dataMap['manager'],
                    logged: dataMap['logged'],
                    archived: dataMap['archived']
                });
            },
            archive_button: false
        },
        {
            name: 'Renommer',
            id: 'rename-button',
            admin_only: true,
            action: (dataMap, docId) => {
                const popupManager = dataMap['popupManager'];

                super.close();
                popupManager.open('document-popup', {
                    state: AddDocumentPopup.state.EDIT,
                    id: docId,
                    popupManager: dataMap['popupManager'],
                    manager: dataMap['manager'],
                    logged: dataMap['logged'],
                    archived: dataMap['archived']
                });
            },
            archive_button: false
        },
        {
            name: 'Archiver',
            id: 'archive-button',
            admin_only: true,
            action: async (dataMap, docId) => {
                const documentManager = dataMap['manager'];
                const popupManager = dataMap['popupManager'];

                super.close();

                let messageContent;
                try {
                    // archive the document
                    await documentManager.archive(docId);
                    messageContent = `Le document ${this.document.getFileName()} a été archivé avec succès.
                    Vous pouvez le retrouver dans la liste des documents archivés. (connexion requise)`;
                } catch (e) {
                    console.log(e);
                    messageContent = `Une erreur est survenue lors de l'archivage du document ${this.document.getFileName()}. Veuillez réessayer.`;
                } finally {
                    popupManager.open('message-popup', {
                        title: 'Archivage du document',
                        message: messageContent
                    });
                }
            },
            archive_button: false
        },
        {
            name: 'Restaurer',
            id: 'restore-button',
            admin_only: true,
            action: async (dataMap, docId) => { 
                const documentManager = dataMap['manager'];
                const popupManager = dataMap['popupManager'];

                super.close();

                let messageContent;
                try {
                    // archive the document
                    await documentManager.unarchive(docId);
                    messageContent = `Le document ${this.document.getFileName()} a été désarchivé avec succès.
                    Vous pouvez le retrouver dans la liste des documents non archivés.`;
                } catch (e) {
                    console.log(e);
                    messageContent = `Une erreur est survenue lors du désarchivage du document ${this.document.getFileName()}. Veuillez réessayer.`;
                } finally {
                    popupManager.open('message-popup', {
                        title: 'Désarchivage du document',
                        message: messageContent
                    });
                }
             },
            archive_button: true
        },
        {
            name: 'Supprimer définitivement',
            id: 'delete-button',
            admin_only: true,
            action: async (dataMap, docId) => {
                const documentManager = dataMap['manager'];
                const popupManager = dataMap['popupManager'];

                super.close();

                let messageContent;
                try {
                    const resp = confirm(`Êtes-vous sûr de vouloir supprimer définitivement le document ${this.document.getFileName()} ?`);

                    if (!resp) return;

                    // archive the document
                    await documentManager.delete(docId);
                    messageContent = `Le document ${this.document.getFileName()} a été supprimé avec succès.`;
                } catch (e) {
                    console.log(e);
                    messageContent = `Une erreur est survenue lors de la suppression définitive du document ${this.document.getFileName()}. Veuillez réessayer.`;
                } finally {
                    if (!messageContent) return;
                    
                    popupManager.open('message-popup', {
                        title: 'Suppression définitive du document',
                        message: messageContent
                    });
                }
             },
            archive_button: true
        }
    ]

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
        this.document = await dataMap['manager'].getById(docId);
        title.innerHTML = this.document.getFileName() || 'Document';

        // add the action buttons depending on the user's and page's state
        this.addActionButtons(dataMap);

    }

    /**
     * Adds action buttons to the popup.
     * 
     * @param {Object} dataMap - The data map containing information for the buttons.
     */
    addActionButtons(dataMap) {
        const isLogged = dataMap['logged'];
        const isArchived = dataMap['archived'];

        // get the container for the buttons
        const buttonsContainer = super.getPopup().querySelector('.buttons');
        buttonsContainer.innerHTML = '';

        // get the buttons to display (depending on the user's state and the page's state)
        const buttons = this.#actions.filter(action => {
            return (action.admin_only ? isLogged : true) && isArchived === action.archive_button;
        });

        // add the buttons to the container
        buttons.forEach(button => {
            const btn = Utils.createHTMLElement('div', '', 'button');
            const text = Utils.createHTMLElement('p');
            text.innerHTML = button.name;
            btn.appendChild(text);
            btn.addEventListener('click', () => button.action(dataMap, dataMap['id']));
            buttonsContainer.appendChild(btn);
        });
    }
}