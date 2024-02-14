/**
 * @class IndexView - The view of the index page
 * @extends View
 */
class IndexView extends View {

  /**
   * Constructs a new instance of the class.
   */
  constructor() {
    super();
    Utils.addStyleSheet('style/templates/document-template.css');

    // after adding the script and the style, add the documents (using the added scripts)
    Instantiator.addDocumentScripts()
      .then(async () => {
        // add the documents to the container (and import its scripts if needed)
        this.documentManager = this.documentManager || await Instantiator.getDocumentManager();
        this.displayFetchedDocuments();
      });

    // add the add button functionality if the user is logged in
      document.addEventListener('USER_LOGGED_IN', () => this.enableAddButton());

  }

  /**
   * Enables the add button functionality.
   * When the add button is clicked, it opens a popup and passes the needed data.
   * @returns {Promise<void>} A promise that resolves when the add button functionality is enabled.
   */
  async enableAddButton() {
    // get the document manager (and set it if not defined) and import its scripts if needed
    this.documentManager = this.documentManager || await Instantiator.getDocumentManager();

    // get the add button
    let btn = document.getElementById('add-card');
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
   * Displays the fetched documents on the page.
   * @returns {Promise<void>} A promise that resolves when the documents are displayed.
   */
  async displayFetchedDocuments() {
    // get the container
    const container = document.querySelector('main');

    // get the template manager (and import its scripts if needed)
    let templateManager = await Instantiator.documentTemplateManager(container);

    // let documents = await DocumentManager.getAll();
    let documents = this.getDocs(); // TO BE REMOVED
    this.documentManager.cacheDocuments(documents); // TO BE REMOVED (the cache should be done by the manager itself (but for now it's done here because the data are not fetched from the server))

    // add the documents to the container
    await templateManager.addDocuments(documents);

    // when a document is clicked open the clicked popup
    templateManager.onDocumentClicked((id) => {
      this.popupManager.open('clicked-popup', {
        id: id,
        popupManager: this.popupManager,
        manager: this.documentManager
      });
    });

  }

  /**
   * Temporary method to get documents (to be removed when the data will be fetched from the server)
   * @returns A list of documents
   */
  getDocs() {
    let documents = [
      new PoDocument(1, 'Document 1'),
      new PoDocument(2, 'Document 2'),
      new PoDocument(3, 'Document 3'),
      new PoDocument(4, 'Document 4'),
      new PoDocument(5, 'Document 5'),
      new PoDocument(6, 'Document 6'),
      new PoDocument(7, 'Document 7'),
      new PoDocument(8, 'Document 8')
    ];

    // add a version to each document
    for (let doc of documents) {
      doc.addVersion(new Version(1, '2020-01-01'));
    }

    return documents;
  }
}