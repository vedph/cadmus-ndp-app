// This app is zoneless (see src/app/app.config.ts) and never declares
// zone.js as a real dependency. However, @angular/core's peer dependency
// on zone.js gets baked as a resolved peer variant into pnpm-lock.yaml for
// hundreds of @angular/* packages (a leftover from before the zoneless
// migration), so a full dependency re-resolution can silently re-fetch
// zone.js into the pnpm virtual store even with `autoInstallPeers: false`
// and `peerDependencyRules.ignoreMissing` set in pnpm-workspace.yaml.
//
// Once that store entry exists, Angular's Vitest unit-test builder finds
// it via plain Node module resolution and emits a dynamic
// `import('zone.js/testing')` in every library's generated init-testbed.js,
// but Vite's stricter pnpm-aware resolver refuses to load it since it is
// not a real declared dependency anywhere - breaking every non-root
// library's test target with "Failed to resolve import zone.js/testing".
//
// Removing the phantom store entry after each install keeps every
// project's tests deterministically zoneless, matching production.
const fs = require('fs');
const path = require('path');

const pnpmDir = path.join(__dirname, '..', 'node_modules', '.pnpm');

function removeIfExists(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
    console.log(`[remove-phantom-zonejs] removed ${targetPath}`);
  }
}

if (fs.existsSync(pnpmDir)) {
  for (const entry of fs.readdirSync(pnpmDir)) {
    if (entry.startsWith('zone.js@')) {
      removeIfExists(path.join(pnpmDir, entry));
    }
  }
  removeIfExists(path.join(pnpmDir, 'node_modules', 'zone.js'));
}
