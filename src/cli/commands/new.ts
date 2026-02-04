import { input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { normalizePrefix, isValidPrefix } from '../../utils/slug.js';
import { DEFAULT_INITIAL_VERSION } from '../../domain/semver.js';
import * as tagService from '../../services/tagService.js';
import { showSuccess, showWarning, showInfo, exitWithError } from '../../utils/validators.js';
import type { CliArgs } from '../../types/index.js';

/**
 * Comando para crear el primer tag (con o sin prefijo)
 * @param args - Argumentos de CLI
 */
export async function newCommand(args: CliArgs): Promise<void> {
  showInfo('Creando nuevo tag');

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

  // Prompt para prefijo (opcional)
  let prefix: string | undefined;
  const usePrefixResponse = await confirm({
    message: '¿Deseas usar un prefijo para el tag?',
    default: false,
  });

  if (usePrefixResponse) {
    const prefixInput = await input({
      message: 'Ingresa el prefijo (se normalizará automáticamente):',
      validate: (value) => {
        if (!value || value.trim().length === 0) {
          return 'El prefijo no puede estar vacío';
        }
        const normalized = normalizePrefix(value);
        if (!isValidPrefix(normalized)) {
          return `El prefijo '${normalized}' no es válido. Solo letras minúsculas, números y guiones`;
        }
        return true;
      },
    });

    prefix = normalizePrefix(prefixInput);
    showInfo(`Prefijo normalizado: ${chalk.cyan(prefix)}`);
  }

  // Mostrar versión inicial
  const version = DEFAULT_INITIAL_VERSION;
  showInfo(`Versión inicial: ${chalk.cyan(version)}`);

  // Confirmar creación
  const tagName = prefix ? `${prefix}-${version}` : version;
  const confirmCreate = await confirm({
    message: `¿Crear tag '${chalk.green(tagName)}'?`,
    default: true,
  });

  if (!confirmCreate) {
    console.log(chalk.gray('Operación cancelada'));
    process.exit(0);
  }

  // Crear tag
  const result = await tagService.createNewTag(version, prefix, {
    push: !args.noPush,
    dryRun: args.dryRun,
  });

  if (!result.success) {
    exitWithError(result.message);
  }

  showSuccess(result.message);
}
