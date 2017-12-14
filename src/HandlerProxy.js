import Eventful from 'zrender/src/mixin/Eventful';
import { mixin } from 'zrender/src/core/util';

function HandlerProxy() {
    Eventful.call(this);
}

HandlerProxy.prototype.dispose = function () {};

HandlerProxy.prototype.setCursor = function (cursor) {
};

mixin(HandlerProxy, Eventful);

export default HandlerProxy;