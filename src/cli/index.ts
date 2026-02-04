#!/usr/bin/env node

import chalk from 'chalk';
import { isGitRepo, hasRemote } from '../git/repo.js';
import { exitWithError } from '../utils/validators.js';
import { newCommand } from './commands/new.js';
import { nextCommand } from './commands/next.js';
import { listCommand } from './commands/list.js';
import { deleteCommand } from './commands/delete.js';
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
  console.log(chalk.bold('\nGit Tag Generate (gtg) - Generador de tags Git con SemVer\n'));

  console.log(chalk.bold('Uso:'));
  console.log('  gtg                    Flujo inteligente: new si no hay tags, next si existen');
  console.log('  gtg new                Crear primer tag');
  console.log('  gtg next               Generar siguiente tag');
  console.log('  gtg list               Listar tags');
  console.log('  gtg delete             Eliminar tags (multi-select)\n');

  console.log(chalk.bold('Atajos:'));
  console.log('  gtg patch              Equivale a: gtg next --level patch');
  console.log('  gtg minor              Equivale a: gtg next --level minor');
  console.log('  gtg major              Equivale a: gtg next --level major');
  console.log('  gtg prepatch           Equivale a: gtg next --level prepatch');
  console.log('  gtg preminor           Equivale a: gtg next --level preminor');
  console.log('  gtg premajor           Equivale a: gtg next --level premajor');
  console.log('  gtg prerelease         Equivale a: gtg next --level prerelease\n');

  console.log(chalk.bold('Flags:'));
  console.log('  -l, --level <nivel>    Especificar nivel: patch|minor|major|prepatch|...');
  console.log('  --beta                 Usar identificador beta para prerelease');
  console.log('  --alpha                Usar identificador alpha para prerelease');
  console.log('  --id <id>              Identificador custom para prerelease');
  console.log('  --noPush               No subir tag al remote');
  console.log('  --dry-run              Simular sin crear tag');
  console.log('  --prefixes             Solo listar prefijos (con comando list)');
  console.log('  -v, --version          Mostrar versión del programa');
  console.log('  -h, --help             Mostrar esta ayuda\n');

  console.log(chalk.bold('Ejemplos:'));
  console.log('  gtg new                        # Crear primer tag (0.0.1)');
  console.log('  gtg patch                      # Incrementar patch (0.0.1 → 0.0.2)');
  console.log('  gtg minor                      # Incrementar minor (0.0.2 → 0.1.0)');
  console.log('  gtg major                      # Incrementar major (0.1.0 → 1.0.0)');
  console.log('  gtg next --beta                # Crear prerelease beta');
  console.log('  gtg prepatch --id rc           # Crear prepatch con id "rc"');
  console.log('  gtg list --prefixes            # Listar solo prefijos');
  console.log('  gtg delete                     # Eliminar tags (multi-select)');
  console.log('  gtg patch --noPush             # Crear sin subir al remote');
  console.log('  gtg major --dry-run            # Simular creación\n');
}

/**
 * Función principal
 */
async function main(): Promise<void> {
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
    exitWithError('No estás en un repositorio Git válido');
  }

  // Validar que existe remote origin (excepto para list)
  if (args.command !== 'list' && !(await hasRemote('origin'))) {
    exitWithError('No se encontró el remote "origin". Asegúrate de tener un remote configurado.');
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
        console.error(chalk.red(`Comando desconocido: ${command}`));
        console.log(chalk.gray('Usa "gtg --help" para ver comandos disponibles'));
        process.exit(1);
    }
  } catch (error) {
    exitWithError(`Error inesperado: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Ejecutar
main().catch((error) => {
  console.error(chalk.red('Error fatal:'), error);
  process.exit(1);
});
