"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.manifest = void 0;
var templates_1 = require("@fx/templates");
var manifest_1 = require("./inputs/manifest");
var path_1 = __importDefault(require("path"));
function manifest() {
    return (0, templates_1.template)({
        name: "manifest",
        description: "Create a Teams manifest template and build scripts",
        templateDirectory: path_1.default.resolve(__dirname, "../templates/manifest"),
        input: manifest_1.manifestInput,
        outputDirectory: function (input) {
            return input.directory;
        }
    });
}
exports.manifest = manifest;
//# sourceMappingURL=manifest.js.map