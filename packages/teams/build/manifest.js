"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.manifest = void 0;
var path_1 = __importDefault(require("path"));
var open_1 = __importDefault(require("open"));
var chalk_1 = require("chalk");
var fs_1 = require("fs");
var fs_2 = __importDefault(require("fs"));
var templates_1 = require("@fx/templates");
var manifest_1 = require("./inputs/manifest");
var plugin_1 = require("@fx/plugin");
var teams_dev_portal_1 = require("@fx/teams-dev-portal");
var jszip_1 = __importDefault(require("jszip"));
var mkdirp_1 = __importDefault(require("mkdirp"));
function manifest() {
    return (0, templates_1.template)({
        name: "teams-manifest",
        description: "Create a Teams manifest template and build scripts",
        templateDirectory: path_1.default.resolve(__dirname, "../templates/manifest"),
        input: manifest_1.manifestInput,
        inputTransform: function (input, context) {
            var configFilePath = context.config.configFilePath;
            var projectRoot = path_1.default.dirname(configFilePath);
            var cwd = process.cwd();
            var directory = input.directory, buildDirectory = input.buildDirectory, rest = __rest(input, ["directory", "buildDirectory"]);
            var norm = function (p) {
                return path_1.default.relative(projectRoot, path_1.default.resolve(cwd, p));
            };
            return __assign({ directory: norm(directory), buildDirectory: norm(buildDirectory) }, rest);
        },
        outputDirectory: function (input) {
            return input.directory;
        },
        methods: {
            test: (0, plugin_1.method)({
                body: function (_a) {
                    var resource = _a.resource, config = _a.config;
                    return {
                        effects: [
                            {
                                type: "function",
                                description: "validate Teams manifest with Teams Dev Portal",
                                body: function () {
                                    var _a, _b;
                                    return __awaiter(this, void 0, void 0, function () {
                                        var res, root, fileName, manifest, tokenProvider, token, result;
                                        return __generator(this, function (_c) {
                                            switch (_c.label) {
                                                case 0:
                                                    res = resource;
                                                    root = path_1.default.dirname(config.configFilePath);
                                                    fileName = path_1.default.join(root, (_b = (_a = res.instance.inputs) === null || _a === void 0 ? void 0 : _a.create) === null || _b === void 0 ? void 0 : _b.directory, "manifest.json");
                                                    return [4 /*yield*/, fs_1.promises.readFile(fileName)];
                                                case 1:
                                                    manifest = (_c.sent()).toString();
                                                    tokenProvider = teams_dev_portal_1.AppStudioLogin.getInstance();
                                                    return [4 /*yield*/, tokenProvider.getAccessToken()];
                                                case 2:
                                                    token = _c.sent();
                                                    if (!token)
                                                        throw new Error("unable to get AppStudio token");
                                                    console.log("validating manifest");
                                                    return [4 /*yield*/, teams_dev_portal_1.AppStudioClient.validateManifest(manifest, token)];
                                                case 3:
                                                    result = _c.sent();
                                                    console.log((result === null || result === void 0 ? void 0 : result.length)
                                                        ? "errors:\n" + JSON.stringify(result, null, 2)
                                                        : "manifest ok");
                                                    return [2 /*return*/, { errors: result }];
                                            }
                                        });
                                    });
                                },
                            },
                        ],
                    };
                },
            }),
            dev: (0, plugin_1.method)({
                body: function (_a) {
                    var resource = _a.resource, config = _a.config;
                    return {
                        effects: [
                            {
                                type: "function",
                                description: "send Teams app to Teams Dev Portal",
                                body: function () {
                                    var _a, _b, _c, _d;
                                    return __awaiter(this, void 0, void 0, function () {
                                        var res, root, fileName, zip, rawmanifest, manifest, tokenProvider, token, existing, result;
                                        return __generator(this, function (_e) {
                                            switch (_e.label) {
                                                case 0:
                                                    res = resource;
                                                    root = path_1.default.dirname(config.configFilePath);
                                                    fileName = path_1.default.join(root, (_b = (_a = res.instance.inputs) === null || _a === void 0 ? void 0 : _a.create) === null || _b === void 0 ? void 0 : _b.buildDirectory, "teams-app.zip");
                                                    return [4 /*yield*/, fs_1.promises.readFile(fileName)];
                                                case 1:
                                                    zip = _e.sent();
                                                    return [4 /*yield*/, fs_1.promises.readFile(path_1.default.join(root, (_d = (_c = res.instance.inputs) === null || _c === void 0 ? void 0 : _c.create) === null || _d === void 0 ? void 0 : _d.directory, "manifest.json"))];
                                                case 2:
                                                    rawmanifest = _e.sent();
                                                    manifest = JSON.parse(rawmanifest.toString());
                                                    tokenProvider = teams_dev_portal_1.AppStudioLogin.getInstance();
                                                    return [4 /*yield*/, tokenProvider.getAccessToken()];
                                                case 3:
                                                    token = _e.sent();
                                                    if (!token)
                                                        throw new Error("unable to get AppStudio token");
                                                    console.log("ensuring app");
                                                    return [4 /*yield*/, teams_dev_portal_1.AppStudioClient.getApp(manifest === null || manifest === void 0 ? void 0 : manifest.id, token)];
                                                case 4:
                                                    existing = _e.sent();
                                                    if (!!existing) return [3 /*break*/, 6];
                                                    return [4 /*yield*/, teams_dev_portal_1.AppStudioClient.createApp(zip, token)];
                                                case 5:
                                                    result = _e.sent();
                                                    console.log("created app:", result);
                                                    return [2 /*return*/, { app: result }];
                                                case 6: return [2 /*return*/, { app: existing }];
                                            }
                                        });
                                    });
                                },
                            },
                            {
                                type: "function",
                                description: "open a browser window to your app",
                                body: function () {
                                    var _a, _b;
                                    return __awaiter(this, void 0, void 0, function () {
                                        var res, output, launchUrl;
                                        return __generator(this, function (_c) {
                                            switch (_c.label) {
                                                case 0:
                                                    res = resource;
                                                    output = (_b = (_a = res.instance.outputs) === null || _a === void 0 ? void 0 : _a.dev) === null || _b === void 0 ? void 0 : _b.find(function (o) { return !!o.app; });
                                                    if (!output)
                                                        throw new Error("cannot find app registration");
                                                    launchUrl = (0, teams_dev_portal_1.teamsAppLaunchUrl)(output.app);
                                                    console.log("open:", (0, chalk_1.cyan)(launchUrl));
                                                    return [4 /*yield*/, (0, open_1.default)(launchUrl, {
                                                            app: {
                                                                name: open_1.default.apps.chrome,
                                                            },
                                                        })];
                                                case 1:
                                                    _c.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    });
                                },
                            },
                        ],
                    };
                },
            }),
            build: (0, plugin_1.method)({
                body: function (_a) {
                    var resource = _a.resource, config = _a.config;
                    var res = resource;
                    return {
                        effects: [
                            {
                                type: "function",
                                description: "zip manifest bundle",
                                body: function () {
                                    var _a;
                                    return __awaiter(this, void 0, void 0, function () {
                                        var _b, directory, buildDirectory, root, abs, zip, manifest, color, outline, resources, outFile;
                                        var _this = this;
                                        return __generator(this, function (_c) {
                                            switch (_c.label) {
                                                case 0:
                                                    _b = __assign({}, (_a = res.instance.inputs) === null || _a === void 0 ? void 0 : _a.create), directory = _b.directory, buildDirectory = _b.buildDirectory;
                                                    root = path_1.default.dirname(config.configFilePath);
                                                    abs = function (v) { return path_1.default.resolve(root, v); };
                                                    zip = new jszip_1.default();
                                                    return [4 /*yield*/, fs_1.promises.readFile(path_1.default.join(abs(directory), "manifest.json"))];
                                                case 1:
                                                    manifest = _c.sent();
                                                    return [4 /*yield*/, fs_1.promises.readFile(path_1.default.join(abs(directory), "resources/color.png"))];
                                                case 2:
                                                    color = _c.sent();
                                                    return [4 /*yield*/, fs_1.promises.readFile(path_1.default.join(abs(directory), "resources/outline.png"))];
                                                case 3:
                                                    outline = _c.sent();
                                                    zip.file("manifest.json", manifest);
                                                    resources = zip.folder("resources");
                                                    resources === null || resources === void 0 ? void 0 : resources.file("outline.png", outline);
                                                    resources === null || resources === void 0 ? void 0 : resources.file("color.png", color);
                                                    outFile = path_1.default.join(abs(buildDirectory), "teams-app.zip");
                                                    return [4 /*yield*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                                                            var outStream;
                                                            return __generator(this, function (_a) {
                                                                switch (_a.label) {
                                                                    case 0: return [4 /*yield*/, (0, mkdirp_1.default)(abs(buildDirectory))];
                                                                    case 1:
                                                                        _a.sent();
                                                                        outStream = fs_2.default.createWriteStream(outFile);
                                                                        zip
                                                                            .generateNodeStream({
                                                                            type: "nodebuffer",
                                                                            streamFiles: true,
                                                                        })
                                                                            .pipe(outStream)
                                                                            .on("error", function (err) { return reject(err); })
                                                                            .on("finish", function () { return resolve(void 0); });
                                                                        return [2 /*return*/];
                                                                }
                                                            });
                                                        }); })];
                                                case 4:
                                                    _c.sent();
                                                    return [2 /*return*/, { outFile: outFile }];
                                            }
                                        });
                                    });
                                },
                            },
                        ],
                    };
                },
            }),
        },
    });
}
exports.manifest = manifest;
//# sourceMappingURL=manifest.js.map