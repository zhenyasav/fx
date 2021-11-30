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
import _ from "lodash";
import { File } from "./File.js";
import { Template, isTemplate } from "./Template.js";
import readDir from "recursive-readdir";
export class DirectoryTemplate extends Template {
  constructor(opts) {
    super(__spreadProps(__spreadValues({}, opts), { rootPath: opts.path }));
  }
  generate(context) {
    return __async(this, null, function* () {
      const { path: templatePath } = this.options;
      const { outputPath } = context;
      const allFiles = yield readDir(templatePath);
      const templateFiles = allFiles.filter(isTemplate);
      const regularFiles = allFiles.filter((file) => !isTemplate(file));
      const templateOutputs = yield Promise.all(templateFiles == null ? void 0 : templateFiles.map((t) => new Template({
        path: t,
        rootPath: templatePath
      }).generate(context)));
      return [
        ...regularFiles == null ? void 0 : regularFiles.map((r) => new File({
          path: path.join(outputPath, r.slice(templatePath.length)),
          sourcePath: r
        })),
        ..._.flatten(templateOutputs)
      ];
    });
  }
}
