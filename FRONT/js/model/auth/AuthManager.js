/**
 * @class AuthManager - Manages user authentication.
 */
class AuthManager {

    /**
     * The private key used for storing the user token.
     * @private
     * @type {string}
     */
    static #key = 'userToken';
    
    /**
     * Constructs a new instance of AuthManager.
     * @constructor
     */
    constructor() {
        // listen for authenticated API requests (to expand token duration)
        document.addEventListener('AUTHENTICATED_API_REQUEST', () => this.#expandTokenDuration());
    }

    /**
     * Checks if the user is logged in.
     * @returns {Promise<boolean>} A promise that resolves to true if the user is logged in, false otherwise.
     */
    async check() {
        this.dao = await Instantiator.getAuthDao();
        let response = await this.dao.checkForExistingUser();
        let responseBody = await response.json();

        if (responseBody.logged) document.dispatchEvent(new Event('USER_LOGGED_IN'));
        else document.dispatchEvent(new Event('USER_NOT_LOGGED_IN'));

        return response.status === 200;
    }

    /**
     * Logs in a user.
     * @param {Object} user - The user object containing login credentials.
     * @returns {Promise<void>} - A promise that resolves when the login is successful.
     */
    async login(user) {
        let val = await this.dao.login(user);
        console.log('token: ' + val.token);
        this.#setToken(val.token);
    }

    /**
     * Registers a user.
     * @param {Object} user - The user object.
     * @returns {Promise<void>} - A promise that resolves when the user is registered.
     */
    async register(user) {
        let response = await this.dao.register(user);
        // get 'token' from response header
        let token = response.headers.get('token');
        this.#setToken(token);
    }

    /**
     * Logs out the user.
     * @returns {Promise<void>} A promise that resolves when the user is logged out.
     */
    static async logout() {
        await this.dao.logout();
        localStorage.removeItem(AuthManager.#key);
    }

    /**
     * Sets the user token in local storage with an expiration date of 5 minutes from now.
     * @param {string} token - The user token to be set.
     */
    #setToken(token) {
        // set the token expiration date to 5 minutes from now
        const date = new Date();
        date.setMinutes(date.getMinutes() + 5);
        date.setHours(date.getHours() + 1);

        // set the user token in local storage
        localStorage.setItem(AuthManager.#key,
            JSON.stringify({
                token: token,
                expire: date
            })
        );
    }

    /**
     * Expands the token duration by setting the token expiration date to 5 minutes from now.
     * If there is no user token in local storage, this method does nothing.
     */
    #expandTokenDuration() {
        // get the user token from local storage
        const item = JSON.parse(localStorage.getItem(AuthManager.#key));

        if (!item) return;

        // set the token expiration date to 5 minutes from now
        const date = new Date();
        date.setMinutes(date.getMinutes() + 5);
        date.setHours(date.getHours() + 1);
        console.log(date);

        // set the user token in local storage
        localStorage.setItem(AuthManager.#key,
            JSON.stringify({
                token: item.token,
                expire: date
            })
        );
    }

    /**
     * Retrieves the user token from local storage.
     * If the token is not expired, it is returned.
     * If the token is expired, it is removed from local storage and null is returned.
     * @returns {string|null} The user token or null if expired or not found.
     */
    static getToken() {
        // get the user token from local storage
        const item = JSON.parse(localStorage.getItem(AuthManager.#key));

        // if the token is not expired, return it
        if (item && new Date(item.expire) > new Date()) {
            return item.token;
        }

        // if the token is expired, remove it from local storage and return null
        localStorage.removeItem(AuthManager.#key);
        return null;
    }
}