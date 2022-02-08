"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.method = exports.printResourceId = exports.promise = exports.isPromise = void 0;
var zod_inquirer_1 = require("@fx/zod-inquirer");
function isPromise(p) {
    return typeof (p === null || p === void 0 ? void 0 : p.then) == "function";
}
exports.isPromise = isPromise;
function promise(p) {
    return isPromise(p) ? p : Promise.resolve(p);
}
exports.promise = promise;
function printResourceId(instance) {
    if (!instance)
        return "[null]";
    var id = instance.id, type = instance.type;
    return "".concat(type, ":").concat(id);
}
exports.printResourceId = printResourceId;
function method(_a) {
    var inputShape = _a.inputShape, rest = __rest(_a, ["inputShape"]);
    return inputShape
        ? __assign({ inputs: function (defaults) {
                return (0, zod_inquirer_1.inquire)(inputShape, defaults);
            } }, rest) : __assign({ inputs: function (defaults) {
            return defaults;
        } }, rest);
}
exports.method = method;
//# sourceMappingURL=plugin.js.map