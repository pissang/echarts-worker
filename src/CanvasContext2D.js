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

var EXPAND_RATIO = 5;

function CanvasContext2D() {
    this._data = null;
    this._offset = 0;
    this._recording = false;
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

    startRecord: function () {
        this._recording = true;
        if (!this._data) {
            this._data = new Float32Array(1e4);
        }
        this._offset = 0;
    },
    
    get fillStyle() {
        return this._fillStyle;
    },

    set fillStyle(val) {
        this._fillStyle = val;
        this._addColor(COMMANDS.fillStyle, val);
    },

    get strokeStyle() {
        return this._strokeStyle;
    },

    set strokeStyle(val) {
        this._strokeStyle = val;
        this._addColor(COMMANDS.strokeStyle, val);
    },

    get lineWidth() {
        return this._lineWidth;
    },

    set lineWidth(val) {
        this._lineWidth = val;
        this._addCommand1(COMMANDS.lineWidth, val);
    },

    get font() {
        return this._font;
    },

    set font(val) {
        if (val) {
            this._font = val;
            this._addString(COMMANDS.font, val);
        }
    },
    
    get textBaseline() {
        return this._textBaseline;
    },

    set textBaseline(val) {
        if (val) {
            this._textBaseline = val;
            this._addString(COMMANDS.textBaseline, val);
        }
    },
    get textAlign() {
        return this._textAlign;
    },

    set textAlign(val) {
        if (val) {
            this._textAlign = val;
            this._addString(COMMANDS.textAlign, val);
        }
    },

    get shadowColor() {
        return this._shadowColor;
    },

    set shadowColor(val) {
        this._shadowColor = val;

        this._addColor(COMMANDS.shadowColor, val);
    },

    get shadowBlur() {
        return this._shadowBlur;
    },

    set shadowBlur(val) {
        this._shadowBlur = val;
        this._addCommand1(COMMANDS.shadowBlur, val);
    },

    get shadowOffsetX() {
        return this._shadowOffsetX;
    },

    set shadowOffsetX(val) {
        this._shadowOffsetX = val;
        this._addCommand1(COMMANDS.shadowOffsetX, val);
    },

    get shadowOffsetY() {
        return this._shadowOffsetY;
    },

    set shadowOffsetY(val) {
        this._shadowOffsetY = val;
        this._addCommand1(COMMANDS.shadowOffsetY, val);
    },

    beginPath: function () {
        this._addCommand(COMMANDS.beginPath);
    },

    moveTo: function (x, y) {
        this._addCommand2(COMMANDS.moveTo, x, y);
    },

    lineTo: function (x, y) {
        this._addCommand2(COMMANDS.lineTo, x, y);
    },

    bezierCurveTo: function (x0, y0, x1, y1, x2, y2) {
        this._addCommand6(COMMANDS.bezierCurveTo, x0, y0, x1, y1, x2, y2);
    },

    quadraticCurveTo: function (x0, y0, x1, y1) {
        this._addCommand4(COMMANDS.quadraticCurveTo, x0, y0, x1, y1);
    },

    arc: function (cx, cy, r, startAngle, endAngle, anticlockwise) {
        this._addCommand6(COMMANDS.arc, cx, cy, r, startAngle, endAngle, +(!!anticlockwise));
    },

    rect: function (x, y, width, height) {
        this._addCommand4(COMMANDS.rect, x, y, width, height);
    },

    closePath: function () {
        this._addCommand(COMMANDS.closePath);
    },

    fill: function () {
        this._addCommand(COMMANDS.fill);
    },

    stroke: function () {
        this._addCommand(COMMANDS.stroke);
    },

    fillText: function (text, x, y, maxWidth) {
        // TODO maxWidth, zrender is not used yet.
        this._addTextCommand(COMMANDS.fillText, text, x, y);
    },

    strokeText: function (text, x, y, maxWidth) {
        this._addTextCommand(COMMANDS.strokeText, text, x, y);
    },

    setTransform: function (a, b, c, d, e, f) {
        this._addCommand6(COMMANDS.setTransform, a, b, c, d, e, f);
    },

    save: function () {
        this._addCommand(COMMANDS.save);
    },

    restore: function () {
        this._addCommand(COMMANDS.restore);
    },

    clearRect: function (x, y, width, height) {
        this._addCommand4(COMMANDS.clearRect, x, y, width, height);
    },

    fillRect: function (x, y, width, height) {
        this._addCommand4(COMMANDS.fillRect, x, y, width, height);
    },

    strokeRect: function (x, y, width, height) {
        this._addCommand4(COMMANDS.strokeRect, x, y, width, height);
    },

    measureText: function (textStr) { 
        var font = parseCssFont(this._font);
        return {
            width: parseInt(font.size) * textStr.length
        };
    },

    stopRecord: function () {
        this._recording = false;
        var arr = new Float32Array(this._offset);
        for (var i = 0; i < this._offset; i++) {
            arr[i] = this._data[i];
        }
        return arr;
    },
           
    _addColor: function (cmd, str) {
        if (!this._recording) {
            return;
        }
        var rgba = color.parse(str, parsedColorRGBA) || defaultBlackColor;
        this._addCommand4(cmd, rgba[0], rgba[1], rgba[2], rgba[3]);
    },

    _addString: function (cmd, str) {
        if (!this._recording) {
            return;
        }
        var strLen = str.length;
        if (this._offset + strLen + 2 >= this._data.length) {
            this._expandArray();
        }
        this._data[this._offset++] = cmd;
        this._data[this._offset++] = str.length;
        for (var i = 0; i < str.length; i++) {
            this._data[this._offset++] = str.charCodeAt(i);
        }
    },

    _addTextCommand: function (cmd, str, x, y) {
        if (!this._recording) {
            return;
        }
        var strLen = str.length;
        if (this._offset + strLen + 4 >= this._data.length) {
            this._expandArray();
        }
        this._addString(cmd, str);
        this._data[this._offset++] = x;
        this._data[this._offset++] = y;
    },

    _addCommand: function (cmd) {
        if (!this._recording) {
            return;
        }
        if (this._offset + 1 >= this._data.length) {
            this._expandArray();
        }
        this._data[this._offset++] = cmd;
    },
    _addCommand1: function (cmd, x) {
        if (!this._recording) {
            return;
        }
        if (this._offset + 2 >= this._data.length) {
            this._expandArray();
        }
        this._data[this._offset++] = cmd;
        this._data[this._offset++] = x;
    },

    _addCommand2: function (cmd, x, y) {
        if (!this._recording) {
            return;
        }
        if (this._offset + 3 >= this._data.length) {
            this._expandArray();
        }
        this._data[this._offset++] = cmd;
        this._data[this._offset++] = x;
        this._data[this._offset++] = y;
    },

    _addCommand4: function (cmd, x, y, x2, y2) {
        if (!this._recording) {
            return;
        }
        if (this._offset + 5 >= this._data.length) {
            this._expandArray();
        }
        this._data[this._offset++] = cmd;
        this._data[this._offset++] = x;
        this._data[this._offset++] = y;
        this._data[this._offset++] = x2;
        this._data[this._offset++] = y2;
    },

    _addCommand6: function (cmd, x, y, x2, y2, x3, y3) {
        if (!this._recording) {
            return;
        }
        if (this._offset + 7 >= this._data.length) {
            this._expandArray();
        }
        this._data[this._offset++] = cmd;
        this._data[this._offset++] = x;
        this._data[this._offset++] = y;
        this._data[this._offset++] = x2;
        this._data[this._offset++] = y2;
        this._data[this._offset++] = x3;
        this._data[this._offset++] = y3;
    },

    _expandArray: function () {
        var newArr = new Float32Array(this._data.length * EXPAND_RATIO);
        newArr.set(this._data);
        this._data = newArr;
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
                    ctx.shadowBlur = commands[i++];
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