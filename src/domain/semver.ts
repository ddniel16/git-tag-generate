import semver from 'semver';
import type { SemVerLevel } from '../types/index.js';

/**
 * Versión inicial por defecto para nuevos tags
 */
export const DEFAULT_INITIAL_VERSION = '0.0.1';

/**
 * Valida si una versión cumple con el formato SemVer
 * @param version - Versión a validar
 * @returns true si es válida
 */
export function isValidSemVer(version: string): boolean {
  // Enfoque estricto: no permitir prefijo 'v' ni formatos abreviados
  // Patrón básico SemVer: MAJOR.MINOR.PATCH con prerelease opcional
  const strictPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-.]+)?$/;
  if (!strictPattern.test(version)) {
    return false;
  }
  return semver.valid(version) !== null;
}

/**
 * Verifica si una versión es prerelease (beta, alpha, rc, etc.)
 * @param version - Versión a verificar
 * @returns true si es prerelease
 */
export function isPrerelease(version: string): boolean {
  const parsed = semver.parse(version);
  return parsed !== null && parsed.prerelease.length > 0;
}

/**
 * Incrementa una versión según el nivel especificado
 * @param currentVersion - Versión actual
 * @param level - Nivel de incremento
 * @param prereleaseId - Identificador para prerelease (beta, alpha, rc)
 * @returns Nueva versión incrementada
 */
export function incrementVersion(
  currentVersion: string,
  level: SemVerLevel,
  prereleaseId?: string
): string | null {
  // Para niveles de prerelease, necesitamos un identificador
  if (
    (level === 'prepatch' ||
      level === 'preminor' ||
      level === 'premajor' ||
      level === 'prerelease') &&
    !prereleaseId
  ) {
    prereleaseId = 'beta'; // Default a beta si no se especifica
  }

  // semver.inc requiere que prereleaseId sea string si se pasa
  if (prereleaseId) {
    return semver.inc(currentVersion, level, prereleaseId);
  }

  return semver.inc(currentVersion, level);
}

/**
 * Obtiene la siguiente versión basándose en el último tag
 * Si no hay tag previo, retorna la versión inicial (0.0.1)
 * @param lastVersion - Última versión (null si no existe)
 * @param level - Nivel de incremento
 * @param prereleaseId - Identificador para prerelease
 * @returns Nueva versión
 */
export function getNextVersion(
  lastVersion: string | null,
  level: SemVerLevel,
  prereleaseId?: string
): string {
  // Si no hay versión previa, retornar versión inicial
  if (!lastVersion) {
    return DEFAULT_INITIAL_VERSION;
  }

  const nextVersion = incrementVersion(lastVersion, level, prereleaseId);

  if (!nextVersion) {
    throw new Error(`No se pudo incrementar la versión ${lastVersion} con nivel ${level}`);
  }

  return nextVersion;
}

/**
 * Compara dos versiones semver
 * @param v1 - Primera versión
 * @param v2 - Segunda versión
 * @returns -1 si v1 < v2, 0 si v1 === v2, 1 si v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  return semver.compare(v1, v2);
}

/**
 * Extrae el identificador de prerelease de una versión
 * @param version - Versión a analizar
 * @returns Identificador de prerelease o null
 */
export function getPrereleaseId(version: string): string | null {
  const parsed = semver.parse(version);
  if (!parsed || parsed.prerelease.length === 0) {
    return null;
  }

  // El primer elemento del prerelease suele ser el identificador (beta, alpha, rc)
  return String(parsed.prerelease[0]);
}
