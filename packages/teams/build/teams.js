"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.teams = void 0;
var path_1 = __importDefault(require("path"));
var templates_1 = require("@fx/templates");
var manifest_1 = require("./manifest");
var tab_1 = require("./tab");
var bots_1 = require("@fx/bots");
var tunnel_1 = require("@fx/tunnel");
function teams() {
    return {
        name: "teams",
        resources: function () {
            return [
                (0, bots_1.botRegistration)(),
                (0, tunnel_1.tunnel)(),
                (0, templates_1.template)({
                    name: "manifest",
                    description: "Create a Teams manifest template and build scripts",
                    templateDirectory: path_1.default.resolve(__dirname, "../templates/manifest"),
                    input: manifest_1.manifestInput,
                }),
                (0, templates_1.template)({
                    name: "tab",
                    description: "Add a staticTabs declaration to your Teams manifest",
                    templateDirectory: path_1.default.resolve(__dirname, "../templates/tab"),
                    input: tab_1.tabInput,
                }),
            ];
        },
    };
}
exports.teams = teams;
//# sourceMappingURL=teams.js.map