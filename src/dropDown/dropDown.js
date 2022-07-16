import "./dropDown.scss"
import { unfold_more } from '@sampilib/icons';
import { componentNameStart, SelectorComponent, SelectorComponentOptions } from "./common";
import { AccessTypes } from "../values/access";
import { initWebComponentWithOptions } from "../common/webComponent";
import { nameSpace } from "../common/svg";

/**Defines options for dropdown component 
 * @typedef {Object} DropDownInternalOptions
 * @property {string} default the text displaied when nothing is selected
 * 
 * Defines options for dropdown component 
 * @typedef {SelectorComponentOptions & DropDownInternalOptions} DropDownOptions*/

/**Dropdown box for selecting between multiple choices in a small space*/
export class DropDown extends SelectorComponent {
    constructor() {
        super();
        /**
         * @type {{}}
         * @protected */
        this.__options = {};
        /**
         * @type {HTMLDivElement}
         * @protected */
        this.__container = document.createElement('div');
        this.appendChild(this.__container);
        /**
         * @type {HTMLDivElement}
         * @protected */
        this.__selector = document.createElement('div');
        this.__container.appendChild(this.__selector);
        this.__selector.onclick = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            this.open = !this.open;
        };
        this.__selector.setAttribute('tabindex', 0);
        this.__selector.onkeydown = (e) => {
            switch (e.key) {
                case ' ': {
                    this.open = true;
                    break;
                }
                case 'ArrowDown': {
                    if (this.__selected) {
                        let check = this.__selected.nextSibling;
                        while (check && check.disabled) {
                            check = check.nextSibling;
                        }
                        if (check) {
                            this.setByOption(check);
                        }
                    } else if (!this.__dropDown.children[0].disabled) {
                        this.setByOption(this.__dropDown.children[0]);
                    } else if (this.__dropDown.children.length > 1) {
                        let check = this.__dropDown.children[0].nextSibling;
                        while (check && check.disabled) {
                            check = check.nextSibling;
                        }
                        if (check) {
                            this.setByOption(check);
                        }
                    }
                    break;
                }
                case 'ArrowUp': {
                    if (this.__selected) {
                        let check = this.__selected.previousSibling;
                        while (check && check.disabled) {
                            check = check.previousSibling;
                        }
                        if (check) {
                            this.setByOption(check);
                        }
                    } else if (!this.__dropDown.children[this.__dropDown.children.length - 1].disabled) {
                        this.setByOption(this.__dropDown.children[this.__dropDown.children.length - 1]);
                    } else if (this.__dropDown.children.length > 1) {
                        let check = this.__dropDown.children[this.__dropDown.children.length - 1].previousSibling;
                        while (check && check.disabled) {
                            check = check.previousSibling;
                        }
                        if (check) {
                            this.setByOption(check);
                        }
                    }
                    break;
                }
                default: { return; }
            }
            e.stopPropagation();
            e.preventDefault();
        };
        /**
         * @type {SVGElement}
         * @protected */
        this.__selIcon = document.createElementNS(nameSpace, 'svg');
        this.__selector.appendChild(this.__selIcon);
        /**
         * @type {HTMLDivElement}
         * @protected */
        this.__selText = document.createElement('div');
        this.__selector.appendChild(this.__selText);
        this.__selector.appendChild(unfold_more());
        /**
         * @type {HTMLSpanElement}
         * @protected */
        this.__dropDown = document.createElement('span');
        this.__container.appendChild(this.__dropDown);
        this.__dropDown.setAttribute('tabindex', 0);
        this.__dropDown.onblur = (ev) => {
            if (ev.relatedTarget !== this.__selector) {
                this.open = false;
            }
        };
        this.__dropDown.onkeydown = (e) => {
            e.stopPropagation();
            e.preventDefault();
            switch (e.key) {
                case 'Escape': {
                    this.open = false;
                    this.__selector.focus();
                    break;
                }
                case 'Enter':
                case ' ': {
                    this.open = false;
                    this.setByOption(this.___next);
                    this.__selector.focus();
                    break;
                }
                case 'ArrowDown': {
                    if (this.___next) {
                        let check = this.___next.nextSibling;
                        while (check && check.disabled) {
                            check = check.nextSibling;
                        }
                        if (check) {
                            this.__next = check;
                        }
                    } else if (!this.__dropDown.children[0].disabled) {
                        this.__next = this.__dropDown.children[0];
                    } else if (this.__dropDown.children.length > 1) {
                        let check = this.__dropDown.children[0].nextSibling;
                        while (check && check.disabled) {
                            check = check.nextSibling;
                        }
                        if (check) {
                            this.__next = check;
                        }
                    }
                    break;
                }
                case 'ArrowUp': {
                    if (this.___next) {
                        let check = this.___next.previousSibling;
                        while (check && check.disabled) {
                            check = check.previousSibling;
                        }
                        if (check) {
                            this.__next = check;
                        }
                    } else if (!this.__dropDown.children[this.__dropDown.children.length - 1].disabled) {
                        this.__next = this.__dropDown.children[this.__dropDown.children.length - 1];
                    } else if (this.__dropDown.children.length > 1) {
                        let check = this.__dropDown.children[this.__dropDown.children.length - 1].previousSibling;
                        while (check && check.disabled) {
                            check = check.previousSibling;
                        }
                        if (check) {
                            this.__next = check;
                        }
                    }
                    break;
                }
            }
        };
        this.__dropDown.classList.add('h');
        /**
         * @type {boolean}
         * @protected */
        this.__open = false;
    }

    /**Options toggeler
     * @param {DropDownOptions} options*/
    options(options) {
        super.options(options)
        if (typeof options.default === 'string') {
            this.default = options.default;
        } else {
            this.default = 'Select Item';
        }
    }

    /**Name for component creation
     * @returns {string} */
    static get elementName() {
        return componentNameStart + 'dropdown'
    };

    /**Creates an instance of the dropdown element
     * @param {DropDownOptions} options
     * @returns {DropDown}*/
    static create(options) {}

    /**Sets the next flag on an options used for keyboard usage
     * @param {HTMLDivElement} val
     * @private*/
    set __next(val) {
        if (val instanceof HTMLDivElement && this.__dropDown.contains(val) != -1) {
            if (this.___next) {
                this.___next.classList.remove('next');
            }
            /**
             * @type {HTMLDivElement}
             * @protected */
            this.___next = val;
            this.___next.classList.add('next');
        } else {
            if (this.___next) {
                this.___next.classList.remove('next');
            }
        }
    }

    /**Toggles wether the drop down is open
     * @param {boolean} tog true is open false is close*/
    set open(tog) {
        if (tog) {
            this.__dropDown.classList.remove('h');
            this.__dropDown.focus();
            this.__next = null;
        } else {
            this.__dropDown.classList.add('h');
        }
        this.__open = Boolean(tog);
    }

    /**Returns wether the dropdown is open/visible
     * @returns {boolean}*/
    get open() {
        return this.__open;
    }

    /**This adds an option to the selector component 
     * @param {string} text text for options
     * @param {ComponentInternalValue} value value for options
     * @param {SVGElement} symbol symbol to display
     * @param {boolean} disabled set to true to make option unselectable
     * @returns {HTMLElement} link to the option*/
    addOption(text, value, symbol = document.createElementNS(nameSpace, 'svg'), disabled) {
        if (!(value in this.__options)) {
            let option = this.__dropDown.appendChild(document.createElement('div'));
            option.value = value;
            option.symbol = option.appendChild(symbol);
            option.text = option.appendChild(document.createElement('div'));
            option.text.innerHTML = text;
            if (disabled) {
                option.classList.add('disabled');
                option.disabled = true;
            }
            option.onclick = (e) => {
                e.stopPropagation();
                this.open = false;
                this.setByOption(option);
                this.__selector.focus();
            };
            this.__options[value] = option;
            return option;
        } else {
            console.warn('Value already in dropdown');
        }
    }

    /**Removes option from dropdown
     * @param {HTMLElement|number|string} option */
    removeOption(option) {
        //If value is passed instead of option element
        if (!(option instanceof HTMLElement) && option in this.__options) {
            option = this.__options[option];
        }
        delete this.__options[option.value];
        this.__dropDown.removeChild(option);
    }

    /**Sets explaning text for component
     * @param {string} text */
    set text(text) {
        if (typeof text == 'string') {
            if (!this.__text) {
                /**
                 * @type {HTMLSpanElement}
                 * @protected */
                this.__text = this.insertBefore(document.createElement('span'), this.firstChild);
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
                let items = this.querySelectorAll('*[tabindex]');
                for (let i = 0, m = items.length; i < m; i++) { items[i].setAttribute('tabindex', -1); }
                break;
            }
            case AccessTypes.WRITE: {
                let items = this.querySelectorAll('*[tabindex]');
                for (let i = 0, m = items.length; i < m; i++) { items[i].setAttribute('tabindex', 0); };
                break;
            }
        }
    }

    /**Sets the text displaid when nothing is selected
     * @param {string} text*/
    set default(text) {
        if (!this.__selected) {
            this.__selText.innerHTML = text;
        }
    }

    /**Sets the value by using the options element
     * @param {HTMLDivElement} elem */
    setByOption(elem) {
        if (elem instanceof HTMLDivElement && this.__dropDown.contains(elem)) {
            this.__setValue(elem.value);
        }
    }

    /**Internal value setter
     * @param {*} val 
     * @private */
    __newValue(val) {
        if (val in this.__options) {
            val = this.__options[val];
            if (this.__selected) {
                this.__selected.classList.remove('sel');
            }
            /**
             * @type {HTMLDivElement}
             * @protected */
            this.__selected = val;
            this.__selected.classList.add('sel');
            this.__selText.innerHTML = val.text.innerHTML;
            let old = this.__selIcon;
            this.__selector.replaceChild(this.__selIcon = (val.symbol ? val.symbol.cloneNode(true) : document.createElementNS(nameSpac, 'svg')), old);
        }
    }
}
initWebComponentWithOptions(DropDown);
export let dropDown = DropDown.create;