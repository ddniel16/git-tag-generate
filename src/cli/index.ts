#!/usr/bin/env node

import chalk from 'chalk';
import { isGitRepo, hasRemote } from '../git/repo.js';
import { exitWithError } from '../utils/validators.js';
import { newCommand } from './commands/new.js';
import { nextCommand } from './commands/next.js';
import { listCommand } from './commands/list.js';
import { deleteCommand } from './commands/delete.js';
import { initI18n, getTranslation } from '../i18n/config.js';
import type { CliArgs, SemVerLevel } from '../types/index.js';

declare const __VERSION__: string;
declare const __PKG_NAME__: string;

/**
 * Parsea los argumentos de línea de comandos
 */
function parseArgs(): CliArgs {
  const args: CliArgs = {};
  const rawArgs = process.argv.slice(2);

  let i = 0;
  while (i < rawArgs.length) {
    const arg = rawArgs[i];

    if (!arg) {
      i++;
      continue;
    }

    // Flags booleanos
    if (arg === '--noPush') {
      args.noPush = true;
      i++;
      continue;
    }

    if (arg === '--dry-run') {
      args.dryRun = true;
      i++;
      continue;
    }

    if (arg === '--prefixes') {
      args.prefixes = true;
      i++;
      continue;
    }

    if (arg === '--beta') {
      args.beta = true;
      i++;
      continue;
    }

    if (arg === '--alpha') {
      args.alpha = true;
      i++;
      continue;
    }

    if (arg === '-s' || arg === '--sign') {
      args.sign = true;
      i++;
      continue;
    }

    if (arg === '--no-sign') {
      args.noSign = true;
      i++;
      continue;
    }

    // Flags con valor
    if (arg === '-l' || arg === '--level') {
      const level = rawArgs[i + 1];
      if (level && !level.startsWith('-')) {
        args.level = level as SemVerLevel;
        i += 2;
        continue;
      }
    }

    if (arg === '--id') {
      const id = rawArgs[i + 1];
      if (id && !id.startsWith('-')) {
        args.id = id;
        i += 2;
        continue;
      }
    }

    if (arg === '--gpg-sign') {
      const keyId = rawArgs[i + 1];
      // --gpg-sign puede usarse sin valor (firma con clave por defecto)
      if (keyId && !keyId.startsWith('-')) {
        args.gpgSign = keyId;
        i += 2;
        continue;
      } else {
        // Sin keyId específico, simplemente habilita firma
        args.sign = true;
        i++;
        continue;
      }
    }

    // Comandos y atajos
    if (!args.command && !arg.startsWith('-')) {
      args.command = arg;
    }

    i++;
  }

  return args;
}

/**
 * Mapea atajos de comandos a comandos reales
 */
function mapShortcuts(args: CliArgs): CliArgs {
  const { command } = args;

  // Atajos de niveles SemVer
  const levelShortcuts: Record<string, SemVerLevel> = {
    patch: 'patch',
    minor: 'minor',
    major: 'major',
    prepatch: 'prepatch',
    preminor: 'preminor',
    premajor: 'premajor',
    prerelease: 'prerelease',
  };

  if (command && command in levelShortcuts) {
    return {
      ...args,
      command: 'next',
      level: levelShortcuts[command],
    };
  }

  return args;
}

/**
 * Muestra ayuda
 */
function showHelp(): void {
  const t = getTranslation();
  console.log(chalk.bold(`\n${t('help.title')}\n`));

  console.log(chalk.bold(t('help.usage')));
  console.log(`  gtg                    ${t('help.usageSmartFlow')}`);
  console.log(`  gtg new                ${t('help.shortcutN')}`);
  console.log(`  gtg next               ${t('help.shortcutX')}`);
  console.log(`  gtg list               ${t('help.shortcutL')}`);
  console.log(`  gtg delete             ${t('help.shortcutD')}\n`);

  console.log(chalk.bold(t('help.shortcuts')));
  console.log(`  gtg patch              ${t('help.shortcutPatch')}`);
  console.log(`  gtg minor              ${t('help.shortcutMinor')}`);
  console.log(`  gtg major              ${t('help.shortcutMajor')}`);
  console.log(`  gtg prepatch           ${t('help.shortcutPrepatch')}`);
  console.log(`  gtg preminor           ${t('help.shortcutPreminor')}`);
  console.log(`  gtg premajor           ${t('help.shortcutPremajor')}`);
  console.log(`  gtg prerelease         ${t('help.shortcutPrerelease')}\n`);

  console.log(chalk.bold(t('help.flags')));
  console.log(`  -l, --level <nivel>    ${t('help.flagLevel')}`);
  console.log(`  --beta                 ${t('help.flagBeta')}`);
  console.log(`  --alpha                ${t('help.flagAlpha')}`);
  console.log(`  --id <id>              ${t('help.flagId')}`);
  console.log(`  -s, --sign             ${t('help.flagSign')}`);
  console.log(`  --no-sign              ${t('help.flagNoSign')}`);
  console.log(`  --gpg-sign [keyid]     ${t('help.flagGpgSign')}`);
  console.log(`  --noPush               ${t('help.flagNoRemote')}`);
  console.log(`  --dry-run              ${t('help.flagDryRun')}`);
  console.log(`  --prefixes             ${t('help.flagPrefixes')}`);
  console.log(`  -v, --version          ${t('help.flagVersion')}`);
  console.log(`  -h, --help             ${t('help.flagHelp')}\n`);

  console.log(chalk.bold(t('help.examples')));
  console.log(`  gtg new                        # ${t('help.example1')} (0.0.1)`);
  console.log(`  gtg patch                      # ${t('help.example2')} (0.0.1 → 0.0.2)`);
  console.log(`  gtg minor                      # ${t('help.example3')} (0.0.2 → 0.1.0)`);
  console.log(`  gtg major                      # ${t('help.exampleMajor')} (0.1.0 → 1.0.0)`);
  console.log(`  gtg next --beta                # ${t('help.exampleBeta')}`);
  console.log(`  gtg prepatch --id rc           # ${t('help.examplePrepatch')}`);
  console.log(`  gtg list --prefixes            # ${t('help.example5')}`);
  console.log(`  gtg delete                     # ${t('help.exampleDelete')}`);
  console.log(`  gtg patch --noPush             # ${t('help.exampleNoPush')}`);
  console.log(`  gtg major --dry-run            # ${t('help.example4')}`);
  console.log(`  gtg patch --sign               # ${t('help.exampleSign')}`);
  console.log(`  gtg major --gpg-sign KEYID     # ${t('help.exampleGpgSign')}\n`);
}

/**
 * Función principal
 */
async function main(): Promise<void> {
  // Inicializar i18n antes que nada
  await initI18n();
  const t = getTranslation();

  const rawArgs = parseArgs();
  const args = mapShortcuts(rawArgs);

  // Mostrar versión
  if (process.argv.includes('-v') || process.argv.includes('--version')) {
    console.log(`${__PKG_NAME__} v${__VERSION__}`);
    process.exit(0);
  }

  // Mostrar ayuda
  if (args.command === 'help' || process.argv.includes('-h') || process.argv.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  // Validar que estamos en un repo Git (excepto para help)
  if (!(await isGitRepo())) {
    exitWithError(t('cli.notGitRepo'));
  }

  // Validar que existe remote origin (excepto para list)
  if (args.command !== 'list' && !(await hasRemote('origin'))) {
    exitWithError(t('cli.noRemoteOrigin'));
  }

  // Si no hay comando especificado, usar inteligencia
  let command = args.command;
  if (!command) {
    // Detectar si hay tags existentes para decidir entre 'new' y 'next'
    const { listTags } = await import('../git/tags.js');
    const existingTags = await listTags();
    command = existingTags.length > 0 ? 'next' : 'new';
  }

  try {
    switch (command) {
      case 'new':
        await newCommand(args);
        break;
      case 'next':
        await nextCommand(args);
        break;
      case 'list':
        await listCommand(args);
        break;
      case 'delete':
        await deleteCommand(args);
        break;
      default:
        console.error(chalk.red(t('cli.unknownCommand', { command })));
        console.log(chalk.gray(t('cli.useHelp')));
        process.exit(1);
    }
  } catch (error) {
    exitWithError(
      t('cli.unexpectedError', { message: error instanceof Error ? error.message : String(error) })
    );
  }
}

// Ejecutar
main().catch((error) => {
  console.error(chalk.red(getTranslation()('cli.fatalError')), error);
  process.exit(1);
});
