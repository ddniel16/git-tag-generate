import { describe, it, expect } from 'vitest';
import { normalizePrefix, isValidPrefix } from './slug.js';

describe('utils/slug', () => {
  describe('normalizePrefix', () => {
    it('convierte a minúsculas', () => {
      expect(normalizePrefix('MyApp')).toBe('myapp');
      expect(normalizePrefix('PROJECT')).toBe('project');
    });

    it('reemplaza espacios por guiones', () => {
      expect(normalizePrefix('my app')).toBe('my-app');
      expect(normalizePrefix('my  app')).toBe('my-app');
    });

    it('reemplaza guiones bajos por guiones', () => {
      expect(normalizePrefix('my_app')).toBe('my-app');
      expect(normalizePrefix('my__app')).toBe('my-app');
    });

    it('elimina caracteres especiales', () => {
      expect(normalizePrefix('my@app!')).toBe('myapp');
      expect(normalizePrefix('my#app$')).toBe('myapp');
    });

    it('elimina guiones al inicio y final', () => {
      expect(normalizePrefix('-myapp-')).toBe('myapp');
      expect(normalizePrefix('--myapp--')).toBe('myapp');
    });

    it('maneja múltiples guiones consecutivos', () => {
      expect(normalizePrefix('my---app')).toBe('my-app');
    });

    it('maneja casos complejos', () => {
      expect(normalizePrefix('  My Cool App! v2  ')).toBe('my-cool-app-v2');
    });
  });

  describe('isValidPrefix', () => {
    it('acepta prefijos válidos', () => {
      expect(isValidPrefix('myapp')).toBe(true);
      expect(isValidPrefix('my-app')).toBe(true);
      expect(isValidPrefix('app123')).toBe(true);
      expect(isValidPrefix('my-app-v2')).toBe(true);
    });

    it('rechaza prefijos inválidos', () => {
      expect(isValidPrefix('')).toBe(false);
      expect(isValidPrefix('  ')).toBe(false);
      expect(isValidPrefix('-myapp')).toBe(false);
      expect(isValidPrefix('myapp-')).toBe(false);
      expect(isValidPrefix('My-App')).toBe(false);
      expect(isValidPrefix('my_app')).toBe(false);
      expect(isValidPrefix('my@app')).toBe(false);
    });
  });
});
