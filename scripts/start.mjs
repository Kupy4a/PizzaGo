#!/usr/bin/env node
// Cross-platform launcher: checks Node, installs dependencies for the current
// OS when needed, then starts the app.
//
//   node scripts/start.mjs          development server (default)
//   node scripts/start.mjs prod     production build + server

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modules = path.join(root, 'node_modules');
const isWindows = process.platform === 'win32';

function run(cmd, args) {
  // npm is a .cmd shim on Windows and needs a shell there.
  const result = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', shell: isWindows });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function fail(message) {
  console.error(`\n[PizzaGo] ${message}\n`);
  process.exit(1);
}

// 1. Node version
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 20 || (major === 20 && minor < 9)) {
  fail(`Node.js ${process.versions.node} is too old. Install Node.js 22 LTS from https://nodejs.org`);
}
if (major === 20 && minor < 19) {
  console.warn(`[PizzaGo] Node.js ${process.versions.node} works, but 20.19+ or 22 LTS is recommended.`);
}

// 2. Dependencies. Next.js ships a native compiler per OS (@next/swc-<os>-<arch>),
// so node_modules installed on Linux/WSL won't run on Windows and vice versa.
function installedForThisPlatform() {
  const nextScope = path.join(modules, '@next');
  if (!existsSync(nextScope)) return false;
  const prefix = `swc-${process.platform}-${process.arch}`;
  return readdirSync(nextScope).some((name) => name.startsWith(prefix));
}

if (!installedForThisPlatform()) {
  if (existsSync(modules)) {
    console.log('[PizzaGo] node_modules was installed for another OS, reinstalling...');
    try {
      rmSync(modules, { recursive: true, force: true });
    } catch {
      fail(
        'Could not remove node_modules (it was probably created from WSL).\n' +
          'Delete the node_modules folder manually and run this script again.'
      );
    }
  } else {
    console.log('[PizzaGo] Installing dependencies...');
  }
  run('npm', ['ci', '--no-audit', '--no-fund']);
}

// 3. Start
const mode = process.argv[2] ?? 'dev';
if (mode === 'prod') {
  run('npm', ['run', 'build']);
  run('npm', ['start']);
} else if (mode === 'dev') {
  run('npm', ['run', 'dev']);
} else {
  fail(`Unknown mode "${mode}". Use "dev" or "prod".`);
}
