import VirtualElement from './VirtualElement';
import CanvasContext2D from './CanvasContext2D';

function VirtualCanvasElement() {
    this.width = 100;
    this.height = 100;

    VirtualElement.call(this);
    this._nodeName = 'CANVAS';
}

VirtualCanvasElement.prototype = new VirtualElement();
VirtualCanvasElement.prototype.constructor = VirtualCanvasElement;

VirtualCanvasElement.prototype.getContext = function () {
    if (!this._ctx) {
        this._ctx = new CanvasContext2D(true);
        // Start record on create
        this._ctx.startRecord();
    }
    return this._ctx;
};

export default VirtualCanvasElement;