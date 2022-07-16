import "../components/common.scss"
import '../styling/common';
import { initWebComponentWithOptions, WebComponentAccess, WebComponentAccessOptions } from "../common/webComponent";
import { Value } from "@sampilib/value";
import { blue, green, grey, orange, red, yellow } from '@sampilib/colors';
import { addThemeVariable } from "../styling/theme";

export let componentNameStart = 'comp-'

/**This contains the different ways to render an component
 * @enum {number}*/
export let Way = { UP: 0, DOWN: 1, LEFT: 2, RIGHT: 3 }

addThemeVariable('componentLabelTextColor', ['Components'], grey['700'], grey['300']);
addThemeVariable('componentBorderColor', ['Components'], grey['700'], grey['300']);
addThemeVariable('componentTextColor', ['Components'], grey['800'], grey['200']);
addThemeVariable('componentSymbolColor', ['Components'], grey['800'], grey['200']);
addThemeVariable('componentBackGroundColor', ['Components'], grey['50'], grey['900']);
addThemeVariable('componentHoverBackGroundColor', ['Components'], grey['400'], grey['700']);
addThemeVariable('componentFocusOutlineColor', ['Components'], orange['600'], orange['300']);
addThemeVariable('componentUnselectedBorderColor', ['Components'], grey['700'], grey['300']);
addThemeVariable('componentUnselectedTextColor', ['Components'], grey['600'], grey['400']);
addThemeVariable('componentUnselectedSymbolColor', ['Components'], grey['600'], grey['400']);
addThemeVariable('componentUnselectedBackGroundColor', ['Components'], grey['300'], grey['800']);
addThemeVariable('componentGreenColor', ['Components'], green['300'], green['900']);
addThemeVariable('componentRedColor', ['Components'], red['300'], red['900']);
addThemeVariable('componentBlueColor', ['Components'], blue['300'], blue['900']);
addThemeVariable('componentYellowColor', ['Components'], yellow['300'], yellow['900']);

//###################################
//#    ____                         #
//#   |  _ \                        #
//#   | |_) | __ _ ___  ___  ___    #
//#   |  _ < / _` / __|/ _ \/ __|   #
//#   | |_) | (_| \__ \  __/\__ \   #
//#   |____/ \__,_|___/\___||___/   #
//###################################
/**Defines base options for components 
 * @typedef {Object} ComponentBaseInternalOptions
 * @property {Way} way the orientation of the component
 * @property {string} text title text of component
 * 
 * Defines base options for components
 * @typedef {WebComponentAccessOptions & ComponentBaseInternalOptions} ComponentBaseOptions

/**Shared component class for other components to inherit from*/
export class Component extends WebComponentAccess {
    constructor() {
        super();
    }

    /**Set the way the component is rendered
     * @param {Way} way */
    set way(way = Way.DOWN) {
        if (typeof way == 'string') { if ((way = ['up', 'down', 'left', 'right'].indexOf(way)) == -1) { return } }
        this.classList.remove('up', 'down', 'left', 'right', 'horz', 'vert');
        this.classList.add(['up', 'down', 'left', 'right'][way], ['horz', 'horz', 'vert', 'vert'][way]);
        this.__onWay(way, this.__way);
        /**
         * @type {Way}
         * @private */
        this.__way = way;
    }

    /**This retreives the way the compontent is
     * @returns {string}*/
    get way() {
        return this.__way;
    }

    /**Set the text of the component
     * @param {string} text*/
    set text(text) {}

    /**Set the text of the component
     * @returns {string}*/
    get text() {}

    /**Internal way call 
     * @param {Way} way
     * @private*/
    __onWay(way) {}

    /**Options setting
     * @param {ComponentBaseOptions} options*/
    options(options) {
        super.options(options)
        if (typeof options.way !== 'undefined') { this.way = options.way; } else { this.way = undefined; }
        if (typeof options.text !== 'undefined') { this.text = options.text; }
    }
}

/**Allowed values for value component 
 * @typedef {string|number|boolean} ComponentInternalValue
 * Value and unit type for value component
 * @typedef {ComponentInternalValue|Value} ComponentValue
 * @typedef {string|Value} ComponentUnit
 * 
 * Defines base options for components with values
 * @typedef {Object} ValueComponentInternalOptions
 * @property {ComponentValue} [value] value to use for component
 * @property {()} [change] function to run at change
 * @property {string} [id] id/name to use to to batch actions
 * 
 * Defines base options for components with values
 * @typedef {ComponentBaseOptions & ValueComponentInternalOptions} ValueComponentOptions

/**Shared class for all components with values*/
export class ValueComponent extends Component {
    /**Options setting
     * @param {ValueComponentOptions} options*/
    options(options) {
        super.options(options)
        if (typeof options.value !== 'undefined') { this.value = options.value; }
        if (typeof options.change === 'function') { this.change = options.change; }
        if (typeof options.id === 'string') { this.id = options.id; }
    }

    /**Returns the value of the component if it has changed
     * @returns {undefined|ComponentInternalValue}*/
    get changed() {
        let val = this.value;
        if (val instanceof Promise) {
            let origBuff = this.__originalValue
            return (async () => {
                return (await val) != origBuff;
            })();
        } else {
            if (val != this.__originalValue) {
                return val;
            }
        }
    }

    /**Updates the internal buffer */
    updateValueBuffer() {
        let val = this.value;
        if (val instanceof Promise) {
            val.then((a) => {
                /** @private*/
                this.__originalValue = a;
            })
        } else {
            this.__originalValue = this.$vbvalueInt;
        }
    }

    /**Resets the value back to the originally set value before user influence */
    resetValue() {
        this.$vsvalueInt(this.__originalValue);
    }

    /**This sets the id of the component
     * @param {string} id*/
    set id(id) {
        if (typeof id === 'string') {
            /**@private */
            this.__id = id;
        } else {
            console.warn('None string passed');
        }
    }

    /**Returns id of the component
     * @returns {string} */
    get id() { return this.__id || ''; }

    /**This sets the value of the component
     * @param {ComponentValue} val*/
    set value(val) {
        if (this.__value) {
            if (this.isConnected) {
                val.removeListener(this.__valueListener);
            }
            this.dettachConnectListener(this.__connectListener);
            delete this.__connectListener;
        }
        if (val instanceof Value) {
            /**
             * @type {Value|*}
             * @private*/
            this.__value = val;
            let valBuff = val.get;
            if (valBuff instanceof Promise) {
                valBuff.then((a) => {
                    this.__originalValue = a;
                })
            } else {
                this.__originalValue = valBuff;
            }
            /**@private*/
            this.__connectListener = this.attachConnectListener((attDet) => {
                if (attDet) {
                    /**
                     * @type {import("../values/value").ValueListener}
                     * @private */
                    this.__valueListener = val.addListener((val) => {
                        /**@protected */
                        this.__valueBuffer = val;
                        this.__newValue(val);
                    }, true);
                } else {
                    val.removeListener(this.__valueListener);
                }
            });
        } else {
            this.__originalValue = val;
            this.__valueBuffer = val;
            this.__newValue(val);
        }
    }

    /**Returns value of the component
     * @returns {ComponentInternalValue} */
    get value() {
        return this.__valueBuffer;
    }

    /**Function to update value
     * @param {*} val
     * @protected */
    __setValue(val) {
        if (this.__value) {
            this.__value.set = val;
        } else {
            this.__valueBuffer = val;
            this.__newValue(val);
        }
        try {
            this.change(val, this);
        } catch (e) {
            console.warn('Failed at listener', e);
        }
    }

    /**Update function for value change
     * @param {*} val
     * @protected */
    __newValue(val) {

    }

    /**Overwriteable change listener
     * @param {ComponentInternalValue} val value at event
     * @param {ValueComponent} target the component itself*/
    change(val, target) {}
}
initWebComponentWithOptions(ValueComponent, true);

/**This describes how an option object should look
 * @typedef {Object} SelectorComponentOption
 * @property {string} text text to display for option
 * @property {*} value value to use for option
 * @property {SVGElement} symbol symbol for option
 * @property {boolean} disabled set to true to make option unselectable
 * 
 * Defines base options for components with multiple options
 * @typedef {Object} SelectorComponentInternalOptions
 * @property {[SelectorComponentOption]} options value to use for component
 * 
 * Defines base options for components with multiple options
 * @typedef {ValueComponentOptions & SelectorComponentInternalOptions} SelectorComponentOptions */

/**Shared class for all components with multiple options*/
export class SelectorComponent extends ValueComponent {
    /**Options setting
     * @param {SelectorComponentOptions} options*/
    options(options) {
        if (options.options) { this.selectorOptions = options.options; }
        super.options(options);
    }

    /**This adds an option to the selector component 
     * @param {string} text text for options
     * @param {ComponentInternalValue} value value for options
     * @param {SVGElement} symbol symbol to display
     * @param {boolean} disabled set to true to make option unselectable
     * @returns {HTMLElement} link to the option*/
    addOption(text, value, symbol, disabled) {}

    /**This removes an option to the selector component 
     * @param {HTMLElement} option*/
    removeOption(option) {}

    /**This sets the options of the selector with an array
     * @param {[SelectorComponentOption]} opts*/
    set selectorOptions(opts) {
        for (let i = 0, m = opts.length; i < m; i++) {
            this.addOption(opts[i].text, opts[i].value, opts[i].symbol, opts[i].disabled);
        }
    }

    /**Sets the value by using the options element
     * @param {HTMLDivElement} elem */
    setByOption(elem) {}
}