class View {
    constructor() {
        this.initPopupManager();
    }

    /**
     * Initialize the PopupManager 
     * manager used in the view to display popups of all sorts (see PopupManager.js for more details)
     */
    initPopupManager() {
        // add the PopupManager script to the page and create the PopupManager object when the script is loaded
        Utils.addScript('js/model/PopupManager.js', () => {
            this.popupManager = new PopupManager();
        });
    }
}