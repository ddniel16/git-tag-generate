import { styleText } from 'node:util';

/**
 * Formatea un error para mostrar al usuario
 * @param error - Error a formatear
 * @returns Mensaje formateado
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Muestra un mensaje de error y termina el proceso
 * @param message - Mensaje de error
 * @param exitCode - Código de salida (default: 1)
 */
export function exitWithError(message: string, exitCode = 1): never {
  console.error(styleText('red', '✗'), message);
  process.exit(exitCode);
}

/**
 * Muestra un mensaje de éxito
 * @param message - Mensaje de éxito
 */
export function showSuccess(message: string): void {
  console.log(styleText('green', '✓'), message);
}

/**
 * Muestra un mensaje de advertencia
 * @param message - Mensaje de advertencia
 */
export function showWarning(message: string): void {
  console.log(styleText('yellow', '⚠'), message);
}

/**
 * Muestra un mensaje informativo
 * @param message - Mensaje informativo
 */
export function showInfo(message: string): void {
  console.log(styleText('blue', 'ℹ'), message);
}
