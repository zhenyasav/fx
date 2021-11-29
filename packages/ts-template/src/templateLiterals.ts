import _ from "lodash";
import * as os from "os";
const { flatten, zip } = _;
export function text(literals: TemplateStringsArray, ...args: any[]) {
  const force = (a: Function | any) => (typeof a == "function" ? a() : a);
  const join = (a: any[] | any) => (Array.isArray(a) ? a.join(os.EOL) : a);
  const squelch = (a: any) => (!a ? "" : a);
  const forcedArgs = args.map((a) => squelch(join(squelch(force(a)))));
  return flatten(zip(literals, forcedArgs)).join("");
}
