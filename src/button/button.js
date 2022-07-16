import { initWebComponentWithOptions } from "../common/webComponent";
import "./button.scss"
import { componentNameStart, ValueComponent, ValueComponentOptions } from "./common";

/**Defines options for button component 
 * @typedef {Object} ButtonInternalOptions
 * @property {SVGElement} [symbol] the symbol to display in the button
 * @property {()} [click] function to run when clicked
 * @property {boolean} [toggle] function to run when clicked
 * @property {ButtonColors} [color] background color for button
 * 
 * @typedef {ValueComponentOptions & ButtonInternalOptions} ButtonOptions*/

/**Defines all possible background colors for the button
 * @enum {number} */
export let ButtonColors = { GREEN: 'green', RED: 'red', BLUE: 'blue', YELLOW: 'yellow' };
let ButtonColorsValues = Object.values(ButtonColors);

/**Button for clicking*/
export class Button extends ValueComponent {
    constructor() {
        super();
        this.setAttribute('tabindex', 0);
    }

    /**Options toggeler
     * @param {ButtonOptions} options*/
    options(options) {
        super.options(options)
        if (typeof options.symbol !== 'undefined') { this.symbol = options.symbol; }
        if (typeof options.click !== 'undefined') { this.click = options.click; }
        this.toggle = options.toggle;
        if (typeof options.color !== 'undefined') { this.color = options.color; }
    }

    /**Name for component creation
     * @returns {string} */
    static get elementName() { return componentNameStart + 'button' };

    /**Creates an instance of the button
     * @param {ButtonOptions} options
     * @returns {Button}*/
    static create(options) {}

    /**Changes the text description of the button
     * @param {(e:MouseEvent)=>} text */
    set click(func) {
        if (typeof func === 'function') {
            this.__click = func;
        } else {
            console.warn('None function passed');
        }
    }

    /**Changes the text description of the button
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

    /**Changes the symbol of the button
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

    /**Changes whether the button is maintained or momentary
     * @param {boolean} tog */
    set toggle(tog) {
        if (tog) {
            this.onpointerdown = null;
            this.onpointerup = null;
            this.onkeydown = (e) => {
                e.stopPropagation();
                switch (e.key) {
                    case 'Enter':
                    case ' ': {
                        this.onkeyup = (e) => {
                            e.stopPropagation();
                            switch (e.key) {
                                case 'Enter':
                                case ' ': {
                                    this.__setValue(!this.__valueBuffer);
                                    if (this.__click) {
                                        this.__click();
                                    }
                                    break;
                                }
                            }
                            this.onkeyup = null;
                        }
                        break;
                    }
                }
            };
            this.onclick = (e) => {
                e.stopPropagation();
                this.__setValue(!this.__valueBuffer);
                if (this.__click) {
                    this.__click();
                }
            }
        } else {
            /**Handler for pointer down
             * @param {PointerEvent} e
             * @private */
            this.onpointerdown = (e) => {
                e.stopPropagation();
                if (e.pointerType == 'touch') {
                    e.preventDefault();
                }
                this.setPointerCapture(e.pointerId);
                this.__setValue(true);
                this.onpointerup = (ev) => {
                    ev.stopPropagation();
                    this.releasePointerCapture(ev.pointerId);
                    this.__setValue(false);
                    if (this.__click) {
                        this.__click();
                    }
                    this.onpointerup = null;
                }
            }
            this.onkeydown = (e) => {
                e.stopPropagation();
                switch (e.key) {
                    case 'Enter':
                    case ' ': {
                        this.__setValue(true);
                        this.onkeyup = (e) => {
                            e.stopPropagation();
                            switch (e.key) {
                                case 'Enter':
                                case ' ': {
                                    this.__setValue(false);
                                    if (this.__click) {
                                        this.__click();
                                    }
                                    break;
                                }
                            }
                            this.onkeyup = null;
                        }
                        break;
                    }
                }
            };
            this.onclick = null;
        }
    }

    /** Sets the background color of the button
     * @param {number} color*/
    set color(color) {
        if (typeof color === 'string') {
            if (ButtonColorsValues.includes(color)) {
                this.setAttribute('color', color);
                return;
            }
        }
        this.removeAttribute('color');
    }

    /**Internal access call 
     * @param {Access} a
     * @private*/
    __onAccess(a) {
        if (a == 'R') {
            this.setAttribute('tabindex', -1);
        } else if (a == 'W') {
            this.setAttribute('tabindex', 0);
        }
    }

    /**Internal value setter
     * @param {boolean} val 
     * @private */
    __newValue(val) {
        if (val) {
            this.classList.add('active');
        } else {
            this.classList.remove('active');
        }
    }
}
initWebComponentWithOptions(Button);
export let button = Button.create;