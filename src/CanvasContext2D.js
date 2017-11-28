import * as color from 'zrender/src/tool/color';
import parseCssFont from 'parse-css-font';

var COMMANDS = [
    'fillStyle',
    'strokeStyle',
    'lineWidth',
    'font',
    'textBaseline',
    'textAlign',
    'beginPath',
    'moveTo',
    'lineTo',
    'bezierCurveTo',
    'quadraticCurveTo',
    'arc',
    'rect',
    'closePath',
    'fill',
    'stroke',
    'fillText',
    'strokeText',
    'measureText',
    'shadowColor',
    'shadowBlur',
    'shadowOffsetX',
    'shadowOffsetY',
    'setTransform',
    'save',
    'restore',
    'clearRect',
    'fillRect',
    'strokeRect'
].reduce(function (obj, val, idx) {
    obj[val] = idx;
    return obj;
}, {});

var defaultBlackColor = [0, 0, 0, 0];
var parsedColorRGBA = [];

function CanvasContext2D() {
    this._data = [];
}

CanvasContext2D.prototype = {

    constructor: CanvasContext2D,

    _fillStyle: '#000',

    _strokeStyle: '#000',

    _opacity: 1,

    _shadowColor: '#000',

    _shadowBlur: 0,

    _shadowOffsetX: 0,

    _shadowOffsetY: 0,

    _lineWidth: 1,

    _font: '12px sans-serif',

    _textBaseline: 'alphabetic',

    _textAlign: 'start',

    reset: function () {
        this._data = [];
    },
    
    get fillStyle() {
        return this._fillStyle;
    },

    set fillStyle(val) {
        this._fillStyle = val;
        this._data.push(COMMANDS.fillStyle);
        this._addColor(val);
    },

    get strokeStyle() {
        return this._strokeStyle;
    },

    set strokeStyle(val) {
        this._strokeStyle = val;
        this._data.push(COMMANDS.strokeStyle);
        this._addColor(val);
    },

    get lineWidth() {
        return this._lineWidth;
    },

    set lineWidth(val) {
        this._lineWidth = val;
        this._data.push(COMMANDS.lineWidth);
        this._data.push(val);
    },

    get font() {
        return this._font;
    },

    set font(val) {
        if (val) {
            this._font = val;
            this._data.push(COMMANDS.font);
            this._addString(val);
        }
    },
    
    
    get textBaseline() {
        return this._textBaseline;
    },

    set textBaseline(val) {
        if (val) {
            this._textBaseline = val;
            this._data.push(COMMANDS.textBaseline);
            this._addString(val);
        }
    },
    get textAlign() {
        return this._textAlign;
    },

    set textAlign(val) {
        if (val) {
            this._textAlign = val;
            this._data.push(COMMANDS.textAlign);
            this._addString(val);
        }
    },

    get shadowColor() {
        return this._shadowColor;
    },

    set shadowColor(val) {
        this._shadowColor = val;
        this._data.push(COMMANDS.shadowColor);
        this._addColor(val);
    },

    get shadowBlur() {
        return this._shadowBlur;
    },

    set shadowBlur(val) {
        this._shadowBlur = val;
        this._data.push(COMMANDS.shadowBlur);
        this._data.push(val);
    },

    get shadowOffsetX() {
        return this._shadowOffsetX;
    },

    set shadowOffsetX(val) {
        this._shadowOffsetX = val;
        this._data.push(COMMANDS.shadowOffsetX);
        this._data.push(val);
    },

    get shadowOffsetY() {
        return this._shadowOffsetY;
    },

    set shadowOffsetY(val) {
        this._shadowOffsetY = val;
        this._data.push(COMMANDS.shadowOffsetY);
        this._data.push(val);
    },
                        
    _addColor: function (str) {
        var rgba = color.parse(str, parsedColorRGBA) || defaultBlackColor;
        this._data.push(rgba[0]);
        this._data.push(rgba[1]);
        this._data.push(rgba[2]);
        this._data.push(rgba[3]);
    },

    _addString: function (str) {
        this._data.push(str.length);
        for (var i = 0; i < str.length; i++) {
            this._data.push(str.charCodeAt(i));
        }
    },

    beginPath: function () {
        this._data.push(COMMANDS.beginPath);
    },

    moveTo: function (x, y) {
        this._data.push(COMMANDS.moveTo);
        this._data.push(x);
        this._data.push(y);
    },

    lineTo: function (x, y) {
        this._data.push(COMMANDS.lineTo);
        this._data.push(x);
        this._data.push(y);
    },

    bezierCurveTo: function (x0, y0, x1, y1, x2, y2) {
        this._data.push(COMMANDS.bezierCurveTo);
        this._data.push(x0);
        this._data.push(y0);
        this._data.push(x1);
        this._data.push(y1);
        this._data.push(x2);
        this._data.push(y2);
    },

    quadraticCurveTo: function (x0, y0, x1, y1) {
        this._data.push(COMMANDS.quadraticCurveTo);
        this._data.push(x0);
        this._data.push(y0);
        this._data.push(x1);
        this._data.push(y1);
    },

    arc: function (cx, cy, r, startAngle, endAngle, anticlockwise) {
        this._data.push(COMMANDS.arc);
        this._data.push(cx);
        this._data.push(cy);
        this._data.push(r);
        this._data.push(startAngle);
        this._data.push(endAngle);
        this._data.push(+(!!anticlockwise));
    },

    rect: function (x, y, width, height) {
        this._data.push(COMMANDS.rect);
        this._data.push(x);
        this._data.push(y);
        this._data.push(width);
        this._data.push(height);
    },

    closePath: function () {
        this._data.push(COMMANDS.closePath);
    },

    fill: function () {
        this._data.push(COMMANDS.fill);
    },

    stroke: function () {
        this._data.push(COMMANDS.stroke);
    },

    fillText: function (text, x, y, maxWidth) {
        this._data.push(COMMANDS.fillText);
        this._addString(text);
        this._data.push(x);
        this._data.push(y);
    },

    strokeText: function (text, x, y, maxWidth) {
        this._data.push(COMMANDS.strokeText);
        this._addString(text);
        this._data.push(x);
        this._data.push(y);
    },

    setTransform: function (a, b, c, d, e, f) {
        this._data.push(COMMANDS.setTransform);
        this._data.push(a);
        this._data.push(b);
        this._data.push(c);
        this._data.push(d);
        this._data.push(e);
        this._data.push(f);
    },

    save: function () {
        this._data.push(COMMANDS.save);
    },

    restore: function () {
        this._data.push(COMMANDS.restore);
    },

    clearRect: function (x, y, width, height) {
        this._data.push(COMMANDS.clearRect);
        this._data.push(x);
        this._data.push(y);
        this._data.push(width);
        this._data.push(height);
    },

    fillRect: function (x, y, width, height) {
        this._data.push(COMMANDS.fillRect);
        this._data.push(x);
        this._data.push(y);
        this._data.push(width);
        this._data.push(height);
    },

    strokeRect: function (x, y, width, height) {
        this._data.push(COMMANDS.strokeRect);
        this._data.push(x);
        this._data.push(y);
        this._data.push(width);
        this._data.push(height);
    },

    measureText: function (textStr) { 
        var font = parseCssFont(this._font);
        return {
            width: parseInt(font.size) * textStr.length
        };
    },

    serialize: function () {
        return new Float32Array(this._data);
    },

    repeatCommands: function (ctx, commands) {
        var prevCmd;
        var dpr = this._dpr;
        for (var i = 0; i < commands.length;) {
            prevCmd = cmd;
            var cmd = commands[i++];
            switch(cmd) {
                case COMMANDS.beginPath:
                    ctx.beginPath();
                    break;
                case COMMANDS.moveTo:
                    ctx.moveTo(commands[i++], commands[i++]);
                    break;
                case COMMANDS.lineTo:
                    ctx.lineTo(commands[i++], commands[i++]);
                    break;
                case COMMANDS.bezierCurveTo:
                    ctx.bezierCurveTo(commands[i++], commands[i++], commands[i++], commands[i++], commands[i++], commands[i++]);
                    break;
                case COMMANDS.quadraticCurveTo:
                    ctx.quadraticCurveTo(commands[i++], commands[i++], commands[i++], commands[i++]);
                    break;
                case COMMANDS.rect:
                    ctx.rect(commands[i++], commands[i++], commands[i++], commands[i++]);
                    break;
                case COMMANDS.closePath:
                    ctx.closePath();
                    break;
                case COMMANDS.fill:
                    ctx.fill();
                    break;
                case COMMANDS.stroke:
                    ctx.stroke();
                    break;
                case COMMANDS.setTransform:
                    ctx.setTransform(
                        commands[i++], commands[i++], commands[i++],
                        commands[i++], commands[i++], commands[i++]
                    );
                    break;
                case COMMANDS.fillStyle:
                    ctx.fillStyle = this._parseColor(commands, i);
                    i += 4;
                    break;
                case COMMANDS.strokeStyle:
                    ctx.strokeStyle = this._parseColor(commands, i);
                    i += 4;
                    break;
                case COMMANDS.lineWidth:
                    ctx.lineWidth = commands[i++];
                    break;
                case COMMANDS.font:
                    ctx.font = this._parseString(commands, i);
                    i += commands[i] + 1;
                    break;
                case COMMANDS.textBaseline:
                    ctx.textBaseline = this._parseString(commands, i);
                    i += commands[i] + 1;
                    break;
                case COMMANDS.textAlign:
                    ctx.textAlign = this._parseString(commands, i);
                    i += commands[i] + 1;
                    break;
                case COMMANDS.fillText:
                    var str = this._parseString(commands, i);
                    i += commands[i] + 1;
                    ctx.fillText(str, commands[i++], commands[i++]);
                    break;
                case COMMANDS.strokeText:
                    var str = this._parseString(commands, i);
                    i += commands[i] + 1;
                    ctx.strokeText(str, commands[i++], commands[i++]);
                    break;
                case COMMANDS.shadowColor:
                    ctx.shadowColor = this._parseColor(commands, i);
                    i += 4;
                    break;
                case COMMANDS.shadowBlur:
                    ctx.shadowOffsetX = commands[i++];
                    break;
                case COMMANDS.shadowOffsetX:
                    ctx.shadowOffsetX = commands[i++];
                    break;
                case COMMANDS.shadowOffsetY:
                    ctx.shadowOffsetY = commands[i++];
                    break;
                case COMMANDS.save:
                    ctx.save();
                    break;
                case COMMANDS.restore:
                    ctx.restore();
                    break;
                case COMMANDS.clearRect:
                    ctx.clearRect(commands[i++], commands[i++], commands[i++], commands[i++]);
                    break;
                case COMMANDS.fillRect:
                    ctx.fillRect(commands[i++], commands[i++], commands[i++], commands[i++]);
                    break;
                case COMMANDS.strokeRect:
                    ctx.strokeRect(commands[i++], commands[i++], commands[i++], commands[i++]);
                    break;
                default:
                    debugger;
                    // console.warn('Unkown commands');
            }
        }
    },

    _parseColor: function (commands, offset) {
        var r = commands[offset++];
        var g = commands[offset++];
        var b = commands[offset++];
        var a = commands[offset++];

        return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    },

    _parseString: function (commands, offset) {
        var len = commands[offset];
        var str = '';
        for (var i = 0; i < len; i++) {
            str += String.fromCharCode(commands[i + 1 + offset]);
        }
        return str;
    }
};

export default CanvasContext2D;