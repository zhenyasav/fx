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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inquire = exports.getQuestions = exports.getQuestion = exports.fulfillMissingInputs = void 0;
var inquirer_1 = __importDefault(require("inquirer"));
function fulfillMissingInputs(spec) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, inquirer_1.default.prompt(spec.questions, spec.defaults)];
        });
    });
}
exports.fulfillMissingInputs = fulfillMissingInputs;
function getQuestion(shape) {
    var _a, _b;
    var defaultValue = void 0, message = "", type = "";
    var typesToQnType = {
        ZodString: "input",
        ZodNumber: "input",
        ZodBoolean: "confirm",
    };
    var next = shape;
    while (next && (next === null || next === void 0 ? void 0 : next._def)) {
        var _c = next._def, dv = _c.defaultValue, description = _c.description, typeName = _c.typeName;
        if (dv) {
            defaultValue = dv === null || dv === void 0 ? void 0 : dv();
        }
        if (description) {
            message =
                description[description.length - 1] == ":"
                    ? description
                    : description + ":";
        }
        if (typeName) {
            type = (_a = typesToQnType[typeName]) !== null && _a !== void 0 ? _a : typeName;
        }
        next = (_b = next._def) === null || _b === void 0 ? void 0 : _b.innerType;
    }
    function validate(data) {
        var _a;
        var parsed = shape.safeParse(data);
        if (parsed.success === true) {
            return true;
        }
        else {
            return (_a = parsed.error.format()._errors) === null || _a === void 0 ? void 0 : _a.join("\n");
        }
    }
    return { message: message, type: type, default: defaultValue, validate: validate };
}
exports.getQuestion = getQuestion;
function getQuestions(shape) {
    var q = [];
    for (var k in shape) {
        var v = shape[k];
        q.push(__assign(__assign({}, getQuestion(v)), { name: k }));
    }
    return q;
}
exports.getQuestions = getQuestions;
function noUndefined(o) {
    if (!o)
        return o;
    var r = {};
    for (var i in o) {
        if (typeof o[i] !== "undefined") {
            r[i] = o[i];
        }
    }
    return r;
}
// @ts-ignore
function inquire(shape, defaults) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var questions, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    questions = getQuestions(shape._def.shape());
                    _b = noUndefined;
                    return [4 /*yield*/, inquirer_1.default.prompt(questions, defaults)];
                case 1: return [2 /*return*/, _b.apply(void 0, [(_a = (_c.sent())) !== null && _a !== void 0 ? _a : {}])];
            }
        });
    });
}
exports.inquire = inquire;
//# sourceMappingURL=inputs.js.map