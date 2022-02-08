"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compact = void 0;
function compact(array) {
    if (!Array.isArray(array))
        return array;
    return array.reduce(function (memo, v) { return v ? memo.concat(v) : memo; }, []);
}
exports.compact = compact;
//# sourceMappingURL=collections.js.map