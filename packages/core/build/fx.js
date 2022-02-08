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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fx = void 0;
var plugin_1 = require("@fx/plugin");
var random_1 = require("./util/random");
var collections_1 = require("./util/collections");
var effectors_1 = require("./effectors");
var config_1 = require("./config");
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
    Fx.prototype.getResourcesWithMethod = function (methodName) {
        return __awaiter(this, void 0, void 0, function () {
            var config, resources;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.config()];
                    case 1:
                        config = _a.sent();
                        resources = config === null || config === void 0 ? void 0 : config.getResources();
                        return [2 /*return*/, resources === null || resources === void 0 ? void 0 : resources.filter(function (r) { var _a; return r.definition && methodName in ((_a = r.definition) === null || _a === void 0 ? void 0 : _a.methods); })];
                }
            });
        });
    };
    Fx.prototype.invokeMethodOnAllResources = function (methodName) {
        return __awaiter(this, void 0, void 0, function () {
            var resources;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getResourcesWithMethod(methodName)];
                    case 1:
                        resources = _a.sent();
                        if (!resources)
                            return [2 /*return*/];
                        resources.forEach(function (res) {
                            console.log("invoking ".concat(res.instance.type, ".").concat(methodName));
                            _this.invokeResourceMethod(res, methodName);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    Fx.prototype.invokeResourceMethod = function (resource, methodName, options) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var _c, dryRun, defaultArgs, definition, instance, method, input, methodResult, _d, effects, value, description, rest, effectResults, _e, config;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _c = __assign({ dryRun: false }, options), dryRun = _c.dryRun, defaultArgs = _c.defaultArgs;
                        definition = resource.definition, instance = resource.instance;
                        if (!definition)
                            throw new Error("resoure definition not found for ".concat(instance === null || instance === void 0 ? void 0 : instance.type));
                        method = definition.methods[methodName];
                        if (!method)
                            throw new Error("the resource ".concat(instance === null || instance === void 0 ? void 0 : instance.type, "(").concat(instance === null || instance === void 0 ? void 0 : instance.id, ") has no method ").concat(method));
                        return [4 /*yield*/, (0, plugin_1.promise)((_a = method.inputs) === null || _a === void 0 ? void 0 : _a.call(method, defaultArgs))];
                    case 1:
                        input = _f.sent();
                        return [4 /*yield*/, (0, plugin_1.promise)((_b = method.body) === null || _b === void 0 ? void 0 : _b.call(method, {
                                input: input,
                            }))];
                    case 2:
                        methodResult = _f.sent();
                        _d = __assign({ effects: [], value: null, description: "".concat(methodName, " ").concat(definition.type).concat(!!(input === null || input === void 0 ? void 0 : input.name) ? " named '".concat(input.name, "'") : "") }, methodResult), effects = _d.effects, value = _d.value, description = _d.description, rest = __rest(_d, ["effects", "value", "description"]);
                        if (!(effects === null || effects === void 0 ? void 0 : effects.length)) return [3 /*break*/, 7];
                        if (!dryRun) return [3 /*break*/, 3];
                        (0, effectors_1.printEffects)(effects, description);
                        return [3 /*break*/, 7];
                    case 3:
                        _e = collections_1.compact;
                        return [4 /*yield*/, (0, effectors_1.applyEffects)(effects, description)];
                    case 4:
                        effectResults = _e.apply(void 0, [_f.sent()]);
                        if (input) {
                            instance.inputs = instance.inputs || {};
                            instance.inputs[methodName] = input;
                        }
                        if (effectResults === null || effectResults === void 0 ? void 0 : effectResults.length) {
                            instance.outputs = instance.outputs || {};
                            instance.outputs[methodName] = effectResults;
                        }
                        return [4 /*yield*/, this.config()];
                    case 5:
                        config = _f.sent();
                        return [4 /*yield*/, config.projectFile.save()];
                    case 6:
                        _f.sent();
                        _f.label = 7;
                    case 7: return [2 /*return*/, __assign({ effects: effects, value: value, description: description }, rest)];
                }
            });
        });
    };
    Fx.prototype.createResource = function (type, inputs, dryRun) {
        if (dryRun === void 0) { dryRun = true; }
        return __awaiter(this, void 0, void 0, function () {
            var config, definition, instance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.config()];
                    case 1:
                        config = _a.sent();
                        definition = config.getResourceDefinition(type);
                        if (!definition)
                            throw new Error("resource type not found");
                        instance = {
                            id: (0, random_1.randomString)(),
                            type: type,
                            inputs: inputs,
                            outputs: {},
                        };
                        return [4 /*yield*/, this.invokeResourceMethod({
                                instance: instance,
                                definition: definition,
                            }, "create", {
                                dryRun: dryRun,
                                defaultArgs: inputs,
                            })];
                    case 2:
                        _a.sent();
                        if (!!dryRun) return [3 /*break*/, 4];
                        config.project.resources.push(instance);
                        return [4 /*yield*/, config.projectFile.save()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, instance];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Fx.prototype.generateResourceChoiceQuestion = function (shape, key) {
        return __awaiter(this, void 0, void 0, function () {
            function extract(shape, memo) {
                var _a;
                if (!shape)
                    return __assign(__assign({}, memo), { name: key.toString() });
                var innerShape = (_a = shape._def) === null || _a === void 0 ? void 0 : _a.innerType;
                var _b = shape._def, dv = _b.defaultValue, description = _b.description, typeName = _b.typeName;
                if (dv) {
                    return extract(innerShape, __assign(__assign({}, memo), { default: dv === null || dv === void 0 ? void 0 : dv() }));
                }
                if (description) {
                    return extract(innerShape, __assign(__assign({}, memo), { message: description }));
                }
                if (typeName) {
                    if (typeName == "ZodLiteral") {
                        var resourceType_1 = shape._def.value;
                        var resources = config.getResources();
                        var applicableDefinitions = config
                            .getResourceDefinitions()
                            .filter(function (def) { return def.type == resourceType_1; });
                        if (!applicableDefinitions.length)
                            throw new Error("unknown resource type ".concat(resourceType_1));
                        var applicableResources = resources.filter(function (res) { return res.instance.type == resourceType_1; });
                        var resourceChoices = applicableResources.map(function (res) {
                            return (0, plugin_1.printResourceId)(res.instance);
                        });
                        return extract(innerShape, __assign(__assign({}, memo), { type: "list", choices: __spreadArray(["Create a new '".concat(resourceType_1, "'")], resourceChoices, true), default: 0 }));
                    }
                    else if (typeName == "ZodUnion") {
                        return memo;
                    }
                }
            }
            var config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.config()];
                    case 1:
                        config = _a.sent();
                        return [2 /*return*/, extract(shape)];
                }
            });
        });
    };
    return Fx;
}());
exports.Fx = Fx;
//# sourceMappingURL=fx.js.map