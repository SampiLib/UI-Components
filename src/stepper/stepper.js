import "./stepper.scss"
import { add, remove } from '@sampilib/icons';
import { setCaretPosition } from "../common/common";
import { componentNameStart, ValueComponent, ValueComponentOptions } from "./common";
import { initWebComponentWithOptions } from "../common/webComponent";

/**Defines options for stepper component 
 * @typedef {Object} StepperInternalOptions
 * @property {ComponentUnit} [unit] unit to use for component 
 * @property {SVGElement} [leftSymbol] symbol to use for left/top side
 * @property {SVGElement} [rightSymbol] symbol to use for right/bottom side 
 * @property {number} [min] lower limit for stepper value
 * @property {number} [max] upper limit for stepper value
 * @property {number} [step] amount of steps on the stepper 0 is infinite
 * @property {number} [decimals] amount of decimals to round to
 * 
 * @typedef {ValueComponentOptions & StepperInternalOptions} StepperOptions*/

/**Slide Selector, displays all options in a slider*/
export class Stepper extends ValueComponent {
    constructor() {
        super();
        /**@type {number} */
        this.__min = 0;
        /**@type {number} */
        this.__max = 100;
        /**@type {number} */
        this.__step = 0;
        /**@type {number} */
        this.__dec = 0;

        this.appendChild(this.__stepper = document.createElement('div'));
        this.__stepper.tabIndex = 0;
        this.__stepper.appendChild(this.__leftSymbol = document.createElement('div'));
        this.__stepper.onkeydown = (e) => {
            e.stopPropagation();
            if (e.key == 'ArrowRight' || e.key == 'ArrowDown') {
                this.__stepValue(true);
            } else if (e.key == 'ArrowLeft' || e.key == 'ArrowUp') {
                this.__stepValue(false);
            } else if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '.', '-'].includes(e.key)) {
                field.focus();
            }
        };
        this.__leftSymbol.appendChild(remove());
        this.__leftSymbol.onpointerdown = (e) => {
            this.__leftSymbol.setPointerCapture(e.pointerId);
            this.__stepValue(false);
            this.__setInterval(false)
        }
        this.__leftSymbol.onpointerup = () => { clearInterval(this.__interval); }
        this.__stepper.appendChild(this.__valueContainer = document.createElement('span'));
        this.__valueContainer.onclick = (e) => {
            let box = field.getBoundingClientRect();
            field.focus();
            if (e.clientX > box.x) {
                setCaretPosition(field, this.__valueField.nodeValue.length);
            }
        };
        let field = this.__valueContainer.appendChild(document.createElement('span'));
        this.__valueField = field.appendChild(document.createTextNode(''));
        field.contentEditable = true;
        field.inputMode = 'decimal';
        field.tabIndex = -1;
        field.onkeydown = (e) => {
            e.stopPropagation();
            if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '.', '-', 'Backspace', 'Delete', 'ArrowRight', 'ArrowLeft', 'Tab', 'Enter'].includes(e.key)) {
                switch (e.key) {
                    case 'Enter': {
                        this.__internalSet(Number(this.__valueField.nodeValue.replace(',', '.')));
                        e.preventDefault();
                        break;
                    }
                }
            } else {
                e.preventDefault();
            }
        };
        field.onblur = () => {
            this.__internalSet(Number(this.__valueField.nodeValue.replace(',', '.')));
        }
        field.ondrop = (e) => {
            e.preventDefault();
        }
        field.onclick = (e) => {
            e.stopPropagation();
        };
        let unit = this.__valueContainer.appendChild(document.createElement('div'));
        this.__unitField = unit.appendChild(document.createTextNode(''));
        this.__stepper.appendChild(this.__rightSymbol = document.createElement('div'));
        this.__rightSymbol.appendChild(add());
        this.__rightSymbol.onpointerdown = (e) => {
            this.__rightSymbol.setPointerCapture(e.pointerId);
            this.__stepValue(true);
            this.__setInterval(true)
        }
        this.__rightSymbol.onpointerup = () => { clearInterval(this.__interval); }
    }

    /**Options toggeler
     * @param {StepperOptions} options*/
    options(options) {
        this.min = options.min;
        this.max = options.max;
        this.step = options.step;
        this.decimals = options.decimals;
        super.options(options)
        if (typeof options.unit !== 'undefined') { this.unit = options.unit; }
        this.leftSymbol = options.leftSymbol;
        this.rightSymbol = options.rightSymbol;
    }

    /**Name for component creation
     * @returns {string} */
    static get elementName() { return componentNameStart + 'stepper' };

    /**Creates an instance of the text element
     * @param {StepperOptions} options
     * @returns {Stepper}*/
    static create(options) {
        if (!options) { console.warn('Parameter must be passed'); return; }
        let elem = new Stepper(options);
        elem.options(options);
        return elem;
    }

    __setInterval(dir, time = 600) {
        clearInterval(this.__interval);
        this.__interval = setTimeout(() => {
            this.__stepValue(dir);
            this.__setInterval(dir, Math.max(80, time - 20));
        }, time);
    }

    /**Updates text of component
     * @param {string} text */
    set text(text) {
        if (typeof text == 'string') {
            if (!this.__text) {
                this.__text = this.insertBefore(document.createElement('span'), this.__stepper);
            }
            this.__text.innerHTML = text;
        } else if (this.__text) {
            this.__text.remove;
            delete this.__text;
        }
    }

    /**Set the minimum value on the slider
     * @param {number} value */
    set min(min = 0) {
        if (typeof min === 'number') {
            this.__min = min;
            this.__valueField.min = min;
        }
    }

    /**Gets the minimum value on the slider
     * @returns {number}*/
    get min() { return this.__min; }

    /**Set the maximum value on the slider
     * @param {number} value */
    set max(max = 100) {
        if (typeof max === 'number') {
            this.__max = max;
            this.__valueField.max = max;
        }
    }

    /**Gets the maximum value on the slider
     * @returns {number}*/
    get max() { return this.__max; }

    /**Sets the amount of steps on the slider
     * @param {number} value */
    set step(step = 0) {
        this.__step = Math.max(step, 0);
    }

    /**Gets the amount of steps on the slider
     * @returns {number} */
    get step() { return this.__step }

    /**Sets the amount of decimals the slider can have, 0 is none
     * @param {number} dec */
    set decimals(dec = 0) {
        this.__dec = Math.max(parseInt(dec), 0);
    }

    /**Gets the amount of decimals the slider can have
     * @returns {number} */
    get decimals() { return this.__dec }

    /**Changes the icon on the right of the slider
     * @param {SVGElement} sym */
    set rightSymbol(sym) {
        if (sym instanceof SVGElement) {
            this.__rightSymbol.replaceChild(sym, this.__rightSymbol.firstChild);
        }
    }

    /**Changes the icon on the left of the slider
     * @param {SVGElement} sym */
    set leftSymbol(sym) {
        if (sym instanceof SVGElement) {
            this.__leftSymbol.replaceChild(sym, this.__leftSymbol.firstChild);
        }
    }

    /**This steps the slider value in the given direction
     * @param {boolean} dir
     * @private*/
    __stepValue(dir) {
        if (dir) {
            this.__internalSet(this.__valueBuffer + (this.__step != 0 ? this.__step : 1));
        } else {
            this.__internalSet(this.__valueBuffer - (this.__step != 0 ? this.__step : 1));
        }
    }

    /**This is called when the user sets the value
     * @param {string|number} val
     * @param {boolean} skipEvent
     * @private*/
    __internalSet(val) {
        if (this.__step != 0) {
            let modBuff = val % this.__step;
            if (modBuff >= this.__step / 2) { val = val + this.__step - modBuff; } else { val = val - modBuff; }
        }
        val = Number(Math.min(Math.max(val, this.__min), this.__max).toFixed(this.__dec));
        this.__setValue(val)
    }

    /**Internal access call 
     * @param {Access} a
     * @private*/
    __onAccess(a) {
        if (a == 'R') {
            this.__stepper.tabIndex = -1;
        } else if (a == 'W') {
            this.__stepper.tabIndex = 0;
        }
    }

    /**Internal value setter
     * @param {boolean} val 
     * @private */
    __newValue(val) {
        this.__valueField.nodeValue = val.toLocaleString(undefined, { maximumFractionDigits: this.__dec })
    }

    /**Sets the unit of the inputbox
     * @param {string|Value} */
    set unit(unit) {}

    /**Returns the current unit
     * @returns {string} */
    get unit() {}

    /**Internal unit setter
     * @param {string} unit 
     * @private */
    $vfunit(unit) {
        this.__unitField.nodeValue = unit;
    }
}
initWebComponentWithOptions(Stepper, undefined, ['unit']);
export let stepper = Stepper.create;