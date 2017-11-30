function VirtualElement() {
    
    this._firstChild = null;

    this._lastChild = null;

    this._parentNode = null;

    this._nextSibling = null;

    this._prevSibling = null;

    this._nodeName = '';

    // TODO
    this.style = {};

    this._attributes = {};
}

VirtualElement.prototype = {
    constructor: VirtualElement,

    get firstChild() {
        return this._firstChild;
    },

    get parentNode() {
        return this._parentNode;
    },

    get nextSibling() {
        return this._nextSibling;
    },

    get prevSibling() {
        return this._prevSibling;
    },

    get nodeName() {
        return this._nodeName;
    },
    
    appendChild: function (child) {
        if (!this._lastChild) {
            this._firstChild = this._lastChild = child;
            child._nextSibling = child._prevSibling = null;
        }
        else {
            this._lastChild._nextSibling = child;
            child._prevSibling = this._lastChild;
            this._lastChild = child;
        }
        child._parentNode = this;
    },

    insertBefore: function (child, refChild) {
        if (refChild.parentNode !== this) {
            throw new Error('NOT_FOUND_ERR');
        }
        var prevSibling = refChild._prevSibling;
        if (prevSibling) {
            prevSibling._nextSibling = child;
            child._prevSibling = prevSibling;
        }
        else {
            this._firstChild = child;
        }
        child._nextSibling = refChild;
        refChild._prevSibling = child;
    },

    setAttribute: function (key, val) {
        this._attributes[key] = val;
    },

    getAttribute: function (key) {
        return this._attributes[key];
    }
};

export default VirtualElement;