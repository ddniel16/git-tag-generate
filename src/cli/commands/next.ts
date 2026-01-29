import { select, confirm, input } from '@inquirer/prompts';
import chalk from 'chalk';
import * as tagService from '../../services/tagService.js';
import { extractPrefixes } from '../../domain/tag.js';
import { listTags } from '../../git/tags.js';
import { normalizePrefix, isValidPrefix } from '../../utils/slug.js';
import { showSuccess, showWarning, showInfo, exitWithError } from '../../utils/validators.js';
import type { CliArgs, SemVerLevel } from '../../types/index.js';

/**
 * Comando para generar el siguiente tag basado en SemVer
 * @param args - Argumentos de CLI
 */
export async function nextCommand(args: CliArgs): Promise<void> {
  showInfo('Generando siguiente tag');

  // Obtener todos los tags
  const allTags = await listTags();

  if (allTags.length === 0) {
    showWarning('No hay tags existentes. Usa el comando "new" para crear el primero.');
    process.exit(0);
  }

  // Extraer prefijos disponibles
  const prefixes = extractPrefixes(allTags);
  let selectedPrefix: string | undefined;

  // Si hay múltiples prefijos o prefijos + sin prefijo, preguntar
  if (prefixes.length > 1 || (prefixes.length === 1 && prefixes[0] !== null)) {
    const prefixChoices = prefixes.map((p) => ({
      name: p ?? chalk.gray('(sin prefijo)'),
      value: p,
    }));

    // Añadir opción para crear nuevo prefijo
    prefixChoices.push({
      name: chalk.green('+ Crear nuevo prefijo'),
      value: '__new__',
    });

    const prefixChoice = await select({
      message: 'Selecciona el prefijo:',
      choices: prefixChoices,
    });

    if (prefixChoice === '__new__') {
      const newPrefixInput = await input({
        message: 'Ingresa el nuevo prefijo:',
        validate: (value) => {
          if (!value || value.trim().length === 0) {
            return 'El prefijo no puede estar vacío';
          }
          const normalized = normalizePrefix(value);
          if (!isValidPrefix(normalized)) {
            return `El prefijo '${normalized}' no es válido`;
          }
          return true;
        },
      });
      selectedPrefix = normalizePrefix(newPrefixInput);
      showInfo(`Prefijo normalizado: ${chalk.cyan(selectedPrefix)}`);
    } else {
      selectedPrefix = prefixChoice ?? undefined;
    }
    // eslint-disable-next-line no-dupe-else-if
  } else if (prefixes.length === 1 && prefixes[0] !== null) {
    selectedPrefix = prefixes[0];
  }

  // Obtener último tag con ese prefijo
  const lastTag = await tagService.getLastTag(selectedPrefix);

  if (lastTag) {
    showInfo(`Último tag: ${chalk.cyan(lastTag.fullName)} (${lastTag.version})`);
  } else {
    showInfo(`No hay tags previos con este prefijo. Se usará versión inicial.`);
  }

  // Determinar nivel de incremento
  let level: SemVerLevel;
  let prereleaseId: string | undefined;

  if (args.level) {
    level = args.level;
  } else {
    // Prompt para nivel
    level = await select<SemVerLevel>({
      message: 'Selecciona el nivel de incremento:',
      choices: [
        { name: 'Patch (0.0.X)', value: 'patch' },
        { name: 'Minor (0.X.0)', value: 'minor' },
        { name: 'Major (X.0.0)', value: 'major' },
        { name: 'Prepatch (0.0.X-beta.0)', value: 'prepatch' },
        { name: 'Preminor (0.X.0-beta.0)', value: 'preminor' },
        { name: 'Premajor (X.0.0-beta.0)', value: 'premajor' },
        { name: 'Prerelease (incrementar prerelease)', value: 'prerelease' },
      ],
    });
  }

  // Detectar prerelease id desde flags
  if (args.beta) {
    prereleaseId = 'beta';
  } else if (args.alpha) {
    prereleaseId = 'alpha';
  } else if (args.id) {
    prereleaseId = args.id;
  }

  // Si es nivel prerelease y no hay id, preguntar
  if (
    (level === 'prepatch' ||
      level === 'preminor' ||
      level === 'premajor' ||
      level === 'prerelease') &&
    !prereleaseId
  ) {
    prereleaseId = await select({
      message: 'Selecciona el identificador de prerelease:',
      choices: [
        { name: 'beta', value: 'beta' },
        { name: 'alpha', value: 'alpha' },
        { name: 'rc', value: 'rc' },
      ],
    });
  }

  // Verificar estado de la rama
  const branchStatus = await tagService.checkBranchStatus();
  if (branchStatus.shouldWarn) {
    showWarning(
      `Estás en la rama '${chalk.yellow(branchStatus.currentBranch)}' (no es main/master)`
    );
    const continueAnyway = await confirm({
      message: '¿Deseas continuar de todas formas?',
      default: false,
    });
    if (!continueAnyway) {
      console.log(chalk.gray('Operación cancelada'));
      process.exit(0);
    }
  }

  // Generar siguiente tag
  const result = await tagService.generateNextTag(level, selectedPrefix, prereleaseId, {
    push: !args.noPush,
    dryRun: args.dryRun,
  });

  if (!result.success) {
    exitWithError(result.message);
  }

  showSuccess(result.message);
}
