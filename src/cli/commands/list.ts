import chalk from 'chalk';
import * as tagService from '../../services/tagService.js';
import { extractPrefixes } from '../../domain/tag.js';
import { listTags } from '../../git/tags.js';
import { showWarning } from '../../utils/validators.js';
import type { CliArgs } from '../../types/index.js';

/**
 * Comando para listar tags
 * @param args - Argumentos de CLI
 */
export async function listCommand(args: CliArgs): Promise<void> {
  const allTags = await listTags();

  if (allTags.length === 0) {
    showWarning('No hay tags en el repositorio');
    return;
  }

  // Si solo se piden prefijos
  if (args.prefixes) {
    const prefixes = extractPrefixes(allTags);
    console.log(chalk.bold('\nPrefijos disponibles:'));
    for (const prefix of prefixes) {
      if (prefix === null) {
        console.log(chalk.gray('  (sin prefijo)'));
      } else {
        console.log(chalk.cyan(`  ${prefix}`));
      }
    }
    return;
  }

  // Listar agrupados por prefijo
  const groups = await tagService.groupByPrefix();

  console.log(chalk.bold(`\nTags encontrados: ${allTags.length}\n`));

  for (const group of groups) {
    const prefixLabel =
      group.prefix === null ? chalk.gray('(sin prefijo)') : chalk.cyan(group.prefix);
    console.log(chalk.bold(`${prefixLabel}:`));

    for (let i = 0; i < group.tags.length; i++) {
      const tag = group.tags[i];
      const isLatest = i === 0;
      const marker = isLatest ? chalk.green('→') : ' ';
      const tagDisplay = isLatest ? chalk.green(tag.fullName) : tag.fullName;
      const dateDisplay = tag.date ? chalk.gray(`(${tag.date})`) : '';

      console.log(`  ${marker} ${tagDisplay} ${dateDisplay}`);
    }
    console.log('');
  }
}
