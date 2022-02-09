"use strict";
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
exports.generateResourceChoiceQuestions = void 0;
var plugin_1 = require("@fx/plugin");
function generateResourceChoiceQuestions(config, shape, key, merge) {
    var _a = shape._def, dv = _a.defaultValue, description = _a.description, typeName = _a.typeName;
    var question = {};
    var result = [question];
    if (dv) {
        question.default = dv === null || dv === void 0 ? void 0 : dv();
    }
    if (description) {
        question.message = description;
    }
    if (typeName) {
        if (typeName == "ZodLiteral") {
            var q = question;
            var resourceType_1 = shape._def.value;
            var resources = config.getResources();
            var applicableResources = resources.filter(function (res) { return res.instance.type == resourceType_1; });
            var applicableDefinitions = config
                .getResourceDefinitions()
                .filter(function (def) { return def.type == resourceType_1; });
            var resourceChoices = applicableResources.map(function (res) {
                return (0, plugin_1.printResourceId)(res.instance);
            });
            q.type = "list";
            q.choices = __spreadArray(__spreadArray([], resourceChoices, true), ((applicableDefinitions === null || applicableDefinitions === void 0 ? void 0 : applicableDefinitions.length)
                ? ["Create a new '".concat(resourceType_1, "'")]
                : []), true);
            q.default = 0;
        }
        else if (typeName == "ZodUnion") {
            var options = shape._def.options;
            var q = question;
            q.type = "list";
            q.name = key.toString();
            q.choices = options === null || options === void 0 ? void 0 : options.map(function (opt) {
                var description = opt._def.description;
                return description;
            });
            q.default = 0;
            options === null || options === void 0 ? void 0 : options.map(function (opt, i) {
                var followupQuestions = generateResourceChoiceQuestions(config, opt, key);
                followupQuestions === null || followupQuestions === void 0 ? void 0 : followupQuestions.forEach(function (q) { return q.when = function (hash) { return hash[key] == i; }; });
                result.push.apply(result, followupQuestions);
            });
        }
    }
    return result;
}
exports.generateResourceChoiceQuestions = generateResourceChoiceQuestions;
//# sourceMappingURL=resourceDeps.js.map