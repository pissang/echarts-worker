(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["echarts"] = factory();
	else
		root["echarts"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var CanvasContext2D = __webpack_require__(1).default;

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

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_zrender_src_tool_color__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_parse_css_font__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_parse_css_font___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_parse_css_font__);



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
        var rgba = __WEBPACK_IMPORTED_MODULE_0_zrender_src_tool_color__["a" /* parse */](str, parsedColorRGBA) || defaultBlackColor;
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
        var font = __WEBPACK_IMPORTED_MODULE_1_parse_css_font___default()(this._font);
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

/* harmony default export */ __webpack_exports__["default"] = (CanvasContext2D);

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = parse;
/* unused harmony export lift */
/* unused harmony export toHex */
/* unused harmony export fastLerp */
/* unused harmony export fastMapToColor */
/* unused harmony export lerp */
/* unused harmony export mapToColor */
/* unused harmony export modifyHSL */
/* unused harmony export modifyAlpha */
/* unused harmony export stringify */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core_LRU__ = __webpack_require__(3);


var kCSSColorTable = {
    'transparent': [0,0,0,0], 'aliceblue': [240,248,255,1],
    'antiquewhite': [250,235,215,1], 'aqua': [0,255,255,1],
    'aquamarine': [127,255,212,1], 'azure': [240,255,255,1],
    'beige': [245,245,220,1], 'bisque': [255,228,196,1],
    'black': [0,0,0,1], 'blanchedalmond': [255,235,205,1],
    'blue': [0,0,255,1], 'blueviolet': [138,43,226,1],
    'brown': [165,42,42,1], 'burlywood': [222,184,135,1],
    'cadetblue': [95,158,160,1], 'chartreuse': [127,255,0,1],
    'chocolate': [210,105,30,1], 'coral': [255,127,80,1],
    'cornflowerblue': [100,149,237,1], 'cornsilk': [255,248,220,1],
    'crimson': [220,20,60,1], 'cyan': [0,255,255,1],
    'darkblue': [0,0,139,1], 'darkcyan': [0,139,139,1],
    'darkgoldenrod': [184,134,11,1], 'darkgray': [169,169,169,1],
    'darkgreen': [0,100,0,1], 'darkgrey': [169,169,169,1],
    'darkkhaki': [189,183,107,1], 'darkmagenta': [139,0,139,1],
    'darkolivegreen': [85,107,47,1], 'darkorange': [255,140,0,1],
    'darkorchid': [153,50,204,1], 'darkred': [139,0,0,1],
    'darksalmon': [233,150,122,1], 'darkseagreen': [143,188,143,1],
    'darkslateblue': [72,61,139,1], 'darkslategray': [47,79,79,1],
    'darkslategrey': [47,79,79,1], 'darkturquoise': [0,206,209,1],
    'darkviolet': [148,0,211,1], 'deeppink': [255,20,147,1],
    'deepskyblue': [0,191,255,1], 'dimgray': [105,105,105,1],
    'dimgrey': [105,105,105,1], 'dodgerblue': [30,144,255,1],
    'firebrick': [178,34,34,1], 'floralwhite': [255,250,240,1],
    'forestgreen': [34,139,34,1], 'fuchsia': [255,0,255,1],
    'gainsboro': [220,220,220,1], 'ghostwhite': [248,248,255,1],
    'gold': [255,215,0,1], 'goldenrod': [218,165,32,1],
    'gray': [128,128,128,1], 'green': [0,128,0,1],
    'greenyellow': [173,255,47,1], 'grey': [128,128,128,1],
    'honeydew': [240,255,240,1], 'hotpink': [255,105,180,1],
    'indianred': [205,92,92,1], 'indigo': [75,0,130,1],
    'ivory': [255,255,240,1], 'khaki': [240,230,140,1],
    'lavender': [230,230,250,1], 'lavenderblush': [255,240,245,1],
    'lawngreen': [124,252,0,1], 'lemonchiffon': [255,250,205,1],
    'lightblue': [173,216,230,1], 'lightcoral': [240,128,128,1],
    'lightcyan': [224,255,255,1], 'lightgoldenrodyellow': [250,250,210,1],
    'lightgray': [211,211,211,1], 'lightgreen': [144,238,144,1],
    'lightgrey': [211,211,211,1], 'lightpink': [255,182,193,1],
    'lightsalmon': [255,160,122,1], 'lightseagreen': [32,178,170,1],
    'lightskyblue': [135,206,250,1], 'lightslategray': [119,136,153,1],
    'lightslategrey': [119,136,153,1], 'lightsteelblue': [176,196,222,1],
    'lightyellow': [255,255,224,1], 'lime': [0,255,0,1],
    'limegreen': [50,205,50,1], 'linen': [250,240,230,1],
    'magenta': [255,0,255,1], 'maroon': [128,0,0,1],
    'mediumaquamarine': [102,205,170,1], 'mediumblue': [0,0,205,1],
    'mediumorchid': [186,85,211,1], 'mediumpurple': [147,112,219,1],
    'mediumseagreen': [60,179,113,1], 'mediumslateblue': [123,104,238,1],
    'mediumspringgreen': [0,250,154,1], 'mediumturquoise': [72,209,204,1],
    'mediumvioletred': [199,21,133,1], 'midnightblue': [25,25,112,1],
    'mintcream': [245,255,250,1], 'mistyrose': [255,228,225,1],
    'moccasin': [255,228,181,1], 'navajowhite': [255,222,173,1],
    'navy': [0,0,128,1], 'oldlace': [253,245,230,1],
    'olive': [128,128,0,1], 'olivedrab': [107,142,35,1],
    'orange': [255,165,0,1], 'orangered': [255,69,0,1],
    'orchid': [218,112,214,1], 'palegoldenrod': [238,232,170,1],
    'palegreen': [152,251,152,1], 'paleturquoise': [175,238,238,1],
    'palevioletred': [219,112,147,1], 'papayawhip': [255,239,213,1],
    'peachpuff': [255,218,185,1], 'peru': [205,133,63,1],
    'pink': [255,192,203,1], 'plum': [221,160,221,1],
    'powderblue': [176,224,230,1], 'purple': [128,0,128,1],
    'red': [255,0,0,1], 'rosybrown': [188,143,143,1],
    'royalblue': [65,105,225,1], 'saddlebrown': [139,69,19,1],
    'salmon': [250,128,114,1], 'sandybrown': [244,164,96,1],
    'seagreen': [46,139,87,1], 'seashell': [255,245,238,1],
    'sienna': [160,82,45,1], 'silver': [192,192,192,1],
    'skyblue': [135,206,235,1], 'slateblue': [106,90,205,1],
    'slategray': [112,128,144,1], 'slategrey': [112,128,144,1],
    'snow': [255,250,250,1], 'springgreen': [0,255,127,1],
    'steelblue': [70,130,180,1], 'tan': [210,180,140,1],
    'teal': [0,128,128,1], 'thistle': [216,191,216,1],
    'tomato': [255,99,71,1], 'turquoise': [64,224,208,1],
    'violet': [238,130,238,1], 'wheat': [245,222,179,1],
    'white': [255,255,255,1], 'whitesmoke': [245,245,245,1],
    'yellow': [255,255,0,1], 'yellowgreen': [154,205,50,1]
};

function clampCssByte(i) {  // Clamp to integer 0 .. 255.
    i = Math.round(i);  // Seems to be what Chrome does (vs truncation).
    return i < 0 ? 0 : i > 255 ? 255 : i;
}

function clampCssAngle(i) {  // Clamp to integer 0 .. 360.
    i = Math.round(i);  // Seems to be what Chrome does (vs truncation).
    return i < 0 ? 0 : i > 360 ? 360 : i;
}

function clampCssFloat(f) {  // Clamp to float 0.0 .. 1.0.
    return f < 0 ? 0 : f > 1 ? 1 : f;
}

function parseCssInt(str) {  // int or percentage.
    if (str.length && str.charAt(str.length - 1) === '%') {
        return clampCssByte(parseFloat(str) / 100 * 255);
    }
    return clampCssByte(parseInt(str, 10));
}

function parseCssFloat(str) {  // float or percentage.
    if (str.length && str.charAt(str.length - 1) === '%') {
        return clampCssFloat(parseFloat(str) / 100);
    }
    return clampCssFloat(parseFloat(str));
}

function cssHueToRgb(m1, m2, h) {
    if (h < 0) {
        h += 1;
    }
    else if (h > 1) {
        h -= 1;
    }

    if (h * 6 < 1) {
        return m1 + (m2 - m1) * h * 6;
    }
    if (h * 2 < 1) {
        return m2;
    }
    if (h * 3 < 2) {
        return m1 + (m2 - m1) * (2/3 - h) * 6;
    }
    return m1;
}

function lerpNumber(a, b, p) {
    return a + (b - a) * p;
}

function setRgba(out, r, g, b, a) {
    out[0] = r; out[1] = g; out[2] = b; out[3] = a;
    return out;
}
function copyRgba(out, a) {
    out[0] = a[0]; out[1] = a[1]; out[2] = a[2]; out[3] = a[3];
    return out;
}

var colorCache = new __WEBPACK_IMPORTED_MODULE_0__core_LRU__["a" /* default */](20);
var lastRemovedArr = null;

function putToCache(colorStr, rgbaArr) {
    // Reuse removed array
    if (lastRemovedArr) {
        copyRgba(lastRemovedArr, rgbaArr);
    }
    lastRemovedArr = colorCache.put(colorStr, lastRemovedArr || (rgbaArr.slice()));
}

/**
 * @param {string} colorStr
 * @param {Array.<number>} out
 * @return {Array.<number>}
 * @memberOf module:zrender/util/color
 */
function parse(colorStr, rgbaArr) {
    if (!colorStr) {
        return;
    }
    rgbaArr = rgbaArr || [];

    var cached = colorCache.get(colorStr);
    if (cached) {
        return copyRgba(rgbaArr, cached);
    }

    // colorStr may be not string
    colorStr = colorStr + '';
    // Remove all whitespace, not compliant, but should just be more accepting.
    var str = colorStr.replace(/ /g, '').toLowerCase();

    // Color keywords (and transparent) lookup.
    if (str in kCSSColorTable) {
        copyRgba(rgbaArr, kCSSColorTable[str]);
        putToCache(colorStr, rgbaArr);
        return rgbaArr;
    }

    // #abc and #abc123 syntax.
    if (str.charAt(0) === '#') {
        if (str.length === 4) {
            var iv = parseInt(str.substr(1), 16);  // TODO(deanm): Stricter parsing.
            if (!(iv >= 0 && iv <= 0xfff)) {
                setRgba(rgbaArr, 0, 0, 0, 1);
                return;  // Covers NaN.
            }
            setRgba(rgbaArr,
                ((iv & 0xf00) >> 4) | ((iv & 0xf00) >> 8),
                (iv & 0xf0) | ((iv & 0xf0) >> 4),
                (iv & 0xf) | ((iv & 0xf) << 4),
                1
            );
            putToCache(colorStr, rgbaArr);
            return rgbaArr;
        }
        else if (str.length === 7) {
            var iv = parseInt(str.substr(1), 16);  // TODO(deanm): Stricter parsing.
            if (!(iv >= 0 && iv <= 0xffffff)) {
                setRgba(rgbaArr, 0, 0, 0, 1);
                return;  // Covers NaN.
            }
            setRgba(rgbaArr,
                (iv & 0xff0000) >> 16,
                (iv & 0xff00) >> 8,
                iv & 0xff,
                1
            );
            putToCache(colorStr, rgbaArr);
            return rgbaArr;
        }

        return;
    }
    var op = str.indexOf('('), ep = str.indexOf(')');
    if (op !== -1 && ep + 1 === str.length) {
        var fname = str.substr(0, op);
        var params = str.substr(op + 1, ep - (op + 1)).split(',');
        var alpha = 1;  // To allow case fallthrough.
        switch (fname) {
            case 'rgba':
                if (params.length !== 4) {
                    setRgba(rgbaArr, 0, 0, 0, 1);
                    return;
                }
                alpha = parseCssFloat(params.pop()); // jshint ignore:line
            // Fall through.
            case 'rgb':
                if (params.length !== 3) {
                    setRgba(rgbaArr, 0, 0, 0, 1);
                    return;
                }
                setRgba(rgbaArr,
                    parseCssInt(params[0]),
                    parseCssInt(params[1]),
                    parseCssInt(params[2]),
                    alpha
                );
                putToCache(colorStr, rgbaArr);
                return rgbaArr;
            case 'hsla':
                if (params.length !== 4) {
                    setRgba(rgbaArr, 0, 0, 0, 1);
                    return;
                }
                params[3] = parseCssFloat(params[3]);
                hsla2rgba(params, rgbaArr);
                putToCache(colorStr, rgbaArr);
                return rgbaArr;
            case 'hsl':
                if (params.length !== 3) {
                    setRgba(rgbaArr, 0, 0, 0, 1);
                    return;
                }
                hsla2rgba(params, rgbaArr);
                putToCache(colorStr, rgbaArr);
                return rgbaArr;
            default:
                return;
        }
    }

    setRgba(rgbaArr, 0, 0, 0, 1);
    return;
}

/**
 * @param {Array.<number>} hsla
 * @param {Array.<number>} rgba
 * @return {Array.<number>} rgba
 */
function hsla2rgba(hsla, rgba) {
    var h = (((parseFloat(hsla[0]) % 360) + 360) % 360) / 360;  // 0 .. 1
    // NOTE(deanm): According to the CSS spec s/l should only be
    // percentages, but we don't bother and let float or percentage.
    var s = parseCssFloat(hsla[1]);
    var l = parseCssFloat(hsla[2]);
    var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
    var m1 = l * 2 - m2;

    rgba = rgba || [];
    setRgba(rgba,
        clampCssByte(cssHueToRgb(m1, m2, h + 1 / 3) * 255),
        clampCssByte(cssHueToRgb(m1, m2, h) * 255),
        clampCssByte(cssHueToRgb(m1, m2, h - 1 / 3) * 255),
        1
    );

    if (hsla.length === 4) {
        rgba[3] = hsla[3];
    }

    return rgba;
}

/**
 * @param {Array.<number>} rgba
 * @return {Array.<number>} hsla
 */
function rgba2hsla(rgba) {
    if (!rgba) {
        return;
    }

    // RGB from 0 to 255
    var R = rgba[0] / 255;
    var G = rgba[1] / 255;
    var B = rgba[2] / 255;

    var vMin = Math.min(R, G, B); // Min. value of RGB
    var vMax = Math.max(R, G, B); // Max. value of RGB
    var delta = vMax - vMin; // Delta RGB value

    var L = (vMax + vMin) / 2;
    var H;
    var S;
    // HSL results from 0 to 1
    if (delta === 0) {
        H = 0;
        S = 0;
    }
    else {
        if (L < 0.5) {
            S = delta / (vMax + vMin);
        }
        else {
            S = delta / (2 - vMax - vMin);
        }

        var deltaR = (((vMax - R) / 6) + (delta / 2)) / delta;
        var deltaG = (((vMax - G) / 6) + (delta / 2)) / delta;
        var deltaB = (((vMax - B) / 6) + (delta / 2)) / delta;

        if (R === vMax) {
            H = deltaB - deltaG;
        }
        else if (G === vMax) {
            H = (1 / 3) + deltaR - deltaB;
        }
        else if (B === vMax) {
            H = (2 / 3) + deltaG - deltaR;
        }

        if (H < 0) {
            H += 1;
        }

        if (H > 1) {
            H -= 1;
        }
    }

    var hsla = [H * 360, S, L];

    if (rgba[3] != null) {
        hsla.push(rgba[3]);
    }

    return hsla;
}

/**
 * @param {string} color
 * @param {number} level
 * @return {string}
 * @memberOf module:zrender/util/color
 */
function lift(color, level) {
    var colorArr = parse(color);
    if (colorArr) {
        for (var i = 0; i < 3; i++) {
            if (level < 0) {
                colorArr[i] = colorArr[i] * (1 - level) | 0;
            }
            else {
                colorArr[i] = ((255 - colorArr[i]) * level + colorArr[i]) | 0;
            }
        }
        return stringify(colorArr, colorArr.length === 4 ? 'rgba' : 'rgb');
    }
}

/**
 * @param {string} color
 * @return {string}
 * @memberOf module:zrender/util/color
 */
function toHex(color) {
    var colorArr = parse(color);
    if (colorArr) {
        return ((1 << 24) + (colorArr[0] << 16) + (colorArr[1] << 8) + (+colorArr[2])).toString(16).slice(1);
    }
}

/**
 * Map value to color. Faster than lerp methods because color is represented by rgba array.
 * @param {number} normalizedValue A float between 0 and 1.
 * @param {Array.<Array.<number>>} colors List of rgba color array
 * @param {Array.<number>} [out] Mapped gba color array
 * @return {Array.<number>} will be null/undefined if input illegal.
 */
function fastLerp(normalizedValue, colors, out) {
    if (!(colors && colors.length)
        || !(normalizedValue >= 0 && normalizedValue <= 1)
    ) {
        return;
    }

    out = out || [];

    var value = normalizedValue * (colors.length - 1);
    var leftIndex = Math.floor(value);
    var rightIndex = Math.ceil(value);
    var leftColor = colors[leftIndex];
    var rightColor = colors[rightIndex];
    var dv = value - leftIndex;
    out[0] = clampCssByte(lerpNumber(leftColor[0], rightColor[0], dv));
    out[1] = clampCssByte(lerpNumber(leftColor[1], rightColor[1], dv));
    out[2] = clampCssByte(lerpNumber(leftColor[2], rightColor[2], dv));
    out[3] = clampCssFloat(lerpNumber(leftColor[3], rightColor[3], dv));

    return out;
}

/**
 * @deprecated
 */
var fastMapToColor = fastLerp;

/**
 * @param {number} normalizedValue A float between 0 and 1.
 * @param {Array.<string>} colors Color list.
 * @param {boolean=} fullOutput Default false.
 * @return {(string|Object)} Result color. If fullOutput,
 *                           return {color: ..., leftIndex: ..., rightIndex: ..., value: ...},
 * @memberOf module:zrender/util/color
 */
function lerp(normalizedValue, colors, fullOutput) {
    if (!(colors && colors.length)
        || !(normalizedValue >= 0 && normalizedValue <= 1)
    ) {
        return;
    }

    var value = normalizedValue * (colors.length - 1);
    var leftIndex = Math.floor(value);
    var rightIndex = Math.ceil(value);
    var leftColor = parse(colors[leftIndex]);
    var rightColor = parse(colors[rightIndex]);
    var dv = value - leftIndex;

    var color = stringify(
        [
            clampCssByte(lerpNumber(leftColor[0], rightColor[0], dv)),
            clampCssByte(lerpNumber(leftColor[1], rightColor[1], dv)),
            clampCssByte(lerpNumber(leftColor[2], rightColor[2], dv)),
            clampCssFloat(lerpNumber(leftColor[3], rightColor[3], dv))
        ],
        'rgba'
    );

    return fullOutput
        ? {
            color: color,
            leftIndex: leftIndex,
            rightIndex: rightIndex,
            value: value
        }
        : color;
}

/**
 * @deprecated
 */
var mapToColor = lerp;

/**
 * @param {string} color
 * @param {number=} h 0 ~ 360, ignore when null.
 * @param {number=} s 0 ~ 1, ignore when null.
 * @param {number=} l 0 ~ 1, ignore when null.
 * @return {string} Color string in rgba format.
 * @memberOf module:zrender/util/color
 */
function modifyHSL(color, h, s, l) {
    color = parse(color);

    if (color) {
        color = rgba2hsla(color);
        h != null && (color[0] = clampCssAngle(h));
        s != null && (color[1] = parseCssFloat(s));
        l != null && (color[2] = parseCssFloat(l));

        return stringify(hsla2rgba(color), 'rgba');
    }
}

/**
 * @param {string} color
 * @param {number=} alpha 0 ~ 1
 * @return {string} Color string in rgba format.
 * @memberOf module:zrender/util/color
 */
function modifyAlpha(color, alpha) {
    color = parse(color);

    if (color && alpha != null) {
        color[3] = clampCssFloat(alpha);
        return stringify(color, 'rgba');
    }
}

/**
 * @param {Array.<number>} arrColor like [12,33,44,0.4]
 * @param {string} type 'rgba', 'hsva', ...
 * @return {string} Result color. (If input illegal, return undefined).
 */
function stringify(arrColor, type) {
    if (!arrColor || !arrColor.length) {
        return;
    }
    var colorStr = arrColor[0] + ',' + arrColor[1] + ',' + arrColor[2];
    if (type === 'rgba' || type === 'hsva' || type === 'hsla') {
        colorStr += ',' + arrColor[3];
    }
    return type + '(' + colorStr + ')';
}


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// Simple LRU cache use doubly linked list
// @module zrender/core/LRU

/**
 * Simple double linked list. Compared with array, it has O(1) remove operation.
 * @constructor
 */
var LinkedList = function () {

    /**
     * @type {module:zrender/core/LRU~Entry}
     */
    this.head = null;

    /**
     * @type {module:zrender/core/LRU~Entry}
     */
    this.tail = null;

    this._len = 0;
};

var linkedListProto = LinkedList.prototype;
/**
 * Insert a new value at the tail
 * @param  {} val
 * @return {module:zrender/core/LRU~Entry}
 */
linkedListProto.insert = function (val) {
    var entry = new Entry(val);
    this.insertEntry(entry);
    return entry;
};

/**
 * Insert an entry at the tail
 * @param  {module:zrender/core/LRU~Entry} entry
 */
linkedListProto.insertEntry = function (entry) {
    if (!this.head) {
        this.head = this.tail = entry;
    }
    else {
        this.tail.next = entry;
        entry.prev = this.tail;
        entry.next = null;
        this.tail = entry;
    }
    this._len++;
};

/**
 * Remove entry.
 * @param  {module:zrender/core/LRU~Entry} entry
 */
linkedListProto.remove = function (entry) {
    var prev = entry.prev;
    var next = entry.next;
    if (prev) {
        prev.next = next;
    }
    else {
        // Is head
        this.head = next;
    }
    if (next) {
        next.prev = prev;
    }
    else {
        // Is tail
        this.tail = prev;
    }
    entry.next = entry.prev = null;
    this._len--;
};

/**
 * @return {number}
 */
linkedListProto.len = function () {
    return this._len;
};

/**
 * Clear list
 */
linkedListProto.clear = function () {
    this.head = this.tail = null;
    this._len = 0;
};

/**
 * @constructor
 * @param {} val
 */
var Entry = function (val) {
    /**
     * @type {}
     */
    this.value = val;

    /**
     * @type {module:zrender/core/LRU~Entry}
     */
    this.next;

    /**
     * @type {module:zrender/core/LRU~Entry}
     */
    this.prev;
};

/**
 * LRU Cache
 * @constructor
 * @alias module:zrender/core/LRU
 */
var LRU = function (maxSize) {

    this._list = new LinkedList();

    this._map = {};

    this._maxSize = maxSize || 10;

    this._lastRemovedEntry = null;
};

var LRUProto = LRU.prototype;

/**
 * @param  {string} key
 * @param  {} value
 * @return {} Removed value
 */
LRUProto.put = function (key, value) {
    var list = this._list;
    var map = this._map;
    var removed = null;
    if (map[key] == null) {
        var len = list.len();
        // Reuse last removed entry
        var entry = this._lastRemovedEntry;

        if (len >= this._maxSize && len > 0) {
            // Remove the least recently used
            var leastUsedEntry = list.head;
            list.remove(leastUsedEntry);
            delete map[leastUsedEntry.key];

            removed = leastUsedEntry.value;
            this._lastRemovedEntry = leastUsedEntry;
        }

        if (entry) {
            entry.value = value;
        }
        else {
            entry = new Entry(value);
        }
        entry.key = key;
        list.insertEntry(entry);
        map[key] = entry;
    }

    return removed;
};

/**
 * @param  {string} key
 * @return {}
 */
LRUProto.get = function (key) {
    var entry = this._map[key];
    var list = this._list;
    if (entry != null) {
        // Put the latest used entry in the tail
        if (entry !== list.tail) {
            list.remove(entry);
            list.insertEntry(entry);
        }

        return entry.value;
    }
};

/**
 * Clear the cache
 */
LRUProto.clear = function () {
    this._list.clear();
    this._map = {};
};

/* harmony default export */ __webpack_exports__["a"] = (LRU);

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__(6);
var isNil = __webpack_require__(12);
var fail = __webpack_require__(35);
var stringify = __webpack_require__(24);

function assert(guard, message) {
  if (guard !== true) {
    if (isFunction(message)) { // handle lazy messages
      message = message();
    }
    else if (isNil(message)) { // use a default message
      message = 'Assert failed (turn on "Pause on exceptions" in your Source panel)';
    }
    assert.fail(message);
  }
}

assert.fail = fail;
assert.stringify = stringify;

module.exports = assert;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = function isFunction(x) {
  return typeof x === 'function';
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var isType = __webpack_require__(9);
var getFunctionName = __webpack_require__(19);

module.exports = function getTypeName(constructor) {
  if (isType(constructor)) {
    return constructor.displayName;
  }
  return getFunctionName(constructor);
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var assert = __webpack_require__(4);
var isString = __webpack_require__(18);
var isFunction = __webpack_require__(6);
var forbidNewOperator = __webpack_require__(17);

module.exports = function irreducible(name, predicate) {

  if (process.env.NODE_ENV !== 'production') {
    assert(isString(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to irreducible(name, predicate) (expected a string)'; });
    assert(isFunction(predicate), 'Invalid argument predicate ' + assert.stringify(predicate) + ' supplied to irreducible(name, predicate) (expected a function)');
  }

  function Irreducible(value, path) {

    if (process.env.NODE_ENV !== 'production') {
      forbidNewOperator(this, Irreducible);
      path = path || [name];
      assert(predicate(value), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/'); });
    }

    return value;
  }

  Irreducible.meta = {
    kind: 'irreducible',
    name: name,
    predicate: predicate,
    identity: true
  };

  Irreducible.displayName = name;

  Irreducible.is = predicate;

  return Irreducible;
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__(6);
var isObject = __webpack_require__(15);

module.exports = function isType(x) {
  return isFunction(x) && isObject(x.meta);
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var isNil = __webpack_require__(12);
var isString = __webpack_require__(18);

module.exports = function isTypeName(name) {
  return isNil(name) || isString(name);
};

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = function isArray(x) {
  return x instanceof Array;
};

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = function isNil(x) {
  return x === null || x === void 0;
};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var isType = __webpack_require__(9);
var isStruct = __webpack_require__(31);
var getFunctionName = __webpack_require__(19);
var assert = __webpack_require__(4);
var stringify = __webpack_require__(24);

// creates an instance of a type, handling the optional new operator
module.exports = function create(type, value, path) {
  if (isType(type)) {
    // for structs the new operator is allowed
    return isStruct(type) ? new type(value, path) : type(value, path);
  }

  if (process.env.NODE_ENV !== 'production') {
    // here type should be a class constructor and value some instance, just check membership and return the value
    path = path || [getFunctionName(type)];
    assert(value instanceof type, function () { return 'Invalid value ' + stringify(value) + ' supplied to ' + path.join('/'); });
  }

  return value;
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

var isType = __webpack_require__(9);

// returns true if x is an instance of type
module.exports = function is(x, type) {
  if (isType(type)) {
    return type.is(x);
  }
  return x instanceof type; // type should be a class constructor
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

var isNil = __webpack_require__(12);
var isArray = __webpack_require__(11);

module.exports = function isObject(x) {
  return !isNil(x) && typeof x === 'object' && !isArray(x);
};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var assert = __webpack_require__(4);
var Boolean = __webpack_require__(25);
var isType = __webpack_require__(9);
var getTypeName = __webpack_require__(7);

// return true if the type constructor behaves like the identity function
module.exports = function isIdentity(type) {
  if (isType(type)) {
    if (process.env.NODE_ENV !== 'production') {
      assert(Boolean.is(type.meta.identity), function () { return 'Invalid meta identity ' + assert.stringify(type.meta.identity) + ' supplied to type ' + getTypeName(type); });
    }
    return type.meta.identity;
  }
  // for tcomb the other constructors, like ES6 classes, are identity-like
  return true;
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var assert = __webpack_require__(4);
var getTypeName = __webpack_require__(7);

module.exports = function forbidNewOperator(x, type) {
  assert(!(x instanceof type), function () { return 'Cannot use the new operator to instantiate the type ' + getTypeName(type); });
};

/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = function isString(x) {
  return typeof x === 'string';
};

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = function getFunctionName(f) {
  return f.displayName || f.name || '<function' + f.length + '>';
};

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var isNil = __webpack_require__(12);
var assert = __webpack_require__(4);

// safe mixin, cannot override props unless specified
module.exports = function mixin(target, source, overwrite) {
  if (isNil(source)) { return target; }
  for (var k in source) {
    if (source.hasOwnProperty(k)) {
      if (overwrite !== true) {
        if (process.env.NODE_ENV !== 'production') {
          assert(!target.hasOwnProperty(k), function () { return 'Invalid call to mixin(target, source, [overwrite]): cannot overwrite property "' + k + '" of target object'; });
        }
      }
      target[k] = source[k];
    }
  }
  return target;
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var irreducible = __webpack_require__(8);

module.exports = irreducible('Any', function () { return true; });


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

var irreducible = __webpack_require__(8);
var isFunction = __webpack_require__(6);

module.exports = irreducible('Function', isFunction);


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

/*! @preserve
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014-2016 Giulio Canti
 *
 */

// core
var t = __webpack_require__(4);

// types
t.Any = __webpack_require__(21);
t.Array = __webpack_require__(36);
t.Boolean = __webpack_require__(25);
t.Date = __webpack_require__(37);
t.Error = __webpack_require__(38);
t.Function = __webpack_require__(22);
t.Nil = __webpack_require__(27);
t.Number = __webpack_require__(39);
t.Object = __webpack_require__(40);
t.RegExp = __webpack_require__(41);
t.String = __webpack_require__(29);

// short alias are deprecated
t.Arr = t.Array;
t.Bool = t.Boolean;
t.Dat = t.Date;
t.Err = t.Error;
t.Func = t.Function;
t.Num = t.Number;
t.Obj = t.Object;
t.Re = t.RegExp;
t.Str = t.String;

// combinators
t.dict = __webpack_require__(30);
t.declare = __webpack_require__(42);
t.enums = __webpack_require__(43);
t.irreducible = __webpack_require__(8);
t.list = __webpack_require__(32);
t.maybe = __webpack_require__(44);
t.refinement = __webpack_require__(46);
t.struct = __webpack_require__(47);
t.tuple = __webpack_require__(33);
t.union = __webpack_require__(48);
t.func = __webpack_require__(50);
t.intersection = __webpack_require__(51);
t.subtype = t.refinement;

// functions
t.assert = t;
t.update = __webpack_require__(52);
t.mixin = __webpack_require__(20);
t.isType = __webpack_require__(9);
t.is = __webpack_require__(14);
t.getTypeName = __webpack_require__(7);
t.match = __webpack_require__(53);

module.exports = t;


/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = function stringify(x) {
  try { // handle "Converting circular structure to JSON" error
    return JSON.stringify(x, null, 2);
  }
  catch (e) {
    return String(x);
  }
};

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

var irreducible = __webpack_require__(8);
var isBoolean = __webpack_require__(26);

module.exports = irreducible('Boolean', isBoolean);


/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = function isBoolean(x) {
  return x === true || x === false;
};

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

var irreducible = __webpack_require__(8);
var isNil = __webpack_require__(12);

module.exports = irreducible('Nil', isNil);


/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = function isNumber(x) {
  return typeof x === 'number' && isFinite(x) && !isNaN(x);
};

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var irreducible = __webpack_require__(8);
var isString = __webpack_require__(18);

module.exports = irreducible('String', isString);


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var assert = __webpack_require__(4);
var isTypeName = __webpack_require__(10);
var isFunction = __webpack_require__(6);
var getTypeName = __webpack_require__(7);
var isIdentity = __webpack_require__(16);
var isObject = __webpack_require__(15);
var create = __webpack_require__(13);
var is = __webpack_require__(14);

function getDefaultName(domain, codomain) {
  return '{[key: ' + getTypeName(domain) + ']: ' + getTypeName(codomain) + '}';
}

function dict(domain, codomain, name) {

  if (process.env.NODE_ENV !== 'production') {
    assert(isFunction(domain), function () { return 'Invalid argument domain ' + assert.stringify(domain) + ' supplied to dict(domain, codomain, [name]) combinator (expected a type)'; });
    assert(isFunction(codomain), function () { return 'Invalid argument codomain ' + assert.stringify(codomain) + ' supplied to dict(domain, codomain, [name]) combinator (expected a type)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to dict(domain, codomain, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(domain, codomain);
  var domainNameCache = getTypeName(domain);
  var codomainNameCache = getTypeName(codomain);
  var identity = isIdentity(domain) && isIdentity(codomain);

  function Dict(value, path) {

    if (process.env.NODE_ENV === 'production') {
      if (identity) {
        return value; // just trust the input if elements must not be hydrated
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      path = path || [displayName];
      assert(isObject(value), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/'); });
    }

    var idempotent = true; // will remain true if I can reutilise the input
    var ret = {}; // make a temporary copy, will be discarded if idempotent remains true
    for (var k in value) {
      if (value.hasOwnProperty(k)) {
        k = create(domain, k, ( process.env.NODE_ENV !== 'production' ? path.concat(domainNameCache) : null ));
        var actual = value[k];
        var instance = create(codomain, actual, ( process.env.NODE_ENV !== 'production' ? path.concat(k + ': ' + codomainNameCache) : null ));
        idempotent = idempotent && ( actual === instance );
        ret[k] = instance;
      }
    }

    if (idempotent) { // implements idempotency
      ret = value;
    }

    if (process.env.NODE_ENV !== 'production') {
      Object.freeze(ret);
    }

    return ret;
  }

  Dict.meta = {
    kind: 'dict',
    domain: domain,
    codomain: codomain,
    name: name,
    identity: identity
  };

  Dict.displayName = displayName;

  Dict.is = function (x) {
    if (!isObject(x)) {
      return false;
    }
    for (var k in x) {
      if (x.hasOwnProperty(k)) {
        if (!is(k, domain) || !is(x[k], codomain)) {
          return false;
        }
      }
    }
    return true;
  };

  Dict.update = function (instance, patch) {
    return Dict(assert.update(instance, patch));
  };

  return Dict;
}

dict.getDefaultName = getDefaultName;
module.exports = dict;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var isType = __webpack_require__(9);

module.exports = function isStruct(x) {
  return isType(x) && ( x.meta.kind === 'struct' );
};

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var assert = __webpack_require__(4);
var isTypeName = __webpack_require__(10);
var isFunction = __webpack_require__(6);
var getTypeName = __webpack_require__(7);
var isIdentity = __webpack_require__(16);
var create = __webpack_require__(13);
var is = __webpack_require__(14);
var isArray = __webpack_require__(11);

function getDefaultName(type) {
  return 'Array<' + getTypeName(type) + '>';
}

function list(type, name) {

  if (process.env.NODE_ENV !== 'production') {
    assert(isFunction(type), function () { return 'Invalid argument type ' + assert.stringify(type) + ' supplied to list(type, [name]) combinator (expected a type)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to list(type, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(type);
  var typeNameCache = getTypeName(type);
  var identity = isIdentity(type); // the list is identity iif type is identity

  function List(value, path) {

    if (process.env.NODE_ENV === 'production') {
      if (identity) {
        return value; // just trust the input if elements must not be hydrated
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      path = path || [displayName];
      assert(isArray(value), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/') + ' (expected an array of ' + typeNameCache + ')'; });
    }

    var idempotent = true; // will remain true if I can reutilise the input
    var ret = []; // make a temporary copy, will be discarded if idempotent remains true
    for (var i = 0, len = value.length; i < len; i++ ) {
      var actual = value[i];
      var instance = create(type, actual, ( process.env.NODE_ENV !== 'production' ? path.concat(i + ': ' + typeNameCache) : null ));
      idempotent = idempotent && ( actual === instance );
      ret.push(instance);
    }

    if (idempotent) { // implements idempotency
      ret = value;
    }

    if (process.env.NODE_ENV !== 'production') {
      Object.freeze(ret);
    }

    return ret;
  }

  List.meta = {
    kind: 'list',
    type: type,
    name: name,
    identity: identity
  };

  List.displayName = displayName;

  List.is = function (x) {
    return isArray(x) && x.every(function (e) {
      return is(e, type);
    });
  };

  List.update = function (instance, patch) {
    return List(assert.update(instance, patch));
  };

  return List;
}

list.getDefaultName = getDefaultName;
module.exports = list;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var assert = __webpack_require__(4);
var isTypeName = __webpack_require__(10);
var isFunction = __webpack_require__(6);
var getTypeName = __webpack_require__(7);
var isIdentity = __webpack_require__(16);
var isArray = __webpack_require__(11);
var create = __webpack_require__(13);
var is = __webpack_require__(14);

function getDefaultName(types) {
  return '[' + types.map(getTypeName).join(', ') + ']';
}

function tuple(types, name) {

  if (process.env.NODE_ENV !== 'production') {
    assert(isArray(types) && types.every(isFunction), function () { return 'Invalid argument types ' + assert.stringify(types) + ' supplied to tuple(types, [name]) combinator (expected an array of types)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to tuple(types, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(types);
  var identity = types.every(isIdentity);

  function Tuple(value, path) {

    if (process.env.NODE_ENV === 'production') {
      if (identity) {
        return value;
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      path = path || [displayName];
      assert(isArray(value) && value.length === types.length, function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/') + ' (expected an array of length ' + types.length + ')'; });
    }

    var idempotent = true;
    var ret = [];
    for (var i = 0, len = types.length; i < len; i++) {
      var expected = types[i];
      var actual = value[i];
      var instance = create(expected, actual, ( process.env.NODE_ENV !== 'production' ? path.concat(i + ': ' + getTypeName(expected)) : null ));
      idempotent = idempotent && ( actual === instance );
      ret.push(instance);
    }

    if (idempotent) { // implements idempotency
      ret = value;
    }

    if (process.env.NODE_ENV !== 'production') {
      Object.freeze(ret);
    }

    return ret;
  }

  Tuple.meta = {
    kind: 'tuple',
    types: types,
    name: name,
    identity: identity
  };

  Tuple.displayName = displayName;

  Tuple.is = function (x) {
    return isArray(x) &&
      x.length === types.length &&
      types.every(function (type, i) {
        return is(x[i], type);
      });
  };

  Tuple.update = function (instance, patch) {
    return Tuple(assert.update(instance, patch));
  };

  return Tuple;
}

tuple.getDefaultName = getDefaultName;
module.exports = tuple;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

﻿var t = __webpack_require__(23);
var unquote = __webpack_require__(54);
var globalKeywords = __webpack_require__(55);
var systemFontKeywords = __webpack_require__(56);
var fontWeightKeywords = __webpack_require__(57);
var fontStyleKeywords = __webpack_require__(58);
var fontStretchKeywords = __webpack_require__(59);
var cssListHelpers = __webpack_require__(60);

var helpers = __webpack_require__(61);

var SystemFont = t.struct({
	system: t.String
});

var Font = t.struct({
	style: t.String,
	variant: t.String,
	weight: t.String,
	stretch: t.String,
	size: t.String,
	lineHeight: t.union([t.String, t.Number]),
	family: t.list(t.String)
});

var Result = t.union([Font, SystemFont]);

module.exports = t.func(t.String, t.Object).of(
	function(value) {

		if (value === '') {
			throw error('Cannot parse an empty string.');
		}

		if (systemFontKeywords.indexOf(value) !== -1) {
			return SystemFont({ system: value });
		}

		var font = {
			style: 'normal',
			variant: 'normal',
			weight: 'normal',
			stretch: 'normal',
			lineHeight: 'normal'
		};

		var isLocked = false;
		var tokens = cssListHelpers.splitBySpaces(value);
		var token = tokens.shift();
		for (; !t.Nil.is(token); token = tokens.shift()) {

			if (token === 'normal' || globalKeywords.indexOf(token) !== -1) {
				['style', 'variant', 'weight', 'stretch'].forEach(function(prop) {
					font[prop] = token;
				});
				isLocked = true;
				continue;
			}

			if (fontWeightKeywords.indexOf(token) !== -1) {
				if (isLocked) {
					continue;
				}
				font.weight = token;
				continue;
			}

			if (fontStyleKeywords.indexOf(token) !== -1) {
				if (isLocked) {
					continue;
				}
				font.style = token;
				continue;
			}

			if (fontStretchKeywords.indexOf(token) !== -1) {
				if (isLocked) {
					continue;
				}
				font.stretch = token;
				continue;
			}

			if (helpers.isSize(token)) {
				var parts = cssListHelpers.split(token, ['/']);
				font.size = parts[0];
				if (!t.Nil.is(parts[1])) {
					font.lineHeight = parseLineHeight(parts[1]);
				}
				if (!tokens.length) {
					throw error('Missing required font-family.');
				}
				font.family = cssListHelpers.splitByCommas(tokens.join(' ')).map(unquote);
				return Font(font);
			}

			if (font.variant !== 'normal') {
				throw error('Unknown or unsupported font token: ' + font.variant);
			}

			if (isLocked) {
				continue;
			}
			font.variant = token;
		}

		throw error('Missing required font-size.');
	}
);

function error(message) {
	return new Error('[parse-css-font] ' + message);
}

function parseLineHeight(value) {
	var parsed = parseFloat(value);
	if (parsed.toString() === value) {
		return parsed;
	}
	return value;
}


/***/ }),
/* 35 */
/***/ (function(module, exports) {

module.exports = function fail(message) {
  throw new TypeError('[tcomb] ' + message);
};

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

var irreducible = __webpack_require__(8);
var isArray = __webpack_require__(11);

module.exports = irreducible('Array', isArray);


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

var irreducible = __webpack_require__(8);

module.exports = irreducible('Date', function (x) { return x instanceof Date; });


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

var irreducible = __webpack_require__(8);

module.exports = irreducible('Error', function (x) { return x instanceof Error; });


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

var irreducible = __webpack_require__(8);
var isNumber = __webpack_require__(28);

module.exports = irreducible('Number', isNumber);


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

var irreducible = __webpack_require__(8);
var isObject = __webpack_require__(15);

module.exports = irreducible('Object', isObject);


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

var irreducible = __webpack_require__(8);

module.exports = irreducible('RegExp', function (x) { return x instanceof RegExp; });


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var assert = __webpack_require__(4);
var isTypeName = __webpack_require__(10);
var isType = __webpack_require__(9);
var isNil = __webpack_require__(12);
var mixin = __webpack_require__(20);
var getTypeName = __webpack_require__(7);

// All the .declare-d types should be clearly different from each other thus they should have
// different names when a name was not explicitly provided.
var nextDeclareUniqueId = 1;

module.exports = function declare(name) {
  if (process.env.NODE_ENV !== 'production') {
    assert(isTypeName(name), function () { return 'Invalid argument name ' + name + ' supplied to declare([name]) (expected a string)'; });
  }

  var type;

  function Declare(value, path) {
    if (process.env.NODE_ENV !== 'production') {
      assert(!isNil(type), function () { return 'Type declared but not defined, don\'t forget to call .define on every declared type'; });
    }
    return type(value, path);
  }

  Declare.define = function (spec) {
    if (process.env.NODE_ENV !== 'production') {
      assert(isType(spec), function () { return 'Invalid argument type ' + assert.stringify(spec) +  ' supplied to define(type) (expected a type)'; });
      assert(isNil(type), function () { return 'Declare.define(type) can only be invoked once'; });
      assert(isNil(spec.meta.name) && Object.keys(spec.prototype).length === 0, function () { return 'Invalid argument type ' + assert.stringify(spec) + ' supplied to define(type) (expected a fresh, unnamed type)'; });
    }

    type = spec;
    mixin(Declare, type, true); // true because it overwrites Declare.displayName
    if (name) {
      type.displayName = Declare.displayName = name;
      Declare.meta.name = name;
    }
    // ensure identity is still false
    Declare.meta.identity = false;
    Declare.prototype = type.prototype;
    return Declare;
  };

  Declare.displayName = name || ( getTypeName(Declare) + "$" + nextDeclareUniqueId++ );
  // in general I can't say if this type will be an identity, for safety setting to false
  Declare.meta = { identity: false };
  Declare.prototype = null;
  return Declare;
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var assert = __webpack_require__(4);
var isTypeName = __webpack_require__(10);
var forbidNewOperator = __webpack_require__(17);
var isString = __webpack_require__(18);
var isObject = __webpack_require__(15);

function getDefaultName(map) {
  return Object.keys(map).map(function (k) { return assert.stringify(k); }).join(' | ');
}

function enums(map, name) {

  if (process.env.NODE_ENV !== 'production') {
    assert(isObject(map), function () { return 'Invalid argument map ' + assert.stringify(map) + ' supplied to enums(map, [name]) combinator (expected a dictionary of String -> String | Number)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to enums(map, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(map);

  function Enums(value, path) {

    if (process.env.NODE_ENV !== 'production') {
      forbidNewOperator(this, Enums);
      path = path || [displayName];
      assert(Enums.is(value), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/') + ' (expected one of ' + assert.stringify(Object.keys(map)) + ')'; });
    }

    return value;
  }

  Enums.meta = {
    kind: 'enums',
    map: map,
    name: name,
    identity: true
  };

  Enums.displayName = displayName;

  Enums.is = function (x) {
    return map.hasOwnProperty(x);
  };

  return Enums;
}

enums.of = function (keys, name) {
  keys = isString(keys) ? keys.split(' ') : keys;
  var value = {};
  keys.forEach(function (k) {
    value[k] = k;
  });
  return enums(value, name);
};

enums.getDefaultName = getDefaultName;
module.exports = enums;


/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var assert = __webpack_require__(4);
var isTypeName = __webpack_require__(10);
var isFunction = __webpack_require__(6);
var isMaybe = __webpack_require__(45);
var isIdentity = __webpack_require__(16);
var Any = __webpack_require__(21);
var create = __webpack_require__(13);
var Nil = __webpack_require__(27);
var forbidNewOperator = __webpack_require__(17);
var is = __webpack_require__(14);
var getTypeName = __webpack_require__(7);

function getDefaultName(type) {
  return '?' + getTypeName(type);
}

function maybe(type, name) {

  if (isMaybe(type) || type === Any || type === Nil) { // makes the combinator idempotent and handle Any, Nil
    return type;
  }

  if (process.env.NODE_ENV !== 'production') {
    assert(isFunction(type), function () { return 'Invalid argument type ' + assert.stringify(type) + ' supplied to maybe(type, [name]) combinator (expected a type)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to maybe(type, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(type);

  function Maybe(value, path) {
    if (process.env.NODE_ENV !== 'production') {
      forbidNewOperator(this, Maybe);
    }
    return Nil.is(value) ? null : create(type, value, path);
  }

  Maybe.meta = {
    kind: 'maybe',
    type: type,
    name: name,
    identity: isIdentity(type)
  };

  Maybe.displayName = displayName;

  Maybe.is = function (x) {
    return Nil.is(x) || is(x, type);
  };

  return Maybe;
}

maybe.getDefaultName = getDefaultName;
module.exports = maybe;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

var isType = __webpack_require__(9);

module.exports = function isMaybe(x) {
  return isType(x) && ( x.meta.kind === 'maybe' );
};

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var assert = __webpack_require__(4);
var isTypeName = __webpack_require__(10);
var isFunction = __webpack_require__(6);
var forbidNewOperator = __webpack_require__(17);
var isIdentity = __webpack_require__(16);
var create = __webpack_require__(13);
var is = __webpack_require__(14);
var getTypeName = __webpack_require__(7);
var getFunctionName = __webpack_require__(19);

function getDefaultName(type, predicate) {
  return '{' + getTypeName(type) + ' | ' + getFunctionName(predicate) + '}';
}

function refinement(type, predicate, name) {

  if (process.env.NODE_ENV !== 'production') {
    assert(isFunction(type), function () { return 'Invalid argument type ' + assert.stringify(type) + ' supplied to refinement(type, predicate, [name]) combinator (expected a type)'; });
    assert(isFunction(predicate), function () { return 'Invalid argument predicate supplied to refinement(type, predicate, [name]) combinator (expected a function)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to refinement(type, predicate, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(type, predicate);
  var identity = isIdentity(type);

  function Refinement(value, path) {

    if (process.env.NODE_ENV !== 'production') {
      forbidNewOperator(this, Refinement);
      path = path || [displayName];
    }

    var x = create(type, value, path);

    if (process.env.NODE_ENV !== 'production') {
      assert(predicate(x), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/'); });
    }

    return x;
  }

  Refinement.meta = {
    kind: 'subtype',
    type: type,
    predicate: predicate,
    name: name,
    identity: identity
  };

  Refinement.displayName = displayName;

  Refinement.is = function (x) {
    return is(x, type) && predicate(x);
  };

  Refinement.update = function (instance, patch) {
    return Refinement(assert.update(instance, patch));
  };

  return Refinement;
}

refinement.getDefaultName = getDefaultName;
module.exports = refinement;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var assert = __webpack_require__(4);
var isTypeName = __webpack_require__(10);
var String = __webpack_require__(29);
var Function = __webpack_require__(22);
var isArray = __webpack_require__(11);
var isObject = __webpack_require__(15);
var create = __webpack_require__(13);
var mixin = __webpack_require__(20);
var isStruct = __webpack_require__(31);
var getTypeName = __webpack_require__(7);
var dict = __webpack_require__(30);

function getDefaultName(props) {
  return '{' + Object.keys(props).map(function (prop) {
    return prop + ': ' + getTypeName(props[prop]);
  }).join(', ') + '}';
}

function extend(mixins, name) {
  if (process.env.NODE_ENV !== 'production') {
    assert(isArray(mixins) && mixins.every(function (x) {
      return isObject(x) || isStruct(x);
    }), function () { return 'Invalid argument mixins supplied to extend(mixins, name), expected an array of objects or structs'; });
  }
  var props = {};
  var prototype = {};
  mixins.forEach(function (struct) {
    if (isObject(struct)) {
      mixin(props, struct);
    }
    else {
      mixin(props, struct.meta.props);
      mixin(prototype, struct.prototype);
    }
  });
  var ret = struct(props, name);
  mixin(ret.prototype, prototype);
  return ret;
}

function struct(props, name) {

  if (process.env.NODE_ENV !== 'production') {
    assert(dict(String, Function).is(props), function () { return 'Invalid argument props ' + assert.stringify(props) + ' supplied to struct(props, [name]) combinator (expected a dictionary String -> Type)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to struct(props, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(props);

  function Struct(value, path) {

    if (Struct.is(value)) { // implements idempotency
      return value;
    }

    if (process.env.NODE_ENV !== 'production') {
      path = path || [displayName];
      assert(isObject(value), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/') + ' (expected an object)'; });
    }

    if (!(this instanceof Struct)) { // `new` is optional
      return new Struct(value, path);
    }

    for (var k in props) {
      if (props.hasOwnProperty(k)) {
        var expected = props[k];
        var actual = value[k];
        this[k] = create(expected, actual, ( process.env.NODE_ENV !== 'production' ? path.concat(k + ': ' + getTypeName(expected)) : null ));
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      Object.freeze(this);
    }

  }

  Struct.meta = {
    kind: 'struct',
    props: props,
    name: name,
    identity: false
  };

  Struct.displayName = displayName;

  Struct.is = function (x) {
    return x instanceof Struct;
  };

  Struct.update = function (instance, patch) {
    return new Struct(assert.update(instance, patch));
  };

  Struct.extend = function (structs, name) {
    return extend([Struct].concat(structs), name);
  };

  return Struct;
}

struct.getDefaultName = getDefaultName;
struct.extend = extend;
module.exports = struct;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var assert = __webpack_require__(4);
var isTypeName = __webpack_require__(10);
var isFunction = __webpack_require__(6);
var getTypeName = __webpack_require__(7);
var isIdentity = __webpack_require__(16);
var isArray = __webpack_require__(11);
var create = __webpack_require__(13);
var is = __webpack_require__(14);
var forbidNewOperator = __webpack_require__(17);
var isType = __webpack_require__(9);
var isUnion = __webpack_require__(49);
var isNil = __webpack_require__(12);

function getDefaultName(types) {
  return types.map(getTypeName).join(' | ');
}

function union(types, name) {

  if (process.env.NODE_ENV !== 'production') {
    assert(isArray(types) && types.every(isFunction) && types.length >= 2, function () { return 'Invalid argument types ' + assert.stringify(types) + ' supplied to union(types, [name]) combinator (expected an array of at least 2 types)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to union(types, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(types);
  var identity = types.every(isIdentity);

  function Union(value, path) {

    if (process.env.NODE_ENV === 'production') {
      if (identity) {
        return value;
      }
    }

    var type = Union.dispatch(value);
    if (!type && Union.is(value)) {
      return value;
    }

    if (process.env.NODE_ENV !== 'production') {
      forbidNewOperator(this, Union);
      path = path || [displayName];
      assert(isType(type), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/') + ' (no constructor returned by dispatch)'; });
      path[path.length - 1] += '(' + getTypeName(type) + ')';
    }

    return create(type, value, path);
  }

  Union.meta = {
    kind: 'union',
    types: types,
    name: name,
    identity: identity
  };

  Union.displayName = displayName;

  Union.is = function (x) {
    return types.some(function (type) {
      return is(x, type);
    });
  };

  Union.dispatch = function (x) { // default dispatch implementation
    for (var i = 0, len = types.length; i < len; i++ ) {
      var type = types[i];
      if (isUnion(type)) { // handle union of unions
        var t = type.dispatch(x);
        if (!isNil(t)) {
          return t;
        }
      }
      else if (is(x, type)) {
        return type;
      }
    }
  };

  Union.update = function (instance, patch) {
    return Union(assert.update(instance, patch));
  };

  return Union;
}

union.getDefaultName = getDefaultName;
module.exports = union;


/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

var isType = __webpack_require__(9);

module.exports = function isUnion(x) {
  return isType(x) && ( x.meta.kind === 'union' );
};

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var assert = __webpack_require__(4);
var isTypeName = __webpack_require__(10);
var FunctionType = __webpack_require__(22);
var isArray = __webpack_require__(11);
var list = __webpack_require__(32);
var isObject = __webpack_require__(15);
var create = __webpack_require__(13);
var isNil = __webpack_require__(12);
var isBoolean = __webpack_require__(26);
var tuple = __webpack_require__(33);
var getFunctionName = __webpack_require__(19);
var getTypeName = __webpack_require__(7);

function getDefaultName(domain, codomain) {
  return '(' + domain.map(getTypeName).join(', ') + ') => ' + getTypeName(codomain);
}

function isInstrumented(f) {
  return FunctionType.is(f) && isObject(f.instrumentation);
}

function func(domain, codomain, name) {

  domain = isArray(domain) ? domain : [domain]; // handle handy syntax for unary functions

  if (process.env.NODE_ENV !== 'production') {
    assert(list(FunctionType).is(domain), function () { return 'Invalid argument domain ' + assert.stringify(domain) + ' supplied to func(domain, codomain, [name]) combinator (expected an array of types)'; });
    assert(FunctionType.is(codomain), function () { return 'Invalid argument codomain ' + assert.stringify(codomain) + ' supplied to func(domain, codomain, [name]) combinator (expected a type)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to func(domain, codomain, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(domain, codomain);

  function FuncType(value, curried) {

    if (!isInstrumented(value)) { // automatically instrument the function
      return FuncType.of(value, curried);
    }

    if (process.env.NODE_ENV !== 'production') {
      assert(FuncType.is(value), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + displayName; });
    }

    return value;
  }

  FuncType.meta = {
    kind: 'func',
    domain: domain,
    codomain: codomain,
    name: name,
    identity: true
  };

  FuncType.displayName = displayName;

  FuncType.is = function (x) {
    return isInstrumented(x) &&
      x.instrumentation.domain.length === domain.length &&
      x.instrumentation.domain.every(function (type, i) {
        return type === domain[i];
      }) &&
      x.instrumentation.codomain === codomain;
  };

  FuncType.of = function (f, curried) {

    if (process.env.NODE_ENV !== 'production') {
      assert(FunctionType.is(f), function () { return 'Invalid argument f supplied to func.of ' + displayName + ' (expected a function)'; });
      assert(isNil(curried) || isBoolean(curried), function () { return 'Invalid argument curried ' + assert.stringify(curried) + ' supplied to func.of ' + displayName + ' (expected a boolean)'; });
    }

    if (FuncType.is(f)) { // makes FuncType.of idempotent
      return f;
    }

    function fn() {
      var args = Array.prototype.slice.call(arguments);
      var len = curried ?
        args.length :
        domain.length;
      var argsType = tuple(domain.slice(0, len));

      args = argsType(args); // type check arguments

      if (len === domain.length) {
        return create(codomain, f.apply(this, args));
      }
      else {
        var g = Function.prototype.bind.apply(f, [this].concat(args));
        var newdomain = func(domain.slice(len), codomain);
        return newdomain.of(g, curried);
      }
    }

    fn.instrumentation = {
      domain: domain,
      codomain: codomain,
      f: f
    };

    fn.displayName = getFunctionName(f);

    return fn;

  };

  return FuncType;

}

func.getDefaultName = getDefaultName;
module.exports = func;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var assert = __webpack_require__(4);
var isTypeName = __webpack_require__(10);
var isFunction = __webpack_require__(6);
var isArray = __webpack_require__(11);
var forbidNewOperator = __webpack_require__(16);
var is = __webpack_require__(14);
var getTypeName = __webpack_require__(7);

function getDefaultName(types) {
  return types.map(getTypeName).join(' & ');
}

function intersection(types, name) {

  if (process.env.NODE_ENV !== 'production') {
    assert(isArray(types) && types.every(isFunction) && types.length >= 2, function () { return 'Invalid argument types ' + assert.stringify(types) + ' supplied to intersection(types, [name]) combinator (expected an array of at least 2 types)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to intersection(types, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(types);

  function Intersection(value, path) {

    if (process.env.NODE_ENV !== 'production') {
      forbidNewOperator(this, Intersection);
      path = path || [displayName];
      assert(Intersection.is(value), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/'); });
    }

    return value;
  }

  Intersection.meta = {
    kind: 'intersection',
    types: types,
    name: name,
    identity: true
  };

  Intersection.displayName = displayName;

  Intersection.is = function (x) {
    return types.every(function (type) {
      return is(x, type);
    });
  };

  Intersection.update = function (instance, patch) {
    return Intersection(assert.update(instance, patch));
  };

  return Intersection;
}

intersection.getDefaultName = getDefaultName;
module.exports = intersection;


/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var assert = __webpack_require__(4);
var isObject = __webpack_require__(15);
var isFunction = __webpack_require__(6);
var isArray = __webpack_require__(11);
var isNumber = __webpack_require__(28);
var mixin = __webpack_require__(20);

function getShallowCopy(x) {
  if (isArray(x)) {
    return x.concat();
  }
  if (x instanceof Date || x instanceof RegExp) {
    return x;
  }
  if (isObject(x)) {
    return mixin({}, x);
  }
  return x;
}

function update(instance, patch) {

  if (process.env.NODE_ENV !== 'production') {
    assert(isObject(patch), function () { return 'Invalid argument patch ' + assert.stringify(patch) + ' supplied to function update(instance, patch): expected an object containing commands'; });
  }

  var value = getShallowCopy(instance);
  var isChanged = false;
  for (var k in patch) {
    if (patch.hasOwnProperty(k)) {
      if (update.commands.hasOwnProperty(k)) {
        value = update.commands[k](patch[k], value);
        isChanged = true;
      }
      else {
        var newValue = update(value[k], patch[k]);
        isChanged = isChanged || ( newValue !== value[k] );
        value[k] = newValue;
      }
    }
  }
  return isChanged ? value : instance;
}

// built-in commands

function $apply(f, value) {
  if (process.env.NODE_ENV !== 'production') {
    assert(isFunction(f), 'Invalid argument f supplied to immutability helper { $apply: f } (expected a function)');
  }
  return f(value);
}

function $push(elements, arr) {
  if (process.env.NODE_ENV !== 'production') {
    assert(isArray(elements), 'Invalid argument elements supplied to immutability helper { $push: elements } (expected an array)');
    assert(isArray(arr), 'Invalid value supplied to immutability helper $push (expected an array)');
  }
  return arr.concat(elements);
}

function $remove(keys, obj) {
  if (process.env.NODE_ENV !== 'production') {
    assert(isArray(keys), 'Invalid argument keys supplied to immutability helper { $remove: keys } (expected an array)');
    assert(isObject(obj), 'Invalid value supplied to immutability helper $remove (expected an object)');
  }
  for (var i = 0, len = keys.length; i < len; i++ ) {
    delete obj[keys[i]];
  }
  return obj;
}

function $set(value) {
  return value;
}

function $splice(splices, arr) {
  if (process.env.NODE_ENV !== 'production') {
    assert(isArray(splices) && splices.every(isArray), 'Invalid argument splices supplied to immutability helper { $splice: splices } (expected an array of arrays)');
    assert(isArray(arr), 'Invalid value supplied to immutability helper $splice (expected an array)');
  }
  return splices.reduce(function (acc, splice) {
    acc.splice.apply(acc, splice);
    return acc;
  }, arr);
}

function $swap(config, arr) {
  if (process.env.NODE_ENV !== 'production') {
    assert(isObject(config), 'Invalid argument config supplied to immutability helper { $swap: config } (expected an object)');
    assert(isNumber(config.from), 'Invalid argument config.from supplied to immutability helper { $swap: config } (expected a number)');
    assert(isNumber(config.to), 'Invalid argument config.to supplied to immutability helper { $swap: config } (expected a number)');
    assert(isArray(arr), 'Invalid value supplied to immutability helper $swap (expected an array)');
  }
  var element = arr[config.to];
  arr[config.to] = arr[config.from];
  arr[config.from] = element;
  return arr;
}

function $unshift(elements, arr) {
  if (process.env.NODE_ENV !== 'production') {
    assert(isArray(elements), 'Invalid argument elements supplied to immutability helper {$unshift: elements} (expected an array)');
    assert(isArray(arr), 'Invalid value supplied to immutability helper $unshift (expected an array)');
  }
  return elements.concat(arr);
}

function $merge(obj, value) {
  return mixin(mixin({}, value), obj, true);
}

update.commands = {
  $apply: $apply,
  $push: $push,
  $remove: $remove,
  $set: $set,
  $splice: $splice,
  $swap: $swap,
  $unshift: $unshift,
  $merge: $merge
};

module.exports = update;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var assert = __webpack_require__(4);
var isFunction = __webpack_require__(6);
var isType = __webpack_require__(9);
var Any = __webpack_require__(21);

module.exports = function match(x) {
  var type, guard, f, count;
  for (var i = 1, len = arguments.length; i < len; ) {
    type = arguments[i];
    guard = arguments[i + 1];
    f = arguments[i + 2];

    if (isFunction(f) && !isType(f)) {
      i = i + 3;
    }
    else {
      f = guard;
      guard = Any.is;
      i = i + 2;
    }

    if (process.env.NODE_ENV !== 'production') {
      count = (count || 0) + 1;
      assert(isType(type), function () { return 'Invalid type in clause #' + count; });
      assert(isFunction(guard), function () { return 'Invalid guard in clause #' + count; });
      assert(isFunction(f), function () { return 'Invalid block in clause #' + count; });
    }

    if (type.is(x) && guard(x)) {
      return f(x);
    }
  }
  assert.fail('Match error');
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 54 */
/***/ (function(module, exports) {

var reg = /[\'\"]/

module.exports = function unquote(str) {
  if (!str) {
    return ''
  }
  if (reg.test(str.charAt(0))) {
    str = str.substr(1)
  }
  if (reg.test(str.charAt(str.length - 1))) {
    str = str.substr(0, str.length - 1)
  }
  return str
}


/***/ }),
/* 55 */
/***/ (function(module, exports) {

module.exports = ["inherit","initial","unset"]

/***/ }),
/* 56 */
/***/ (function(module, exports) {

module.exports = ["caption","icon","menu","message-box","small-caption","status-bar"]

/***/ }),
/* 57 */
/***/ (function(module, exports) {

module.exports = ["normal","bold","bolder","lighter","100","200","300","400","500","600","700","800","900"]

/***/ }),
/* 58 */
/***/ (function(module, exports) {

module.exports = ["normal","italic","oblique"]

/***/ }),
/* 59 */
/***/ (function(module, exports) {

module.exports = ["normal","condensed","semi-condensed","extra-condensed","ultra-condensed","expanded","semi-expanded","extra-expanded","ultra-expanded"]

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

var t = __webpack_require__(23);

var Options = t.struct({
	last: t.maybe(t.Boolean)
});

var helpers = {

	split: function(value, separators, options) {
		return split(value, separators, options || {});
	},

	splitBySpaces: t.func(t.String, t.Array).of(
		function(value) {
			var spaces = [' ', '\n', '\t'];
			return helpers.split(value, spaces);
		}
	),

	splitByCommas: t.func(t.String, t.Array).of(
		function(value) {
			var comma = ',';
			return helpers.split(value, [comma], { last: true });
		}
	)

};

var split = t.func([t.String, t.Array, Options], t.Array).of(
	function(value, separators, options) {
		var array   = [];
		var current = '';
		var split   = false;

		var func    = 0;
		var quote   = false;
		var escape  = false;

		for (var i = 0; i < value.length; i++) {
			var char = value[i];

			if (quote) {
				if (escape) {
					escape = false;
				} else if (char === '\\') {
					escape = true;
				} else if (char === quote) {
					quote = false;
				}
			} else if (char === '"' || char === '\'') {
				quote = char;
			} else if (char === '(') {
				func += 1;
			} else if (char === ')') {
				if (func > 0) {
					func -= 1;
				}
			} else if (func === 0) {
				if (separators.indexOf(char) !== -1) {
					split = true;
				}
			}

			if (split) {
				if (current !== '') {
					array.push(current.trim());
				}
				current = '';
				split = false;
			} else {
				current += char;
			}
		}

		if (options.last || current !== '') {
			array.push(current.trim());
		}
		return array;
	}
);

module.exports = helpers;


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

var cssFontSizeKeywords = __webpack_require__(62);

module.exports = {

	isSize: function(value) {
		return /^[\d\.]/.test(value)
			|| value.indexOf('/') !== -1
			|| cssFontSizeKeywords.indexOf(value) !== -1
		;
	}

};


/***/ }),
/* 62 */
/***/ (function(module, exports) {

module.exports = ["xx-small","x-small","small","medium","large","x-large","xx-large","larger","smaller"]

/***/ })
/******/ ]);
});