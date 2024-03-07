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
    }

    async isLogged() {
        await this.check();
        return !!AuthManager.getToken();
    }

    /**
     * Checks if the user is logged in.
     * @returns {Promise<boolean>} A promise that resolves to true if the user is logged in, false otherwise.
     */
    async check() {
        this.dao = await Instantiator.getAuthDao();

        let toReturn = false;
        let response = null;

        try {
            response = await this.dao.checkForExistingUser();
            toReturn = response.status === 200;

            if (toReturn) {
                let responseBody = await response.json();
                if (responseBody.logged) document.dispatchEvent(new Event('USER_LOGGED_IN'));
                else {
                    document.dispatchEvent(new CustomEvent('USER_NOT_LOGGED_IN', { detail: { userExist: true } }));
                    localStorage.removeItem(AuthManager.#key);
                }
            } else {
                document.dispatchEvent(new CustomEvent('USER_NOT_LOGGED_IN', { detail: { userExist: false } }));
            }

        } catch (error) {
            console.error(error);
            document.dispatchEvent(new CustomEvent('USER_NOT_LOGGED_IN', { detail: { userExist: false } }));
        }

        return toReturn;
    }

    /**
     * Logs in a user.
     * @param {Object} user - The user object containing login credentials.
     * @returns {Promise<void>} - A promise that resolves when the login is successful.
     */
    async login(user) {
        let response = await this.dao.login(user);
        this.#setToken(response);
    }

    /**
     * Registers a user.
     * @param {Object} user - The user object.
     * @returns {Promise<void>} - A promise that resolves when the user is registered.
     */
    async register(user) {
        let response = await this.dao.register(user);
        this.#setToken(response);
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
     * @param {Date} expire - The expiration date of the token.
     */
    #setToken(token) {
        if (!token) return;

        // set the user token in local storage
        localStorage.setItem(AuthManager.#key, token);
    }

    /**
     * Retrieves the user token from local storage.
     * If the token is not expired, it is returned.
     * If the token is expired, it is removed from local storage and null is returned.
     * @returns {string|null} The user token or null if expired or not found.
     */
    static getToken() {
        // get the user token from local storage
        const item = localStorage.getItem(AuthManager.#key);
        return item || null;
    }
}