var CanvasContext2D = require('./CanvasContext2D').default;

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
    this._ctxProxy = new CanvasContext2D();

    this._canvas = document.createElement('canvas');
    this._ctx = this._canvas.getContext('2d');
    this._dom = dom;
    dom.appendChild(this._canvas);

    this._dpr = devicePixelRatio;
    
    this.resize(true);

    this._pendingCallbacks = {};
}

ECharts.prototype.initManually = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        self._sendActionToWorker('init', [null, {
            width: self._width,
            height: self._height,
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
                this._ctxProxy.repeatCommands(this._ctx, data.commands);
        }
    }
};

ECharts.prototype.resize = function (notPostMessage) {
    var width = this._dom.clientWidth;
    var height = this._dom.clientHeight;
    this._canvas.width = width * this._dpr;
    this._canvas.height = height * this._dpr;

    this._canvas.style.width = width + 'px';
    this._canvas.style.height = height + 'px';

    this._width = width;
    this._height = height;

    if (!notPostMessage) {
        return this._promisifySendActionToWorker('resize', [{
            width: width, 
            height: height
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

var echarts = {
    setWorkerURL: function (_workerUrl) {
        workerUrl = _workerUrl;
    },
    init: function (dom) {
        var ec = new ECharts(dom);
        return ec.initManually();
    }
};

module.exports = echarts;