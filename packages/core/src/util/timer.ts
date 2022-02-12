import { performance } from "perf_hooks";

export function timer() {
  const start = performance.now();
  return function() {
    const d = performance.now() - start;
    const t = []
    if (d > 1000) {
      t.push(`${(Math.round(d / 1000).toFixed(1))}s`);
    } else {
      t.push(`${d.toFixed(0)}ms`);
    }
    return t.join(' ');
  };
}

export async function timed(fn: () => Promise<any>): Promise<any> {
  const t = timer();
  const r = await fn?.();
  console.info(`done ${t()}\n`);
  return r;
}