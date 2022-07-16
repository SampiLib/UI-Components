import "./toggleSwitch.scss"
import { grey } from '@sampilib/colors';
import { addThemeVariable } from "../styling/theme";
import { componentNameStart, ValueComponent, ValueComponentOptions } from "./common";
import { AccessTypes } from "../values/access";
import { initWebComponentWithOptions } from "../common/webComponent";

addThemeVariable('componentToggleSwitchColor', ['Components', 'Toggle Switch'], grey['50'], grey['900']);
addThemeVariable('componentToggleSwitchBorderColor', ['Components', 'Toggle Switch'], grey['700'], grey['300']);

/**Defines options for toggle button component 
 * @typedef {Object} ToggleSwitchInternalOptions
 * @property {SVGElement} [symbol] the symbol to display in the button
 * 
 * Defines options for toggle button component 
 * @typedef {ValueComponentOptions & ToggleSwitchInternalOptions} ToggleSwitchOptions*/


/**Toggle Switch, switches between on and off*/
export class ToggleSwitch extends ValueComponent {
    constructor() {
        super();
        /** Stores container for toggler
         * @type {HTMLDivElement}
         * @private */
        this.__switch = document.createElement('div')
        this.appendChild(this.__switch);
        this.__switch.onkeydown = (e) => {
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
                                break;
                            }
                        }
                        this.onkeyup = null;
                    }
                    break;
                }
            }
        };

        /**Handler for dragging the switch 
         * @param {PointerEvent} e
         * @private*/
        this.__switch.onpointerdown = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.__switch.focus();
            this.__switch.setPointerCapture(e.pointerId);
            let hasMoved = false;
            /**@param {PointerEvent} ev*/
            this.__switch.onpointermove = (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                if (hasMoved) {
                    let box = this.__switch.getBoundingClientRect();
                    let midCord = box.x + box.width / 2;
                    if (ev.clientX > midCord) {
                        if (!this.__valueBuffer) {
                            this.__setValue(true);
                        }
                    } else {
                        if (this.__valueBuffer) {
                            this.__setValue(false);
                        }
                    }
                } else if (Math.abs(e.clientX - ev.clientX) > 10 || Math.abs(e.clientY - ev.clientY) > 10) {
                    hasMoved = true;
                }
            };

            /**@param {PointerEvent} ev */
            this.__switch.onpointerup = (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                if (!hasMoved) {
                    this.__setValue(!this.__valueBuffer);
                }
                this.__switch.releasePointerCapture(ev.pointerId);
                this.__switch.onpointerup = undefined;
                this.__switch.onpointermove = undefined;
            }
        }
        /**Handler for clicking the switch 
         * @param {PointerEvent} e
         * @private*/
        this.__switch.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
        }

        /**Handler for clicking the switch 
         * @param {PointerEvent} e
         * @private*/
        this.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.__preventClick) {
                this.__preventClick = false;
                return;
            }
            this.__setValue(!this.__valueBuffer);
        }
    }

    /**Options toggeler
     * @param {ToggleSwitchOptions} options*/
    options(options) {
        super.options(options)
        this.symbol = options.symbol;
    }

    /**Name for component creation
     * @returns {string} */
    static get elementName() { return componentNameStart + 'toggleswitch' };

    /**Creates an instance of the toggle button element
     * @param {ToggleSwitchOptions} options
     * @returns {ToggleSwitch}*/
    static create(options) {}

    /**Changes the icon of the switch
     * @param {SVGElement} sym */
    set symbol(sym) {
        if (sym instanceof SVGElement) {
            this.__sym = this.insertBefore(sym, this.firstChild);
        } else if (this.__sym) {
            this.removeChild(this.__sym);
            delete this.__sym;
        }
    }

    /**Set text of switch
     * @param {string} text */
    set text(text) {
        if (typeof text == 'string') {
            if (!this.__text) {
                this.__text = this.insertBefore(document.createElement('span'), this.__switch);
            }
            this.__text.innerHTML = text;
        } else if (this.__text) {
            this.removeChild(this.__text);
            delete this.__text;
        }
    }

    /**Internal access call 
     * @param {AccessTypes} a
     * @private*/
    __onAccess(a) {
        switch (a) {
            case AccessTypes.READ: {
                this.__switch.removeAttribute('tabindex');
                break;
            }
            case AccessTypes.WRITE: {
                this.__switch.setAttribute('tabindex', 0);
                break;
            }
        }
    }

    /**Internal value setter
     * @param {boolean} val 
     * @private */
    __newValue(val) {
        if (val) {
            this.__switch.classList.add('on');
        } else {
            this.__switch.classList.remove('on');
        }
    }
}
initWebComponentWithOptions(ToggleSwitch);
export let toggleSwitch = ToggleSwitch.create;