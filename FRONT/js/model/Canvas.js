/**
 * @class Canvas - Represents a Canvas object which is used to draw on a canvas element.
 */
class Canvas {

    /**
     * Represents the canvas element.
     * @private
     * @type {HTMLElement}
     */
    #canvas;

    /**
     * Represents a Canvas object which is used to draw on a canvas element.
     * @constructor
     * @param {HTMLCanvasElement} canvas - The HTML canvas element.
     */
    constructor(canvas) {
        // Set the canvas
        this.#canvas = canvas;
        this.#canvas.bDraw = false;

        // due to the canvas not resizing properly (it's size is set by this current class),
        // we need to reload the page when the window is resized (allowing the canvas to resize properly and be drawn on the whole surface)
        window.addEventListener('resize', () => window.location.reload());

        // remove the blur effect from the canvas
        this.#removeBlur();

        // add event listeners
        this.#canvas.addEventListener("mousedown", (e) => this.#downDrawLine(e));
        this.#canvas.addEventListener("mouseup", (e) => this.#upDrawLine(e));
        this.#canvas.addEventListener("mousemove", (e) => this.#moveDrawLine(e));
        this.#canvas.addEventListener("touchstart", (e) => this.#downDrawLine(e));
        this.#canvas.addEventListener("touchend", (e) => this.#upDrawLine(e));
        this.#canvas.addEventListener("touchmove", (e) => this.#moveDrawLine(e));
    }

    /**
     * Removes the blur effect from the canvas.
     */
    #removeBlur() {
        // Get the context and the position of the event
        const ctx = this.#canvas.getContext('2d');
        const devicePixelRatio = window.devicePixelRatio || 1;

        // Calculate the canvas size based on the visible area
        const canvasWidth = this.#canvas.clientWidth;
        const canvasHeight = this.#canvas.clientHeight;

        // Set the canvas size
        this.#canvas.width = canvasWidth * devicePixelRatio;
        this.#canvas.height = canvasHeight * devicePixelRatio;
        this.#canvas.style.width = canvasWidth + 'px';
        this.#canvas.style.height = canvasHeight + 'px';

        // Scale the canvas
        ctx.scale(devicePixelRatio, devicePixelRatio);
    }

    /**
     * Moves and draws a line on the canvas.
     * @param {Event} event - The event object.
     */
    #moveDrawLine(event) {

        // If the canvas is not in drawing mode, we return
        if (!this.#canvas.bDraw) return;

        // Get the context and the position of the event
        const ctx = this.#canvas.getContext('2d');

        // Draw
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round'; // Set line cap to round
        ctx.beginPath();
        ctx.moveTo(this.#canvas.posX, this.#canvas.posY);
        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();

        // Update the position
        this.#canvas.posX = event.offsetX;
        this.#canvas.posY = event.offsetY;
    }

    /**
     * Get the position of the event relative to the canvas.
     * @param {Event} event - The event object.
     * @returns {Object} - The position of the event relative to the canvas, with properties posX and posY.
     */
    #getPosition(event) {
        // Return the position of the event relative to the canvas
        let position = {
            posX: event.offsetX,
            posY: event.offsetY,
        };

        return position;
    }

    /**
     * Handles the event for drawing a line on the canvas.
     * @param {Event} event - The event object.
     */
    #downDrawLine(event) {
        event.preventDefault();

        // Get the position of the event relative to the canvas
        const pos = this.#getPosition(event);
        this.#canvas.posX = pos.posX;
        this.#canvas.posY = pos.posY;
        this.#canvas.bDraw = true;
    }

    /**
     * Private method to disable drawing on the canvas.
     * @private
     */
    #upDrawLine() {
        this.#canvas.bDraw = false;
    }

    /**
     * Clears the canvas.
     */
    clearCanvas() {
        const ctx = this.#canvas.getContext('2d');
        ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    /**
     * Exports the canvas as an image and return it
     */
    exportToImage() {
        return this.#canvas.toDataURL("image/png");
    }
}
