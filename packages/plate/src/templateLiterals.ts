import * as os from "os";
import flatten from "lodash.flatten";
import zip from "lodash.zip";
import prettier from "prettier";

const force = (a: Function | any) => (typeof a == "function" ? a() : a);
const join = (a: any[] | any) => (Array.isArray(a) ? a.join(os.EOL) : a);
const squelch = (a: any) => (!a ? "" : a);
const trim = (a: string) => a.trim();
const newline = (a: string) =>
  a[a.length - 1] == os.EOL[os.EOL.length - 1] ? a : a + os.EOL;

export function text_untrimmed(literals: TemplateStringsArray, ...args: any[]) {
  const cleanArgs = args.map((a) => squelch(join(squelch(force(a)))));
  return newline(trim(flatten(zip(literals, cleanArgs)).join("")));
}

export function text(literals: TemplateStringsArray, ...args: any[]) {
  return trim(newline(text_untrimmed(literals, ...args)));
}

export function ts(literals: TemplateStringsArray, ...args: any[]) {
  const result = text(literals, ...args);
  try {
    return prettier.format(result, {
      parser: "typescript",
    });
  } catch (err: any) {
    console.warn("error formatting typescript:\n", err?.message);
    return result;
  }
}
