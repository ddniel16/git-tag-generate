// Configuración explícita para esbuild compatible con ESM y Node.js
import { build } from 'esbuild';

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
}).catch(() => process.exit(1));
