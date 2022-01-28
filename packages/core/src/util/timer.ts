import { performance } from "perf_hooks";

export function timer() {
  const start = performance.now();
  return function() {
    return `${(performance.now() - start).toFixed(2)}ms`;
  };
}

export async function timed(fn: () => Promise<any>): Promise<any> {
  const t = timer();
  const r = await fn?.();
  console.info(`done ${t()}\n`);
  return r;
}