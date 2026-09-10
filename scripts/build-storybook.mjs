import { spawnSync } from "node:child_process";
import { cpSync, rmSync } from "node:fs";
import { resolve, sep } from "node:path";

const projectRoot = process.cwd();
const source = resolve(projectRoot, "storybook-static");
const publicRoot = resolve(projectRoot, "public");
const target = resolve(publicRoot, "storybook-static");
const includeInApplication = process.argv.includes("--app");

if (!target.startsWith(`${publicRoot}${sep}`)) {
  throw new Error(`Invalid Storybook target: ${target}`);
}

// Do not let a previous embedded build become part of the next Storybook's
// copied public assets.
rmSync(target, { force: true, recursive: true });

const npmCli = process.env.npm_execpath;

if (!npmCli) {
  throw new Error("npm_execpath is required to build Storybook");
}

const build = spawnSync(
  process.execPath,
  [npmCli, "exec", "--", "storybook", "build"],
  {
    cwd: projectRoot,
    stdio: "inherit",
  },
);

if (build.error) {
  throw build.error;
}

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

if (includeInApplication) {
  cpSync(source, target, { recursive: true });
}
