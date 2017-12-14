import COMMANDS from './commands';

function getColor(commands, offset) {
    var r = commands[offset++];
    var g = commands[offset++];
    var b = commands[offset++];
    var a = commands[offset++];

    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

function getString(commands, offset) {
    var len = commands[offset];
    var str = '';
    for (var i = 0; i < len; i++) {
        str += String.fromCharCode(commands[i + 1 + offset]);
    }
    return str;
}

function CanvasCommandRepeater(ctx, commands) {
    this.dpr = ctx.dpr || 1;
    this._ctx = ctx;
    this._commands = commands;
    this._offset = 0;
}

CanvasCommandRepeater.prototype.isFinished = function () {
    return this._offset >= this._commands.length;
};

CanvasCommandRepeater.prototype.execute = function (maxRunTime) {
    var commands = this._commands;
    var prevCmd;
    var startTime = Date.now();
    var execTime;
    var drawCount = 0;
    var prevDrawCount;
    var offset = this._offset;
    var ctx = this._ctx;

    maxRunTime = maxRunTime || Infinity;

    for (var i = offset; i < commands.length;) {
        prevCmd = cmd;
        var cmd = commands[i++];
        prevDrawCount = drawCount;
        switch (cmd) {
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
            case COMMANDS.arc:
                ctx.arc(commands[i++], commands[i++], commands[i++], commands[i++], commands[i++], !!commands[i++]);
                break;
            case COMMANDS.closePath:
                ctx.closePath();
                break;
            case COMMANDS.fill:
                ctx.fill();
                drawCount++;
                break;
            case COMMANDS.stroke:
                ctx.stroke();
                drawCount++;
                break;
            case COMMANDS.setIdentityTransform:
                ctx.setTransform(
                    this.dpr, 0, 0,
                    this.dpr, 0, 0
                );
                break;
            case COMMANDS.setScaleTransform:
                ctx.setTransform(
                    commands[i++], 0, 0,
                    commands[i++], 0, 0
                );
                break;
            case COMMANDS.setTranslationTransform:
                ctx.setTransform(
                    this.dpr, 0, 0,
                    this.dpr, commands[i++], commands[i++]
                );
                break;
            case COMMANDS.setScaleTranslationTransform:
                ctx.setTransform(
                    commands[i++], 0, 0,
                    commands[i++], commands[i++], commands[i++]
                );
                break;
            case COMMANDS.setTransform:
                ctx.setTransform(
                    commands[i++], commands[i++], commands[i++],
                    commands[i++], commands[i++], commands[i++]
                );
                break;
            case COMMANDS.fillStyle:
                ctx.fillStyle = getColor(commands, i);
                i += 4;
                break;
            case COMMANDS.strokeStyle:
                ctx.strokeStyle = getColor(commands, i);
                i += 4;
                break;
            case COMMANDS.lineWidth:
                ctx.lineWidth = commands[i++];
                break;
            case COMMANDS.opacity:
                ctx.opacity = commands[i++];
                break;
            case COMMANDS.font:
                ctx.font = getString(commands, i);
                i += commands[i] + 1;
                break;
            case COMMANDS.textBaseline:
                ctx.textBaseline = getString(commands, i);
                i += commands[i] + 1;
                break;
            case COMMANDS.textAlign:
                ctx.textAlign = getString(commands, i);
                i += commands[i] + 1;
                break;
            case COMMANDS.fillText:
                var str = getString(commands, i);
                i += commands[i] + 1;
                ctx.fillText(str, commands[i++], commands[i++]);
                drawCount++;
                break;
            case COMMANDS.strokeText:
                var str = getString(commands, i);
                i += commands[i] + 1;
                ctx.strokeText(str, commands[i++], commands[i++]);
                drawCount++;
                break;
            case COMMANDS.shadowColor:
                ctx.shadowColor = getColor(commands, i);
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

        // Put draw into next chunk
        if (drawCount > prevDrawCount) {
            // reset draw count
            // PENDING, performance?
            execTime = Date.now() - startTime;
            if (execTime > maxRunTime) {
                break;
            }
        }
    }

    this._offset = i;

    return execTime;
};

export default CanvasCommandRepeater;