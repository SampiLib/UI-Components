import "./slider.scss"
import { chevron_left, chevron_right, expand_less, expand_more } from '@sampilib/icons';
import { componentNameStart, ValueComponent, Way, ValueComponentOptions } from "./common";
import { initWebComponentWithOptions } from "../common/webComponent";
import { AccessTypes } from "../values/access";

/**Defines options for slider component 
 * @typedef {Object} SliderInternalOptions
 * @property {ComponentUnit} [unit] unit to use for component 
 * @property {SVGElement} [leftSymbol] symbol to use for left/top side
 * @property {SVGElement} [rightSymbol] symbol to use for right/bottom side 
 * @property {number} [min] lower limit for slider value
 * @property {number} [max] upper limit for slider value
 * @property {number} [step] amount of steps on the slider 0 is infinite
 * @property {number} [decimals] amount of decimals to round to
 * @property {boolean} [live] wether the events are live as the slider is moved or only when moving stops
 * 
 * @typedef {ValueComponentOptions & SliderInternalOptions} SliderOptions*/

/**Slide Selector, displays all options in a slider*/
export class Slider extends ValueComponent {
    constructor() {
        super();

        /**Slide background box
         * @type {HTMLDivElement}
         * @private */
        this._slide = document.createElement('div');
        this.appendChild(this._slide);

        /**Slide container box
         * @type {HTMLDivElement}
         * @private */
        this.__slide = document.createElement('div');
        this._slide.appendChild(this.__slide);

        /**The slider thing itself
         * @type {HTMLDivElement}
         * @private */
        this.__slider = document.createElement('div');
        this.__slide.appendChild(this.__slider);
        this.__slider.tabIndex = 0;

        /**Textnode for value
         * @type {Text}
         * @private */
        this.__valNode = document.createTextNode('');
        this.__slider.appendChild(this.__valNode);

        /**Container for unit of value
         * @type {HTMLDivElement}
         * @private */
        this.__unit = document.createElement('div');
        this.__slider.appendChild(this.__unit);

        //Handlers for moving the slider
        this._slide.onpointerdown = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.__moving = true;
            this.__moveTo(e.clientX, e.clientY);
            this.__slider.setPointerCapture(e.pointerId);
            this.__slider.onpointermove = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.__moveTo(e.clientX, e.clientY);
            };
            this.__slider.onpointerup = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.__moving = false;
                this.__slider.releasePointerCapture(e.pointerId);
                this.__slider.onpointermove = undefined;
                this.__slider.onpointerup = undefined;
                this.__moveTo(e.clientX, e.clientY);
            };
            this.__slider.focus();
        };

        this.__slider.onkeydown = (e) => {
            e.stopPropagation();
            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    this.__stepValue(true);
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    this.__stepValue(false);
                    break;
            }
        };

        /**@type {number} */
        this.__min = 0;
        /**@type {number} */
        this.__max = 100;
        /**@type {number} */
        this.__span = this.__max - this.__min;
        /**@type {number} */
        this.__step = 0;
        /**@type {number} */
        this.__dec = 0;
    }

    /**Creates an instance of the text element
     * @param {SliderOptions} options
     * @returns {Slider}*/
    static create(options) {}

    /**Name for component creation
     * @returns {string} */
    static get elementName() { return componentNameStart + 'slider' };

    /**Options toggeler
     * @param {SliderOptions} options*/
    options(options) {
        this.min = options.min;
        this.max = options.max;
        this.step = options.step;
        super.options(options)
        if (typeof options.unit !== 'undefined') { this.unit = options.unit; }
        this.leftSymbol = options.leftSymbol;
        this.rightSymbol = options.rightSymbol;
        this.decimals = options.decimals;
        if (typeof options.live !== 'undefined') { this.live = options.live; }
    }

    /**Updates text of component
     * @param {string} text */
    set text(text) {
        if (typeof text == 'string') {
            if (!this.__text) {
                this.__text = this.insertBefore(document.createElement('span'), this._slide);
            }
            this.__text.innerHTML = text;
        } else if (this.__text) {
            this.__text.remove;
            delete this.__text;
        }
    }

    /**Internal unit setter
     * @param {string} val 
     * @private */
    $vfunit(val) {
        this.__unit.innerHTML = val;
    }

    /**Moves the value to a position by the mouse xy coordinates
     * @param {number} x
     * @param {number} y 
     * @private*/
    __moveTo(x, y) {
        let box = this.__slide.getBoundingClientRect();
        switch (this.__way) {
            case Way.RIGHT:
            case Way.LEFT: {
                var perc = Math.min(100, Math.max(0, (y - box.y) / (box.height) * 100));
                break;
            }
            default: {
                var perc = Math.min(100, Math.max(0, (x - box.x) / (box.width) * 100));
                break;
            }
        }
        this.__userSetValue((perc / 100 * this.__span) + this.__min);
    }

    /**Moves the slider to the given percent position
     * @param {number} perc
     * @private */
    __movePerc(perc) {
        perc = Math.min(Math.max(perc, 0), 100);
        if (this.__way == 2 || this.__way == 3) {
            this.__slider.style.top = perc + '%';
        } else {
            this.__slider.style.left = perc + '%';
        }
    }

    /**This is called when the user sets the value
     * @param {string|number} val
     * @private*/
    __userSetValue(val) {
        if (this.__step != 0) {
            let modBuff = val % this.__step;
            if (modBuff >= this.__step / 2) {
                val = val + this.__step - modBuff;
            } else {
                val = val - modBuff;
            }
        }
        this.__valueBufferSlider = val;

        val = Math.min(Math.max(val, this.__min), this.__max);
        if (this.__live || !this.__moving) {
            this.__val = Number(val.toFixed(this.__dec));
            this.__setValue(this.__val);
        }

        this.__movePerc((-this.__min + val) / this.__span * 100);
        this.__valNode.nodeValue = (val.toLocaleString(undefined, { maximumFractionDigits: this.__dec }));
    }

    /**This steps the slider value in the given direction
     * @param {boolean} dir
     * @private*/
    __stepValue(dir) {
        let step = this.__step || this.__span / 100;
        if (dir) {
            this.__userSetValue((this.__valueBufferSlider || 0) + step);
        } else {
            this.__userSetValue((this.__valueBufferSlider || 0) - step);
        }
    }

    /**Internal value setter
     * @param {boolean} val 
     * @private */
    __newValue(val) {
        if (!this.__moving) {
            this.__movePerc((-this.__min + val) / this.__span * 100);
            this.__valNode.nodeValue = (val.toLocaleString(undefined, { maximumFractionDigits: this.__dec }));
        }
    }

    /**Set the minimum value on the slider
     * @param {number} value */
    set min(min = 0) {
        this.__min = min;
        this.__span = this.__max - min;
    }

    /**Gets the minimum value on the slider
     * @returns {number}*/
    get min() {
        return this.__min;
    }

    /**Set the maximum value on the slider
     * @param {number} value */
    set max(max = 100) {
        this.__max = max;
        this.__span = max - this.__min;
    }

    /**Gets the maximum value on the slider
     * @returns {number}*/
    get max() {
        return this.__max;
    }

    /**Sets the amount of steps on the slider
     * @param {number} value */
    set step(step = 0) {
        this.__step = Math.max(step, 0);
    }

    /**Gets the amount of steps on the slider
     * @returns {number} */
    get step() {
        return this.__step
    }

    /**Sets the amount of decimals the slider can have, 0 is none
     * @param {number} dec */
    set decimals(dec = 0) {
        this.__dec = Math.max(parseInt(dec), 0);
    }

    /**Gets the amount of decimals the slider can have
     * @returns {number} */
    get decimals() {
        return this.__dec
    }

    /**Changes the icon on the right of the slider
     * @param {SVGElement} sym */
    set rightSymbol(sym) {
        if (typeof sym === 'undefined') {
            switch (this.__way) {
                case Way.RIGHT:
                case Way.LEFT: { sym = expand_more(); break; }
                default: { sym = chevron_right(); break; }
            }
        }
        if (this.__rightSymbol) {
            this.__rightSymbol = this._slide.replaceChild(sym, this.__rightSymbol);
            this.__rightSymbol = sym;
        } else {
            this.__rightSymbol = this._slide.appendChild(sym);
        }
        sym.onpointerdown = (e) => {
            e.stopPropagation();
            this.__stepValue(true);
        };
    }

    /**Changes the icon on the left of the slider
     * @param {SVGElement} sym */
    set leftSymbol(sym) {
        if (typeof sym === 'undefined') {
            switch (this.__way) {
                case Way.RIGHT:
                case Way.LEFT: { sym = expand_less(); break; }
                default: { sym = chevron_left(); break; }
            }
        }
        if (this.__leftSymbol) {
            this.__leftSymbol = this._slide.replaceChild(sym, this.__leftSymbol);
            this.__leftSymbol = sym;
        } else {
            this.__leftSymbol = this._slide.appendChild(sym);
        }
        sym.onpointerdown = (e) => {
            e.stopPropagation();
            this.__stepValue(false);
        };
    }

    /**Set wether the slider is in live mode
     * @param {boolean} live */
    set live(live) {
        this.__live = Boolean(live);
    }

    /**Internal access call 
     * @param {Access} a
     * @private*/
    __onAccess(a) {
        switch (a) {
            case AccessTypes.READ:
                this.__slider.tabIndex = -1;
                break;
            case AccessTypes.WRITE:
                this.__slider.tabIndex = 0;
                break;
        }
    }

    /**Sets the unit of the inputbox
     * @param {string|Value} */
    set unit(unit) {}

    /**Returns the current unit
     * @returns {string} */
    get unit() {}
}
initWebComponentWithOptions(Slider, undefined, ['unit']);
export let slider = Slider.create;