#!/usr/bin/env node
// Guards against the classic monorepo trap: a local @myrmidon/<lib> library
// resolving to a stale published npm copy under node_modules instead of the
// workspace's own dist/ build.
//
// Local libraries (those under projects/myrmidon) must resolve in exactly one
// way: tsconfig.json's compilerOptions.paths -> ./dist/myrmidon/<lib>. This
// fails when:
// - a local library has no such paths entry;
// - a real (non-symlinked) copy exists under node_modules/@myrmidon, which
//   plain Node module resolution (and Vite's dependency pre-bundling) could
//   pick instead of the local dist/ build;
// - a symlink there points anywhere but this workspace's dist/.
'use strict';

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const repoRoot = path.resolve(__dirname, '..');
const libsDir = path.join(repoRoot, 'projects', 'myrmidon');

// tsconfig.json may contain comments: parse it with TypeScript's reader
const tsconfigPath = path.join(repoRoot, 'tsconfig.json');
const { config, error } = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
if (error) {
  console.error(
    '[check-local-libs] cannot read tsconfig.json: ' +
      ts.flattenDiagnosticMessageText(error.messageText, '\n')
  );
  process.exit(1);
}
const paths = (config.compilerOptions && config.compilerOptions.paths) || {};

const localLibs = fs
  .readdirSync(libsDir)
  .filter((dir) => fs.existsSync(path.join(libsDir, dir, 'package.json')))
  .map(
    (dir) =>
      JSON.parse(fs.readFileSync(path.join(libsDir, dir, 'package.json'), 'utf8'))
        .name
  );

let failed = false;

for (const name of localLibs) {
  const scopedName = name.slice('@myrmidon/'.length);
  const expectedDist = path.join(repoRoot, 'dist', 'myrmidon', scopedName);

  // 1. tsconfig paths must map the library to its dist/ build
  const mapped = (paths[name] || []).map((p) => path.resolve(repoRoot, p));
  if (mapped.length !== 1 || mapped[0] !== path.resolve(expectedDist)) {
    console.error(
      `[check-local-libs] tsconfig.json paths must map ${name} to ` +
        `./dist/myrmidon/${scopedName} (found: ${JSON.stringify(paths[name])}).`
    );
    failed = true;
  }

  // 2. no shadowing copy in node_modules
  const nodeModulesPath = path.join(
    repoRoot,
    'node_modules',
    '@myrmidon',
    scopedName
  );
  if (!fs.existsSync(nodeModulesPath)) {
    continue;
  }

  const stat = fs.lstatSync(nodeModulesPath);
  if (!stat.isSymbolicLink()) {
    console.error(
      `[check-local-libs] node_modules/@myrmidon/${scopedName} is a real ` +
        'directory, not a symlink. This means a published npm copy of a ' +
        'local workspace library exists and may shadow the local dist/ ' +
        'build. Remove it (e.g. pnpm remove, or delete the directory and ' +
        'reinstall) so resolution stays uniform via tsconfig paths.'
    );
    failed = true;
    continue;
  }

  const target = fs.realpathSync(nodeModulesPath);
  if (path.resolve(target) !== path.resolve(expectedDist)) {
    console.error(
      `[check-local-libs] node_modules/@myrmidon/${scopedName} is a ` +
        `symlink, but points to ${target} instead of ${expectedDist}. ` +
        "Fix the link so it resolves into this workspace's own dist/ " +
        'build.'
    );
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(
  `[check-local-libs] OK: ${localLibs.length} local libraries resolve ` +
    'uniformly via tsconfig paths (no shadowing copies in node_modules).'
);
