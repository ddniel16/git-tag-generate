import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default [
  // Archivos a procesar
  {
    files: ['src/**/*.ts'],
  },

  // Archivos y directorios a ignorar
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', '*.js', '**/*.spec.ts'],
  },

  // Configuración base de ESLint
  eslint.configs.recommended,

  // Configuración principal de TypeScript
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Entorno Node.js
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Reglas recomendadas de TypeScript
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs['recommended-type-checked'].rules,

      // Reglas personalizadas existentes del proyecto
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',

      // Reglas estrictas para async/await (crítico para CLI con operaciones Git)
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/require-await': 'error',

      // Reglas para imports de tipos consistentes (mejora tree-shaking)
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],

      // Preferir nullish coalescing sobre OR lógico (mejor con strict null checks)
      '@typescript-eslint/prefer-nullish-coalescing': 'error',

      // Detectar condiciones innecesarias
      '@typescript-eslint/no-unnecessary-condition': 'error',

      // Detectar type assertions innecesarias
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',

      // Requerir switch exhaustivo (útil para tipos discriminados en domain/)
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
    },
  },

  // Configuración de Prettier (DEBE ir al final para desactivar reglas conflictivas)
  eslintConfigPrettier,
];
