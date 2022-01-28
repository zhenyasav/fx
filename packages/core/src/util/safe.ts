export async function safe(fn: () => Promise<any>): Promise<any> {
    try {
      const r = await fn?.();
      return r;
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }