#!/usr/bin/env node
// Install dependencies with @lynkflow/* packages resolved against the local
// Verdaccio registry instead of the real one, AND guarantee those packages
// are actually fresh -- not just "whatever the lockfile already trusts".
//
// Root cause this works around (confirmed by direct reproduction against a
// real Verdaccio instance, see .claude/rules/publishing.md's "Local
// registry (Verdaccio)" section): a bare `npm install` -- even with
// `--force`, even with the correct `--@lynkflow:registry=...` override --
// does NOT re-check the registry for a package if the existing lockfile
// entry's resolution already satisfies that package's declared semver
// range. Republishing the *same* version to Verdaccio with new content
// (exactly what `publish:local:force` is for, precisely so you don't have
// to bump the version every local iteration) is therefore invisible to a
// subsequent plain `npm install` -- npm never even asks the registry.
//
// The only thing that reliably forces npm to re-resolve is naming the
// package explicitly as an install target. So this script does two passes:
//
//   1. A normal, full `npm install` (still scoped to Verdaccio for
//      @lynkflow/*) -- handles a fresh clone with no node_modules at all,
//      and every non-@lynkflow dependency as usual.
//   2. An explicit, named-target reinstall of just the @lynkflow/*
//      packages found in this repo's own dependencies/devDependencies,
//      with `--no-save` so it can't drift package.json's declared range --
//      this is the step that actually busts the lockfile-trust shortcut
//      above and guarantees you get whatever's really on Verdaccio right
//      now, not a stale cached resolution.
//
// If this repo has no @lynkflow/* dependency at all, step 2 is skipped --
// there's nothing for it to do.
//
// Usage: npm run install:local

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const REGISTRY = "http://localhost:4873";
const SCOPE_OVERRIDE = `--@lynkflow:registry=${REGISTRY}`;

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

const { dependencies = {}, devDependencies = {} } = JSON.parse(
  readFileSync("./package.json", "utf8"),
);

const lynkflowPackages = Object.keys({ ...dependencies, ...devDependencies }).filter(
  (name) => name.startsWith("@lynkflow/"),
);

console.log("Installing dependencies (@lynkflow/* resolved via Verdaccio)...");
run(`npm install ${SCOPE_OVERRIDE}`);

if (lynkflowPackages.length === 0) {
  console.log("No @lynkflow/* dependency declared here -- nothing else to do.");
} else {
  console.log(
    `Forcing a fresh re-resolve of: ${lynkflowPackages.join(", ")} ` +
      "(bypasses npm's lockfile-trust shortcut so a same-version republish " +
      "on Verdaccio is actually picked up)...",
  );
  run(`npm install ${lynkflowPackages.join(" ")} --no-save ${SCOPE_OVERRIDE}`);
}
