import VirtualDivElement from './VirtualDivElement';
import echarts from 'echarts';
import HandlerProxy from './HandlerProxy';
import VirtualDocument from './VirtualDocument';
import Layer from 'zrender/src/Layer';

self.document = new VirtualDocument();


Layer.prototype.__cleared = true;
var oldClear = Layer.prototype.clear;
Layer.prototype.clear = function () {
    oldClear.arguments(this, arguments);
    this.__cleared = true;
};

var ec;
var root;
var dpr;
var handlerProxy;

function initECharts(parameters) {
    root = new VirtualDivElement();
    dpr = parameters[1].devicePixelRatio || 1;
    ec = echarts.init(root, parameters[0], {
        width: parameters[1].width || 100,
        height: parameters[1].height || 100,
        devicePixelRatio: dpr
    });

    handlerProxy = new HandlerProxy();
    var zr = ec.getZr();
    zr.handler.setHandlerProxy(handlerProxy);

    var oldRefreshImmediately = zr.refreshImmediately;
    var oldRefreshHoverImmediately = zr.refreshHoverImmediately;

    function clearWrapper() {

    }
    zr.refreshHoverImmediately = function () {
        var hoverLayer = zr.painter.getHoverLayer();
        var commands = {};

        hoverLayer.ctx.startRecord();
        oldRefreshHoverImmediately.call(this);
        commands[hoverLayer.zlevel] = {
            clear: true,
            commands: hoverLayer.ctx.stopRecord()
        };
        self.postMessage({
            action: 'render',
            layers: commands
        });
    };

    zr.refreshImmediately = function () {
        var layersCommands = {};
        var commandsBuffers = [];
        zr.painter.eachLayer(function (layer, zlevel) {
            layer.ctx.startRecord();
            layer.__cleared = false;
        });
        oldRefreshImmediately.call(this);
        zr.painter.eachLayer(function (layer, zlevel) {
            var ctx = layer.ctx;
            var commands = ctx.stopRecord();
            layersCommands[zlevel] = {
                clear: layer.__cleared,
                commands: commands
            };
            commandsBuffers.push(commands.buffer);
        });
        self.postMessage({
            action: 'render',
            layers: layersCommands
        }, commandsBuffers);
    };
}

self.onmessage = function (e) {
    var data = e.data;
    var result;
    switch (data.action) {
        case 'init':
            initECharts(data.parameters);
            break;
        case 'resize':
            ec.resize(data.parameters[0].width, data.parameters[0].height);
        case 'setOption':
            result = ec[data.action].apply(ec, data.parameters);
            break;
        case 'event':
            handlerProxy.trigger(data.eventType, data.parameters);
            break;
    }

    self.postMessage({
        action: data.action,
        callback: true,
        uuid: data.uuid,
        result: result || null
    });
};