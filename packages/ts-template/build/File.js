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
import { promises as fs } from "fs";
import * as path from "path";
import mkdirp from "mkdirp";
const SHORT_PATH_MAX_LENGTH = 100;
const fileExists = (path2) => __async(this, null, function* () {
  try {
    yield fs.stat(path2);
  } catch (err) {
    return false;
  }
  return true;
});
const ellipsis = (s, n = SHORT_PATH_MAX_LENGTH) => s.length > n ? s.slice(0, n / 2 - 3) + "..." + s.slice(s.length - n / 2 - 3) : s;
const kib = (bytes) => bytes < 1024 ? `${bytes} B` : `${Math.round(bytes / 1024)} KiB`;
export class File {
  constructor(options) {
    this.content = "";
    this.parsed = null;
    this.path = "";
    this.name = "";
    this.root = "";
    this.dir = "";
    this.base = "";
    this.ext = "";
    this.sourcePath = "";
    const {
      path: p,
      content,
      parsed,
      sourcePath,
      overwrite
    } = __spreadValues({ overwrite: true }, options);
    this.path = Array.isArray(p) ? path.join(...p) : p;
    if (!this.path)
      throw new Error("File must have an output path");
    if (sourcePath) {
      this.sourcePath = Array.isArray(sourcePath) ? path.join(...sourcePath) : sourcePath != null ? sourcePath : "";
    }
    if (content)
      this.content = content;
    if (parsed)
      this.parsed = parsed;
    const { root, base, dir, ext, name } = path.parse(this.path);
    Object.assign(this, { root, base, dir, ext, name });
    this.overwrite = overwrite;
  }
  isLoaded() {
    return this.content != null;
  }
  isCopy() {
    return !!this.sourcePath && !this.content && !this.parsed;
  }
  save() {
    return __async(this, null, function* () {
      const text = this.parsed !== null ? yield this.serialize() : this.content;
      this.content = text;
      const parsedPath = path.parse(this.path);
      const exists = yield fileExists(this.path);
      if (exists && !this.overwrite)
        throw new Error("file save failed, file exists: " + this.path);
      if (!exists)
        yield mkdirp(parsedPath.dir);
      if (this.content) {
        const handle = yield fs.open(this.path, "w");
        yield handle.writeFile(text, "utf-8");
        handle.close();
        console.info("wrote", this.shortDescription());
      } else if (this.sourcePath) {
        yield fs.copyFile(this.sourcePath, this.path);
      }
    });
  }
  load(loadOptions) {
    return __async(this, null, function* () {
      const handle = yield fs.open(this.path, "r");
      this.content = yield handle.readFile("utf-8");
      handle.close();
      this.parsed = yield this.parse(this.content, loadOptions);
      console.info("loaded", this.shortDescription());
      return this;
    });
  }
  parse(content, loadOptions) {
    return __async(this, null, function* () {
      return content;
    });
  }
  serialize() {
    return __async(this, null, function* () {
      return this.content;
    });
  }
  shortDescription() {
    var _a, _b;
    return `${ellipsis(path.relative(process.cwd(), this.dir))}/${this.name}${this.ext}: ${kib((_b = (_a = this.content) == null ? void 0 : _a.length) != null ? _b : 0)}`;
  }
}
