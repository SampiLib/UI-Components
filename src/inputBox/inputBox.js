import "./inputBox.scss"
import { edit_calendar, schedule } from '@sampilib/icons';
import { componentNameStart, ValueComponent, ValueComponentOptions } from "./common";
import { AccessTypes } from "../values/access";
import { stringByteLength } from "../common/formatting";
import { initWebComponentWithOptions } from "../common/webComponent";

/**List of all available types for the input box
 * @enum {string} */
export let InputBoxTypes = {
    BASE64: "base64",
    ASCII: "ascii",
    DATE: "date",
    TIMEMINUTE: "timemin",
    TIMESECOND: "timesec",
    DATETIMEMINUTE: "dtmin",
    DATETIMESECOND: "dtsec",
    TEXT: "text",
    NUMBER: "number",
    NUMBERPOSITIVE: "numberPositive",
    NUMBERWHOLE: "numberWhole",
    NUMBERWHOLEPOSITIVE: "numberWholePositive",
    TEL: "tel",
    EMAIL: "email",
    PASSCODE: "passcode",
    PASSWORD: "password",
    IP: "ip",
    COLOR: "color",
    File: "file",
    URL: "url",
}

/**Defines options for inputBox component 
 * @typedef {Object} InputBoxInternalOptions
 * @property {ComponentUnit} [unit] unit to use for component 
 * @property {number} [min] lower limit for number values
 * @property {number} [max] upper limit for number values 
 * @property {string} [placeholder] text to display when nothing is entered 
 * @property {InputBoxTypes} type type of value to process
 * @property {number} [length] max length of text
 * @property {number} [byteLength] max byte length of text
 * @property {boolean} [live] live mode where value is applied with each key press
 * 
 * @typedef {ValueComponentOptions & InputBoxInternalOptions} InputBoxOptions*/

/**Input box, for inputting values*/
export class InputBox extends ValueComponent {
    constructor() {
        super();
        /**
         * @type {HTMLDivElement}
         * @private */
        this.__cont = document.createElement('div')
        this.appendChild(this.__cont);
        /**
         * @type {HTMLInputElement}
         * @private */
        this.__input = document.createElement('input')
        this.__cont.appendChild(this.__input);
        /**
         * @type {HTMLDivElement}
         * @private */
        this.__unit = document.createElement('div')
        this.__cont.appendChild(this.__unit);
        this.__unit.appendChild(document.createTextNode(''));

        /**
         * @type {number}
         * @private */
        this.__min = -Infinity
        /**
         * @type {number}
         * @private */
        this.__max = Infinity;
        /**
         * @type {number}
         * @private */
        this.__byteLength = 0;
        /**
         * @type {string}
         * @private */
        this.___lastValue = '';

        let reset = 0;
        this.__input.onblur = (ev) => {
            if (reset >= 1) {
                if (reset >= 2) {
                    if (ev.relatedTarget) {
                        ev.relatedTarget.focus();
                    }
                    reset = 0;
                    this.__input.value = this.__valueBuffer || '';
                } else {
                    reset++;
                }
            } else {
                reset = 0;
            }
        }

        this.__input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                let val = this.__input.value = this.___limit(this.__input.value);
                let res = this.___update(val);
                if (res) {
                    e.stopPropagation();
                    this.__input.setCustomValidity(res);
                    this.__input.reportValidity();
                    reset = 1;
                } else {
                    this.__input.setCustomValidity('');
                    this.__setValue(val);
                    reset = 0;
                }
            }
        }

        this.__input.onchange = (ev) => {
            ev.stopPropagation();
            let val = this.__input.value = this.___limit(this.__input.value);
            let res = this.___update(val);
            if (res) {
                this.__input.setCustomValidity(res);
                this.__input.reportValidity();
                reset = 1;
            } else {
                this.__input.setCustomValidity('');
                this.__setValue(val);
                reset = 0;
            }
        }

        this.__input.addEventListener('wheel', (ev) => {
            if (this.ownerDocument.activeElement === this.__input) {
                ev.stopPropagation();
                ev.preventDefault();
                this.___wheel(ev.deltaY < 0);
            }
        });

        this.__input.addEventListener('beforeinput', (ev) => {
            ev.stopPropagation();
            let res;
            switch (ev.inputType) {
                case 'insertLineBreak':
                case 'deleteContentBackward':
                case 'deleteContentForward':
                case 'deleteWordBackward':
                case 'deleteWordForward': { break; }
                case 'insertFromPaste':
                case 'insertText': {
                    res = this.___insertText(ev, ev.data);
                    break;
                }
                default: { ev.preventDefault(); break; }
            }
            if (res) {
                this.__input.setCustomValidity(res);
                this.__input.reportValidity();
            } else {
                this.__input.setCustomValidity('');
            }
        });

        this.__input.addEventListener('input', () => {
            let res = this.___input(this.__input.value, this.__input.selectionStart, this.__input.selectionEnd);
            this.___lastValue = this.__input.value;
            if (res) {
                console.warn(res);
                this.__input.setCustomValidity(res);
                this.__input.reportValidity();
            } else {
                this.__input.setCustomValidity('');
            }
        });
    }

    /**Options toggeler
     * @param {InputBoxOptions} options*/
    options(options) {
        super.options(options)
        if (options.type) { this.type = options.type; }
        if (typeof options.unit !== 'undefined') { this.unit = options.unit; }
        if (typeof options.min === 'number') { this.min = options.min; }
        if (typeof options.max === 'number') { this.max = options.max; }
        if (options.placeholder) { this.placeholder = options.placeholder; }
        if (typeof options.length === 'number') { this.length = options.length; }
        if (typeof options.byteLength === 'number') { this.byteLength = options.byteLength; }
        if (typeof options.live !== 'undefined') { this.live = options.live; }
    }

    /**Name for component creation
     * @returns {string} */
    static get elementName() { return componentNameStart + 'inputbox' };

    /**Creates an instance of the input box element
     * @param {InputBoxOptions} options
     * @returns {InputBox}*/
    static create(options) {}

    /**Method to focus input box */
    focus() {
        this.__input.focus();
    }

    /**Sets the minimum value for input, only works with some types
     * @param {number} val*/
    set min(val) {
        switch (typeof val) {
            case 'number': {
                if (val === val) {
                    this.__min = val;
                    break;
                }
            }
            case 'undefined':
                this.__min = -Infinity;
                break;
            default:
                console.warn('None number passed');
                break;
        }
    }

    /**Sets the maximum value for input, only works with some types
     * @param {number} val*/
    set max(val) {
        switch (typeof val) {
            case 'number': {
                if (val === val) {
                    this.__max = val;
                    break;
                }
            }
            case 'undefined':
                this.__max = Infinity;
                break;
            default:
                console.warn('None number passed');
                break;
        }
    }

    /**Sets live mode, where value is set with each keypress
     * @param {boolean} live*/
    set live(live) {
        /**
         * @type {boolean}
         * @private */
        this.__live = Boolean(live);
    }

    /**Changes the text of the input box
     * @param {string} text */
    set text(text) {
        if (typeof text == 'string') {
            if (!this.__text) {
                /**
                 * @type {HTMLSpanElement}
                 * @private*/
                this.__text = this.insertBefore(document.createElement('span'), this.__cont);
            }
            this.__text.innerHTML = text;
        } else if (this.__text) {
            this.removeChild(this.__text);
            delete this.__text;
        }
    }

    /**Changes the placeholder text of the box
     * @param {string} text */
    set placeholder(text) {
        this.__input.placeholder = text;
    }

    /**Sets the max lenght of the text
     * @param {string} len */
    set length(len) {
        if (typeof len === 'number') {
            this.___maxLength = len;
        } else {
            delete this.___maxLength;
        }
    }

    /**Sets the max byte lenght of the text
     * @param {string} len */
    set byteLength(len) {
        if (typeof len === 'number') {
            /** @private*/
            this.___byteMax = len;
        } else {
            delete this.___byteMax;
        }
    }

    /**Sets which filetypes are allowed, using mime types
     * @param {[string]} types */
    set fileTypes(types) {
        if (types instanceof Array) {
            this.__input.accept = types.join(',');
        } else {
            this.__input.accept = '';
        }
    }

    /**Internal access call 
     * @param {Access} a
     * @private*/
    __onAccess(a) {
        switch (a) {
            case AccessTypes.READ:
                this.__input.setAttribute('readonly', '');
                break;
            case AccessTypes.WRITE:
                this.__input.removeAttribute('readonly');
                break;
        }
    }

    /**Internal value setter
     * @param {boolean} val 
     * @private */
    __newValue(val) {
        this.__input.value = val;
        this.___lastValue = this.__input.value;
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
        this.__unit.firstChild.nodeValue = val;
    }


    /** This sets the type of the input box
     * @param {InputBoxTypes} type the type of the input box*/
    set type(type) {
        switch (this.__type) {
            case InputBoxTypes.DATE:
            case InputBoxTypes.TIMEMINUTE:
            case InputBoxTypes.TIMESECOND:
            case InputBoxTypes.DATETIMEMINUTE:
            case InputBoxTypes.DATETIMESECOND:
                this.__cont.removeChild(this.__icon);
                break;
        }
        switch (type) {
            case InputBoxTypes.IP:
            case InputBoxTypes.TEXT:
            case InputBoxTypes.ASCII:
            case InputBoxTypes.URL:
            case InputBoxTypes.BASE64: { this.__input.type = 'text'; break; }
            case InputBoxTypes.DATE:
                this.__input.type = 'date';
                /**@private */
                (this.__icon = this.__cont.insertBefore(edit_calendar(), this.__unit)).onclick = () => { this.__input.showPicker(); }
                break;
            case InputBoxTypes.TIMESECOND:
                this.__input.step = 1;
            case InputBoxTypes.TIMEMINUTE:
                this.__input.type = 'time';
                (this.__icon = this.__cont.insertBefore(schedule(), this.__unit)).onclick = () => { this.__input.showPicker(); }
                break;
            case InputBoxTypes.DATETIMESECOND:
                this.__input.step = 1;
            case InputBoxTypes.DATETIMEMINUTE:
                this.__input.type = 'datetime-local';
                (this.__icon = this.__cont.insertBefore(edit_calendar(), this.__unit)).onclick = () => { this.__input.showPicker(); }
                break;
            case InputBoxTypes.EMAIL: { this.__input.type = 'email'; break; }
            case InputBoxTypes.NUMBER:
            case InputBoxTypes.NUMBERPOSITIVE:
            case InputBoxTypes.NUMBERWHOLE:
            case InputBoxTypes.NUMBERWHOLEPOSITIVE: { this.__input.type = 'number'; break; }
            case InputBoxTypes.PASSCODE:
            case InputBoxTypes.PASSWORD: { this.__input.type = 'password'; break; }
            case InputBoxTypes.TEL: { this.__input.type = 'tel'; break; }
            case InputBoxTypes.COLOR: { this.__input.type = 'color'; break; }
            case InputBoxTypes.File: { this.__input.type = 'file'; break; }
            default:
                console.warn('Invalid inputbox type');
                return;
        }
        /**
         * @type {InputBoxTypes}
         * @private*/
        this.__type = type;
    }

    /**Updates internal variables
     * @param {string} val
     * @returns {string}
     * @private */
    ___limit(val) {
        switch (this.__type) {
            case InputBoxTypes.NUMBER:
            case InputBoxTypes.NUMBERPOSITIVE:
            case InputBoxTypes.NUMBERWHOLE:
            case InputBoxTypes.NUMBERWHOLEPOSITIVE:
                return Math.min(this.__max, Math.max(this.__min, val));
            default:
                return val;
        }
    }

    /**Updates internal variables
     * @param {string} val
     * @returns {string}
     * @private */
    ___update(val) {
        switch (this.__type) {
            case InputBoxTypes.BASE64: {
                try {
                    window.atob(val);
                    return
                } catch (e) {
                    return 'Invalid base 64';
                }
            }
            case InputBoxTypes.URL: {
                try {
                    new URL(val);
                } catch (e) {
                    return 'Invalid URL';
                }
            }
            case InputBoxTypes.IP: {
                if (!/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/g.test(val)) {
                    return 'Invalid IP Address';
                }
            }
        }
    }

    /**Called when new data is entered
     * @param {string} val
     * @param {number} start
     * @param {number} end
     * @returns {string}
     * @private */
    ___input(val, start, end) {
        switch (this.__type) {
            case InputBoxTypes.BASE64:
            case InputBoxTypes.ASCII:
            case InputBoxTypes.TEXT:
            case InputBoxTypes.EMAIL:
            case InputBoxTypes.TEL:
            case InputBoxTypes.PASSCODE:
            case InputBoxTypes.PASSWORD: {
                let bytes = stringByteLength(val);
                if (this.___byteMax > 0 && bytes > this.___byteMax) {
                    this.__input.value = this.___lastValue;
                    return 'Maximum of ' + this.___byteMax + ' bytes';
                }
                if (this.___maxLength > 0 && val.length > this.___maxLength) {
                    this.__input.value = this.___lastValue;
                    return 'Maximum of ' + this.___maxLength + ' characters';
                }
                break;
            }
            case InputBoxTypes.IP: {
                let parts = val.split('.');
                console.log(parts, start, end);
                for (let i = 0; i < parts.length; i++) {
                    let part = parseInt(parts[i]);
                    if (i < parts.length - 1 || i == 3) {
                        if (part > 255) {
                            parts[i] = 255;
                            continue;
                        }
                    } else {
                        if (parts[i].length > 3 && i == parts.length - 1) {
                            parts[i + 1] = parts[i].substring(3);
                            parts[i] = parts[i].substring(0, 3);
                            continue;
                        }
                        if (part > 255) {
                            parts[i + 1] = parts[i].substring(2);
                            parts[i] = parts[i].substring(0, 2);
                            continue;
                        }
                    }
                }
                parts.length = Math.min(parts.length, 4);
                this.__input.value = parts.join('.');
                break;
            }
        }
    }


    /**Method handling newly added text
     * @param {InputEvent} ev 
     * @param {string} text 
     * @returns {string}
     * @private*/
    ___insertText(ev, text) {
        switch (this.__type) {
            case InputBoxTypes.BASE64:
                if (text.search(/[^-A-Za-z0-9+/=]|=[^=]|={3,}$/gm) !== -1) {
                    ev.preventDefault();
                    return text + ' is not valid BASE64';
                }
                break;
            case InputBoxTypes.ASCII:
                if (text.search(/[^ -~]/g) !== -1) {
                    ev.preventDefault();
                    return text + ' is not valid ASCII';
                }
                break;
            case InputBoxTypes.IP:
                if (text.search(/[^\d\.]/g) !== -1) {
                    ev.preventDefault();
                    return text + ' is not valid for and IP address';
                }
                break;
            case InputBoxTypes.NUMBERPOSITIVE:
                if (text.search(/[^\d\.,]/g) !== -1) {
                    ev.preventDefault();
                    return 'Only positive numbers allowed';
                }
                break;
            case InputBoxTypes.NUMBERWHOLE:
                if (text.search(/[^-\d]/g) !== -1) {
                    ev.preventDefault();
                    return 'Only whole numbers allowed';
                }
                break;
            case InputBoxTypes.NUMBERWHOLEPOSITIVE:
                if (text.search(/[^\d]/g) !== -1) {
                    ev.preventDefault();
                    return 'Only whole positive numbers allowed';
                }
                break;
            case InputBoxTypes.PASSCODE:
                if (text.search(/[^\d]/g) !== -1) {
                    ev.preventDefault();
                }
                break;
            case InputBoxTypes.TEL: {
                if (text.search(/[^\+\d]/g) !== -1) {
                    ev.preventDefault();
                    return text + ' is not valid for a phone number';
                }
                break;
            }
            case InputBoxTypes.URL: {
                if (text.search(/[^A-Za-z0-9-._~:/?#[\]@!$&'()*+,;=%]|%([^0-9A-F]{2}|[^0-9A-F][0-9A-F]|[0-9A-F][^0-9A-F])/g) !== -1) {
                    ev.preventDefault();
                    return text + ' is not valid for a URL';
                }
                break;
            }
            default:
                break;
        }

    }

    /**Method handling newly added text
     * @param {boolean} way 
     * @private*/
    ___wheel(way) {
        switch (this.__type) {
            case InputBoxTypes.NUMBER:
            case InputBoxTypes.NUMBERPOSITIVE:
            case InputBoxTypes.NUMBERWHOLE:
            case InputBoxTypes.NUMBERWHOLEPOSITIVE:
                let old = Number(this.__valueBuffer);
                if (old !== old) {
                    old = 0;
                }
                this.__setValue((way ? old + 1 : old - 1));
                break;
        }
    }

    /**Returns the inputbox type used
     * @returns {string} */
    get type() {
        return this.__type || ''
    }
}
initWebComponentWithOptions(InputBox, undefined, ['unit']);
export let inputBox = InputBox.create;