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
export const CreateFileHandler = {
  describe(e) {
    return `create file: ${e.file.shortDescription()}`;
  },
  apply(e) {
    return __async(this, null, function* () {
      throw new Error("not implemented");
    });
  }
};
export const CopyFileHandler = {
  describe(e) {
    return `copy file ${e.source} to ${e.dest}`;
  },
  apply(e) {
    return __async(this, null, function* () {
      throw new Error("not implemented");
    });
  }
};
export const PackageScriptHandler = {
  describe(e) {
    return `run package script ${e.name}`;
  },
  apply(e) {
    return __async(this, null, function* () {
      throw new Error("not implemented");
    });
  }
};
export const Effects = {
  "copy-file": CopyFileHandler,
  "create-file": CreateFileHandler,
  "package-script": PackageScriptHandler
};
export function handler(e) {
  return Effects[e.type];
}
