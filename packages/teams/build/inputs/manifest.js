"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.manifestInput = void 0;
var zod_1 = require("zod");
var os_1 = __importDefault(require("os"));
exports.manifestInput = zod_1.z.object({
    directory: zod_1.z
        .string()
        .describe("choose a folder where to store the manifest and icons")
        .default("./teams-manifest"),
    buildDirectory: zod_1.z
        .string()
        .describe("choose a folder where to produce the teams app zip bundle")
        .default("./build/teams-manifest"),
    name: zod_1.z.string().describe("enter a short, friendly application name"),
    description: zod_1.z
        .string()
        .describe("enter a friendly application description")
        .default("An app built with Teams Toolkit"),
    packageName: zod_1.z
        .string()
        .describe("enter a package name like com.example.myapp"),
    developerName: zod_1.z
        .string()
        .describe("enter your publisher name")
        .default(os_1.default.userInfo().username),
});
//# sourceMappingURL=manifest.js.map