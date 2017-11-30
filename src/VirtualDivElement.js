import VirtualElement from './VirtualElement';

function VirtualDivElement() {
    VirtualElement.call(this);
    this._nodeName = 'DIV';
}

VirtualDivElement.prototype = new VirtualElement();
VirtualDivElement.prototype.constructor = VirtualDivElement;

export default VirtualDivElement;