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

var instances = {};

function initECharts(parameters) {
    var root = new VirtualDivElement();
    var dpr = parameters[1].devicePixelRatio || 1;
    var chart = echarts.init(root, parameters[0], {
        width: parameters[1].width || 100,
        height: parameters[1].height || 100,
        devicePixelRatio: dpr
    });
    instances[chart.id] = chart;

    var handlerProxy = new HandlerProxy();
    handlerProxy.setCursor = function (cursor) {
        self.postMessage({
            chartId: chart.id,
            action: 'setCursor',
            cursor: cursor
        });
    };

    var zr = chart.getZr();
    zr.handler.setHandlerProxy(handlerProxy);

    var oldRefreshImmediately = zr.refreshImmediately;
    var oldRefreshHoverImmediately = zr.refreshHoverImmediately;

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
            chartId: chart.id,
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
            chartId: chart.id,
            action: 'render',
            layers: layersCommands
        }, commandsBuffers);
    };

    return chart;
}

self.onmessage = function (e) {
    var data = e.data;
    var result;
    var chart;
    if (data.chartId != null) {
        chart = instances[data.chartId];
    }
    switch (data.action) {
        case 'init':
            chart = initECharts(data.parameters);
            result = chart.id;
            break;
        case 'registerMap':
        case 'getMap':
            result = echarts[data.action].apply(echarts, data.parameters);
            break;
        case 'dispose':
            if (chart) {
                chart.dispose();
                delete instances[data.chartId];
            }
            break;
        case 'resize':
            chart && chart.resize(data.parameters[0].width, data.parameters[0].height);
        case 'setOption':
            if (chart) {
                result = chart[data.action].apply(chart, data.parameters);
            }
            break;
        case 'event':
            if (chart) {
                chart.getZr().handler.proxy.trigger(data.eventType, data.parameters);
            }
            break;
    }

    self.postMessage({
        action: data.action,
        callback: true,
        uuid: data.uuid,
        chartId: data.chartId,
        result: result != null ? result : null
    });
};