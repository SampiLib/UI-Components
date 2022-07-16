import "./text.scss"
import { Component, ComponentBaseOptions, componentNameStart, ValueComponent, ValueComponentOptions } from "./common";
import { initWebComponentWithOptions } from "../common/webComponent";

/**Defines options for text component  
 * @typedef {Object} TextBoxComponentInternalOptions
 * @property {number} size size of text in rem
 * @property {number} style style of text (italic or normal)
 * @property {number} weight weight of text number or name
 * 
 * Defines options for text component 
 * @typedef {ComponentBaseOptions & TextBoxComponentInternalOptions} TextBoxComponentOptions*/

/**Component for displaying simple text */
export class TextBox extends Component {
    constructor() {
        super()
    }

    /**Options toggeler
     * @param {TextBoxComponentOptions} options*/
    options(options) {
        super.options(options)
        if (options.size) { this.size = options.size; }
        if (options.style) { this.fStyle = options.style; }
        if (options.weight) { this.weight = options.weight; }
    }

    /**Name for component creation
     * @returns {string} */
    static get elementName() { return componentNameStart + 'text' };

    /**Creates an instance of the text element
     * @param {TextBoxComponentOptions} options
     * @returns {TextBox}*/
    static create(options) {
        if (!options) { console.warn('Parameter must be passed'); return; }
        let elem = new TextBox(options);
        elem.options(options);
        return elem;
    }

    /**Set the text of the component
     * @param {string} text*/
    set text(text) {
        this.innerHTML = text
    }

    /**Set the text of the component
     * @returns {string}*/
    get text() {
        return this.innerHTML;
    }

    /**Set the size of the text
     * @param {number} size*/
    set size(size) {
        this.style.fontSize = size + 'rem';
    }

    /**Set the style of the text
     * @param {string} st*/
    set fStyle(st) {
        this.style.fontStyle = st
    }

    /**Set the weight of the text
     * @param {string} wg*/
    set weight(wg) {
        this.style.fontWeight = wg
    }
}
customElements.define(TextBox.elementName, TextBox);
export let text = TextBox.create;


/**Defines options for text component  
 * @typedef {Object} TextBoxValueComponentInternalOptions
 * @property {ComponentUnit} [unit] unit to use for component 
 * @property {number} size size of text in rem
 * @property {number} style style of text (italic or normal)
 * @property {number} weight weight of text number or name
 * @property {number} decimals amount of decimals shown
 * 
 * @typedef {ValueComponentOptions & TextBoxValueComponentInternalOptions} TextBoxValueComponentOptions*/

/**Component for displaying value text */
export class TextBoxValue extends ValueComponent {

    /**Build method which constructs the element and apply initial parameters
     * @param {TextBoxValueComponentOptions} options*/
    constructor(options) {
        super(options);
        this.__text = this.appendChild(document.createElement('span'));
        this.appendChild(this.__valueBox = document.createElement('div'));
        let unit = document.createElement('span');
        unit.appendChild(this.__unitNode = document.createTextNode(''));
        this.__valueBox.append(this.__valueNode = document.createTextNode(''), document.createTextNode(' '), unit);
    }

    /**Options toggeler
     * @param {TextBoxValueComponentOptions} options*/
    options(options) {
        this.decimals = options.decimals;
        super.options(options)
        if (typeof options.unit !== 'undefined') { this.unit = options.unit; }
        if (options.size) { this.size = options.size; }
        if (options.style) { this.fStyle = options.style; }
        if (options.weight) { this.weight = options.weight; }
    }

    /**Name for component creation
     * @returns {string} */
    static get elementName() { return componentNameStart + 'textvalue' };

    /**Creates an instance of the text element
     * @param {TextBoxValueComponentOptions} options
     * @returns {TextBoxValue}*/
    static create(options) {
        if (!options) { console.warn('Parameter must be passed'); return; }
        let elem = new TextBoxValue(options);
        elem.options(options);
        return elem;
    };

    /**Set the text of the component
     * @param {string} text*/
    set text(text) {
        this.__text.innerHTML = text
    }

    /**Set the text of the component
     * @returns {string}*/
    get text() {
        return this.__text.innerHTML;
    }

    /**Sets the amount of decimals the slider can have, 0 is none
     * @param {number} dec */
    set decimals(dec = 3) {
        if (typeof dec === 'number') {
            this.__dec = Math.max(parseInt(dec), 0);
            this.__hasDec = true;
        } else if (typeof dec === 'boolean') {
            this.__hasDec = false;
        } else {
            console.warn('None number passed');
        }
    }

    /**Gets the amount of decimals the slider can have
     * @returns {number} */
    get decimals() {
        return this.__dec
    }

    /**Set the size of the text
     * @param {number} size*/
    set size(size) {
        this.__valueBox.style.fontSize = size + 'rem';
    }

    /**Set the style of the text
     * @param {string} st*/
    set fStyle(st) {
        this.__valueBox.style.fontStyle = st
    }

    /**Set the weight of the text
     * @param {string} wg*/
    set weight(wg) {
        this.__valueBox.style.fontWeight = wg
    }

    /**This is called when the program sets the value
     * @param {ComponentInternalValue} val*/
    __newValue(val) {
        if (this.__hasDec) {
            this.__valueNode.nodeValue = val.toLocaleString(undefined, { maximumFractionDigits: this.__dec });
        } else {
            this.__valueNode.nodeValue = val;
        }
    }

    /**Sets the unit of the inputbox
     * @param {string|Value} */
    set unit(unit) {}

    /**Returns the current unit
     * @returns {string} */
    get unit() {}

    /**Internal unit setter
     * @param {string} val 
     * @private */
    $vfunit(val) {
        this.__unitNode.nodeValue = val;
    }
}
initWebComponentWithOptions(TextBoxValue, undefined, ['unit']);
export let textValue = TextBoxValue.create;