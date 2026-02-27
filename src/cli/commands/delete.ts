import { checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { listTags, deleteTag } from '../../git/tags.js';
import { showSuccess, showWarning, showInfo } from '../../utils/validators.js';
import { getTranslation } from '../../i18n/config.js';
import type { CliArgs } from '../../types/index.js';

/**
 * Comando para eliminar tags (multi-select)
 * @param args - Argumentos de CLI
 */
export async function deleteCommand(args: CliArgs): Promise<void> {
  const t = getTranslation();
  showInfo(t('commands.delete.title'));

  const allTags = await listTags();

  if (allTags.length === 0) {
    showWarning(t('commands.delete.noTags'));
    return;
  }

  // Multi-select de tags
  const selectedTags = await checkbox({
    message: t('commands.delete.selectPrompt'),
    choices: allTags.map((tag) => ({
      name: `${tag.fullName} ${tag.date ? chalk.gray(`(${tag.date})`) : ''}`,
      value: tag.fullName,
    })),
    pageSize: 15,
  });

  if (selectedTags.length === 0) {
    console.log(chalk.gray(t('commands.delete.noneSelected')));
    return;
  }

  // Mostrar resumen
  console.log(chalk.yellow(`\n${t('commands.delete.toDelete', { count: selectedTags.length })}`));
  for (const tagName of selectedTags) {
    console.log(chalk.red(`  - ${tagName}`));
  }

  // Confirmar eliminación
  const confirmDelete = await confirm({
    message: t('commands.delete.confirmDelete', { count: selectedTags.length }),
    default: false,
  });

  if (!confirmDelete) {
    console.log(chalk.gray(t('commands.new.operationCancelled')));
    return;
  }

  // Eliminar cada tag
  let successCount = 0;
  let errorCount = 0;

  for (const tagName of selectedTags) {
    const result = await deleteTag({
      tagName,
      deleteRemote: !args.noPush,
      dryRun: args.dryRun,
    });

    if (result.success) {
      showSuccess(`${tagName}: ${result.message}`);
      successCount++;
    } else {
      console.error(chalk.red(`✗ ${tagName}: ${result.message}`));
      errorCount++;
    }
  }

  // Resumen final
  console.log('');
  if (successCount > 0) {
    showSuccess(t('commands.delete.deleted', { count: successCount }));
  }
  if (errorCount > 0) {
    showWarning(t('commands.delete.errors', { count: errorCount }));
  }
}
