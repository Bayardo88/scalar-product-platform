const esbuild = require("esbuild");

const isWatch = process.argv.includes("--watch");

const buildOptions = {
  entryPoints: ["code.ts"],
  bundle: true,
  outfile: "dist/code.js",
  platform: "browser",
  target: "es2020",
  format: "iife",
  mainFields: ["main", "module"],
  sourcemap: false,
  minify: process.argv.includes("--minify"),
  external: ["openai", "openai/helpers/zod", "dotenv"],
  logLevel: "info",
};

if (isWatch) {
  esbuild
    .context(buildOptions)
    .then((ctx) => {
      ctx.watch();
      console.log("[esbuild] watching for changes...");
    })
    .catch(() => process.exit(1));
} else {
  esbuild
    .build(buildOptions)
    .then(() => console.log("[esbuild] build complete"))
    .catch(() => process.exit(1));
}
