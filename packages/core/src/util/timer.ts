import { performance } from "perf_hooks";

export function timer(): () => number {
  const start = performance.now();
  return function () {
    return performance.now() - start;
  };
}

export function duration(d: number) {
  const t = [];
  if (d > 1000) {
    t.push(`${Math.round(d / 1000).toFixed(1)}s`);
  } else {
    t.push(`${d.toFixed(0)}ms`);
  }
  return t.join(" ");
}

export async function timed(fn: () => Promise<any>): Promise<any> {
  const t = timer();
  const r = await fn?.();
  console.info(`done ${duration(t())}\n`);
  return r;
}

export async function time(fn: () => Promise<any>): Promise<number> {
  const t = timer();
  await fn?.();
  return t();
}
