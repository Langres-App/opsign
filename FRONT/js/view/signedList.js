/**
 * @class SignedListView - Represents the signed list view.
 */
class SignedListView extends View {

  /**
   * Represents the ID of a document.
   * @private
   * @type {string}
   */
  #docId;

  /**
   * Constructs a new instance of the signedList view.
   * @constructor
   */
  constructor(authManager) {
    super();
    Utils.addStyleSheet('style/templates/user-list-template.css');

    // check if the id is in the url, otherwise redirect to the index page
    this.#CheckParam();

    Instantiator.getUserManager().then((manager) => {
      this.manager = manager;
      this.#init(authManager);
    });
  }

  #init(authManager) {
    this.#setPageTitle();

    // Wait for auth Check
    document.addEventListener('USER_LOGGED_IN', () => {
      this.#displayUsers().then(() => {
        this.addButtons();
        this.#manageSearch();
      });
    });

    // if the user is not logged in, we redirect to the index page
    document.addEventListener('USER_NOT_LOGGED_IN', () => {
      this.#displayUsers().then(() => {
        this.removeButtons();
        this.#manageSearch();
      });
    });

    authManager.check();

  }

  /**
   * Adds buttons to the DOM and removes the 'disabled' class from them.
   */
  addButtons() {
    const btns = document.querySelectorAll('.admin');
    btns.forEach(btn => {
      btn.classList.remove('disabled');
    });
  }

  /**
   * Disables the remove buttons for administrators.
   */
  removeButtons() {
    const btns = document.querySelectorAll('.admin');
    btns.forEach(btn => {
      btn.classList.add('disabled');
    });
  }

  /**
   * Checks the parameters in the URL and performs necessary actions.
   * @private
   */
  #CheckParam() {
    // get the document id and name from the url
    this.#docId = Utils.getParamValue('id');

    // if the document id or name is not in the url, we redirect to the index page
    if (!this.#docId) {
      this.#backToIndex();
    }

  }

  /**
   * Sets the page title based on the document name.
   * @private
   */
  async #setPageTitle() {
    // get docName and set it
    Instantiator.addDocumentScripts();
    const docManager = await Instantiator.getDocumentManager();
    const doc = await docManager.getById(this.#docId);
    let docName = doc.getFileName();

    // set the title of the page
    document.title = 'Signataires - ' + docName;
    document.dispatchEvent(new Event('TITLE_CHANGED'));
  }

  #backToIndex() {
    window.location.href = Utils.getRelativePathToRoot() + 'index.html';
  }

  /**
   * Manages the search functionality.
   * @private
   */
  #manageSearch() {
    // get the search input
    let searchInput = document.getElementById('search-field');

    searchInput.replaceWith(searchInput.cloneNode(true));

    searchInput = document.getElementById('search-field');

    // add the event listener
    searchInput.addEventListener('submit', (e) => {
      e.preventDefault();
      let searchValue = searchInput.elements['identifier'].value;
      this.#displayUsers(searchValue);
    });
  }

  /**
   * Displays the list of signed users in the container.
   * 
   * @param {string} searchValue - The value to search for in the user's display name.
   * @returns {Promise<void>} - A promise that resolves when the users are displayed.
   */
  async #displayUsers(searchValue) {
    // get the container
    let container = document.getElementById('list');

    // create the template manager
    let templateManager = await Instantiator.signedUserTemplateManager(container);

    // add the users to the container
    let users = await this.manager.getAllByDocId(this.#docId);

    // set the search value as an empty string if it is not defined
    searchValue = searchValue || '';

    // remove every Template from the container
    templateManager.clearContainer();

    // filter the users based on the search value and add them to the container
    let userList = users.filter(user => user.getDisplayName().toLowerCase().includes(searchValue.toLowerCase()));
    await templateManager.addSignedUsers(userList);

    // add the event listener
    templateManager.onSeeClicked((id) => {
      // open the signed document on a new tab
      const link = '/posignapi/users/signedDocument/' + id;
      window.open(link, '_blank');
    });

    templateManager.onArchiveClicked(async (id) => {

      try {
        await this.manager.archive(id);
        window.location.reload();
      } catch (e) {
        // TODO: error message
      }
    });
  }
}