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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.File = void 0;
var fs_1 = require("fs");
var path = __importStar(require("path"));
var mkdirp_1 = __importDefault(require("mkdirp"));
var utils_1 = require("./utils");
var File = /** @class */ (function () {
    function File(options) {
        this.content = "";
        this.parsed = null;
        this.path = "";
        this.name = "";
        this.root = "";
        this.dir = "";
        this.base = "";
        this.ext = "";
        this.sourcePath = "";
        var _a = __assign({ overwrite: true }, options), p = _a.path, content = _a.content, parsed = _a.parsed, copyFrom = _a.copyFrom, overwrite = _a.overwrite;
        this.path = Array.isArray(p) ? path.join.apply(path, p) : p;
        if (!this.path)
            throw new Error("File must have an output path");
        if (copyFrom) {
            this.sourcePath = Array.isArray(copyFrom)
                ? path.join.apply(path, copyFrom) : copyFrom !== null && copyFrom !== void 0 ? copyFrom : "";
        }
        if (content)
            this.content = content;
        if (parsed)
            this.parsed = parsed;
        var _b = path.parse(this.path), root = _b.root, base = _b.base, dir = _b.dir, ext = _b.ext, name = _b.name;
        Object.assign(this, { root: root, base: base, dir: dir, ext: ext, name: name });
        this.overwrite = overwrite;
    }
    File.prototype.isLoaded = function () {
        return this.content != null;
    };
    File.prototype.isCopy = function () {
        return !!this.sourcePath && !this.content && !this.parsed;
    };
    File.prototype.save = function () {
        return __awaiter(this, void 0, void 0, function () {
            var text, _a, parsedPath, exists, handle;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.isCopy()) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, mkdirp_1.default)(path.dirname(this.path))];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, fs_1.promises.copyFile(this.sourcePath, this.path)];
                    case 2:
                        _b.sent();
                        console.info("copied ".concat((0, utils_1.ellipsis)((0, utils_1.relative)(this.path))));
                        return [3 /*break*/, 14];
                    case 3:
                        if (!(this.parsed !== null)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.serialize()];
                    case 4:
                        _a = _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        _a = this.content;
                        _b.label = 6;
                    case 6:
                        text = _a;
                        this.content = text;
                        if (!this.content) return [3 /*break*/, 14];
                        parsedPath = path.parse(this.path);
                        return [4 /*yield*/, (0, utils_1.fileExists)(this.path)];
                    case 7:
                        exists = _b.sent();
                        if (exists && !this.overwrite)
                            throw new Error("file save failed, file exists: " + this.path);
                        if (!!exists) return [3 /*break*/, 9];
                        return [4 /*yield*/, (0, mkdirp_1.default)(parsedPath.dir)];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9:
                        handle = void 0;
                        _b.label = 10;
                    case 10:
                        _b.trys.push([10, , 13, 14]);
                        return [4 /*yield*/, fs_1.promises.open(this.path, "w")];
                    case 11:
                        handle = _b.sent();
                        return [4 /*yield*/, handle.writeFile(text, "utf-8")];
                    case 12:
                        _b.sent();
                        console.info("wrote", this.shortDescription());
                        return [3 /*break*/, 14];
                    case 13:
                        handle === null || handle === void 0 ? void 0 : handle.close();
                        return [7 /*endfinally*/];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    File.prototype.load = function (loadOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var handle, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, fs_1.promises.open(this.path, "r")];
                    case 1:
                        handle = _c.sent();
                        _a = this;
                        return [4 /*yield*/, handle.readFile("utf-8")];
                    case 2:
                        _a.content = _c.sent();
                        handle.close();
                        _b = this;
                        return [4 /*yield*/, this.parse(this.content, loadOptions)];
                    case 3:
                        _b.parsed = _c.sent();
                        console.info("loaded", this.shortDescription());
                        return [2 /*return*/, this];
                }
            });
        });
    };
    File.prototype.parse = function (content, loadOptions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, content];
            });
        });
    };
    File.prototype.serialize = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, (_a = Object.toString.call(this.parsed)) !== null && _a !== void 0 ? _a : this.content];
            });
        });
    };
    File.prototype.shortDescription = function () {
        var _a, _b;
        return "".concat((0, utils_1.ellipsis)((0, utils_1.relative)(this.dir)), "/").concat(this.name).concat(this.ext, ": ").concat((0, utils_1.kib)((_b = (_a = this.content) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0));
    };
    return File;
}());
exports.File = File;
//# sourceMappingURL=File.js.map