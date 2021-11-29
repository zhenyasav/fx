var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
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
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
import * as path from "path";
import _ from "lodash";
import { File } from "./File.js";
import { Template, isTemplate } from "./Template.js";
import readDir from "recursive-readdir";
export class DirectoryTemplate extends Template {
  constructor(opts) {
    super(__spreadProps(__spreadValues({}, opts), { rootPath: opts.path }));
  }
  async generate(context) {
    const { path: templatePath } = this.options;
    const { outputPath } = context;
    const allFiles = await readDir(templatePath);
    const relativeFiles = allFiles == null ? void 0 : allFiles.map((file) => file.slice(templatePath.length));
    const templateFiles = relativeFiles.filter(isTemplate);
    const regularFiles = relativeFiles.filter((file) => !isTemplate(file));
    const templateOutputs = await Promise.all(templateFiles == null ? void 0 : templateFiles.map((t) => new Template({
      path: path.join(templatePath, t),
      rootPath: templatePath
    }).generate({ outputPath })));
    return [
      ...regularFiles == null ? void 0 : regularFiles.map((r) => new File({
        path: path.join(outputPath, r)
      })),
      ..._.flatten(templateOutputs)
    ];
  }
}
