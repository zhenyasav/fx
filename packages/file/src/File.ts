import { promises as fs } from "fs";
import * as path from "path";
import mkdirp from "mkdirp";
import { relative, fileExists, ellipsis, kib } from "./utils";

export type Path = string | string[];

export type MaybePromise<T> = T | Promise<T>;

export function promise<T>(o: MaybePromise<T>): Promise<T> {
  return isPromise(o) ? o : Promise.resolve(o);
}

export function isPromise<T>(p: any): p is Promise<T> {
  return typeof p?.then == "function";
}

export type AsyncFunctor<T> = (o: T) => MaybePromise<T>;

export type FileOptions<D> = {
  path: Path;
  copyFrom?: Path;
  content?: D;
  transform?: AsyncFunctor<D | null>;
  overwrite?: boolean;
};

export class File<D = string> {
  public content: D | undefined;
  public transform: AsyncFunctor<D | null> | undefined;
  public path: string = "";
  public name: string = "";
  public root: string = "";
  public dir: string = "";
  public base: string = "";
  public ext: string = "";
  public allowOverwrite: boolean;
  public copyFrom: string | undefined;
  constructor(options: FileOptions<D>) {
    const {
      path: p,
      content,
      transform,
      copyFrom,
      overwrite,
    } = { overwrite: true, ...options };
    this.path = Array.isArray(p) ? path.join(...p) : p;
    if (!this.path) throw new Error("File must have an output path");
    if (copyFrom) {
      this.copyFrom = Array.isArray(copyFrom)
        ? path.join(...copyFrom)
        : copyFrom ?? "";
    }
    if (typeof content != "undefined") {
      this.content = content;
    }
    if (typeof transform == "function") {
      this.transform = transform;
    }
    const { root, base, dir, ext, name } = path.parse(this.path);
    Object.assign(this, { root, base, dir, ext, name });
    this.allowOverwrite = overwrite;
  }
  shortDescription() {
    return `${ellipsis(relative(this.dir))}/${this.name}${this.ext}${
      typeof this.content == "string"
        ? ": " + kib(this.content?.length ?? 0)
        : ""
    }`;
  }
  clone() {
    const { path, content, transform } = this;
    const ctor = this.constructor as typeof File;
    const clone = new ctor({
      path,
      transform,
      content: JSON.parse(JSON.stringify(content)), // TODO: ??
    });
    return clone;
  }
  isLoaded() {
    return this.content != null;
  }
  isCopy() {
    return !!this.copyFrom && !this.content;
  }
  async load(loadOptions?: any): Promise<File<D>> {
    let content: Buffer | undefined;
    try {
      content = await fs.readFile(this.copyFrom || this.path);
    } catch (err) {
      // faild to read / maybe no file at all
    }
    const parsed = !!content ? (await this.parse(content!, loadOptions)) : null;
    const transformed = this.transform
      ? await promise(this.transform(parsed))
      : parsed;
    this.content = transformed ?? void 0;
    return this;
  
  }
  async ensureLoaded() {
    if (!this.isLoaded()) await this.load();
  }
  protected async parse(content: Buffer, loadOptions?: any): Promise<D> {
    return content.toString("utf8") as any;
  }
  protected async serialize(): Promise<string> {
    return "" + this.content;
  }
  async save(): Promise<File<D> | undefined> {
    if (this.isCopy() && !this.transform) {
      await mkdirp(path.dirname(this.path));
      await fs.copyFile(this.copyFrom!, this.path);
    } else {
      await this.ensureLoaded();
      const serialized = await this.serialize();
      if (typeof serialized != "undefined") {
        if (!this.allowOverwrite) {
          const exists = await fileExists(this.path);
          if (exists)
            throw new Error("file save failed, file exists: " + this.path);
        }
        try {
          await mkdirp(path.dirname(this.path));
          await fs.writeFile(this.path, serialized);
          return this;
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
}
