#!/usr/bin/env node
const { spawnSync } = require("child_process");
async function npmLint() {
  const spawnOption = {
    shell: true,
    env: process.env,
    stdio: "inherit",
    cwd: "./web",
  };
  let npmInstall;
  let npmRunLint;
  try {
    npmInstall = await spawnSync("pnpm", ["add", "."], spawnOption);
    if (npmInstall.status !== 0) {
      process.exit(npmInstall.status);
    }
    npmRunLint = await spawnSync("pnpm", ["lint"], spawnOption);
    process.exit(npmRunLint.status);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
npmLint();
