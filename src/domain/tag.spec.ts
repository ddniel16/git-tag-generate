import { describe, it, expect } from 'vitest';
import { parseTag, formatTag, extractPrefixes, filterByPrefix } from './tag.js';
import type { Tag } from '../../types/index.js';

describe('domain/tag', () => {
  describe('parseTag', () => {
    it('parsea tag con prefijo y versión', () => {
      const result = parseTag('project-1.0.0');
      expect(result).toEqual({
        fullName: 'project-1.0.0',
        prefix: 'project',
        version: '1.0.0',
      });
    });

    it('parsea tag con prefijo multi-palabra', () => {
      const result = parseTag('my-app-2.3.4');
      expect(result).toEqual({
        fullName: 'my-app-2.3.4',
        prefix: 'my-app',
        version: '2.3.4',
      });
    });

    it('parsea tag sin prefijo', () => {
      const result = parseTag('1.0.0');
      expect(result).toEqual({
        fullName: '1.0.0',
        version: '1.0.0',
      });
    });

    it('parsea tag con prerelease', () => {
      const result = parseTag('app-1.0.0-beta.1');
      expect(result).toEqual({
        fullName: 'app-1.0.0-beta.1',
        prefix: 'app',
        version: '1.0.0-beta.1',
      });
    });

    it('parsea tag prerelease sin prefijo', () => {
      const result = parseTag('1.0.0-alpha.0');
      expect(result).toEqual({
        fullName: '1.0.0-alpha.0',
        version: '1.0.0-alpha.0',
      });
    });
  });

  describe('formatTag', () => {
    it('formatea tag con prefijo', () => {
      expect(formatTag('1.0.0', 'project')).toBe('project-1.0.0');
    });

    it('formatea tag sin prefijo', () => {
      expect(formatTag('1.0.0')).toBe('1.0.0');
      expect(formatTag('1.0.0', '')).toBe('1.0.0');
    });

    it('formatea tag con prerelease', () => {
      expect(formatTag('1.0.0-beta.1', 'app')).toBe('app-1.0.0-beta.1');
    });
  });

  describe('extractPrefixes', () => {
    it('extrae prefijos únicos', () => {
      const tags: Tag[] = [
        { fullName: 'app-1.0.0', prefix: 'app', version: '1.0.0' },
        { fullName: 'app-1.0.1', prefix: 'app', version: '1.0.1' },
        { fullName: 'lib-2.0.0', prefix: 'lib', version: '2.0.0' },
        { fullName: '3.0.0', version: '3.0.0' },
      ];

      const prefixes = extractPrefixes(tags);
      expect(prefixes).toHaveLength(3);
      expect(prefixes).toContain('app');
      expect(prefixes).toContain('lib');
      expect(prefixes).toContain(null);
    });
  });

  describe('filterByPrefix', () => {
    const tags: Tag[] = [
      { fullName: 'app-1.0.0', prefix: 'app', version: '1.0.0' },
      { fullName: 'app-1.0.1', prefix: 'app', version: '1.0.1' },
      { fullName: 'lib-2.0.0', prefix: 'lib', version: '2.0.0' },
      { fullName: '3.0.0', version: '3.0.0' },
    ];

    it('filtra por prefijo específico', () => {
      const filtered = filterByPrefix(tags, 'app');
      expect(filtered).toHaveLength(2);
      expect(filtered.every((t) => t.prefix === 'app')).toBe(true);
    });

    it('filtra tags sin prefijo', () => {
      const filtered = filterByPrefix(tags, null);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].fullName).toBe('3.0.0');
    });
  });
});
