/**
 * @class AddDocumentPopup is a class that extends Popup 
 * Used to create a popup that allows the user to add a document to the database
 */
class AddDocumentPopup extends Popup {

    static id = 'document-popup';

    constructor() {
        super(AddDocumentPopup.id, 'visual/popups/AddDocumentPopup.html');
    }


}