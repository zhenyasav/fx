"use strict";
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
exports.printEffects = exports.applyEffects = exports.getEffector = void 0;
var child_process_1 = require("child_process");
var ellipsis_1 = require("./util/ellipsis");
var files_1 = require("./util/files");
var WriteFile = {
    describe: function (e) {
        var file = e.file;
        return file.isCopy()
            ? "copy file: ".concat((0, ellipsis_1.ellipsis)((0, files_1.relative)(e.file.sourcePath)), " to ").concat((0, ellipsis_1.ellipsis)((0, files_1.relative)(e.file.path)))
            : "create file: ".concat(e.file.shortDescription());
    },
    apply: function (e) {
        return __awaiter(this, void 0, void 0, function () {
            var file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        file = e.file;
                        return [4 /*yield*/, file.save()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    },
};
var Function = {
    describe: function (e) {
        var _a;
        return (_a = e.description) !== null && _a !== void 0 ? _a : "execute function";
    },
    apply: function (e) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, (_a = e.body) === null || _a === void 0 ? void 0 : _a.call(e)];
            });
        });
    },
};
var Shell = {
    describe: function (e) {
        return "invoke: '".concat(e.command, "'").concat(e.cwd ? " in directory ".concat((0, ellipsis_1.ellipsis)(e.cwd)) : "");
    },
    apply: function (e) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!(e === null || e === void 0 ? void 0 : e.command))
                    return [2 /*return*/];
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        (0, child_process_1.exec)(e.command, { cwd: (e === null || e === void 0 ? void 0 : e.cwd) ? e.cwd : process.cwd() }, function (err, stdout, stderr) {
                            if (err || stderr)
                                return reject({ error: err || stderr });
                            resolve(stdout);
                        });
                    })];
            });
        });
    },
};
var Effectors = {
    "write-file": WriteFile,
    function: Function,
    shell: Shell,
};
function getEffector(e) {
    return Effectors[e.type];
}
exports.getEffector = getEffector;
function applyEffects(effects, caption) {
    return __awaiter(this, void 0, void 0, function () {
        var tasks;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (caption)
                        console.info("plan: ".concat(caption));
                    if (!(effects === null || effects === void 0 ? void 0 : effects.length)) {
                        return [2 /*return*/, []];
                    }
                    console.info("cwd:", process.cwd());
                    console.info("\n".concat(effects.length, " actions:"));
                    tasks = Promise.all(effects === null || effects === void 0 ? void 0 : effects.map(function (effect) {
                        var effector = getEffector(effect);
                        console.log(effector.describe(effect));
                        return effector.apply(effect);
                    }));
                    console.log("\nexecuting ...");
                    return [4 /*yield*/, tasks];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.applyEffects = applyEffects;
function printEffects(effects, caption) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (caption)
                console.info("dry run: ".concat(caption));
            console.info("cwd:", process.cwd());
            console.info("\n".concat(effects.length, " actions:"));
            effects === null || effects === void 0 ? void 0 : effects.forEach(function (effect) {
                return console.log(getEffector(effect).describe(effect));
            });
            return [2 /*return*/];
        });
    });
}
exports.printEffects = printEffects;
//# sourceMappingURL=effectors.js.map