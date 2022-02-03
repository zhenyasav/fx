"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomString = void 0;
function randomString(n) {
    if (n === void 0) { n = 4; }
    return Math.random().toString(16).slice(2, 2 + n);
}
exports.randomString = randomString;
//# sourceMappingURL=random.js.map