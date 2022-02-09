export function debug(...args: any[]) {
  if (/zod-inquirer/.test(process.env.DEBUG ?? "")) console.debug(...args);
}
