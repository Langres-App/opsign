/**
 * @class Utils - Class that contains utility functions
 */
class Utils {

    /**
     * Add a stylesheet to the page defined by the pathFromRoot
     * @param {string} pathFromRoot Path to the stylesheet from the root of the website
     */
    static addStyleSheet(pathFromRoot) {
        pathFromRoot = Utils.getRelativePathToRoot() + pathFromRoot;

        // check if the stylesheet don't exist first
        let links = document.getElementsByTagName('link');
        for (let link of links) {
            if (link.href.includes(pathFromRoot)) {
                return;
            }
        }

        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = pathFromRoot;

        document.head.appendChild(link);
    }

    /**
     * Function to add a script to the from their pathFromRoot
     * @param {string} pathFromRoot Path to the script from the root of the website
     * @param {lambda Expression} onLoadEvent event to execute when the script is loaded
     * @returns {Promise} a promise that resolves when the script is loaded
     */
    static addScript(pathFromRoot) {
        return new Promise((resolve, reject) => {
            // check if the script don't exist first
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
     * Get the relative path to the root of the website
     * @returns {string} The relative path to the root of the website
     */
    static getRelativePathToRoot() {
        // if path end with /, we remove it
        if (window.location.pathname.endsWith('/')) window.location.pathname = window.location.pathname.slice(0, -1);
        
        // get the path of the current page (without the domain name)
        return  `/${window.location.pathname.split('/')[1]}/`;
    }

    /**
     * Create an HTML element with the specified type, id and classes
     * @param {string} type Type of the element to create
     * @param {string} id Identifier of the element to create
     * @param {string} className Classes of the element to create
     * @returns the created element
     */
    static createHTMLElement(type, id, className) {
        const el = document.createElement(type);
        if (id) el.id = id;
        if (className) el.className = className;
        return el;
    }

    /**
     * Read the file specified by fileName
     * @param fileName Relative path to the file
     * @throws Error if the file is not found
     */
    static async readLocalFile(fileName) {
        // we wait the response of the request
        const response = await fetch(this.getRelativePathToRoot() + fileName);

        // if the response is not ok, we throw an error
        if (!response.ok) {
            throw new Error(`Failed to read file: error ${response.statusText}`);
        }

        // we return the content of the file
        return await response.text();
    }

    /**
     * Read the file specified by fileName and replace the keys with the values passed in the values object.
     * @param path Relative path to the file
     * @param values
     * @returns {Promise<string>}
     * @throws Error if the file is not found
     */
    static async readAndFormatFile(path, values) {
        // we wait the response of the request
        let content = await Utils.readLocalFile(path);

        if (values)
            Object.entries(values).forEach(el => content = content.replaceAll('{{' + el[0] + '}}', el[1]));   // for each key in the file content, we replace the key by the value

        return content;
    }

    /**
     * Get the value of the parameter in the URL
     * @param {string} parameter The parameter to search for in the URL
     * @returns {string | undefined} The value of the parameter in the URL
     */
    static getParamValue(parameter) {
        // get the URL of the page
        const url = window.location.href;
        let result = undefined;

        // add the '=' to the parameter to search for
        // ex: if the parameter is 'id', we search for 'id='
        let param = parameter + "=";

        // check if the parameter is in the URL
        if (url.includes(param)) {

            // get the value of the parameter in the URL
            result = url.substring(url.lastIndexOf(param) + param.length);

            // if the value contains a '&', we remove everything after the '&' (because it's another parameter)
            if (result.includes('&')) {
                result = result.substring(0, result.indexOf('&'));
            }
        }

        return result;
    }


    /**
     * Get the element which has a parent with the specified class (up to the specified limit element) otherwise return null
     * @param {HTMLElement} element Element to check if it has a parent with the specified class
     * @param {string} className Name of the class to check
     * @param {string} upTo Query element to limit the search (ex: 'body' to search up to the body element or '.container' to search up to the container element)
     * @returns {boolean} True if the element has a parent with the specified class, false otherwise
     */
    static getParentWithClass(element, className, upTo = 'body') {
        // check if the element has a parent with the specified class
        let parent = element.parentElement;

        // get the element that is the limit of the search
        let limitElement = document.querySelector(upTo);

        // while the parent is not null and not the limit element, we check if the parent has the specified class
        while (parent != null && parent != limitElement) {
            if (parent.classList.contains(className)) return parent;
            parent = parent.parentElement;
        }

        return null;
    }

    /**
     * Copies the given value to the clipboard.
     * 
     * @param {string} val - The value to be copied to the clipboard.
     * @returns {Promise<void>} - A promise that resolves when the value is successfully copied to the clipboard.
     */
    static async copyToClipboard(val) {
        // deprecated but still works | another way would be to use the clipboard API but would require a secure context (https)
        const textArea = document.createElement("textarea");
        textArea.value = val;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Unable to copy to clipboard', err);
        }
        document.body.removeChild(textArea);
    }

}