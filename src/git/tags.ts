import { getGit } from './repo.js';
import { parseTag } from '../domain/tag.js';
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

  try {
    // Verificar si el tag ya existe
    if (await tagExists(tagName)) {
      return {
        success: false,
        message: `El tag '${tagName}' ya existe`,
        error: new Error('Tag duplicado'),
      };
    }

    if (dryRun) {
      return {
        success: true,
        message: `[DRY RUN] Se crearía el tag '${tagName}'${push ? ' y se subiría al remote' : ''}`,
      };
    }

    const git = getGit();

    // Crear tag anotado con mensaje
    const tagMessage = message ?? `Tag ${tagName}`;
    await git.addAnnotatedTag(tagName, tagMessage);

    // Push si está habilitado
    if (push) {
      await pushTag(tagName, dryRun);
    }

    return {
      success: true,
      message: `Tag '${tagName}' creado exitosamente${push ? ' y subido al remote' : ''}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al crear tag '${tagName}'`,
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
  try {
    if (dryRun) {
      return {
        success: true,
        message: `[DRY RUN] Se subiría el tag '${tagName}' al remote`,
      };
    }

    const git = getGit();
    await git.pushTags('origin');

    return {
      success: true,
      message: `Tag '${tagName}' subido al remote`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al subir tag '${tagName}'`,
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

  try {
    // Verificar que el tag existe
    if (!(await tagExists(tagName))) {
      return {
        success: false,
        message: `El tag '${tagName}' no existe`,
        error: new Error('Tag no encontrado'),
      };
    }

    if (dryRun) {
      return {
        success: true,
        message: `[DRY RUN] Se eliminaría el tag '${tagName}'${deleteRemote ? ' local y remotamente' : ' localmente'}`,
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
      message: `Tag '${tagName}' eliminado${deleteRemote ? ' local y remotamente' : ' localmente'}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al eliminar tag '${tagName}'`,
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
  try {
    if (dryRun) {
      return {
        success: true,
        message: `[DRY RUN] Se eliminaría el tag '${tagName}' del remote`,
      };
    }

    const git = getGit();
    await git.push('origin', `:refs/tags/${tagName}`);

    return {
      success: true,
      message: `Tag '${tagName}' eliminado del remote`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al eliminar tag '${tagName}' del remote`,
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
