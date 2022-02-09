"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug = void 0;
function debug() {
    var _a;
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (/zod-inquirer/.test((_a = process.env.DEBUG) !== null && _a !== void 0 ? _a : ""))
        console.debug.apply(console, args);
}
exports.debug = debug;
//# sourceMappingURL=debug.js.map