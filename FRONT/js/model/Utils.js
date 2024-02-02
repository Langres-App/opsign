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

        console.log('Added stylesheet: ' + pathFromRoot);
    }

    /**
     * Function to add a script to the from their pathFromRoot
     * @param {string} pathFromRoot Path to the script from the root of the website
     * @param {lambda Expression} onLoadEvent event to execute when the script is loaded
     * @returns {void}
     */
    static addScript(pathFromRoot, onLoadAction) {
        // add the relative path to the root of the website to the path
        pathFromRoot = Utils.getRelativePathToRoot() + pathFromRoot;

        // check if the script don't exist first
        let scripts = document.getElementsByTagName('script');
        for (let script of scripts) {
            if (script.src.includes(pathFromRoot)) {
                return;
            }
        }

        // create the script element and set its attributes
        let script = document.createElement('script');
        script.src = pathFromRoot;

        // add the script to the head of the document
        document.head.appendChild(script);

        console.log('Added script: ' + pathFromRoot);

        // add the event to the script
        script.onload = onLoadAction;

    }

    /**
     * Get the relative path to the root of the website
     * @returns {string} The relative path to the root of the website
     */
    static getRelativePathToRoot() {
        // get the path of the current page (without the domain name)
        let path = window.location.pathname;

        // replace the '/charte' because the website is in a folder called 'charte'
        path = path.replace('/charte', '');
        path = path.replace('/front', '');

        // split the path into an array of strings
        const pathArray = path.split('/');
        let relativePath = '';

        if (path == '') relativePath = 'charte/';
        else relativePath = './';

        // for each element in the array, we add a '../' to the relative path to go to the root of the website
        for (let i = 0; i < pathArray.length - 2; i++) {
            relativePath += '../';
        }
        return relativePath;
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
        const response = await fetch(fileName);

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

}