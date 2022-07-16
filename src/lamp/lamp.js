import "./lamp.scss"
import { initWebComponentWithOptions } from "../common/webComponent";
import { componentNameStart, ValueComponent, ValueComponentOptions } from "./common";

/**Defines options for lamp component 
 * @typedef {Object} ButtonInternalOptions
 * @property {SVGElement} [symbol] the symbol to display in the lamp
 * @property {[LampColors]} colors the color of lamp is the the index color in this array
 * 
 * @typedef {ValueComponentOptions & ButtonInternalOptions} ButtonOptions*/

/**Defines all possible background colors for the lamp
 * @enum {number} */
export let LampColors = { OFF: 'off', GREEN: 'green', RED: 'red', BLUE: 'blue', YELLOW: 'yellow' };
let LampColorsValues = Object.values(LampColors);

/**Lamp for clicking*/
export class Lamp extends ValueComponent {
    /**Options toggeler
     * @param {ButtonOptions} options*/
    options(options) {
        if (typeof options.colors !== 'undefined') {
            this.colors = options.colors;
        } else {
            console.warn('Lamp needs colors');
        }
        super.options(options)
        if (typeof options.symbol !== 'undefined') { this.symbol = options.symbol; }
    }

    /**Name for component creation
     * @returns {string} */
    static get elementName() { return componentNameStart + 'lamp' };

    /**Creates an instance of the lamp
     * @param {ButtonOptions} options
     * @returns {Lamp}*/
    static create(options) {}

    /**Changes the text description of the lamp
     * @param {string} text */
    set text(text) {
        if (typeof text == 'string' && text) {
            if (!this.__text) {
                /**
                 * @type {HTMLDivElement}
                 * @private */
                this.__text = document.createElement('div')
                this.appendChild(this.__text);
            }
            this.__text.innerHTML = text;
        } else {
            if (this.__text) {
                this.removeChild(this.__text);
                delete this.__text;
            }
        }
    }

    /**Changes the symbol of the lamp
     * @param {SVGElement} sym */
    set symbol(sym) {
        if (sym instanceof SVGElement) {
            if (this.__sym) {
                this.replaceChild(sym, this.__sym);
                this.__sym = sym;
            } else {
                this.__sym = this.insertBefore(sym, this.firstChild);
            }
        } else if (this.__sym) {
            this.removeChild(this.__sym);
            delete this.__sym;
        }
    }

    /** Sets the background color of the lamp
     * @param {[LampColors]} colors*/
    set colors(colors) {
        if (colors instanceof Array) {
            this.__colors = colors;
        } else {
            console.warn('Colors must be array of colors');
            this.__colors = ['off'];
        }
    }

    /**Internal value setter
     * @param {boolean} val 
     * @private */
    __newValue(val) {
        let color = this.__colors[Number(val)];
        if (color) {
            this.setAttribute('color', color);
        } else {
            this.removeAttribute('color');
        }
    }
}
initWebComponentWithOptions(Lamp);
export let lamp = Lamp.create;