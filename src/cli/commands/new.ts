import { input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { normalizePrefix, isValidPrefix } from '../../utils/slug.js';
import { DEFAULT_INITIAL_VERSION } from '../../domain/semver.js';
import * as tagService from '../../services/tagService.js';
import { showSuccess, showWarning, showInfo, exitWithError } from '../../utils/validators.js';
import { getTranslation } from '../../i18n/config.js';
import type { CliArgs } from '../../types/index.js';

/**
 * Comando para crear el primer tag (con o sin prefijo)
 * @param args - Argumentos de CLI
 */
export async function newCommand(args: CliArgs): Promise<void> {
  const t = getTranslation();
  showInfo(t('commands.new.creating'));

  // Verificar estado de la rama
  const branchStatus = await tagService.checkBranchStatus();
  if (branchStatus.shouldWarn) {
    showWarning(
      t('commands.new.noBranchWarning', { branch: chalk.yellow(branchStatus.currentBranch) })
    );
    const continueAnyway = await confirm({
      message: t('commands.new.continueAnyway'),
      default: false,
    });
    if (!continueAnyway) {
      console.log(chalk.gray(t('commands.new.operationCancelled')));
      process.exit(0);
    }
  }

  // Prompt para prefijo (opcional)
  let prefix: string | undefined;
  const usePrefixResponse = await confirm({
    message: t('commands.new.usePrefix'),
    default: false,
  });

  if (usePrefixResponse) {
    const prefixInput = await input({
      message: t('commands.new.enterPrefix'),
      validate: (value) => {
        if (!value || value.trim().length === 0) {
          return t('validation.prefixEmpty');
        }
        const normalized = normalizePrefix(value);
        if (!isValidPrefix(normalized)) {
          return t('validation.prefixInvalid', { prefix: normalized });
        }
        return true;
      },
    });

    prefix = normalizePrefix(prefixInput);
    showInfo(t('commands.new.prefixNormalized', { prefix: chalk.cyan(prefix) }));
  }

  // Mostrar versión inicial
  const version = DEFAULT_INITIAL_VERSION;
  showInfo(t('commands.new.initialVersion', { version: chalk.cyan(version) }));

  // Confirmar creación
  const tagName = prefix ? `${prefix}-${version}` : version;
  const confirmCreate = await confirm({
    message: t('commands.new.confirmCreate', { tag: chalk.green(tagName) }),
    default: true,
  });

  if (!confirmCreate) {
    console.log(chalk.gray(t('commands.new.operationCancelled')));
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
