import _ from "lodash";
import * as os from "os";
const { flatten, zip } = _;
export function text(literals, ...args) {
  const force = (a) => typeof a == "function" ? a() : a;
  const join = (a) => Array.isArray(a) ? a.join(os.EOL) : a;
  const squelch = (a) => !a ? "" : a;
  const forcedArgs = args.map((a) => squelch(join(squelch(force(a)))));
  return flatten(zip(literals, forcedArgs)).join("");
}
