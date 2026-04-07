import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Detecta el idioma del sistema desde las variables de entorno
 * @returns 'es' | 'en' - Código del idioma detectado
 */
function detectSystemLanguage(): 'es' | 'en' {
  // Obtener idioma desde variables de entorno
  const envLang = process.env.LANG ?? process.env.LANGUAGE ?? process.env.LC_ALL ?? '';

  // Extraer código de idioma (ej: "es_ES.UTF-8" -> "es")
  const langCode = envLang.split('_')[0]?.toLowerCase() ?? '';

  // Si es español, devolver 'es', sino 'en' por defecto
  return langCode === 'es' ? 'es' : 'en';
}

/**
 * Inicializa i18next con configuración optimizada
 */
export async function initI18n(): Promise<void> {
  const systemLang = detectSystemLanguage();

  // La ruta debe ser relativa al archivo dist/app.js
  // Los archivos JSON están en dist/i18n/locales/
  const loadPath = path.join(__dirname, 'i18n', 'locales', '{{lng}}.json');

  await i18next.use(Backend).init({
    // Idioma detectado del sistema
    lng: systemLang,

    // Idioma de fallback
    fallbackLng: 'en',

    // Idiomas soportados
    supportedLngs: ['es', 'en'],

    // Namespace por defecto
    defaultNS: 'translation',
    ns: ['translation'],

    // Configuración del backend (archivos JSON)
    backend: {
      loadPath,
    },

    // Interpolación
    interpolation: {
      escapeValue: false, // No necesario en Node.js
    },

    // Debug en desarrollo
    debug: false,
  });
}

/**
 * Obtiene la función de traducción
 * @returns Función t() de i18next
 */
export function getTranslation(): (typeof i18next)['t'] {
  return i18next.t.bind(i18next);
}

/**
 * Cambia el idioma en tiempo de ejecución
 * @param lang - Código del idioma ('es' | 'en')
 */
export async function changeLanguage(lang: 'es' | 'en'): Promise<void> {
  await i18next.changeLanguage(lang);
}

/**
 * Obtiene el idioma actual
 * @returns Código del idioma actual
 */
export function getCurrentLanguage(): string {
  return i18next.language;
}
