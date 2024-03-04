/**
 * @class IndexView - The view of the index page
 * @extends View
 */
class IndexView extends View {

  /**
   * Constructs a new instance of the class.
   */
  constructor(authManager) {
    super();
    this.manager = authManager;
    this.documentManager = null;
    Utils.addStyleSheet('style/templates/document-template.css');

    // add the add button functionality if the user is logged in
    document.addEventListener('USER_LOGGED_IN', () => this.enableAddButton());
    document.addEventListener('USER_NOT_LOGGED_IN', () => this.disableAddButton());

    this.instantiateDocumentManager().then(() => {
      // add the documents to the container (and import its scripts if needed) and display them
      // after that, check if the user is logged in (to enable the add button if needed)
      this.manageDisplayDocument().then(() => this.manager.check());

    });

  }

  /**
   * Instantiates the document manager by adding the documents to the container and importing its scripts if needed.
   * @returns {Promise<void>} A promise that resolves when the document manager is instantiated.
   */
  async instantiateDocumentManager() {
    // add the documents to the container (and import its scripts if needed)
    this.documentManager = await Instantiator.getDocumentManager();
  }

  /**
   * Manages the display of documents.
   * Adds the necessary scripts and styles, then displays the fetched documents.
   * @returns {Promise<void>} A promise that resolves when the display is complete.
   */
  async manageDisplayDocument() {
    // after adding the script and the style, add the documents (using the added scripts)
    await Instantiator.addDocumentScripts();

    await this.displayFetchedDocuments();
  }

  /**
   * Enables the add button functionality.
   */
  enableAddButton() {

    // get the add button (and replace it to remove the event listeners)
    let btn = document.getElementById('add-card');
    let clonedBtn = btn.cloneNode(true);
    btn.replaceWith(clonedBtn);
    btn = clonedBtn;

    btn.classList.remove('disabled');

    // when the add is clicked open the popup and pass the needed data
    btn.addEventListener('click', () => {
      this.popupManager.open('document-popup', {
        state: AddDocumentPopup.state.ADD,
        manager: this.documentManager
      });
    });
  }

  /**
   * Disables the add button by replacing it with a disabled clone.
   * @async
   */
  async disableAddButton() {
    // get the add button
    let btn = document.getElementById('add-card');
    let clonedBtn = btn.cloneNode(true);
    btn.replaceWith(clonedBtn);
    btn = clonedBtn;
    btn.classList.add('disabled');
  }

  /**
   * Displays the fetched documents on the page.
   * @returns {Promise<void>} A promise that resolves when the documents are displayed.
   */
  async displayFetchedDocuments() {
    // get the container
    const container = document.querySelector('main');

    // get the template manager (and import its scripts if needed)
    let templateManager = await Instantiator.documentTemplateManager(container);
    let documents = await this.documentManager.getAll();

    // add the documents to the container
    await templateManager.addDocuments(documents);

    // when a document is clicked open the clicked popup
    templateManager.onDocumentClicked((id) => {
      this.popupManager.open('clicked-popup', {
        id: id,
        authManager: this.manager,
        popupManager: this.popupManager,
        manager: this.documentManager
      });
    });

  }
}