class HeaderManager {

    constructor() {
        // make the back buttons go back
        const backButtons = document.querySelectorAll('.back-button');
        backButtons.forEach(btn => btn.addEventListener('click', () => this.goBack()));

        // set the title of the page
        this.setTitle(document.title);

        // set the account button | if there is no button, create one if 'login' button isn't wanted on a specific page
        const accountButton = document.getElementById('account-button') || document.createElement('button');

        // if the user is logged in, set the button to log out
        document.addEventListener('USER_LOGGED_IN', () => {

            // set button Text to 'Déconnexion'
            accountButton.innerHTML = 'Déconnexion';

            // add the event listener to log out
            accountButton.addEventListener('click', () => {
                Instantiator.loginManager().then(loginManager => loginManager.logout());
            });
        });

        // if the user is not logged in, set the button to log in
        document.addEventListener('USER_NOT_LOGGED_IN', () => {
            
            // set button Text to 'Connexion'
            accountButton.innerHTML = 'Connexion';

            // add the event listener to log in
            accountButton.addEventListener('click', () => {
                window.location.href = Utils.getRelativePathToRoot() + 'visual/pages/login.html';
            });
        });
    }

    /**
     * Sets the page & header title.
     * 
     * @param {string} title - The title to be set.
     */
    setTitle(title) {
        document.title = title;
        document.getElementById('title').innerHTML = title;
    }



    /**
     * Navigates the user back to the previous page in the browser history.
     */
    goBack() {
        window.history.back();
    }
}