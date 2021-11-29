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
import { DirectoryTemplate } from "@nice/ts-template";
import { Plugin } from "./plugin.js";
export function templateResource(options) {
  const { name, templatePath, description, outputPath } = __spreadValues({}, options);
  if (!name)
    throw new Error("a name for the resource is required");
  if (!templatePath)
    throw new Error("a template resource must have a path to the root folder of the template");
  return new class extends Plugin {
    resourceDefinitions() {
      return __async(this, null, function* () {
        return [
          {
            type: name,
            description,
            create(_0) {
              return __async(this, arguments, function* ({ inputs: { name: name2 } }) {
                const template = new DirectoryTemplate({
                  path: templatePath
                });
                const files = yield template.generate({
                  input: { name: name2 },
                  outputPath: path.resolve(outputPath, name2)
                });
                return files == null ? void 0 : files.map((file) => ({ type: "create-file", file }));
              });
            }
          }
        ];
      });
    }
  }();
}
