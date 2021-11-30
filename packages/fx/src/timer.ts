import { performance } from "perf_hooks";
export function timer() {
  const start = performance.now();
  return function() {
    return `${(performance.now() - start).toFixed(2)}ms`;
  };
}
