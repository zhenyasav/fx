"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = exports.error = exports.warn = exports.printResourceInstance = exports.printResourceDefinition = exports.printLogo = exports.logo = void 0;
var chalk_1 = __importDefault(require("chalk"));
var cyan = chalk_1.default.cyan, gray = chalk_1.default.gray, white = chalk_1.default.white, yellow = chalk_1.default.yellow, red = chalk_1.default.red;
exports.logo = " _______  __\n|  ___\\ \\/ /\n| |_   \\  / \n|  _|  /  \\ \n|_|   /_/\\_\\\n";
function printLogo() {
    console.log(cyan(exports.logo));
}
exports.printLogo = printLogo;
function printResourceDefinition(resource) {
    console.log(cyan(resource.type) + " " + gray("-") + " " + resource.description);
}
exports.printResourceDefinition = printResourceDefinition;
function printResourceInstance(resource) {
    console.log(white(resource.type) + " " + gray(resource.id));
    console.log(gray(JSON.stringify(resource.input, null, 2)));
}
exports.printResourceInstance = printResourceInstance;
function warn() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    console.warn.apply(console, (args).map(function (c) { return yellow(c); }));
}
exports.warn = warn;
function error() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    console.error.apply(console, args.map(function (c) { return red(c); }));
}
exports.error = error;
function info() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    console.info.apply(console, args.map(function (c) { return gray(c); }));
}
exports.info = info;
//# sourceMappingURL=prettyPrint.js.map