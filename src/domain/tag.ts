import type { Tag } from '../types/index.js';

/**
 * Parsea un tag completo separando prefijo y versión
 * Formato esperado: "prefix-1.0.0" o "1.0.0" (sin prefijo)
 * @param fullTag - Nombre completo del tag
 * @returns Objeto Tag con prefijo (opcional) y versión
 */
export function parseTag(fullTag: string): Tag {
  const trimmedTag = fullTag.trim();

  // Buscar patrón: prefijo-version o solo version
  // Si hay guion, lo que está antes es prefijo, después es versión
  const match = trimmedTag.match(/^(.+)-(\d+\.\d+\.\d+(?:-[\w.]+)?)$/);

  if (!match) {
    // No hay guion con formato válido, es solo versión (sin prefijo)
    return {
      fullName: trimmedTag,
      version: trimmedTag,
    };
  }

  const [, prefixPart, version] = match;

  if (!prefixPart || prefixPart.trim() === '') {
    // Sin prefijo
    return {
      fullName: trimmedTag,
      version,
    };
  }

  return {
    fullName: trimmedTag,
    prefix: prefixPart,
    version,
  };
}

/**
 * Formatea un tag completo a partir de prefijo y versión
 * @param version - Versión semver
 * @param prefix - Prefijo opcional
 * @returns Tag completo formateado
 */
export function formatTag(version: string, prefix?: string): string {
  if (!prefix || prefix.trim() === '') {
    return version;
  }
  return `${prefix}-${version}`;
}

/**
 * Extrae todos los prefijos únicos de una lista de tags
 * @param tags - Lista de tags
 * @returns Array de prefijos únicos (puede incluir null para tags sin prefijo)
 */
export function extractPrefixes(tags: Tag[]): (string | null)[] {
  const prefixSet = new Set<string | null>();

  for (const tag of tags) {
    prefixSet.add(tag.prefix ?? null);
  }

  return Array.from(prefixSet);
}

/**
 * Filtra tags por prefijo específico
 * @param tags - Lista de tags
 * @param prefix - Prefijo a filtrar (null para tags sin prefijo)
 * @returns Tags que coinciden con el prefijo
 */
export function filterByPrefix(tags: Tag[], prefix: string | null): Tag[] {
  return tags.filter((tag) => {
    if (prefix === null) {
      return !tag.prefix;
    }
    return tag.prefix === prefix;
  });
}
