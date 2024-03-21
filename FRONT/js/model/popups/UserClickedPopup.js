/**
 * @class UserClickedPopup - Represents a popup that is opened when a user is clicked.
 * @extends Popup
 */
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

    /**
     * Initializes the UserClickedPopup.
     * 
     * @returns {Promise<void>} A promise that resolves when the initialization is complete.
     */
    async initialize() {
        if (this.initialized) return;

        this.initialized = true;

        const archiveButton = this.getPopup().querySelector('#archiveUser');
        archiveButton.addEventListener('click', async () => {
            const confirmRes = confirm('Voulez-vous vraiment archiver cet utilisateur ?');
            if (confirmRes) {
                try {
                    await this.userManager.archive(this.userId);
                    alert('Utilisateur archivé avec succès');
                    window.location.reload();
                } catch (e) {
                    alert('Erreur lors de l\'archivage de l\'utilisateur');
                    console.log(e);
                }
            }
        });

        // add the stylesheet
        Utils.addStyleSheet('style/templates/main-user-doc-template.css');

        // init the template managers
        await this.initDocSignedTemplateManager();
        await this.initDocWaitingTemplateManager();
    }

    /**
     * Initializes the document signed template manager.
     * @returns {Promise<void>} A promise that resolves when the initialization is complete.
     */
    async initDocSignedTemplateManager() {
        const container = this.getPopup().querySelector('.signed-docs');
        this.DocSignedTM = await Instantiator.mainUserDocSignedTemplateManager(container);

        this.DocSignedTM.onUpdateClick(async (uvId) => {
            const user = await this.userManager.getById(this.userId);
            const userDoc = user.docs_signatures.find(doc => doc.user_version_id == uvId);

            const resp = await this.userManager.generateSigningLink({ email: user.email, documentId: userDoc.id });

            const confirmRes = confirm('Voulez-vous envoyer par email le lien de signature à cet utilisateur ?');

            if (confirmRes) {
                const mailTo = `mailto:${user.email}?subject=Signature du document ${doc.title}&body=Bonjour ${user.display_name},%0D%0AMerci de signer ce document à l'adresse suivante : ${resp}.%0D%0ACordialement.`;
                window.open(mailTo, '_blank');
                window.location.reload();
            } else {
                alert('Pour accéder au token, veuillez réinitialiser la page et revenir sur cette popup.');
            }

        });

        this.DocSignedTM.onDocClick(async (uvId) => {
            await this.userManager.print(uvId);
        });

        this.DocSignedTM.onDeleteClick(async (uvId) => {
            const user = await this.userManager.getById(this.userId);
            const userDoc = user.docs_signatures.find(doc => doc.user_version_id == uvId);
            const confirmRes = confirm('Voulez-vous vraiment supprimer cette signature ?');
            if (confirmRes) {
                try {
                    await this.userManager.deleteSignatures(this.userId, userDoc.id);
                    alert('Signature(s) supprimée avec succès');
                    window.location.reload();
                } catch (e) {
                    alert('Erreur lors de la suppression de la signature');
                    console.log(e);
                }
            }
        });
    }

    /**
     * Initializes the document waiting template manager.
     * @returns {Promise<void>} A promise that resolves when the initialization is complete.
     */
    async initDocWaitingTemplateManager() {
        const container = this.getPopup().querySelector('.waiting-docs');
        this.DocWaitingTM = await Instantiator.mainUserDocWaitingTemplateManager(container);

        this.DocWaitingTM.onEmailClick(async (docId) => {
            const user = await this.userManager.getById(this.userId);
            const doc = user.docs_waiting.find(doc => doc.id == docId);
            const token = doc.signing_token;

            const link = document.location.origin + '/posign/visual/pages/signing.html?token=' + token;
            const mailTo = `mailto:${user.email}?subject=Signature du document ${doc.title}&body=Bonjour ${user.display_name},%0D%0AMerci de signer ce document à l'adresse suivante : ${link}.%0D%0ACordialement.`;
            window.open(mailTo, '_blank');
        });

        this.DocWaitingTM.onCopyClick(async (docId) => {
            const user = await this.userManager.getById(this.userId);
            const doc = user.docs_waiting.find(doc => doc.id == docId);
            const token = doc.signing_token;

            await Utils.copyToClipboard(token);
            alert('Code de signature copié dans le presse-papier');
        });

        this.DocWaitingTM.onDeleteClick(async (docId) => {
            const user = await this.userManager.getById(this.userId);
            const doc = user.docs_waiting.find(doc => doc.id == docId);
            const token = doc.signing_token;

            const confirmRes = confirm('Voulez-vous vraiment supprimer ce lien de signature ?');
            if (confirmRes) {
                try {
                    await this.userManager.deleteSignatureToken(this.userId, token);
                    alert('Signature(s) supprimée avec succès');
                    window.location.reload();
                } catch (e) {
                    alert('Erreur lors de la suppression de la signature');
                }
            }
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

        let popup = this.getPopup();
        this.userManager = dataMap['manager'];
        this.userId = dataMap['id'];

        // initialize the popup
        await this.initialize();

        const user = await this.userManager.getById(this.userId, false);

        popup.querySelector('#user-name').innerText = user.display_name;

        if (user.docs_signatures.length == 0) {
            popup.querySelector('.signed').style.display = 'none';
        } else {
            popup.querySelector('.signed').style.display = 'block';
        }

        if (user.docs_waiting.length == 0) {
            popup.querySelector('.waiting').style.display = 'none';
        } else {
            popup.querySelector('.signed').style.display = 'block';
        }

        this.DocSignedTM.clearContainer();
        this.DocWaitingTM.clearContainer();

        await this.DocSignedTM.addSignedDocs(user.docs_signatures);
        await this.DocWaitingTM.addWaitingDocs(user.docs_waiting);


    }
}