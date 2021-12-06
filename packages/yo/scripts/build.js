import g from "glob"
import esbuild from "esbuild"
const results = g.sync('./src/**/*.ts');
esbuild.build({
  entryPoints: results,
  outdir: "build"
}).catch(() => process.exit(1))
