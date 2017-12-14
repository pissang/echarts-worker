import CommandsRepeater from './CanvasCommandRepeater';
import { normalizeEvent } from 'zrender/src/core/event';
import zrender from 'zrender';

var uuid = 1;
var workerUrl = './echarts-worker.js';
var worker;

var instances = {};

function getUUID() {
    return uuid++;
}

function ECharts(dom, theme, opts) {

    opts = opts || {};
    var devicePixelRatio = opts.devicePixelRatio || window.devicePixelRatio || 1;

    this._dom = dom;

    this._zr = zrender.init(dom, {
        devicePixelRatio: devicePixelRatio
    });
    this._zr.animation.on('frame', this._loop, this);

    this._dpr = devicePixelRatio;

    this.resize(true);

    // PENDING commands of each layer
    this._pendingCommands = {};

    this._initHandlers();
}

ECharts.prototype.initManually = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        sendActionToWorker(this, 'init', [null, {
            width: self._zr.getWidth(),
            height: self._zr.getHeight(),
            devicePixelRatio: self._dpr
        }], function (id) {
            self.id = id;
            instances[id] = self;
            resolve(self);
        });
    });
};

ECharts.prototype.resize = function (notPostMessage) {
    this._zr.resize();

    if (!notPostMessage) {
        return promisifySendActionToWorker(this, 'resize', [{
            width: this._zr.getWidth(),
            height: this._zr.getHeight()
        }]);
    }
};

ECharts.prototype.setOption = function (option, notMerge) {
    return promisifySendActionToWorker(this, 'setOption', [option, notMerge]);
};

ECharts.prototype.dispose = function () {
    this._zr.dispose();
    delete instances[this.id];
    return promisifySendActionToWorker(this, 'dispose');
};


ECharts.prototype._initHandlers = function () {
    var self = this;
    ['mousedown', 'mouseup', 'mousemove', 'click', 'dblclick', 'zoom', 'DOMMouseScroll', 'mousewheel'].forEach(function (eventType) {
        self._dom.addEventListener(eventType, function (event) {
            normalizeEvent(event);
            worker.postMessage({
                chartId: self.id,
                action: 'event',
                eventType: eventType,
                parameters: {
                    zrX: event.zrX,
                    zrY: event.zrY,
                    zrDelta: event.zrDelta
                }
            });
        });
    });
};

ECharts.prototype._loop = function () {
    var totalExecTime = 0;
    for (var zlevel in this._pendingCommands) {
        var commands = this._pendingCommands[zlevel][0];
        if (!commands) {
            continue;
        }

        var execTime = commands.repeater.execute(12);
        if (commands.repeater.isFinished()) {
            this._pendingCommands[zlevel].shift();
        }
        totalExecTime += execTime;
    }
    // console.log(totalExecTime);
};

ECharts.prototype._clearLayerCommands = function (layers) {
    for (var zlevel in layers) {
        this._pendingCommands[zlevel] = [];
    }
};

ECharts.prototype._updateLayerCommands = function (layerCommands) {
    for (var zlevel in layerCommands) {
        var layer = this._zr.painter.getLayer(+zlevel);
        var ctx = layer.ctx;
        this._pendingCommands[zlevel] = this._pendingCommands[zlevel] || [];
        if (layerCommands[zlevel].clear) {
            this._pendingCommands = [];
        }
        this._pendingCommands[zlevel].push({
            repeater: new CommandsRepeater(ctx, layerCommands[zlevel].commands)
        });
    }
};

var echarts = {};

echarts.setWorkerURL = function (_workerUrl) {
    workerUrl = _workerUrl;
};

echarts.init = function (dom) {
    var ec = new ECharts(dom);
    return ec.initManually();
};

echarts.dispose = function (chart) {
    chart.dispose();
};

echarts.registerMap = function (name, geoJSON) {
    return promisifySendActionToWorker('registerMap', [name, geoJSON]);
};

echarts.getMap = function (name) {
    return promisifySendActionToWorker('getMap', [name]);
};

/////////////// Communicate with worker.
var pendingCallbacks = {};
function messageHandler(e) {
    var data = e.data;

    var chart;
    if (data.chartId != null) {
        chart = instances[data.chartId];
    }

    if (data.callback && data.uuid && pendingCallbacks[data.uuid]) {
        pendingCallbacks[data.uuid].callback(data.result);
        delete pendingCallbacks[data.uuid];
    }
    else {
        switch (data.action) {
            case 'render':
                chart && chart._updateLayerCommands(data.layers);
                break;
            case 'setCursor':
                chart && chart._zr.setCursorStyle(data.cursor || 'default');
                break;
        }
    }
}

function promisifySendActionToWorker(chart, action, parameters) {
    return new Promise(function (resolve, reject) {
        sendActionToWorker(chart, action, parameters, resolve);
    });
};

function sendActionToWorker(chart, action, parameters, callback) {
    if (!worker) {
        worker = new Worker(workerUrl);
        worker.onmessage = messageHandler;
    }

    // Chart parameter is ignored.
    if (typeof chart === 'string') {
        parameters = action;
        action = chart;
        chart = null;
    }

    var uuid = getUUID();
    worker.postMessage({
        chartId: chart ? chart.id : null,
        action: action,
        parameters: parameters,
        uuid: uuid
    });

    if (callback) {
        pendingCallbacks[uuid] = {
            action: action,
            callback: callback
        };
    }
};

export default echarts;