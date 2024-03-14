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
    Utils.addStyleSheet('style/templates/main-user-template.css');

    this.loadPage();
  }

  async loadPage() {
    // import the differents scripts
    await this.instantiateManagers();

    await this.displayFetchedDocuments();

    // manage what to display depending on the user state
    if (await this.manager.isLogged()) {
      this.isLogged = true;
      this.enableNavButtons();
      this.enableAddButton();
    } else {
      this.isLogged = false;
      this.disableNavButtons();
      this.disableAddButton();
    }

  }

  enableNavButtons() {
    const header = document.getElementById('mainHeader');
    header.classList.add('enabled');

    // clone it and add back every listener
    header.replaceWith(header.cloneNode(true));

    // get the buttons and the switch
    const docBtn = document.getElementById('docs_menu');
    const usersBtn = document.getElementById('users_menu');
    const toggleSwitch = document.getElementById('archived_cb');

    // set the switch to false (unchecked)
    toggleSwitch.checked = false;

    /**
     * Toggles the state of the buttons.
     */
    const toggleState = () => {
      docBtn.classList.toggle('active');
      usersBtn.classList.toggle('active');
    };

    // add the event listeners
    docBtn.addEventListener('click', async () => {
      if (!docBtn.classList.contains('active')) {
        toggleState();
        await this.reload(toggleSwitch.checked);
      }
    });

    usersBtn.addEventListener('click', async () => {
      if (!usersBtn.classList.contains('active')) {
        toggleState();
        await this.reload(toggleSwitch.checked);
      }
    });

    // reload the view when the switch is toggled
    toggleSwitch.addEventListener('change', async () => await this.reload(toggleSwitch.checked));

  }


  /**
   * Reloads the view based on the selected state.
   * If the documents button is active, it displays the documents.
   * If the users button is active, it displays the users.
   * @param {boolean} archived - Indicates whether to fetch archived data or not.
   * @returns {Promise<void>} - A promise that resolves when the view is reloaded.
   */
  async reload(archived) {
    const docBtn = document.getElementById('docs_menu');
    this.isArchiveView = archived;

    // if the documents button is active, display the documents, else display the users (using the switch state for the archived state)
    if (docBtn.classList.contains('active')) {
      await this.displayFetchedDocuments(archived);
      if (archived) this.disableAddButton();
      else this.enableAddButton();

    } else {
      await this.displayUsers(archived);
      this.disableAddButton();
    }
  }

  /**
   * Disables the navigation buttons in the main header.
   * Clones the header element and adds it back with all the listeners.
   * @returns {Promise<void>} A promise that resolves once the navigation buttons are disabled.
   */
  disableNavButtons() {
    let header = document.getElementById('mainHeader');
    header.classList.remove('enabled');

    // clone it and add back every listener
    header.replaceWith(header.cloneNode(true));

    console.log('nav buttons disabled');
  }

  /**
   * Instantiates the document manager by adding the documents to the container and importing its scripts if needed.
   * @returns {Promise<void>} A promise that resolves when the document manager is instantiated.
   */
  async instantiateManagers() {
    // add the documents to the container (and import its scripts if needed)
    await Instantiator.addDocumentScripts();

    this.documentManager = await Instantiator.getDocumentManager();
    this.userManager = await Instantiator.getUserManager();

    // get the container (same for the documents and the users)
    const container = document.querySelector('#mainBody');

    // init the template managers
    this.docTemplateManager = await Instantiator.documentTemplateManager(container);
    this.userTemplateManager = await Instantiator.mainUserTemplateManager(container);

    
    // when a document is clicked open the clicked popup
    this.docTemplateManager.onDocumentClicked((id) => {
      this.popupManager.open('clicked-popup', {
        id: id,
        archived: this.isArchiveView || false, 
        logged: this.isLogged,
        authManager: this.manager,
        popupManager: this.popupManager,
        manager: this.documentManager
      });
    });


    // when a user is clicked open the clicked popup
    this.userTemplateManager.onUserClicked((id) => {
      console.log('user clicked', id);
    });
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
      console.log('add button clicked');
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
  async displayFetchedDocuments(archived = false) {
    await this.docTemplateManager.clearContainer();

    // get the template manager    
    let documents = await this.documentManager.getAll(archived);

    // add the documents to the container
    await this.docTemplateManager.addDocuments(documents);
  }

  async displayUsers(archived = false) {
    await this.userTemplateManager.clearContainer();

    // get the template manager
    let users = await this.userManager.getAll(archived);

    // add the users to the container
    await this.userTemplateManager.addUsers(users);
  }
}