"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ellipsis = void 0;
var MAX_LENGTH = 60;
var ellipsis = function (s, n) {
    if (n === void 0) { n = MAX_LENGTH; }
    return s.length > n
        ? s.slice(0, n / 2 - 3) + "..." + s.slice(s.length - n / 2 - 3)
        : s;
};
exports.ellipsis = ellipsis;
//# sourceMappingURL=ellipsis.js.map