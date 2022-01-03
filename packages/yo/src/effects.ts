import { Effector, EffectorSet } from "@fx/plugin";
import { exec, ExecOptions } from "child_process";

export type RunYo = {
  type: "yo";
  generator: string;
};

function promiseExec(cmd: string, options?: ExecOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { ...options }, (err, stdout, stderr) => {
      if (err) return reject(err);
      const serr = stderr.toString();
      if (serr) return reject(serr);
      resolve(stdout.toString());
    });
  });
}

export const yo: Effector<RunYo> = {
  describe(y) {
    return `run yo ${y.generator}`;
  },
  async apply(y) {
    return promiseExec(`yo ${y.generator}`);
  },
};

export const Handlers: EffectorSet<RunYo> = {
  yo,
};
