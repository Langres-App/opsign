/**
 * @class SigningView - The signing view.
 * @extends View
 */
class SigningView extends View {

  /**
   * Constructs a new SigningView object.
   * @constructor
   * @param {AuthManager} authManager - The authentication manager.
   */
  constructor(authManager) {
    super();

    // check the authentication (update the header & check the auth token)
    authManager.check();

    Instantiator.getUserManager().then(async (usersManager) => {
      // initialize the users manager
      this.usersManager = usersManager;
      
      // get the token wether it is in the url or not
      await this.getToken();

      // initialize the signing view
      this.init();
    });
  }

  /**
   * Retrieves the token from the URL parameter or prompts the user to enter it.
   * If the token is not provided or is empty, it keeps prompting until a valid token is entered.
   * After obtaining the token, it confirms the token with the user and updates the URL with the token.
   * @returns {Promise<void>} A promise that resolves when the token is obtained and confirmed.
   */
  async getToken() {

    this.token = Utils.getParamValue('token');

    if (!this.token) {

      // ask for the token until a valid one is entered 
      do {
        do {
          this.token = prompt('Veuillez entrer le token de signature');

        // if the user cancels the prompt, redirect to the charte page
          if (!this.token) window.location = '/charte'
          this.token = this.token.trim()
        } while (this.token === '')

        this.confirm = confirm(`Le token de signature est : ${this.token}\nConfirmez-vous ?`);

      } while (!this.confirm);

      window.location = window.location.pathname + '?token=' + this.token;
    }

  }

  /**
   * Initializes the signing view.
   * @returns {Promise<void>} A promise that resolves when the initialization is complete.
   */
  async init() {
    // initialize the visual data and canvas logic
    await Promise.all([
      this.initVisualData(),
      this.initCanvasLogic(),
    ]);

    // initialize the signing button after the visual data and canvas logic
    this.initSigningButton();
  }

  /**
   * Initializes the visual data for the signing view.
   * Retrieves the document and user information, and sets the document title, user name, and document viewer.
   * @returns {Promise<void>} A promise that resolves when the visual data is initialized.
   */
  async initVisualData() {
    // get the document and user name
    let { docId, docName, docDate, userName } = await this.usersManager.getDocAndUserName(this.token);

    // define the document date if it is not present
    if (!docDate) docDate = 'latest';

    const date = docDate.split('/').reverse().join('-');

    // define the document name
    const docTitle = document.getElementById('doc-title');
    docTitle.innerText = docName;

    // define the user name
    const displayName = document.getElementById('display-name');
    displayName.innerText = userName;

    // define the document viewer
    const documentViewer = document.getElementById('document-viewer');
    documentViewer.data = `/charteapi/documents/${docId}/view/${date}#toolbar=1&scrollbar=0&view=fitH&navpanes=0`;

  }

  /**
   * Initializes the canvas logic.
   * @returns {Promise<void>}
   */
  async initCanvasLogic() {
    // get the canvas class
    this.canvasClass = await Instantiator.canvas(document.getElementById('signature'));

    // get the clear button
    const clearButton = document.getElementById('clear-canvas');

    // add the clear button event listener
    clearButton.addEventListener('click', () => {
      this.canvasClass.clearCanvas();
    });
  }

  /**
   * Initializes the signing button.
   * @returns {Promise<void>} A promise that resolves when the signing button is initialized.
   */
  async initSigningButton() {
    // get the signing button
    const signingButton = document.getElementById('signing-button');

    // add the signing button event listener
    signingButton.addEventListener('click', async () => {

      // ask the user if they have signed the document (to confirm)
      const hasSigned = confirm('Avez-vous bien signé le document ?');

      // if the user has not signed, return
      if (!hasSigned) return;

      // get the blob from the canvas
      const blob = await this.canvasClass.exportToBlob();

      // send the token & blob to api and retreive the signed doc as a blob
      const signedDocBlob = await this.usersManager.signDocument(this.token, blob);

      alert('Votre document signé va être ouvert dans un nouvel onglet (usage unique), si vous avez besoin de le télécharger, veuillez le faire maintenant.\nVous pourrez toujours le redemander par la suite à l\'administrateur.\nMerci de votre compréhension.');

      // open the signed document
      const link = URL.createObjectURL(signedDocBlob);
      window.open(link, '_blank');

      window.location.href = '/charte';

    });
  }
}