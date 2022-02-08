"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manifestInput = void 0;
var zod_1 = require("zod");
exports.manifestInput = zod_1.z.object({
    outputDir: zod_1.z.string().describe("choose a folder").default("./teams"),
    full: zod_1.z
        .boolean()
        .describe("generate all the possible fields in the manifest")
        .default(false),
});
//# sourceMappingURL=manifest.js.map