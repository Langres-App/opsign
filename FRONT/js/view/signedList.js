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
  constructor() {
    super();
    Utils.addStyleSheet('style/templates/user-list-template.css');

    // check if the id is in the url, otherwise redirect to the index page
    this.#CheckParam();

    // Wait for auth Check
    document.addEventListener('USER_LOGGED_IN', () => {
      this.#setPageTitle();
      this.#displayUsers().then(() => {
        this.#manageSearch();
      });
    });

    // if the user is not logged in, we redirect to the index page
    document.addEventListener('USER_NOT_LOGGED_IN', () => this.#backToIndex());

    // TODO: remove this => only for dev
    this.#displayUsers().then(() => {
      this.#manageSearch();
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
  #setPageTitle() {
    // get docName and set it
    // let docName = await DocumentManager.getDocName(this.#docId);
    let docName = 'Charte d\'informatique et des libertés';

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
    // let users = await UserManager.getAllSignedUsers(doc.id);
    let users = [
      new SignedUser(1, 'John Doe', '2020-01-01'),
      new SignedUser(2, 'Jane Doe', '2020-01-02'),
      new SignedUser(3, 'John Smith', '2020-01-03'),
      new SignedUser(4, 'Jane Smith', '2020-01-04'),
      new SignedUser(5, 'John Johnson', '2020-01-05'),
      new SignedUser(6, 'Jane Johnson', '2020-01-06'),
      new SignedUser(7, 'John Brown', '2020-01-07'),
      new SignedUser(8, 'Jane Brown', '2020-01-08')
    ];

    // set the search value as an empty string if it is not defined
    searchValue = searchValue || '';

    // remove every Template from the container
    templateManager.clearContainer();

    // filter the users based on the search value and add them to the container
    let userList = users.filter(user => user.getDisplayName().toLowerCase().includes(searchValue.toLowerCase()));
    await templateManager.addSignedUsers(userList);

    // add the event listener
    templateManager.onSeeClicked((id) => {
      // TODO: call manager & open the document
      console.log('print', id);
    });

    templateManager.onArchiveClicked((id) => {
      // TODO: call manager & archive the document => open message popup
      console.log('archive', id);
    });

  }

}