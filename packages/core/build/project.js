"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectFile = exports.PROJECT_FILE_NAME = exports.FRAMEWORK_FOLDER = void 0;
var path_1 = __importDefault(require("path"));
var ts_template_1 = require("@nice/ts-template");
exports.FRAMEWORK_FOLDER = ".fx";
exports.PROJECT_FILE_NAME = "project.json";
var ProjectFile = /** @class */ (function (_super) {
    __extends(ProjectFile, _super);
    function ProjectFile(options) {
        var _this = this;
        var _a = __assign({ projectFolder: process.cwd(), projectFile: null }, options), projectFile = _a.projectFile, projectFolder = _a.projectFolder;
        var resolvedProjectFileName = projectFile !== null && projectFile !== void 0 ? projectFile : path_1.default.resolve(projectFolder, exports.FRAMEWORK_FOLDER, exports.PROJECT_FILE_NAME);
        _this = _super.call(this, { path: resolvedProjectFileName }) || this;
        return _this;
    }
    return ProjectFile;
}(ts_template_1.JSONFile));
exports.ProjectFile = ProjectFile;
//# sourceMappingURL=project.js.map