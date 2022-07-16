import "./toggleButton.scss"
import { componentNameStart, SelectorComponent, Way, SelectorComponentOptions } from "./common";
import { initWebComponentWithOptions } from "../common/webComponent";

/**Defines options for toggle button component 
 * @typedef {Object} ToggleButtonInternalOptions
 * 
 * Defines options for toggle button component 
 * @typedef {SelectorComponentOptions} ToggleButtonOptions*/


/**Toggle buttons, displays all options in a multi toggler*/
export class ToggleButton extends SelectorComponent {
    /**Component builder 
     * @param {ToggleButtonOptions} options*/
    constructor(options) {
        super();
        this.way = options.way;
        /**
         * @type {HTMLTableElement}
         * @protected */
        this.__buttons = this.appendChild(document.createElement('table'));
        /**
         * @type {HTMLTableRowElement}
         * @protected */
        this.__buttonsRow = this.__buttons.appendChild(document.createElement('tr'));
        this.__buttonsRow.classList.add('br');
        this.onkeyup = this.__keyUp;
        delete options.way;
        /**
         * @type {{}}
         * @protected */
        this.__options = {};
    }

    /**Name for component creation
     * @returns {string} */
    static get elementName() { return componentNameStart + 'togglebutton' };

    /**Creates an instance of the text element
     * @param {ToggleButtonOptions} options
     * @returns {ToggleButton}*/
    static create(options) {};

    /**This adds an option to the selector component 
     * @param {string} text text for options
     * @param {ComponentInternalValue} value value for options
     * @param {SVGElement} symbol symbol to display
     * @param {boolean} disabled set to true to make option unselectable
     * @returns {HTMLTableCellElement} link to the option*/
    addOption(text, value, symbol, disabled) {
        if (symbol instanceof SVGElement && !this.__symbols) { this.symbols = true; }
        if (!(symbol instanceof SVGElement)) { symbol = document.createElement('div'); }
        var opt = this.__buttonsRow.appendChild(document.createElement('td'));
        this.__options[value] = opt;
        opt.onclick = () => { this.setByOption(opt); };
        opt.text = document.createElement('div');
        opt.text.appendChild(document.createTextNode(text));
        opt.sym = symbol;
        opt.value = value;
        if (disabled) {
            opt.classList.add('disabled');
            opt.disabled = true;
        } else {
            opt.setAttribute('tabindex', 0);
        }
        if (this.__symbols) {
            opt.appendChild(symbol);
            let txt = this.__textRow.appendChild(document.createElement('td'));
            txt.onclick = opt.onclick;
            if (disabled) {
                txt.classList.add('disabled');
            }
            txt.appendChild(opt.text);
        } else { opt.appendChild(opt.text); }
        this.__buttons.style.minWidth = (this.__buttonsRow.children.length * 3) + 'rem';
        return opt;
    }

    /**Updates text of component
     * @param {string} text */
    set text(text) {
        if (typeof text == 'string') {
            if (!this.__text) {
                /**
                 * @type {HTMLSpanElement}
                 * @protected */
                this.__text = this.insertBefore(document.createElement('span'), this.__buttons);
            }
            this.__text.innerHTML = text;
        } else if (this.__text) {
            this.__text.remove;
            delete this.__text;
        }
    }

    /**This sets if the selector uses symbols
     * @param {boolean} sym */
    set symbols(sym) {
        if (sym && !this.__symbols) {
            if (this.__way == 0) {
                /**
                 * @type {HTMLTableRowElement}
                 * @protected */
                this.__textRow = document.createElement('tr');
                this.__buttons.insertBefore(this.__textRow, this.__buttonsRow);
            } else {
                this.__textRow = this.__buttons.appendChild(document.createElement('tr'));
            }
            for (let i = 0, n = this.__buttonsRow.children.length; i < n; i++) {
                this.__buttonsRow.children[i].appendChild(this.__buttonsRow.children[i].sym);
                let txt = this.__textRow.appendChild(document.createElement('td'));
                txt.appendChild(this.__buttonsRow.children[i].text);
            }
        } else if (!sym && this.__symbols) {
            for (let i = 0, n = this.__buttonsRow.children.length; i < n; i++) {
                this.__buttonsRow.children[i].innerHTML = '';
                this.__buttonsRow.children[i].appendChild(this.__buttonsRow.children[i].text);
            }
            this.__textRow.remove();
            delete this.__textRow;
        }
        /**
         * @type {boolean}
         * @protected */
        this.__symbols = sym;
    }

    /**Keyboard handling
     * @param {KeyboardEvent} e 
     * @private*/
    __keyUp(e) {
        switch (e.key) {
            case 'Enter': {
                if (!e.target.disabled) {
                    this.setByOption(e.target);
                }
                break;
            }
            case 'ArrowRight':
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
            case 'ArrowLeft':
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
    }

    /**Internal way call 
     * @param {Way}
     * @private*/
    __onWay(ways) {
        switch (ways) {
            case Way.UP:
                if (this.__textRow) {
                    this.__buttons.insertBefore(this.__textRow, this.__buttonsRow);
                }
                break;
            case Way.DOWN:
                if (this.__textRow) {
                    this.__buttons.appendChild(this.__textRow);
                }
                break;
        }
    }

    /**Internal access call 
     * @param {Access} a
     * @private*/
    __onAccess(a) {
        if (a == 'R') {
            let items = this.querySelectorAll('*[tabindex]');
            for (let i = 0, m = items.length; i < m; i++) {
                items[i].setAttribute('tabindex', -1);
            }
        } else if (a == 'W') {
            let items = this.querySelectorAll('*[tabindex]');
            for (let i = 0, m = items.length; i < m; i++) {
                items[i].setAttribute('tabindex', 0);
            }
        }
    }

    /**Sets the value by using the options element
     * @param {HTMLDivElement} elem */
    setByOption(elem) {
        if (elem instanceof HTMLTableCellElement && this.__buttonsRow.contains(elem)) {
            this.__setValue(elem.value);
            this.__selected.focus();
        }
    }

    /**Internal value setter
     * @param {boolean} val 
     * @private */
    __newValue(val) {
        if (val in this.__options) {
            if (this.__selected) {
                this.__selected.classList.remove('selected');
                this.__selected.text.parentElement.classList.remove('selected');
            }
            /**
             * @type {HTMLDivElement}
             * @protected */
            this.__selected = this.__options[val];
            this.__selected.classList.add('selected');
            this.__selected.text.parentElement.classList.add('selected');
        }
    }
}
initWebComponentWithOptions(ToggleButton);
export let toggleButton = ToggleButton.create;