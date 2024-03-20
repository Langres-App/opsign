/**
 * @class TemplateManager - Class that manages the templates
 */
class TemplateManager {

    /**
     * Constructor of the TemplateManagers
     * @param {HTMLElement} container Container of the template manager
     */
    constructor(container = null) {
        this.container = container;
    }

    /**
     * Set the container of the template manager
     * @param {HTMLElement} container Element that will contain the templates
     */
    setContainer(container) {
        this.container = container;
    }

    /**
     * Clear the container of the template manager
     */
    clearContainer() {
        // remove every element with the class 'template' from the container
        let elements = this.container.getElementsByClassName('template');

        // remove the elements
        while (elements.length > 0) {
            elements[0].parentNode.removeChild(elements[0]);
        }
    }

    /**
     * Add the template to the container with the values passed in the values object
     * @param {[]} values Map that contains the values to be replaced in the template, 
     * the key is the name of the variable in the template and the value is the value to replace
     */
    async addTemplate(values) {
        // add the template to the container with the values
        this.container.innerHTML += await Utils.readAndFormatFile(this.path, values);
    }

    /**
     * Action to be performed when the element with the specified class is clicked (when they contain the 'data-id' attribute)
     * @param {lambda} callback Callback to be called when the element with the specified class is clicked
     * @param {string} className Name of the class to be clicked to call the callback 
     * @param {string} parentClass the class of the parent of the element to be clicked
     * @param {string} limitElement QuerySelector string to limit the search (ex: 'body' to search up to the body element or '.container' to search up to the container element)
     * @Note If the className is empty, the callback will be called when an element with the parentClass is clicked
     */
    onClick(callback, className, parentClass, limitElement = 'main') {
        // add the event listener to the container
        this.container.addEventListener('click', (event) => {
            // get the target of the event
            let target = event.target;

            // check if the target of one of her parent has the specified class (if the class is not empty otherwise pass)
            if (!target.classList.contains(className) && className !== '') {
                const btnWithClass = Utils.getParentWithClass(target, className, limitElement);

                // if the parent with the class does not exist, do nothing
                if (!btnWithClass) return;

                // set the target to the parent with the class
                target = btnWithClass;
            }


            // get the parent of the target with the specified class
            let parentWithClass = Utils.getParentWithClass(target, parentClass, limitElement);

            // if the parent exists, call the callback with the id of the parent otherwise do nothing
            if (parentWithClass && parentWithClass.getAttribute('data-id')) {
                callback(parentWithClass.getAttribute('data-id'));
            }
        });
    }
}