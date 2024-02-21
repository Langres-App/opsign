/**
 * @class AddDocumentPopup is a class that extends Popup 
 * Used to create a popup that allows the user to add a document to the database
 */
class AddDocumentPopup extends Popup {

    /**
     * The unique identifier for the document popup.
     * @type {string}
     */
    static id = 'document-popup';

    /**
     * Represents the state of the AddDocumentPopup.
     * @enum {string}
     * @readonly
     * @property {string} ADD - The state for adding a document.
     * @property {string} EDIT - The state for editing a document.
     * @property {string} ADD_VERSION - The state for adding a document version.
     */
    static state = {
        ADD: 'add',
        EDIT: 'edit',
        ADD_VERSION: 'add-version',
    }

    constructor() {
        super(AddDocumentPopup.id, 'visual/popups/AddDocumentPopup.html');
    }

    /**
     * Opens the add document popup.
     * @returns {Promise<void>} - A promise that resolves when the popup is opened.
     */
    async open(dataMap = []) {
        await super.open();
        this.updateForm(dataMap);
        return;
    }

    /**
     * Resets the form in the AddDocumentPopup.
     */
    #resetForm() {
        // Get the elements of the popup
        let form = super.getPopup().querySelector('form');
        let p = super.getPopup().querySelector('#details');

        // reset the values
        form.reset();

        // reset the state / style
        form = form.elements;
        form['document-file'].parentElement.style.display = 'flex';
        form['document-name'].disabled = false;
        p.classList.add('disabled');
        form['popup-close'].value = 'Annuler';

    }

    /**
     * Updates the form of the AddDocumentPopup based on the provided dataMap.
     * 
     * @param {Object} dataMap - The data map containing the necessary information for updating the form.
     */
    updateForm(dataMap) {
        // Get the elements of the popup
        const title = super.getPopup().querySelector('#document-popup-title');
        const add_version_details = super.getPopup().querySelector('#details');
        let form = super.getPopup().querySelector('form');
       
        // Get the form elements
        form = form.elements;

        // Set the state of the popup
        dataMap['state'] = dataMap['state'] || AddDocumentPopup.state.ADD;

        // Reset the form to its default state
        this.#resetForm();

        // Set the title of the popup
        switch (dataMap['state']) {
            case AddDocumentPopup.state.ADD:
                title.innerHTML = 'Ajouter un document';
                break;
            case AddDocumentPopup.state.EDIT:
                title.innerHTML = 'Renommer un document';
                break;
            case AddDocumentPopup.state.ADD_VERSION:
                title.innerHTML = 'Ajouter une nouvelle version';
                add_version_details.classList.remove('disabled');
                break;
        }

        // Get the document and manager from the dataMap
        let manager = dataMap['manager'];
        let doc = manager.getDocument(dataMap['id']) || new PoDocument();

        // if the state isn't add we replace the close button by a clone with a different onclick
        if (dataMap['state'] !== AddDocumentPopup.state.ADD) {
            // replace the close button by a clone
            form['popup-close'].replaceWith(form['popup-close'].cloneNode(true));
            form['popup-close'].value = 'Retour';

            // set the onclick of the new close button to go back to the clicked-popup
            form['popup-close'].onclick = () => {
                super.close();
                // if the state isn't add we open the document clicked popup
                if (dataMap['state'] !== AddDocumentPopup.state.ADD) {
                    dataMap['popupManager'].open('clicked-popup', dataMap);
                }
            }
        }

        // set the form values & states to the dataMap values 
        form['document-name'].value = doc.getFileName() || '';
        
        // disable and lower the opacity of the name input if the state is ADD_VERSION
        form['document-name'].style.opacity = dataMap['state'] === AddDocumentPopup.state.ADD_VERSION ? 0.5 : 1;
        form['document-name'].disabled = dataMap['state'] === AddDocumentPopup.state.ADD_VERSION;

        // get the last version of the document or create a new one
        let version = doc.getLastVersion() || new Version();

        // set the date to the current date if the state is ADD
        form['document-date'].value = dataMap['state'] === AddDocumentPopup.state.EDIT ? version.getAddDate() : new Date().toISOString().split('T')[0];
        form['document-file'].parentElement.style.display = dataMap['state'] === AddDocumentPopup.state.EDIT ? 'none' : 'flex';
        form['document-date'].parentElement.style.display = dataMap['state'] === AddDocumentPopup.state.EDIT ? 'none' : 'flex';

        // replace the submit button by a clone to remove any older eventListener
        form['document-submit'].replaceWith(form['document-submit'].cloneNode(true));
        form['document-submit'].innerHTML = dataMap['state'] === AddDocumentPopup.state.EDIT ? 'Modifier' : 'Ajouter';


        // onclick of the submit button
        super.getPopup().querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('submit');

            // do the necessary action depending on the state
            switch (dataMap['state']) {
                case AddDocumentPopup.state.ADD:
                    this.addDocumentWithVersion(manager, form);
                    break;
                case AddDocumentPopup.state.EDIT:
                    this.editDocument(manager, form);
                    break;
                case AddDocumentPopup.state.ADD_VERSION:
                    this.addVersion(manager, form);
                    break;
            }

            /**
             * Closes the popup.
             */
            super.close();
        });
    }

    /**
     * Adds a document with a version to the manager.
     * 
     * @param {DocumentManager} manager - The manager object.
     * @param {HTMLFormElement} form - The form containing the document details.
     * @returns {Promise} - A promise that resolves when the document and version are added to the database.
     */
    async addDocumentWithVersion(manager, form) {
        
        // Create the document and version objects from the form
        let doc = new PoDocument();
        doc.setFileName(form['document-name'].value);

        let ver = new Version();
        ver.setFile(form['document-file'].files[0]);
        ver.setAddDate(form['document-date'].value);

        // Add the version to the document
        doc.addVersion(ver);

        console.log(doc);

        // Add the document to the database
        console.log(form);

        const data = new FormData();
        data.append('title', form['document-name'].value);
        data.append('file', form['document-file'].files[0]);
        data.append('date', form['document-date'].value);

        manager.add(data)
        .then(() => {})
        .catch(e => console.error(e));
    }

    async editDocument(manager, form) {

    }

    async addVersion(manager, form) {

    }





}