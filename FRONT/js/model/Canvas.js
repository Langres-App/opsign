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

        // Set the canvas size
        const backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;
        const ratio = devicePixelRatio / backingStoreRatio;

        // Set the canvas size
        this.#canvas.width = this.#canvas.offsetWidth * ratio;
        this.#canvas.height = this.#canvas.offsetHeight * ratio;
        this.#canvas.style.width = this.#canvas.offsetWidth + 'px';
        this.#canvas.style.height = this.#canvas.offsetHeight + 'px';

        // Scale the canvas
        ctx.scale(ratio, ratio);
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
        const pos = this.#getPosition(event);

        // Draw
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round'; // Set line cap to round
        ctx.beginPath();
        ctx.moveTo(this.#canvas.posX, this.#canvas.posY);
        ctx.lineTo(pos.posX, pos.posY);
        ctx.stroke();

        // Update the position
        this.#canvas.posX = pos.posX;
        this.#canvas.posY = pos.posY;
    }

    /**
     * Get the position of the event relative to the canvas.
     * @param {Event} event - The event object.
     * @returns {Object} - The position of the event relative to the canvas, with properties posX and posY.
     */
    #getPosition(event) {
        // Get the position of the canvas
        const rect = this.#canvas.getBoundingClientRect();
        const eventPos = event.changedTouches ? event.changedTouches[0] : event;

        // Return the position of the event relative to the canvas
        return {
            posX: (eventPos.clientX - rect.left) / (rect.right - rect.left) * this.#canvas.width,
            posY: (eventPos.clientY - rect.top) / (rect.bottom - rect.top) * this.#canvas.height
        };
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
     * Exports the canvas as an image and return it
     */
    exportToImage() {
        return this.#canvas.toDataURL("image/png");
    }
}
