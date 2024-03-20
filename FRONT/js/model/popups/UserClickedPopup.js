class UserClickedPopup extends Popup {

    /**
    * The unique identifier for the popup.
    * @type {string}
    */
    static id = 'user-clicked-popup';

    /**
     * Represents a SigningLinkPopup.
     * @constructor
     */
    constructor() {
        super(UserClickedPopup.id, 'visual/popups/MainUserPopup.html');

    }

    async initialize() {
        if (this.initialized) return;

        this.initialized = true;

        // add the stylesheet
        Utils.addStyleSheet('style/templates/main-user-doc-template.css');

        // init the template managers
        await this.initDocSignedTemplateManager();
        await this.initDocWaitingTemplateManager();
    }

    async initDocSignedTemplateManager() {
        const container = this.getPopup().querySelector('.signed-docs');
        this.DocSignedTM = await Instantiator.mainUserDocSignedTemplateManager(container);

        this.DocSignedTM.onUpdateClick(async (docId) => {
            console.log('update clicked', docId);
        });

        this.DocSignedTM.onDocClick(async (docId) => {
            console.log('doc clicked', docId);
        });

        this.DocSignedTM.onDeleteClick(async (docId) => {
            console.log('delete clicked', docId);
        });
    }

    async initDocWaitingTemplateManager() {
        const container = this.getPopup().querySelector('.waiting-docs');
        this.DocWaitingTM = await Instantiator.mainUserDocWaitingTemplateManager(container);

        this.DocWaitingTM.onEmailClick(async (docId) => {
            console.log('email clicked', docId);
        });

        this.DocWaitingTM.onCopyClick(async (docId) => {
            console.log('copy clicked', docId);
        });

        this.DocWaitingTM.onDeleteClick(async (docId) => {
            console.log('delete clicked', docId);
        });
    }

    /**
     * Opens the SigningLinkPopup and adds data to it.
     * 
     * @param {Array} dataMap - An array containing the data to be added to the popup.
     * @returns {Promise<void>} - A promise that resolves when the popup is opened and data is added.
     */
    async open(dataMap = []) {
        // we wait for the super.open to be done before doing anything else 
        // (because open also add the popup to the DOM if not used before and we need to access it to add the data to it)
        await super.open();

        // initialize the popup
        await this.initialize();

        let popup = this.getPopup();
        const userManager = dataMap['manager'];

        const userId = dataMap['id'];
        const user = await userManager.getById(userId, false);

        popup.querySelector('#user-name').innerText = user.display_name;

        this.DocSignedTM.clearContainer();
        this.DocWaitingTM.clearContainer();

        await this.DocSignedTM.addSignedDocs(user.docs_signatures);
        await this.DocWaitingTM.addWaitingDocs(user.docs_waiting);


    }
}