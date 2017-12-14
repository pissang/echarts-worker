import * as color from 'zrender/src/tool/color';
import parseCssFont from 'parse-css-font';
import enums from './enums';
var COMMANDS = enums.COMMANDS;

var uuid = 0;
function getUUID() {
    return uuid++;
}

var defaultBlackColor = [0, 0, 0, 0];
var parsedColorRGBA = [];

var EXPAND_RATIO = 5;

function CanvasContext2D() {
    this._data = null;
    this._offset = 0;
    this._recording = false;

    this._transform = [1, 0, 0, 1, 0, 0];

    this._stacks = [];

    this._reset();
}

CanvasContext2D.prototype = {

    constructor: CanvasContext2D,

    startRecord: function () {
        this._recording = true;
        if (!this._data) {
            this._data = new Float32Array(1e4);
        }
        this._offset = 0;
        this._reset();
    },

    _reset: function () {

        this._fillStyle = '#000';
        this._strokeStyle = '#000';
        this._globalAlpha = 1;
        this._shadowColor = '#000';
        this._shadowBlur = 0;
        this._shadowOffsetX = 0;
        this._shadowOffsetY = 0;
        this._lineWidth = 1;
        this._font = '12px sans-serif';
        this._textBaseline = 'alphabetic';
        this._textAlign = 'start';
        this._globalCompositeOperation = 'source-over';

    },

    get fillStyle() {
        return this._fillStyle;
    },

    set fillStyle(val) {
        if (val === this._fillStyle) {
            return;
        }
        this._fillStyle = val;
        this._addColor(COMMANDS.fillStyle, val);
    },

    get strokeStyle() {
        return this._strokeStyle;
    },

    set strokeStyle(val) {
        if (val === this._strokeStyle) {
            return;
        }
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

    get globalAlpha() {
        return this._globalAlpha;
    },

    set globalAlpha(val) {
        this._globalAlpha = val;
        this._addCommand1(COMMANDS.globalAlpha, val);
    },

    get font() {
        return this._font;
    },

    set font(val) {
        if (val) {
            if (val === this._font) {
                return;
            }
            this._font = val;
            this._addString(COMMANDS.font, val);
        }
    },

    get textBaseline() {
        return this._textBaseline;
    },

    set textBaseline(val) {
        if (val) {
            if (val === this._textBaseline) {
                return;
            }
            this._textBaseline = val;
            this._addString(COMMANDS.textBaseline, val);
        }
    },
    get textAlign() {
        return this._textAlign;
    },

    set textAlign(val) {
        if (val) {
            if (val === this._textAlign) {
                return;
            }
            this._textAlign = val;
            this._addString(COMMANDS.textAlign, val);
        }
    },

    get shadowColor() {
        return this._shadowColor;
    },

    set shadowColor(val) {
        if (val !== this._shadowColor) {
            this._shadowColor = val;
            this._addColor(COMMANDS.shadowColor, val);
        }
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

    get globalCompositeOperation() {
        return this._globalCompositeOperation;
    },

    set globalCompositeOperation(val) {
        if (val !== this._globalCompositeOperation) {
            this._globalCompositeOperation = val;
            this._addString(COMMANDS.globalCompositeOperation, val);
        }
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
        var m = this._transform;
        if (m[0] === a && m[1] === b && m[2] === b && m[3] === d && m[4] === e && m[5] === f) {
            return;
        }

        if (a === this.dpr && d === this.dpr) {
            if (b === 0 && c === 0) {
                if (e === 0 && f === 0) {
                    this._addCommand(COMMANDS.setIdentityTransform);
                }
                else {
                    this._addCommand2(COMMANDS.setTranslationTransform, e, f);
                }
            }
            else {
                this._addCommand6(COMMANDS.setTransform, a, b, c, d, e, f);
            }
        }
        else {
            if (b === 0 && c === 0) {
                if (e === 0 && f === 0) {
                    this._addCommand2(COMMANDS.setScaleTransform, a, d);
                }
                else {
                    this._addCommand4(COMMANDS.setScaleTranslationTransform, a, d, e, f);
                }
            }
            else {
                this._addCommand6(COMMANDS.setTransform, a, b, c, d, e, f);
            }
        }

        m[0] = a;
        m[1] = b;
        m[2] = c;
        m[3] = d;
        m[4] = e;
        m[5] = f;
    },

    save: function () {
        var states = {
            transform: this._transform.slice(),
            fillStyle: this._fillStyle,
            strokeStyle: this._strokeStyle,
            globalAlpha: this._globalAlpha,
            font: this._font,
            textBaseline: this._textBaseline,
            textAlign: this._textAlign,
            shadowBlur: this._shadowBlur,
            shadowOffsetX: this._shadowOffsetX,
            shadowOffsetY: this._shadowOffsetY,
            lineWidth: this._lineWidth,
            globalCompositeOperation: this._globalCompositeOperation
        };
        this._stacks.push(states);
        this._addCommand(COMMANDS.save);
    },

    restore: function () {
        var states = this._stacks.pop();
        if (states) {
            this._transform = states.transform;
            this._fillStyle = states.fillStyle;
            this._strokeStyle = states.strokeStyle;
            this._globalAlpha = states.globalAlpha;
            this._font = states.font;
            this._textBaseline = states.textBaseline;
            this._textAlign = states.textAlign;
            this._shadowBlur = states.shadowBlur;
            this._shadowOffsetX = states.shadowOffsetX;
            this._shadowOffsetY = states.shadowOffsetY;
            this._lineWidth = states.lineWidth;
            this._globalCompositeOperation = states.globalCompositeOperation;

        }
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

        var arr = this._recordedCommands = new Float32Array(this._offset);
        for (var i = 0; i < this._offset; i++) {
            arr[i] = this._data[i];
        }
        return arr;
    },

    getRecordedCommands: function () {
        return this._recordedCommands || new Float32Array();
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
    }
};

export default CanvasContext2D;