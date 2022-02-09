"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teams = void 0;
// import { template } from "@fx/templates";
var manifest_1 = require("./manifest");
// import { tabInput } from "./inputs/tab";
var bots_1 = require("@fx/bots");
var tunnel_1 = require("@fx/tunnel");
var teamsBot_1 = require("./teamsBot");
var tab_1 = require("./tab");
function teams() {
    return {
        name: "teams",
        resources: function () {
            return [
                (0, manifest_1.manifest)(),
                (0, tab_1.tab)(),
                (0, teamsBot_1.teamsBot)(),
                (0, bots_1.botService)(),
                (0, tunnel_1.tunnel)(),
                // template({
                //   name: "tab",
                //   description: "Add a staticTabs declaration to your Teams manifest",
                //   templateDirectory: path.resolve(__dirname, "../templates/tab"),
                //   input: tabInput,
                // }),
            ];
        },
    };
}
exports.teams = teams;
//# sourceMappingURL=plugin.js.map