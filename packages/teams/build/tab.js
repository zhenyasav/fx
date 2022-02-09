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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tab = exports.tabInput = void 0;
var path_1 = __importDefault(require("path"));
var zod_1 = require("zod");
var plugin_1 = require("@fx/plugin");
var templates_1 = require("@fx/templates");
exports.tabInput = zod_1.z.object({
    id: zod_1.z.string().describe("enter a new short machine identifier for the tab"),
    name: zod_1.z.string().describe("enter the friendly tab name"),
    manifest: zod_1.z.literal("teams-manifest").describe("specify teams manifest"),
    url: zod_1.z
        .union([
        zod_1.z
            .string()
            .describe("enter the https url of the tab")
            .default("https://localhost:3000"),
        zod_1.z.literal("tunnel").describe("use a tunnel resource"),
    ])
        .describe("identify the tab URL"),
});
function tab() {
    return {
        type: "teams-tab",
        description: "A Teams Tab",
        methods: {
            create: (0, plugin_1.method)({
                inputShape: exports.tabInput,
                body: function (_a) {
                    var _b, _c, _d;
                    var input = _a.input, config = _a.config;
                    return __awaiter(this, void 0, void 0, function () {
                        var manifestRef, manifestResource, file, tab, manifest;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    manifestRef = input.manifest;
                                    manifestResource = config.getResource(manifestRef);
                                    file = new templates_1.JSONFile({
                                        path: [
                                            path_1.default.dirname(config.configFilePath),
                                            (_c = (_b = manifestResource.instance.inputs) === null || _b === void 0 ? void 0 : _b.create) === null || _c === void 0 ? void 0 : _c.directory,
                                            "manifest.json",
                                        ],
                                    });
                                    return [4 /*yield*/, file.load()];
                                case 1:
                                    _e.sent();
                                    tab = {
                                        name: input.name,
                                        contentUrl: input.url,
                                        scopes: ["personal"],
                                        entityId: input.id
                                    };
                                    manifest = file.parsed;
                                    manifest.staticTabs = (_d = manifest === null || manifest === void 0 ? void 0 : manifest.staticTabs) !== null && _d !== void 0 ? _d : [];
                                    manifest.staticTabs.push(tab);
                                    return [2 /*return*/, {
                                            effects: [
                                                {
                                                    type: "write-file",
                                                    file: file,
                                                },
                                            ],
                                        }];
                            }
                        });
                    });
                },
            }),
        },
    };
}
exports.tab = tab;
//# sourceMappingURL=tab.js.map