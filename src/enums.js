var COMMANDS = [
    'setTransform',
    'beginPath',
    'moveTo',
    'lineTo',
    'bezierCurveTo',
    'quadraticCurveTo',
    'arc',
    'rect',
    'globalAlpha',
    'fillStyle',
    'strokeStyle',
    'lineWidth',
    'font',
    'globalCompositeOperation',
    'textBaseline',
    'textAlign',
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
    // Try to reduce commands....
    'setIdentityTransform',
    'setScaleTransform',
    'setTranslationTransform',
    'setScaleTranslationTransform',
    'save',
    'restore',
    'clearRect',
    'fillRect',
    'strokeRect'
].reduce(function (obj, val, idx) {
    obj[val] = idx;
    return obj;
}, {});

export default {
    COMMANDS
};