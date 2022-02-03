"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.teams = void 0;
var path_1 = __importDefault(require("path"));
var templates_1 = require("@fx/templates");
var manifest_js_1 = require("./manifest.js");
var tab_js_1 = require("./tab.js");
// import { aadAppRegistration } from "@fx/aad";
// import { yogenerator } from "@fx/yo";
function teams() {
    return {
        name: "teams",
        resources: function () {
            return [
                // yogenerator({ name: 'teams' }),
                // aadAppRegistration(),
                (0, templates_1.template)({
                    name: "manifest",
                    description: "Create a Teams manifest template and build scripts",
                    templateDirectory: path_1.default.resolve(__dirname, "../templates/manifest"),
                    input: manifest_js_1.manifestInput,
                }),
                (0, templates_1.template)({
                    name: "tab",
                    description: "Add a staticTabs declaration to your Teams manifest",
                    templateDirectory: path_1.default.resolve(__dirname, "../templates/tab"),
                    input: tab_js_1.tabInput,
                }),
            ];
        },
    };
}
exports.teams = teams;
//# sourceMappingURL=teams.js.map