#!/usr/bin/env node
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
var yargs_1 = __importDefault(require("yargs"));
var core_1 = require("@fx/core");
var prettyPrint_1 = require("./prettyPrint");
var config_1 = __importDefault(require("./config"));
var chalk_1 = require("chalk");
var fx = new core_1.Fx({
    aadAppId: config_1.default.teamsfxcliAadAppId,
});
var parser = (0, yargs_1.default)(process.argv.slice(2))
    .scriptName("fx")
    .usage("$0 [-d] <cmd> [args]")
    .option("dry", {
    alias: "d",
    type: "boolean",
    default: false,
    description: "do not touch anything, just show the plan",
})
    .option("verbose", {
    alias: "v",
    type: "boolean",
    default: false,
    description: "print more stuff",
})
    .demandCommand(1, "at least one command is required")
    .command("se", "search resources", function (yargs) { return yargs; }, function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var resources;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, fx.config()];
            case 1:
                resources = (_a = (_b.sent())) === null || _a === void 0 ? void 0 : _a.getResourceDefinitions();
                if (!resources.length) {
                    (0, prettyPrint_1.info)("there are no resource definitions installed in this project");
                }
                else {
                    console.log("".concat(resources.length, " resource types available:"));
                    resources.forEach(prettyPrint_1.printResourceDefinition);
                }
                console.log("");
                return [2 /*return*/];
        }
    });
}); })
    .command("add <type> [name]", "create a new resource", function (yargs) {
    return yargs
        .positional("type", {
        type: "string",
        describe: "the type of thing to create",
    })
        .positional("name", {
        type: "string",
        describe: "how to name the new thing",
    });
}, function (argv) { return __awaiter(void 0, void 0, void 0, function () {
    var type, name, dry, d, v, verbose, $0, _, rest, instance, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                type = argv.type, name = argv.name, dry = argv.dry, d = argv.d, v = argv.v, verbose = argv.verbose, $0 = argv.$0, _ = argv._, rest = __rest(argv, ["type", "name", "dry", "d", "v", "verbose", "$0", "_"]);
                if (!type)
                    throw new Error("type is required");
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                console.log((0, chalk_1.gray)("cwd: " + process.cwd()));
                return [4 /*yield*/, fx.createResource(type, __assign(__assign({}, rest), { name: name }), !!dry)];
            case 2:
                instance = _a.sent();
                console.log("added resource:", JSON.stringify(instance, null, 2));
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                console.error(err_1.message);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); })
    .command("ls [type]", "show resources configured in the current project", function (yargs) {
    return yargs.positional("type", {
        type: "string",
        describe: "the type of resource to filter by",
    });
}, function (argv) { return __awaiter(void 0, void 0, void 0, function () {
    var type, config, resources;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                type = argv.type;
                return [4 /*yield*/, fx.config()];
            case 1:
                config = _b.sent();
                if (!config.project) {
                    console.log("project is empty");
                    return [2 /*return*/];
                }
                resources = type
                    ? (_a = config.project.resources) === null || _a === void 0 ? void 0 : _a.filter(function (res) { return res.type == type; })
                    : config.project.resources;
                console.log("".concat(resources ? resources.length : 0, " resources in project:"));
                resources === null || resources === void 0 ? void 0 : resources.forEach(prettyPrint_1.printResourceInstance);
                return [2 /*return*/];
        }
    });
}); })
    .command("$0", false, function () { }, function (argv) { return __awaiter(void 0, void 0, void 0, function () {
    var arg, methodName, resources, config_2, defs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                arg = argv._[0];
                if (!arg) {
                    console.error("at least one command is required");
                    return [2 /*return*/];
                }
                methodName = arg.toString();
                return [4 /*yield*/, fx.getResourcesWithMethod(methodName)];
            case 1:
                resources = _a.sent();
                if (!!resources.length) return [3 /*break*/, 3];
                (0, prettyPrint_1.error)("there are no configured resources in the project supporting this method");
                return [4 /*yield*/, fx.config()];
            case 2:
                config_2 = _a.sent();
                defs = config_2.getResourceDefinitions().filter(function (res) {
                    return res.methods && methodName in res.methods;
                });
                if (defs === null || defs === void 0 ? void 0 : defs.length) {
                    (0, prettyPrint_1.info)("\nThese (".concat(defs.length, ") known resource types support '").concat(methodName, "' and can be created with 'fx add <resource-type>':"));
                    defs.forEach(prettyPrint_1.printResourceDefinition);
                }
                process.exit(1);
                _a.label = 3;
            case 3: return [4 /*yield*/, fx.invokeMethodOnAllResources(methodName)];
            case 4:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })
    .showHelpOnFail(false);
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var err_2, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 4]);
                    (0, prettyPrint_1.printLogo)();
                    return [4 /*yield*/, parser.parse()];
                case 1:
                    _c.sent();
                    return [3 /*break*/, 4];
                case 2:
                    err_2 = _c.sent();
                    (0, prettyPrint_1.error)("".concat(err_2 === null || err_2 === void 0 ? void 0 : err_2.message, "\n"));
                    _b = (_a = console).info;
                    return [4 /*yield*/, parser.getHelp()];
                case 3:
                    _b.apply(_a, [_c.sent()]);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
main();
//# sourceMappingURL=main.js.map