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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigLoader = void 0;
// import { findAncestorPath } from "./util/findAncestorPath";
var path_1 = __importDefault(require("path"));
var cosmiconfig_1 = require("cosmiconfig");
var cosmiconfig_typescript_loader_1 = __importDefault(require("@endemolshinegroup/cosmiconfig-typescript-loader"));
var _1 = require(".");
var ConfigLoader = /** @class */ (function () {
    function ConfigLoader() {
        this.cosmiconfig = (0, cosmiconfig_1.cosmiconfig)("fx", {
            searchPlaces: [
                ".#.json",
                ".#.yaml",
                ".#.yml",
                ".#.ts",
                ".#.js",
                ".#rc",
                ".#rc.json",
                ".#rc.yaml",
                ".#rc.yml",
                ".#rc.ts",
                ".#rc.js",
                "#.config.ts",
                "#.config.js",
                "package.json",
            ].map(function (s) { return s.replace("#", "fx"); }),
            loaders: {
                ".ts": cosmiconfig_typescript_loader_1.default,
            },
        });
    }
    ConfigLoader.prototype.load = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, cwd, configFile, file, _b, plugins, allResources_1, resourcesByPlugin, resourcesByType_1, _i, _c, plugin, resources, _d, resources_1, resource, projectFile, err_1, loaded;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _a = __assign({ cwd: process.cwd(), configFile: null }, options), cwd = _a.cwd, configFile = _a.configFile;
                        if (!(configFile || cwd)) return [3 /*break*/, 15];
                        if (!configFile) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.cosmiconfig.load(configFile)];
                    case 1:
                        _b = _e.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.cosmiconfig.search(cwd)];
                    case 3:
                        _b = _e.sent();
                        _e.label = 4;
                    case 4:
                        file = _b;
                        if (!file) return [3 /*break*/, 13];
                        plugins = file.config.plugins;
                        allResources_1 = [];
                        resourcesByPlugin = new Map();
                        resourcesByType_1 = new Map();
                        _i = 0, _c = plugins !== null && plugins !== void 0 ? plugins : [];
                        _e.label = 5;
                    case 5:
                        if (!(_i < _c.length)) return [3 /*break*/, 8];
                        plugin = _c[_i];
                        return [4 /*yield*/, plugin.resources()];
                    case 6:
                        resources = _e.sent();
                        resourcesByPlugin.set(plugin, resources);
                        for (_d = 0, resources_1 = resources; _d < resources_1.length; _d++) {
                            resource = resources_1[_d];
                            resourcesByType_1.set(resource.type, { resource: resource, plugin: plugin });
                            allResources_1.push(resource);
                        }
                        _e.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8:
                        projectFile = new _1.ProjectFile({
                            projectFolder: path_1.default.dirname(file.filepath),
                        });
                        _e.label = 9;
                    case 9:
                        _e.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, projectFile.load()];
                    case 10:
                        _e.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        err_1 = _e.sent();
                        return [3 /*break*/, 12];
                    case 12:
                        loaded = __assign(__assign({ configFilePath: file.filepath, project: projectFile.parsed, projectFile: projectFile }, file.config), { getResourceDefinitionByType: function (type) {
                                var _a, _b;
                                return (_b = (_a = resourcesByType_1.get(type)) === null || _a === void 0 ? void 0 : _a.resource) !== null && _b !== void 0 ? _b : null;
                            }, getAllResourceDefinitions: function () {
                                return __spreadArray([], allResources_1, true);
                            } });
                        return [2 /*return*/, loaded];
                    case 13: throw new Error("fx project configuration file not found");
                    case 14: return [3 /*break*/, 16];
                    case 15: throw new Error("either cwd or configFile must be specifed");
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    return ConfigLoader;
}());
exports.ConfigLoader = ConfigLoader;
//# sourceMappingURL=config.js.map