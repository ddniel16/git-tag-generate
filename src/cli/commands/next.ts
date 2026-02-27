import { select, confirm, input } from '@inquirer/prompts';
import chalk from 'chalk';
import * as tagService from '../../services/tagService.js';
import { extractPrefixes } from '../../domain/tag.js';
import { listTags } from '../../git/tags.js';
import { normalizePrefix, isValidPrefix } from '../../utils/slug.js';
import { showSuccess, showWarning, showInfo, exitWithError } from '../../utils/validators.js';
import { getTranslation } from '../../i18n/config.js';
import type { CliArgs, SemVerLevel } from '../../types/index.js';

/**
 * Comando para generar el siguiente tag basado en SemVer
 * @param args - Argumentos de CLI
 */
export async function nextCommand(args: CliArgs): Promise<void> {
  const t = getTranslation();
  showInfo(t('commands.next.generating'));

  // Obtener todos los tags
  const allTags = await listTags();

  if (allTags.length === 0) {
    showWarning(t('commands.next.noExistingTags'));
    process.exit(0);
  }

  // Extraer prefijos disponibles
  const prefixes = extractPrefixes(allTags);
  let selectedPrefix: string | undefined;

  // Si hay múltiples prefijos o prefijos + sin prefijo, preguntar
  if (prefixes.length > 1 || (prefixes.length === 1 && prefixes[0] !== null)) {
    const prefixChoices = prefixes.map((p) => ({
      name: p ?? chalk.gray(t('commands.list.noPrefix')),
      value: p,
    }));

    // Añadir opción para crear nuevo prefijo
    prefixChoices.push({
      name: chalk.green(t('commands.next.createNewPrefix')),
      value: '__new__',
    });

    const prefixChoice = await select({
      message: t('commands.next.selectPrefix'),
      choices: prefixChoices,
    });

    if (prefixChoice === '__new__') {
      const newPrefixInput = await input({
        message: t('commands.next.enterNewPrefix'),
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
      selectedPrefix = normalizePrefix(newPrefixInput);
      showInfo(t('commands.new.prefixNormalized', { prefix: chalk.cyan(selectedPrefix) }));
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
    showInfo(
      t('commands.next.lastTag', { tag: chalk.cyan(lastTag.fullName), version: lastTag.version })
    );
  } else {
    showInfo(t('commands.next.noPreviousTags'));
  }

  // Determinar nivel de incremento
  let level: SemVerLevel;
  let prereleaseId: string | undefined;

  if (args.level) {
    level = args.level;
  } else {
    // Prompt para nivel
    level = await select<SemVerLevel>({
      message: t('commands.next.selectIncrement'),
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
      message: t('commands.next.selectPreId'),
      choices: [
        { name: t('commands.next.preIdBeta'), value: 'beta' },
        { name: t('commands.next.preIdAlpha'), value: 'alpha' },
        { name: t('commands.next.preIdRc'), value: 'rc' },
      ],
    });
  }

  // Verificar estado de la rama
  const branchStatus = await tagService.checkBranchStatus();
  if (branchStatus.shouldWarn) {
    showWarning(
      t('commands.next.confirmBranch', { branch: chalk.yellow(branchStatus.currentBranch) })
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
