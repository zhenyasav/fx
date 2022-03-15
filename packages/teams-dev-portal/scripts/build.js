#!/usr/bin/env node
const path = require("path");
const { mkdirp, copy } = require("fs-extra");
const { exec } = require("child_process");

async function main() {
  await new Promise((res,rej)=> {
    exec('tsc', (err, stdout, stderr) => {
      if (err || stderr) {
        if (err) throw err;
        if (stderr) process.stderr.write(stderr);
        return rej();
      }
      if (stdout) process.stdout.write(stdout);
      return res();
    });
  });
  await mkdirp(path.resolve(__dirname, "..", "build/auth/codeFlowResult"));
  await copy(
    path.resolve(__dirname, "../src/auth/codeFlowResult"),
    path.resolve(__dirname, "../build/auth/codeFlowResult/")
  );
}

main();
