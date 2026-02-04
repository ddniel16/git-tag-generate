/**
 * Normaliza un string para usarlo como prefijo de tag
 * Convierte a minúsculas, reemplaza espacios y caracteres especiales por guiones
 * @param text - Texto a normalizar
 * @returns String normalizado apto para prefijo
 */
export function normalizePrefix(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-') // Espacios y guiones bajos a guiones
    .replace(/[^\w-]/g, '') // Eliminar caracteres no alfanuméricos excepto guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno solo
    .replace(/^-|-$/g, ''); // Eliminar guiones al inicio y final
}

/**
 * Valida si un prefijo tiene formato válido
 * @param prefix - Prefijo a validar
 * @returns true si es válido
 */
export function isValidPrefix(prefix: string): boolean {
  if (!prefix || prefix.trim().length === 0) {
    return false;
  }
  // Solo letras minúsculas, números y guiones, no puede empezar/terminar con guion
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(prefix);
}
