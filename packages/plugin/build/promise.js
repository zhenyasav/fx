"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promise = exports.isPromise = void 0;
function isPromise(p) {
    return typeof (p === null || p === void 0 ? void 0 : p.then) == "function";
}
exports.isPromise = isPromise;
function promise(p) {
    return isPromise(p) ? p : Promise.resolve(p);
}
exports.promise = promise;
//# sourceMappingURL=promise.js.map