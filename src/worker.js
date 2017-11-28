import CanvasContext2D from './CanvasContext2D';
import echarts from 'echarts';

function Canvas(width, height) {
    
    this.width = width || 100;
    this.height = height || 100;

    var ctx = new CanvasContext2D();

    this.getContext = function () {
        return ctx;
    };
}

echarts.setCanvasCreator(function () {
    return new Canvas();
});

var ec;
var canvas;
var dpr;

self.onmessage = function (e) {
    var data = e.data;
    var result;
    switch (data.action) {
        case 'init':
            canvas = new Canvas();
            dpr = data.parameters[1].devicePixelRatio || 1;
            ec = echarts.init(canvas, null, {
                width: data.parameters[1].width,
                height: data.parameters[1].height
            });
            canvas.width *= dpr;
            canvas.height *= dpr;
            var oldRefreshImmediately = ec.getZr().refreshImmediately;
            ec.getZr().refreshImmediately = function () {
                var ctx = canvas.getContext();
                // Force set context dpr
                // FIXME
                ctx.dpr = dpr;
                ctx.reset();
                oldRefreshImmediately.call(this);
                self.postMessage({
                    action: 'render',
                    commands: ctx.serialize()
                });
            };
            break;
        case 'resize':
            canvas.width = data.parameters[1].width * dpr;
            canvas.height = data.parameters[1].height * dpr;
        case 'setOption':
            result = ec[data.action].apply(ec, data.parameters);
    }

    self.postMessage({
        action: data.action,
        callback: true,
        uuid: data.uuid,
        result: result || null
    });
};