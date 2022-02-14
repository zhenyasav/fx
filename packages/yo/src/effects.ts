import { Effector, EffectorSet } from "@fx/plugin";
import { exec, ExecOptions } from "child_process";

export type RunYo = {
  $effect: "yo";
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
    const {
      effect: { generator },
    } = y;
    return `run yo ${generator}`;
  },
  async apply(y) {
    const {
      effect: { generator },
    } = y;
    return promiseExec(`yo ${generator}`);
  },
};

export const Handlers: EffectorSet<RunYo> = {
  yo,
};
