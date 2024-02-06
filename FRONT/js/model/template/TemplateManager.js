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
        this.path = 'visual/templates/DocumentTemplate.html';
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
}