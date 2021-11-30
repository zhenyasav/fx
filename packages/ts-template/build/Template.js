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
import * as esbuild from "esbuild";
import { promises as fs } from "fs";
export const TEMPLATE_REGEX = /(.*)\.t\.ts$/;
export function isTemplate(file) {
  return TEMPLATE_REGEX.test(file);
}
export function getOutputNameFromTemplateName(s) {
  const e = TEMPLATE_REGEX.exec(s);
  const out = e == null ? void 0 : e[1];
  return out != null ? out : s;
}
function importTemplate(p) {
  return __async(this, null, function* () {
    var _a;
    if (!isTemplate(p))
      throw new Error("only t.ts templates are supported");
    const outpath = p.replace(/\.t\.ts$/, ".t.js");
    yield esbuild.build({
      entryPoints: [p],
      outfile: outpath,
      target: "node16",
      platform: "node"
    });
    let mod;
    try {
      mod = yield import(outpath);
    } finally {
      yield fs.unlink(outpath);
    }
    const fn = (_a = mod == null ? void 0 : mod["default"]) != null ? _a : mod;
    return typeof fn == "function" ? fn : null;
  });
}
export class Template {
  constructor(options) {
    this.options = __spreadValues({}, options);
  }
  generate(context) {
    return __async(this, null, function* () {
      const { path: templatePath, rootPath } = this.options;
      const { outputPath } = context;
      const templateFullPath = path.resolve(rootPath, templatePath);
      const templateFunction = yield importTemplate(templateFullPath);
      if (!templateFunction)
        return [];
      try {
        const result = yield templateFunction(context);
        return typeof result == "string" ? [
          new File({
            content: result,
            path: path.resolve(outputPath, getOutputNameFromTemplateName(templatePath))
          })
        ] : result;
      } catch (err) {
        console.error(`problem in template ${templateFullPath}`);
        throw err;
      }
    });
  }
}
