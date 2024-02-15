class Instantiator {

    /**
     * Pathes to the scripts to load (formated as a tree depending 
     * on the type of the script and the name of the script)
     */
    static #pathes = {
        data: {
            access: {
                Dao: 'js/data/dao/Dao.js',
                DocumentDao: 'js/data/dao/DocumentDao.js',
                UserDao: 'js/data/dao/UserDao.js',
                AuthDao: 'js/data/dao/AuthDao.js',
            },

            model: {
                PoDocument: 'js/data/dataModels/PoDocument.js',
                Version: 'js/data/dataModels/Version.js',
                SignedUser: 'js/data/dataModels/SignedUser.js',
            },

            manager: 'js/model/data/DataManager.js',
            DocumentManager: 'js/model/data/DocumentManager.js',
        },

        HeaderManager: 'js/view/HeaderManager.js',

        popup: {
            model: {
                Popup: 'js/model/popups/Popup.js',
                AddDocumentPopup: 'js/model/popups/AddDocumentPopup.js',
                DocumentClickedPopup: 'js/model/popups/DocumentClickedPopup.js',
                MessagePopup: 'js/model/popups/MessagePopup.js',
            },

            manager: 'js/model/popups/PopupManager.js',
        },

        template: {
            manager: 'js/model/template/TemplateManager.js',
            DocumentTemplateManager: 'js/model/template/DocumentTemplateManager.js',
            SignedUserTemplateManager: 'js/model/template/SignedUserTemplateManager.js',
        },

        AuthManager: 'js/model/auth/AuthManager.js',

        view: {
            Index: 'js/view/index.js',
            Login: 'js/view/login.js',
            SignedList: 'js/view/signedList.js',
            Signing: 'js/view/signing.js',
            View: 'js/view/View.js',
        },

    }

    /**
     * Function to add a script to the from their pathFromRoot
     * @param {string} pathFromRoot Path to the script from the root of the website
     * @param {lambda Expression} onLoadEvent event to execute when the script is loaded
     * @returns {Promise} a promise that resolves when the script is loaded
     */
    static #addScript(pathFromRoot) {
        return new Promise((resolve, reject) => {
            // check if the script don't exist first and if it does, resolve the promise
            let scripts = document.getElementsByTagName('script');
            for (let script of scripts) {
                if (script.src.includes(pathFromRoot)) {
                    resolve();
                    return;
                }
            }

            // add the relative path to the root of the website to the path
            pathFromRoot = Utils.getRelativePathToRoot() + pathFromRoot;

            // create the script element and set its attributes
            let script = document.createElement('script');
            script.src = pathFromRoot;

            // add the script to the head of the document
            document.head.appendChild(script);

            // add the event to the script
            script.onload = resolve;
            script.onerror = reject;
        });
    }

    /**
     * Load the scripts in the given array sequentially to prevent errors 
     * (loading a child script before the parent script which resulted in an error in the child script)
     * @param {string} scripts scripts to load
     */
    static async #loadSequentially(scripts = []) {
        for (let script of scripts) {
            await this.#addScript(script);
        }
    }


    
    /**
     * Loads the necessary dependencies and initializes the index view.
     * @returns {Promise<void>} A promise that resolves when the index view is initialized.
     */
    static async index(manager) {
        await Promise.all([
            this.#loadSequentially([this.#pathes.view.View, this.#pathes.view.Index]),
            this.#addScript(this.#pathes.data.model.PoDocument),
            this.#addScript(this.#pathes.data.model.Version),
        ]);

        new IndexView(manager);
    }
    
    /**
     * Adds document scripts asynchronously.
     * @returns {Promise<void>} A promise that resolves when all scripts are added.
     */
    static async addDocumentScripts() {
        await Promise.all([
            this.#addScript(this.#pathes.data.model.PoDocument),
            this.#addScript(this.#pathes.data.model.Version),
        ]);
    }

    /**
     * Function to instantiate the login manager
     * @returns {Promise<DocumentManager>} a promise that resolves to a DocumentManager
     */
    static async getDocumentManager() {
        await Promise.all([
            this.#loadSequentially([this.#pathes.data.access.Dao, this.#pathes.data.access.DocumentDao]),
            this.#loadSequentially([this.#pathes.data.manager, this.#pathes.data.DocumentManager]),
        ]);

        return new DocumentManager();
    }

    
    /**
     * Retrieves the PopupManager instance.
     * @returns {PopupManager} The PopupManager instance.
     */
    static async getPopupManager() {
        await Promise.all([
            this.#addScript(this.#pathes.popup.manager),
            this.#loadSequentially([
                this.#pathes.popup.model.Popup,
                this.#pathes.popup.model.MessagePopup,
                this.#pathes.popup.model.AddDocumentPopup,
                this.#pathes.popup.model.DocumentClickedPopup
            ]),
        ]);

        return new PopupManager();
    }

    /**
     * Function to instantiate the login manager
     * @param {HTMLElement} container container to add the document template manager to
     * @returns Promise<DocumentTemplateManager> a promise that resolves to a DocumentTemplateManager
     */
    static async documentTemplateManager(container) {
        await Promise.all([
            this.#loadSequentially([this.#pathes.template.manager, this.#pathes.template.DocumentTemplateManager]),
            this.#addScript(this.#pathes.data.model.Version),
            this.#addScript(this.#pathes.data.model.PoDocument),
        ]);

        return new DocumentTemplateManager(container);
    }


    /**
     * Creates a new instance of SignedUserTemplateManager.
     * 
     * @param {HTMLElement} container - The container element for the template manager.
     * @returns {SignedUserTemplateManager} The created instance of SignedUserTemplateManager.
     */
    static async signedUserTemplateManager(container) {
        await Promise.all([
            this.#loadSequentially([this.#pathes.template.manager, this.#pathes.template.SignedUserTemplateManager]),
            this.#addScript(this.#pathes.data.model.SignedUser),
        ]);

        return new SignedUserTemplateManager(container);

    }

    /**
     * Creates a signed list view.
     * @returns {Promise<void>} A promise that resolves when the signed list view is created.
     */
    static async signedList(manager) {
        await Promise.all([
            this.#loadSequentially([this.#pathes.view.View, this.#pathes.view.SignedList]),
        ]);

        new SignedListView(manager);
    }

    /**
     * Creates a signing view.
     * @returns {Promise<void>} A promise that resolves when the signing view is created.
     */
    static async signing(manager) {
        await Promise.all([
            this.#loadSequentially([this.#pathes.view.View, this.#pathes.view.Signing]),
            this.#addScript(this.#pathes.data.model.SignedUser),
        ]);

        new SigningView(manager);
    }


    /**
     * Import and creates a new Canvas object.
     * 
     * @param {HTMLElement} canvas - The HTML canvas element.
     * @returns {Canvas} The newly created Canvas object.
     */
    static async canvas(canvas) {
        await this.#addScript('js/model/Canvas.js');
     
        return new Canvas(canvas);
    }


    /**
     * Creates a new instance of HeaderManager.
     * @returns {HeaderManager} The newly created instance of HeaderManager.
     */
    static async headerManager() {
        await this.#addScript(this.#pathes.HeaderManager);

        return new HeaderManager();
    }

    /**
     * Creates a new instance of LoginView.
     * @returns {LoginView} The newly created LoginView instance.
     */
    static async loginView(manager) {
        await this.#loadSequentially([this.#pathes.view.View, this.#pathes.view.Login]);

        return new LoginView(manager);
    }

    /**
     * Retrieves the AuthManager instance.
     * @returns {Promise<AuthManager>} A promise that resolves to an instance of AuthManager.
     */
    static async getAuthManager() {
        await Promise.all([
            this.#loadSequentially([this.#pathes.data.access.Dao, this.#pathes.data.access.AuthDao]),
            this.#addScript(this.#pathes.AuthManager),
        ]);

        return new AuthManager();
    }

    /**
     * Retrieves the authentication DAO.
     * @returns {AuthDao} The authentication DAO instance.
     */
    static async getAuthDao() {
        await this.#loadSequentially([this.#pathes.data.access.Dao, this.#pathes.data.access.AuthDao]);

        return new AuthDao();
    }

}