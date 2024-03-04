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

    // initialize the signing view
    this.init();
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
    this.usersManager = await Instantiator.getUserManager();
    let { docId, docName, docDate, userName } = await this.usersManager.getDocAndUserName(Utils.getParamValue('token'));

    // define the document date if it is not present
    if (!docDate) docDate = 'latest';

    // define the document name
    const docTitle = document.getElementById('doc-title');
    docTitle.innerText = docName;

    // define the user name
    const displayName = document.getElementById('display-name');
    displayName.innerText = userName;

    // define the document viewer
    const documentViewer = document.getElementById('document-viewer');
    documentViewer.data = `/charteapi/documents/${docId}/view/${docDate}#toolbar=1&scrollbar=0&view=fitH&navpanes=0`;

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

      // get the blob from the canvas
      const blob = await this.canvasClass.exportToBlob();

      // send the token & blob to api
      const token = Utils.getParamValue('token');
      const link = await this.usersManager.signDocument(token, blob);
      console.log(link);


      // // open the signing link
      // window.open(link, '_blank');
    });
  }
}