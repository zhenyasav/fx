"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tab = void 0;
var zod_1 = require("zod");
var plugin_1 = require("@fx/plugin");
function tab() {
    return {
        type: "teams-tab",
        description: "A Teams Tab",
        methods: {
            create: (0, plugin_1.method)({
                inputShape: zod_1.z.object({
                    name: zod_1.z.string().describe("enter the tab name"),
                    manifest: zod_1.z
                        .literal("teams-manifest")
                        .describe("specify teams manifest"),
                    url: zod_1.z
                        .union([
                        zod_1.z
                            .string()
                            .describe("enter the https url of the tab")
                            .default("https://localhost:3000"),
                        zod_1.z.literal("tunnel").describe("use a tunnel resource"),
                    ])
                        .describe("identify the tab URL"),
                }),
            }),
        },
    };
}
exports.tab = tab;
//# sourceMappingURL=tab.js.map