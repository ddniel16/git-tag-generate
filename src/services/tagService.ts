import * as gitTags from '../git/tags.js';
import * as gitRepo from '../git/repo.js';
import { extractPrefixes, filterByPrefix, formatTag } from '../domain/tag.js';
import { getNextVersion, isValidSemVer } from '../domain/semver.js';
import type { Tag, TagGroup, SemVerLevel, CreateTagOptions } from '../types/index.js';

/**
 * Obtiene todos los tags agrupados por prefijo
 * @returns Array de grupos de tags
 */
export async function groupByPrefix(): Promise<TagGroup[]> {
  const allTags = await gitTags.listTags({ sortBy: '-creatordate' });
  const prefixes = extractPrefixes(allTags);

  const groups: TagGroup[] = [];

  for (const prefix of prefixes) {
    const tagsInGroup = filterByPrefix(allTags, prefix);
    if (tagsInGroup.length > 0) {
      groups.push({
        prefix,
        tags: tagsInGroup,
        latest: tagsInGroup[0], // Ya están ordenados por fecha
      });
    }
  }

  return groups;
}

/**
 * Obtiene el último tag, opcionalmente filtrado por prefijo
 * @param prefix - Prefijo opcional
 * @returns Último tag o null
 */
export async function getLastTag(prefix?: string): Promise<Tag | null> {
  return gitTags.getLastTag(prefix);
}

/**
 * Valida que un tag sea único
 * @param tagName - Nombre del tag a validar
 * @returns true si es único
 */
export async function validateNewTag(tagName: string): Promise<boolean> {
  return !(await gitTags.tagExists(tagName));
}

/**
 * Crea un nuevo tag con validaciones
 * @param version - Versión del tag
 * @param prefix - Prefijo opcional
 * @param options - Opciones adicionales
 * @returns Resultado de la operación
 */
export async function createNewTag(
  version: string,
  prefix: string | undefined,
  options: Partial<CreateTagOptions> = {}
): Promise<{ success: boolean; message: string; tagName?: string }> {
  // Validar formato SemVer
  if (!isValidSemVer(version)) {
    return {
      success: false,
      message: `La versión '${version}' no es válida según SemVer`,
    };
  }

  const tagName = formatTag(version, prefix);

  // Validar unicidad
  if (!(await validateNewTag(tagName))) {
    return {
      success: false,
      message: `El tag '${tagName}' ya existe`,
    };
  }

  // Crear tag
  const result = await gitTags.createTag({
    tagName,
    message: options.message,
    push: options.push ?? true,
    dryRun: options.dryRun ?? false,
  });

  return {
    success: result.success,
    message: result.message,
    tagName: result.success ? tagName : undefined,
  };
}

/**
 * Genera el siguiente tag basado en el último existente
 * @param level - Nivel de incremento SemVer
 * @param prefix - Prefijo opcional
 * @param prereleaseId - Identificador de prerelease
 * @param options - Opciones adicionales
 * @returns Resultado con el nuevo tag
 */
export async function generateNextTag(
  level: SemVerLevel,
  prefix: string | undefined,
  prereleaseId: string | undefined,
  options: Partial<CreateTagOptions> = {}
): Promise<{ success: boolean; message: string; tagName?: string }> {
  // Obtener último tag con el mismo prefijo
  const lastTag = await getLastTag(prefix);
  const lastVersion = lastTag?.version ?? null;

  // Calcular siguiente versión
  const nextVersion = getNextVersion(lastVersion, level, prereleaseId);

  // Crear el tag
  return createNewTag(nextVersion, prefix, options);
}

/**
 * Verifica el estado de la rama actual
 * @returns Información sobre la rama
 */
export async function checkBranchStatus() {
  return gitRepo.checkBranchStatus();
}
