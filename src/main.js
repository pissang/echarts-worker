import CanvasContext2D from './CanvasContext2D';
import { normalizeEvent } from 'zrender/src/core/event';
import zrender from 'zrender';

var uuid = 1;
var workerUrl = './echarts-worker.js';
function getUUID() {
    return uuid++;
}

function ECharts(dom, theme, opts) {
    var ecWorker = new Worker(workerUrl);

    opts = opts || {};
    var devicePixelRatio = opts.devicePixelRatio || window.devicePixelRatio || 1;

    ecWorker.onmessage = this._messageHandler.bind(this);

    this._worker = ecWorker;

    this._dom = dom;

    this._zr = zrender.init(dom, {
        devicePixelRatio: devicePixelRatio
    });

    this._dpr = devicePixelRatio;
    
    this.resize(true);

    this._pendingCallbacks = {};

    this._initHandlers();
}

ECharts.prototype.initManually = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        self._sendActionToWorker('init', [null, {
            width: self._zr.getWidth(),
            height: self._zr.getHeight(),
            devicePixelRatio: self._dpr
        }], function () {
            resolve(self);
        });
    });
};

ECharts.prototype._messageHandler = function (e) {
    var data = e.data;
    if (data.callback && data.uuid && this._pendingCallbacks[data.uuid]) {
        this._pendingCallbacks[data.uuid].callback(data.result);
        delete this._pendingCallbacks[data.uuid];
    }
    else {
        switch (data.action) {
            case 'render':
                this._execCommands(data.layers);
                break;
            case 'setCursor':
                this._dom.style.cursor = data.cursor || 'default';
                break;
        }
    }
};

ECharts.prototype._execCommands = function (layerCommands)  {
    for (var zlevel in layerCommands) {
        var layer = this._zr.painter.getLayer(+zlevel);
        var ctx = layer.ctx;
        if (!layer.__ctxProxy) {
            layer.__ctxProxy = new CanvasContext2D();
            layer.__ctxProxy.dpr = this._dpr;
        }
        layer.__ctxProxy.execCommands(ctx, layerCommands[zlevel].commands);
    }
};

ECharts.prototype.resize = function (notPostMessage) {
    this._zr.resize();

    if (!notPostMessage) {
        return this._promisifySendActionToWorker('resize', [{
            width: this._zr.getWidth(), 
            height: this._zr.getHeight()
        }]);
    }

};

ECharts.prototype.setOption = function (option, notMerge) {
    return this._promisifySendActionToWorker('setOption', [option, notMerge]);
};

ECharts.prototype._promisifySendActionToWorker = function (action, parameters) {
    var self = this;
    return new Promise(function (resolve, reject) {
        self._sendActionToWorker(action, parameters, resolve)
    });
};

ECharts.prototype._sendActionToWorker = function (action, parameters, callback) {
    var uuid = getUUID();
    this._worker.postMessage({
        action: action,
        parameters: parameters,
        uuid: uuid
    });

    if (callback) {
        this._pendingCallbacks[uuid] = {
            action: action,
            callback: callback
        };
    }
};

ECharts.prototype._initHandlers = function () {
    var self = this;
    ['mousedown', 'mouseup', 'mousemove', 'click', 'dblclick'].forEach(function (eventType) {
        self._dom.addEventListener(eventType, function (event) {
            normalizeEvent(event);
            self._worker.postMessage({
                action: 'event',
                eventType: eventType,
                parameters: {
                    zrX: event.zrX,
                    zrY: event.zrY
                }
            });
        });
    });
};

var echarts = {
    setWorkerURL: function (_workerUrl) {
        workerUrl = _workerUrl;
    },
    init: function (dom) {
        var ec = new ECharts(dom);
        return ec.initManually();
    }
};

export default echarts;