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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fx = void 0;
var plugin_1 = require("@fx/plugin");
var random_1 = require("./util/random");
var util_1 = require("./util");
var config_1 = require("./config");
var effectors_1 = require("./effectors");
var Fx = /** @class */ (function () {
    function Fx(options) {
        this._config = null;
        this.options = __assign({ cwd: process.cwd() }, options);
        this.configLoader = new config_1.ConfigLoader();
    }
    Fx.prototype.config = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!((_a = this._config) !== null && _a !== void 0)) return [3 /*break*/, 1];
                        _b = _a;
                        return [3 /*break*/, 3];
                    case 1:
                        _c = this;
                        return [4 /*yield*/, this.configLoader.load(this.options)];
                    case 2:
                        _b = (_c._config = _d.sent());
                        _d.label = 3;
                    case 3: return [2 /*return*/, (_b)];
                }
            });
        });
    };
    Fx.prototype.createResource = function (type, inputs, dryRun) {
        if (dryRun === void 0) { dryRun = true; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                (0, util_1.safe)(function () { return __awaiter(_this, void 0, void 0, function () {
                    var config, resource, input;
                    var _this = this;
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, this.config()];
                            case 1:
                                config = _c.sent();
                                resource = config.getResourceDefinitionByType(type);
                                if (!resource)
                                    throw new Error("resource type not found");
                                return [4 /*yield*/, (0, plugin_1.promise)((_b = (_a = resource.methods.create).getInput) === null || _b === void 0 ? void 0 : _b.call(_a, inputs !== null && inputs !== void 0 ? inputs : {}))];
                            case 2:
                                input = _c.sent();
                                return [4 /*yield*/, (0, util_1.timed)(function () { return __awaiter(_this, void 0, void 0, function () {
                                        var createResult, _a, effects, value, description;
                                        var _b, _c;
                                        return __generator(this, function (_d) {
                                            switch (_d.label) {
                                                case 0: return [4 /*yield*/, (0, plugin_1.promise)((_c = (_b = resource.methods.create).execute) === null || _c === void 0 ? void 0 : _c.call(_b, {
                                                        input: input,
                                                    }))];
                                                case 1:
                                                    createResult = _d.sent();
                                                    _a = __assign({ effects: [], value: null, description: "create ".concat(type).concat(!!(inputs === null || inputs === void 0 ? void 0 : inputs.name) ? " named '".concat(inputs.name, "'") : "") }, createResult), effects = _a.effects, value = _a.value, description = _a.description;
                                                    if (!effects) return [3 /*break*/, 4];
                                                    if (!dryRun) return [3 /*break*/, 2];
                                                    (0, effectors_1.printEffects)(effects, description);
                                                    return [3 /*break*/, 4];
                                                case 2: return [4 /*yield*/, (0, effectors_1.applyEffects)(effects, description)];
                                                case 3:
                                                    _d.sent();
                                                    _d.label = 4;
                                                case 4:
                                                    if (!!dryRun) return [3 /*break*/, 6];
                                                    config.project.resources.push(__assign({ type: type, id: (0, random_1.randomString)(), input: input }, (value ? { output: value } : {})));
                                                    return [4 /*yield*/, config.projectFile.save()];
                                                case 5:
                                                    _d.sent();
                                                    _d.label = 6;
                                                case 6: return [2 /*return*/];
                                            }
                                        });
                                    }); })];
                            case 3:
                                _c.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    Fx.prototype.getResourceDefinitionsInProject = function (predicate) {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.config()];
                    case 1:
                        config = _a.sent();
                        return [2 /*return*/, config.project.resources.reduce(function (memo, instance) {
                                var res = config.getResourceDefinitionByType(instance.type);
                                if (res && (!predicate || (predicate === null || predicate === void 0 ? void 0 : predicate(res))))
                                    memo.push(res);
                                return memo;
                            }, [])];
                }
            });
        });
    };
    Fx.prototype.getResourcesInProjectWithMethod = function (methodName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getResourceDefinitionsInProject(function (resource) {
                        return methodName in resource.methods;
                    })];
            });
        });
    };
    Fx.prototype.invokeMethod = function (methodName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var resources;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getResourcesInProjectWithMethod(methodName)];
                    case 1:
                        resources = _a.sent();
                        if (!resources)
                            return [2 /*return*/];
                        resources.forEach(function (res) {
                            console.log('invoking', res.type, methodName);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    return Fx;
}());
exports.Fx = Fx;
//# sourceMappingURL=fx.js.map