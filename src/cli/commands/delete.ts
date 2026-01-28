import { checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { listTags, deleteTag } from '../../git/tags.js';
import { showSuccess, showWarning, showInfo } from '../../utils/validators.js';
import type { CliArgs } from '../../types/index.js';

/**
 * Comando para eliminar tags (multi-select)
 * @param args - Argumentos de CLI
 */
export async function deleteCommand(args: CliArgs): Promise<void> {
  showInfo('Selecciona los tags a eliminar');

  const allTags = await listTags();

  if (allTags.length === 0) {
    showWarning('No hay tags en el repositorio');
    return;
  }

  // Multi-select de tags
  const selectedTags = await checkbox({
    message: 'Selecciona los tags a eliminar (usa espacio para seleccionar):',
    choices: allTags.map((tag) => ({
      name: `${tag.fullName} ${tag.date ? chalk.gray(`(${tag.date})`) : ''}`,
      value: tag.fullName,
    })),
    pageSize: 15,
  });

  if (selectedTags.length === 0) {
    console.log(chalk.gray('Ningún tag seleccionado. Operación cancelada.'));
    return;
  }

  // Mostrar resumen
  console.log(chalk.yellow(`\nTags a eliminar (${selectedTags.length}):`));
  for (const tagName of selectedTags) {
    console.log(chalk.red(`  - ${tagName}`));
  }

  // Confirmar eliminación
  const confirmDelete = await confirm({
    message: `¿Estás seguro de eliminar ${selectedTags.length} tag(s)?`,
    default: false,
  });

  if (!confirmDelete) {
    console.log(chalk.gray('Operación cancelada'));
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
    showSuccess(`${successCount} tag(s) eliminado(s) correctamente`);
  }
  if (errorCount > 0) {
    showWarning(`${errorCount} tag(s) con errores`);
  }
}
