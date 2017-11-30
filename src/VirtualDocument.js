import VirtualDivElement from './VirtualDivElement';
import VirtualCanvasElement from './VirtualCanvasElement';
import VirtualElement from './VirtualElement';

function VirtualBodyElement() {
    VirtualElement.call(this);
    this._nodeName = 'BODY';
}

VirtualBodyElement.prototype = new VirtualElement();
VirtualBodyElement.constructor = VirtualBodyElement;


function VirtualDocument() {

    this._body = new VirtualBodyElement();
}

VirtualDocument.prototype ={

    constructor: VirtualDocument,

    get body() {
        return this._body;
    },

    createElement: function (nodeName) {
        switch (nodeName.toLowerCase()) {
            case 'div':
                return new VirtualDivElement();
            case 'canvas':
                return new VirtualCanvasElement();
            default:
                console.warn('Unkown node ' + nodeName);
        }
    }
};


export default VirtualDocument;