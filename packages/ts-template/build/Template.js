var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import * as path from "path";
import { File } from "./File.js";
export const TEMPLATE_REGEX = /(.*)\.t\.ts$/;
export function isTemplate(file) {
  return TEMPLATE_REGEX.test(file);
}
export function getOutputNameFromTemplateName(s) {
  const e = TEMPLATE_REGEX.exec(s);
  const out = e == null ? void 0 : e[1];
  return out != null ? out : s;
}
export class Template {
  constructor(options) {
    this.options = __spreadValues({}, options);
  }
  generate(context) {
    return __async(this, null, function* () {
      var _a;
      const { path: templatePath, rootPath } = this.options;
      const { outputPath } = context;
      const templateFullPath = path.resolve(rootPath, templatePath);
      console.log("loading template", templateFullPath);
      const template = yield import(templateFullPath);
      const templateFunction = (_a = template == null ? void 0 : template["default"]) != null ? _a : template;
      const result = yield templateFunction(context);
      return typeof result == "string" ? [new File({
        content: result,
        path: path.resolve(outputPath, getOutputNameFromTemplateName(templatePath))
      })] : result;
    });
  }
}
