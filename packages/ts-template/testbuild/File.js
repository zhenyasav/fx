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
import { promises as fs } from "fs";
import * as path from "path";
import mkdirp from "mkdirp";
const fileExists = async (path2) => {
  try {
    await fs.stat(path2);
  } catch (err) {
    return false;
  }
  return true;
};
const ellipsis = (s, n = 30) => s.length > n ? s.slice(0, n / 2 - 3) + "..." + s.slice(s.length - n / 2 - 3) : s;
const kib = (bytes) => `${Math.round(bytes / 1024)} KiB`;
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
    const {
      path: p,
      content,
      parsed,
      overwrite
    } = __spreadValues({ overwrite: true }, options);
    this.path = Array.isArray(p) ? path.join(...p) : p;
    if (!this.path)
      throw new Error("File must have an output path");
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
  async save() {
    const parsedPath = path.parse(this.path);
    const exists = await fileExists(this.path);
    if (exists && !this.overwrite)
      throw new Error("file save failed, file exists: " + this.path);
    if (!exists)
      await mkdirp(parsedPath.dir);
    const handle = await fs.open(this.path, "w");
    const text = this.parsed !== null ? await this.serialize() : this.content;
    this.content = text;
    if (!this.content || !this.content.length) {
      console.warn("skipping writing file, contents empty: " + this.path);
      return;
    }
    await handle.writeFile(text, "utf-8");
    handle.close();
    console.info("wrote", this.shortDescription());
  }
  async load(loadOptions) {
    const handle = await fs.open(this.path, "r");
    this.content = await handle.readFile("utf-8");
    handle.close();
    this.parsed = await this.parse(this.content, loadOptions);
    console.info("loaded", this.shortDescription());
    return this;
  }
  async parse(content, loadOptions) {
    return content;
  }
  async serialize() {
    return this.content;
  }
  shortDescription() {
    var _a;
    return `${ellipsis(this.dir)}/${this.name}${this.ext}: ${kib(((_a = this.content) == null ? void 0 : _a.length) ?? 0)}`;
  }
}
