"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tabInput = void 0;
var zod_1 = require("zod");
exports.tabInput = zod_1.z.object({
    outputDir: zod_1.z.string().describe("choose a folder").default("./teams"),
});
//# sourceMappingURL=tab.js.map