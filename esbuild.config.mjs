// Configuración explícita para esbuild compatible con ESM y Node.js
import { build } from 'esbuild';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

build({
  entryPoints: ['src/cli/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: ['node20'],
  outfile: 'dist/main.js',
  minify: true,
  treeShaking: true,
  sourcemap: true,
  packages: 'external',
  logLevel: 'info',
  define: {
    __VERSION__: JSON.stringify(pkg.version),
    __PKG_NAME__: JSON.stringify(pkg.name),
  },
}).catch(() => process.exit(1));
