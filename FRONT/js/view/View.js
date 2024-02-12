class View {
    constructor() {
        this.initPopupManager();
    }

    /**
     * Initialize the PopupManager 
     * manager used in the view to display popups of all sorts (see PopupManager.js for more details)
     */
    async initPopupManager() {
        // add the PopupManager script to the page and create the PopupManager object when the script is loaded
        this.popupManager = await Instantiator.getPopupManager();
        
    }
}