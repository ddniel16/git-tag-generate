// Configuración explícita para esbuild compatible con ESM y Node.js
import { build } from 'esbuild';
import { readFileSync, mkdirSync, copyFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
})
  .then(() => {
    // Copiar archivos de traducción al directorio de salida
    const localesDir = join(__dirname, 'dist', 'i18n', 'locales');
    mkdirSync(localesDir, { recursive: true });

    const locales = ['es.json', 'en.json'];
    locales.forEach((locale) => {
      const src = join(__dirname, 'src', 'i18n', 'locales', locale);
      const dest = join(localesDir, locale);
      copyFileSync(src, dest);
      console.log(`Copied ${locale} to dist/i18n/locales/`);
    });
  })
  .catch(() => process.exit(1));
