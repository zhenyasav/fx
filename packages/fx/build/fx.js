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
import path from "path";
import { promises as fs } from "fs";
import { handler } from "./effects.js";
const CONFIG_FILE_NAME = `.fx.js`;
export class Fx {
  constructor() {
    this.config = null;
    this.configPromise = null;
    this.resourcesByType = /* @__PURE__ */ new Map();
  }
  findConfigFile() {
    return __async(this, null, function* () {
      let cd = process.cwd();
      while (cd && cd.split("/").length) {
        try {
          const exists = yield fs.stat(path.resolve(cd, CONFIG_FILE_NAME));
          if (exists) {
            return path.resolve(cd, CONFIG_FILE_NAME);
          }
        } catch (err) {
        }
        cd = path.dirname(cd);
      }
      return null;
    });
  }
  loadConfig() {
    return __async(this, null, function* () {
      if (this.config)
        return this.config;
      if (this.configPromise)
        return yield this.configPromise;
      return yield this.configPromise = new Promise((resolve) => __async(this, null, function* () {
        var _a, _b;
        const file = yield this.findConfigFile();
        if (!file)
          return resolve({});
        const configmodule = yield import(file);
        const config = (_a = configmodule == null ? void 0 : configmodule["default"]) != null ? _a : configmodule;
        for (let p of (_b = config.plugins) != null ? _b : []) {
          const resources = yield p.resourceDefinitions();
          resources.forEach((resource) => {
            this.resourcesByType.set(resource.type, {
              plugin: p,
              resource
            });
          });
        }
        resolve(config);
      }));
    });
  }
  getResource(type) {
    return __async(this, null, function* () {
      var _a, _b;
      yield this.loadConfig();
      return (_b = (_a = this.resourcesByType.get(type)) == null ? void 0 : _a.resource) != null ? _b : null;
    });
  }
  getAllResources() {
    return __async(this, null, function* () {
      yield this.loadConfig();
      return this.resourcesByType;
    });
  }
  invokeEffects(effects, dryRun = true, caption) {
    return __async(this, null, function* () {
      if (caption)
        console.info(`${dryRun ? "dry run" : "executing"}: ${caption}`);
      if (effects) {
        console.info(`${effects.length} actions:`);
        if (dryRun) {
          effects == null ? void 0 : effects.forEach((effect) => console.log(handler(effect).describe(effect)));
        } else {
          yield Promise.all(effects == null ? void 0 : effects.map((effect) => {
            const h = handler(effect);
            console.log(h.describe(effect));
            return h.apply(effect);
          }));
        }
      } else {
        console.log("nothing to do");
      }
    });
  }
  createResource(type, name, dryRun = true) {
    return __async(this, null, function* () {
      yield this.loadConfig();
      const resource = yield this.getResource(type);
      const effects = yield resource == null ? void 0 : resource.create({
        inputs: {
          name
        }
      });
      yield this.invokeEffects(effects, dryRun, `create ${type} ${name}`);
    });
  }
}
