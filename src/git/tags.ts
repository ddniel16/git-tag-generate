import { getGit } from './repo.js';
import { parseTag } from '../domain/tag.js';
import { getTranslation } from '../i18n/config.js';
import type {
  Tag,
  CreateTagOptions,
  DeleteTagOptions,
  ListTagsOptions,
  GitOperationResult,
} from '../types/index.js';

/**
 * Lista todos los tags del repositorio
 * @param options - Opciones de filtrado y ordenamiento
 * @returns Lista de tags parseados
 */
export async function listTags(options: ListTagsOptions = {}): Promise<Tag[]> {
  const git = getGit();

  const sortBy = options.sortBy ?? '-creatordate';
  const tagList = await git.tag([
    '--sort=' + sortBy,
    '--format=%(refname:short)|%(creatordate:iso8601)|%(objectname:short)',
  ]);

  if (!tagList || tagList.trim() === '') {
    return [];
  }

  const tagLines = tagList.trim().split('\n');
  const tags: Tag[] = [];

  for (const line of tagLines) {
    const [fullName, date, hash] = line.split('|');
    if (!fullName) continue;

    const parsed = parseTag(fullName);
    tags.push({
      ...parsed,
      date,
      hash,
    });
  }

  // Filtrar por prefijo si se especifica
  if (options.prefix !== undefined) {
    return tags.filter((tag) => {
      if (options.prefix === '' || options.prefix === undefined) {
        return !tag.prefix;
      }
      return tag.prefix === options.prefix;
    });
  }

  return tags;
}

/**
 * Verifica si un tag existe
 * @param tagName - Nombre del tag
 * @returns true si existe
 */
export async function tagExists(tagName: string): Promise<boolean> {
  const tags = await listTags();
  return tags.some((tag) => tag.fullName === tagName);
}

/**
 * Crea un nuevo tag
 * @param options - Opciones de creación
 * @returns Resultado de la operación
 */
export async function createTag(options: CreateTagOptions): Promise<GitOperationResult> {
  const { tagName, message, push = true, dryRun = false } = options;
  const t = getTranslation();

  try {
    // Verificar si el tag ya existe
    if (await tagExists(tagName)) {
      return {
        success: false,
        message: t('git.tagExists', { tag: tagName }),
        error: new Error(t('git.tagDuplicate')),
      };
    }

    if (dryRun) {
      return {
        success: true,
        message: `${t('git.dryRunCreate', { tag: tagName })}${push ? ` ${t('git.dryRunPush', { tag: tagName })}` : ''}`,
      };
    }

    const git = getGit();

    // Crear tag anotado con mensaje
    const tagMessage = message ?? t('git.defaultMessage', { tag: tagName });
    await git.addAnnotatedTag(tagName, tagMessage);

    // Obtener hash del commit
    const hash = await git.revparse(['--short', 'HEAD']);

    // Push si está habilitado
    if (push) {
      await pushTag(tagName, dryRun);
    }

    return {
      success: true,
      message: t('git.tagCreated', { tag: tagName, commit: hash }),
    };
  } catch (error) {
    return {
      success: false,
      message: t('git.errorCreating', { tag: tagName }),
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Sube un tag al remote
 * @param tagName - Nombre del tag
 * @param dryRun - Si es true, solo simula la operación
 * @returns Resultado de la operación
 */
export async function pushTag(tagName: string, dryRun = false): Promise<GitOperationResult> {
  const t = getTranslation();

  try {
    if (dryRun) {
      return {
        success: true,
        message: t('git.dryRunPush', { tag: tagName }),
      };
    }

    const git = getGit();
    await git.pushTags('origin');

    return {
      success: true,
      message: t('git.tagPushed', { tag: tagName }),
    };
  } catch (error) {
    return {
      success: false,
      message: t('git.errorPushing', { tag: tagName }),
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Elimina un tag localmente
 * @param options - Opciones de eliminación
 * @returns Resultado de la operación
 */
export async function deleteTag(options: DeleteTagOptions): Promise<GitOperationResult> {
  const { tagName, deleteRemote = true, dryRun = false } = options;
  const t = getTranslation();

  try {
    // Verificar que el tag existe
    if (!(await tagExists(tagName))) {
      return {
        success: false,
        message: t('git.tagNotFound', { tag: tagName }),
        error: new Error(t('git.tagNotFoundTitle')),
      };
    }

    if (dryRun) {
      return {
        success: true,
        message: `${t('git.dryRunDelete', { tag: tagName })}${deleteRemote ? ` ${t('git.dryRunDeleteRemote', { tag: tagName })}` : ''}`,
      };
    }

    const git = getGit();

    // Eliminar tag local
    await git.tag(['-d', tagName]);

    // Eliminar del remote si está habilitado
    if (deleteRemote) {
      await deleteRemoteTag(tagName, dryRun);
    }

    return {
      success: true,
      message: t('git.tagDeleted', { tag: tagName }),
    };
  } catch (error) {
    return {
      success: false,
      message: t('git.errorDeleting', { tag: tagName }),
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Elimina un tag del remote
 * @param tagName - Nombre del tag
 * @param dryRun - Si es true, solo simula la operación
 * @returns Resultado de la operación
 */
export async function deleteRemoteTag(
  tagName: string,
  dryRun = false
): Promise<GitOperationResult> {
  const t = getTranslation();

  try {
    if (dryRun) {
      return {
        success: true,
        message: t('git.dryRunDeleteRemote', { tag: tagName }),
      };
    }

    const git = getGit();
    await git.push('origin', `:refs/tags/${tagName}`);

    return {
      success: true,
      message: t('git.tagDeletedRemote', { tag: tagName }),
    };
  } catch (error) {
    return {
      success: false,
      message: t('git.errorDeletingRemote', { tag: tagName }),
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Obtiene el último tag (globalmente o por prefijo)
 * @param prefix - Prefijo opcional para filtrar
 * @returns Último tag o null si no hay tags
 */
export async function getLastTag(prefix?: string): Promise<Tag | null> {
  const tags = await listTags({ sortBy: '-creatordate', prefix });
  return tags.length > 0 ? tags[0] : null;
}
