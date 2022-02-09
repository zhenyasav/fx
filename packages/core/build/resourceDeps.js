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
exports.generateResourceChoiceQuestions = exports.getResourceQuestionGenerator = void 0;
var plugin_1 = require("@fx/plugin");
function getResourceQuestionGenerator(config) {
    return function (shape, key) {
        return generateResourceChoiceQuestions(config, shape, key.toString());
    };
}
exports.getResourceQuestionGenerator = getResourceQuestionGenerator;
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
        if (typeName == "ZodNumber") {
            var q = question;
            q.type = "number";
            q.name = key.toString();
        }
        else if (typeName == "ZodString") {
            var q = question;
            q.type = "input";
            q.name = key.toString();
        }
        else if (typeName == "ZodLiteral") {
            var q = question;
            var resourceType_1 = shape._def.value;
            var resources = config.getResources();
            var applicableResources = resources.filter(function (res) { return res.instance.type == resourceType_1; });
            var applicableDefinitions = config
                .getResourceDefinitions()
                .filter(function (def) { return def.type == resourceType_1; });
            var resourceChoices = applicableResources.map(function (res) { return ({
                type: "choice",
                name: (0, plugin_1.resourceId)(res.instance),
                value: { $resource: (0, plugin_1.resourceId)(res.instance) },
            }); });
            q.type = "list";
            q.name = key.toString();
            var choices = __spreadArray(__spreadArray([], resourceChoices, true), ((applicableDefinitions === null || applicableDefinitions === void 0 ? void 0 : applicableDefinitions.length)
                ? [
                    {
                        type: "choice",
                        name: "Create a new '".concat(resourceType_1, "'"),
                        value: { $resource: resourceType_1 },
                    },
                ]
                : []), true);
            q.choices = choices;
            q.default = 0;
        }
        else if (typeName == "ZodUnion") {
            var _b = shape._def, options = _b.options, description_1 = _b.description;
            var q = question;
            q.type = "list";
            q.name = "".concat(key.toString(), "-type");
            q.message = description_1;
            var choices_1 = options === null || options === void 0 ? void 0 : options.map(function (opt) {
                var _a = opt._def, description = _a.description, typeName = _a.typeName;
                var choice = {
                    type: "choice",
                    name: description,
                    value: typeName == "ZodString"
                        ? "string"
                        : typeName == "ZodNumber"
                            ? "number"
                            : typeName == "ZodLiteral"
                                ? opt._def.value
                                : description,
                };
                return choice;
            });
            q.choices = choices_1;
            q.default = 0;
            options === null || options === void 0 ? void 0 : options.map(function (opt, i) {
                var followupQuestions = generateResourceChoiceQuestions(config, opt, key);
                followupQuestions === null || followupQuestions === void 0 ? void 0 : followupQuestions.forEach(function (fq) {
                    return (fq.when = function (hash) {
                        return hash["".concat(key, "-type")] == choices_1[i].value;
                    });
                });
                result.push.apply(result, followupQuestions);
            });
        }
    }
    return result;
}
exports.generateResourceChoiceQuestions = generateResourceChoiceQuestions;
//# sourceMappingURL=resourceDeps.js.map