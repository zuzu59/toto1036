import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import process from 'node:process';

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(root, '..');
const packageJson = JSON.parse(readFileSync(resolve(projectRoot, 'package.json'), 'utf8'));
const appVersion = packageJson.version;
const buildAt = new Date().toISOString();

const env = {
  ...process.env,
  VITE_APP_VERSION: appVersion,
  VITE_BUILD_AT: buildAt,
  VITE_BASE_URL: '/toto1036/',
};

execFileSync('npx', ['vue-tsc', '-p', 'tsconfig.app.json', '--noEmit'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env,
});

execFileSync('npx', ['vite', 'build'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env,
});
