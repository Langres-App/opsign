/**
 * @class LoginView - The view for the login page.
 */
class LoginView extends View {
    /**
     * Constructs a new instance of the Login view.
     * @param {AuthManager} authManager - The authentication manager.
     */
    constructor(authManager) {
        super();
        this.manager = authManager;

        this.setupView();
    }

    /**
     * Sets up the login view.
     * 
     * @returns {Promise<void>} A promise that resolves when the setup is complete.
     */
    async setupView() {
        const manager = this.manager;

        // if the user is logged in, redirect to index
        document.addEventListener('USER_LOGGED_IN', () => window.location = '/posign');
        const res = await manager.check();

        // check if the user exist is logged in
        this.userExists = res.userExists;

        // if the user exists (but is not logged in), we display the login form
        if (!this.userExists) {
            let title = document.querySelector('h2');
            title.innerHTML = 'Se créer un compte';

            let button = document.querySelector('.button.green');
            button.value = 'Créer le compte';

            // change document title
            document.title = 'POSign - Créer un compte';
            document.dispatchEvent(new Event('TITLE_CHANGED'));
        }

        // manage the form submission
        let form = document.querySelector('form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // object to send back to the API (to login / register)
            const user = {
                username: form.elements['user-identifier'].value,
                password: form.elements['user-password'].value
            };

            if (!/^[a-z0-9-]+\.[a-z0-9]+$/i.test(user.username)) {
                throw new Error('Le nom d\'utilisateur est invalide, il doit être de la forme prenom.nom');
            }

            if (user.password.length < 4) {
                throw new Error('Le mot de passe est trop court, il doit faire au moins 4 caractères');
            }

            // depending on the userExists value, we login or register
            if (this.userExists) {

                // using try/catch to handle login errors
                try {
                    await manager.login(user);

                    // redirect to index
                    window.location = '/posign';
                } catch (e) {
                    alert('Identifiant ou mot de passe incorrect');
                    form.reset();
                }
            }
            else {
                // using try/catch to handle register errors
                try {
                    await manager.register(user);

                    // redirect to index
                    window.location = '/posign';
                } catch (e) {
                    alert('Erreur lors de la création du compte, veuillez réessayer plus tard.');
                    form.reset();
                }
            }

        });

    }
}