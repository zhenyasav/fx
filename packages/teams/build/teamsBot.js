"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamsBot = void 0;
var zod_1 = require("zod");
var plugin_1 = require("@fx/plugin");
function teamsBot() {
    return {
        type: "teams-bot",
        description: "An Azure Bot Service powered bot connected to Teams",
        methods: {
            create: (0, plugin_1.method)({
                inputShape: zod_1.z.object({
                    name: zod_1.z.string().describe("the name of the teams bot app"),
                    manifest: zod_1.z.literal("manifest").describe("a Teams manifest file"),
                    botService: zod_1.z
                        .literal("azure-bot-service")
                        .describe("an Azure Bot Service"),
                })
            }),
        },
    };
}
exports.teamsBot = teamsBot;
//# sourceMappingURL=teamsBot.js.map