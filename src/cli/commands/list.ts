import { styleText } from 'node:util';
import * as tagService from '../../services/tagService.js';
import { extractPrefixes } from '../../domain/tag.js';
import { listTags } from '../../git/tags.js';
import { showWarning } from '../../utils/validators.js';
import { getTranslation } from '../../i18n/config.js';
import type { CliArgs } from '../../types/index.js';

/**
 * Comando para listar tags
 * @param args - Argumentos de CLI
 */
export async function listCommand(args: CliArgs): Promise<void> {
  const t = getTranslation();
  const allTags = await listTags();

  if (allTags.length === 0) {
    showWarning(t('commands.list.noTags'));
    return;
  }

  // Si solo se piden prefijos
  if (args.prefixes) {
    const prefixes = extractPrefixes(allTags);
    console.log(styleText('bold', `\n${t('commands.list.availablePrefixes')}`));
    for (const prefix of prefixes) {
      if (prefix === null) {
        console.log(styleText('gray', `  ${t('commands.list.noPrefix')}`));
      } else {
        console.log(styleText('cyan', `  ${prefix}`));
      }
    }
    return;
  }

  // Listar agrupados por prefijo
  const groups = await tagService.groupByPrefix();

  console.log(styleText('bold', `\n${t('commands.list.tagsFound', { count: allTags.length })}\n`));

  for (const group of groups) {
    const prefixLabel =
      group.prefix === null
        ? styleText('gray', t('commands.list.noPrefix'))
        : styleText('cyan', group.prefix);
    console.log(styleText('bold', `${prefixLabel}:`));

    for (let i = 0; i < group.tags.length; i++) {
      const tag = group.tags[i];
      const isLatest = i === 0;
      const marker = isLatest ? styleText('green', '→') : ' ';
      const tagDisplay = isLatest ? styleText('green', tag.fullName) : tag.fullName;
      const dateDisplay = tag.date ? styleText('gray', `(${tag.date})`) : '';

      console.log(`  ${marker} ${tagDisplay} ${dateDisplay}`);
    }
    console.log('');
  }
}
