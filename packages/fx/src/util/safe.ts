import { timer } from "./timer.js";

export async function safe(fn: () => Promise<any>): Promise<any> {
    const t = timer();
    try {
      const r = await fn?.();
      console.info(`done ${t()}\n`);
      return r;
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }