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
import * as path from "path";
import { File } from "./File.js";
export const TEMPLATE_REGEX = /(.*)\.t\.ts$/;
export function isTemplate(file) {
  return TEMPLATE_REGEX.test(file);
}
export function getOutputNameFromTemplateName(s) {
  const e = TEMPLATE_REGEX.exec(s);
  const out = e == null ? void 0 : e[1];
  return out ?? s;
}
export class Template {
  constructor(options) {
    this.options = __spreadValues({}, options);
  }
  async generate(context) {
    const { path: templatePath, rootPath } = this.options;
    const { outputPath } = context;
    const templateFullPath = path.resolve(rootPath, templatePath);
    console.log("loading template", templateFullPath);
    const template = await import(templateFullPath);
    const templateFunction = (template == null ? void 0 : template["default"]) ?? template;
    const result = await templateFunction(context);
    return typeof result == "string" ? [new File({
      content: result,
      path: path.resolve(outputPath, getOutputNameFromTemplateName(templatePath))
    })] : result;
  }
}
