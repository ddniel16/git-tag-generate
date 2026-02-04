import { describe, it, expect } from 'vitest';
import {
  isValidSemVer,
  isPrerelease,
  incrementVersion,
  getNextVersion,
  compareVersions,
  getPrereleaseId,
  DEFAULT_INITIAL_VERSION,
} from './semver.js';

describe('domain/semver', () => {
  describe('isValidSemVer', () => {
    it('valida versiones SemVer correctas', () => {
      expect(isValidSemVer('1.0.0')).toBe(true);
      expect(isValidSemVer('0.0.1')).toBe(true);
      expect(isValidSemVer('2.3.4-beta.1')).toBe(true);
    });

    it('rechaza versiones inválidas', () => {
      expect(isValidSemVer('1.0')).toBe(false);
      expect(isValidSemVer('1.0.0.0')).toBe(false);
      expect(isValidSemVer('invalid')).toBe(false);
    });
  });

  describe('isPrerelease', () => {
    it('detecta versiones prerelease', () => {
      expect(isPrerelease('1.0.0-beta.1')).toBe(true);
      expect(isPrerelease('2.0.0-alpha.0')).toBe(true);
      expect(isPrerelease('1.0.0-rc.3')).toBe(true);
    });

    it('rechaza versiones estables', () => {
      expect(isPrerelease('1.0.0')).toBe(false);
      expect(isPrerelease('0.0.1')).toBe(false);
    });
  });

  describe('incrementVersion', () => {
    it('incrementa patch', () => {
      expect(incrementVersion('1.0.0', 'patch')).toBe('1.0.1');
      expect(incrementVersion('0.0.1', 'patch')).toBe('0.0.2');
    });

    it('incrementa minor', () => {
      expect(incrementVersion('1.0.5', 'minor')).toBe('1.1.0');
      expect(incrementVersion('0.0.1', 'minor')).toBe('0.1.0');
    });

    it('incrementa major', () => {
      expect(incrementVersion('1.2.3', 'major')).toBe('2.0.0');
      expect(incrementVersion('0.5.0', 'major')).toBe('1.0.0');
    });

    it('crea prepatch con identificador', () => {
      expect(incrementVersion('1.0.0', 'prepatch', 'beta')).toBe('1.0.1-beta.0');
      expect(incrementVersion('0.0.1', 'prepatch', 'alpha')).toBe('0.0.2-alpha.0');
    });

    it('crea preminor con identificador', () => {
      expect(incrementVersion('1.0.0', 'preminor', 'beta')).toBe('1.1.0-beta.0');
    });

    it('crea premajor con identificador', () => {
      expect(incrementVersion('1.0.0', 'premajor', 'beta')).toBe('2.0.0-beta.0');
    });

    it('incrementa prerelease existente', () => {
      expect(incrementVersion('1.0.0-beta.0', 'prerelease', 'beta')).toBe('1.0.0-beta.1');
      expect(incrementVersion('1.0.0-beta.5', 'prerelease', 'beta')).toBe('1.0.0-beta.6');
    });

    it('usa beta por defecto para niveles pre* sin id', () => {
      expect(incrementVersion('1.0.0', 'prepatch')).toBe('1.0.1-beta.0');
    });
  });

  describe('getNextVersion', () => {
    it('retorna versión inicial si no hay tag previo', () => {
      expect(getNextVersion(null, 'patch')).toBe(DEFAULT_INITIAL_VERSION);
      expect(getNextVersion(null, 'minor')).toBe(DEFAULT_INITIAL_VERSION);
    });

    it('incrementa desde versión existente', () => {
      expect(getNextVersion('1.0.0', 'patch')).toBe('1.0.1');
      expect(getNextVersion('0.0.1', 'minor')).toBe('0.1.0');
    });
  });

  describe('compareVersions', () => {
    it('compara versiones correctamente', () => {
      expect(compareVersions('1.0.0', '2.0.0')).toBeLessThan(0);
      expect(compareVersions('2.0.0', '1.0.0')).toBeGreaterThan(0);
      expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
    });
  });

  describe('getPrereleaseId', () => {
    it('extrae identificador de prerelease', () => {
      expect(getPrereleaseId('1.0.0-beta.1')).toBe('beta');
      expect(getPrereleaseId('1.0.0-alpha.0')).toBe('alpha');
      expect(getPrereleaseId('2.0.0-rc.3')).toBe('rc');
    });

    it('retorna null para versiones estables', () => {
      expect(getPrereleaseId('1.0.0')).toBe(null);
      expect(getPrereleaseId('0.0.1')).toBe(null);
    });
  });
});
