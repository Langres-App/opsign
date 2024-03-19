/**
 * @class SigningLinkPopup - Represents a SigningLinkPopup.
 */
class SigningLinkPopup extends Popup {

    /**
    * The unique identifier for the signing link popup.
    * @type {string}
    */
    static id = 'signing-link-popup';

    /**
     * Represents a SigningLinkPopup.
     * @constructor
     */
    constructor() {
        super(SigningLinkPopup.id, 'visual/popups/SigningLinkPopup.html');
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

        const docId = dataMap['id'];
        const popupManager = dataMap['popupManager'];
        const documentManager = dataMap['manager'];
        const authManager = dataMap['authManager'];

        // get the doc title
        const docName = (await documentManager.getById(docId)).getFileName() || 'Nom du document';
        super.getPopup().querySelector('#signing-docName').innerText = docName;

        // reset the form & remove the disabled style
        popup.querySelector('form').reset();
        const inputs = this.getInputs(popup);
        inputs.firstName.disabled = false;
        inputs.lastName.disabled = false;
        inputs.firstName.classList.remove('deactivated');
        inputs.lastName.classList.remove('deactivated');

        // add the data to the popup
        popup.setAttribute('data-id', dataMap['id']);

        // in case the user manager is not set yet, we set it
        if (!this.userManager) {
            this.userManager = await Instantiator.getUserManager();
        }

        // manage the click events & the input formatting
        this.manageClick(dataMap);
        this.manageInputs();

    }

    /**
     * Retrieves the input elements from the given popup.
     * 
     * @param {HTMLElement} popup - The popup element.
     * @returns {Object} - An object containing the input elements.
     */
    getInputs(popup) {
        return {
            email: popup.querySelector('#signing-email'),
            firstName: popup.querySelector('#user-first-name'),
            lastName: popup.querySelector('#user-last-name'),
        };
    }

    /**
     * Manages the inputs in the SigningLinkPopup.
     */
    manageInputs() {
        let popup = super.getPopup();
        let inputs = this.getInputs(popup);

        // format the email input to have all lowercase letters and remove any weird chars but let the @ and the underscore
        inputs.email.addEventListener('input', () => {
            // make email lower case and only accept email format allow the underscore and dash

            inputs.email.value = inputs.email.value.toLowerCase().replace(/[^a-zA-Z0-9@._-]/g, '');
        });

        // when the email loses focus we check if the user exists & fill the first and last name if he does
        inputs.email.addEventListener('blur', async () => {
            // call api to get the user if he exists (auto fill the first and last name if he exists)
            const data = await this.userManager.getByEmail(inputs.email.value);

            // if the user does not exist we can edit the first and last name
            inputs.firstName.disabled = data;
            inputs.lastName.disabled = data;

            // if the user does not exist we clear the inputs & remove the disabled style
            if (!data) {
                inputs.firstName.classList.remove('deactivated');
                inputs.lastName.classList.remove('deactivated');
                inputs.firstName.value = inputs.lastName.value = '';
                return;
            }

            // add disabled style 
            inputs.firstName.classList.add('deactivated');
            inputs.lastName.classList.add('deactivated');

            // fill the inputs with the user data
            inputs.firstName.value = data.first_name;
            inputs.lastName.value = data.last_name;
        });

        // format the first name input to have the first letter of each word uppercase and the rest lowercase
        inputs.firstName.addEventListener('input', () => {
            // make the first letter of each word uppercase and the rest lowercase and remove any weird chars but let dashes
            inputs.firstName.value = inputs.firstName.value.replace(/[^a-zA-Z\s-]/g, '').replace(/\b\w/g, l => l.toUpperCase());
        });

        // format the last name input to have all uppercase letters and remove any weird chars like numbers ',' '.' etc
        inputs.lastName.addEventListener('input', () => {
            // make every thing uppercase
            inputs.lastName.value = inputs.lastName.value.toUpperCase();

            // remove any weird chars but not spaces
            inputs.lastName.value = inputs.lastName.value.replace(/[^a-zA-Z\s]/g, '');
        });
    }

    /**
     * Handles the click events for the signing link popup.
     */
    manageClick(dataMap) {
        let popup = super.getPopup();

        // duplicate whole popup
        let clone = popup.cloneNode(true);
        popup.replaceWith(clone);
        popup = clone;

        // add the close listener to the new popup
        super.addCloseListener();

        // get the doc title
        const docName = dataMap['name'] || 'Nom du document';

        // actions to be taken when the popup is clicked
        const actions = {
            'signing-link-copy': async (_, link) => await this.copyToClipboard(link),
            'signing-link-mailto': async (user, link) => {
                // send the mail
                window.location.href = `mailto:${user.identifier}?subject=Signature du document ${docName}&body=Bonjour ${user.first_name} ${user.last_name},%0D%0AMerci de signer ce document à l'adresse suivante : ${link}.%0D%0ACordialement.`;
            }
        };


        // on popup click log what was clicked
        popup.addEventListener('submit', async (e) => {
            e.preventDefault();

            // check if the user exists (if the fields are disabled)
            const userExists = popup.querySelector('#user-first-name').disabled;

            // create the user object depending on if he exists or not
            const user = {
                identifier: popup.querySelector('#signing-email').value,
                first_name: popup.querySelector('#user-first-name').value,
                last_name: popup.querySelector('#user-last-name').value
            };

            // call the api to add the user if he does not exist
            try {
                if (!userExists) await this.userManager.addUser(user);
                let link = await this.userManager.generateSigningLink({ email: user.identifier, documentId: dataMap['id'] });
                actions[e.submitter.id](user, link);
            } catch (e) {
                alert(e.message);
            }

        });


    }

    /**
     * Copies the given value to the clipboard.
     * 
     * @param {string} val - The value to be copied to the clipboard.
     * @returns {Promise<void>} - A promise that resolves when the value is successfully copied to the clipboard.
     */
    async copyToClipboard(val) {
        // deprecated but still works | another way would be to use the clipboard API but would require a secure context (https)
        const textArea = document.createElement("textarea");
        textArea.value = val;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            alert('Lien copié dans le presse papier');
        } catch (err) {
            console.error('Unable to copy to clipboard', err);
        }
        document.body.removeChild(textArea);


    }
}