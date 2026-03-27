import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as simpleGit from 'simple-git';

vi.mock('simple-git');

let gitInstance: any = null;

vi.mock('./repo.js', async () => {
  const actual = await vi.importActual<typeof import('./repo.js')>('./repo.js');
  return {
    ...actual,
    getGit: () => gitInstance,
  };
});

vi.mock('../i18n/config.js', () => ({
  getTranslation: () => (key: string, params?: Record<string, string>) => {
    const translations: Record<string, string> = {
      'git.defaultMessage': `Tag ${params?.tag}`,
      'git.tagCreated': `Tag '${params?.tag}' creado exitosamente en el commit ${params?.commit}`,
    };
    return translations[key] || key;
  },
}));

const { createTag } = await import('./tags.js');

describe('git/tags', () => {
  describe('createTag - construcción de argumentos para firma', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      gitInstance = null;
    });

    it('crea tag sin firma cuando sign es undefined', async () => {
      const mockTag = vi.fn().mockResolvedValue(undefined);
      const mockRevparse = vi.fn().mockResolvedValue('abc123');
      const mockRaw = vi.fn().mockResolvedValue('');
      gitInstance = {
        tag: mockTag,
        revparse: mockRevparse,
        raw: mockRaw,
      };

      await createTag({
        tagName: '1.0.0',
        push: false,
        dryRun: false,
      });

      expect(mockTag).toHaveBeenCalledWith(['-a', '1.0.0', '-m', 'Tag 1.0.0']);
    });

    it('agrega flag -s cuando sign es true', async () => {
      const mockTag = vi.fn().mockResolvedValue(undefined);
      const mockRevparse = vi.fn().mockResolvedValue('abc123');
      const mockRaw = vi.fn().mockResolvedValue('');
      gitInstance = {
        tag: mockTag,
        revparse: mockRevparse,
        raw: mockRaw,
      };

      await createTag({
        tagName: '1.0.0',
        push: false,
        dryRun: false,
        sign: true,
      });

      expect(mockTag).toHaveBeenCalledWith(['-a', '1.0.0', '-m', 'Tag 1.0.0', '-s']);
    });

    it('agrega flag --no-sign cuando sign es false', async () => {
      const mockTag = vi.fn().mockResolvedValue(undefined);
      const mockRevparse = vi.fn().mockResolvedValue('abc123');
      const mockRaw = vi.fn().mockResolvedValue('');
      gitInstance = {
        tag: mockTag,
        revparse: mockRevparse,
        raw: mockRaw,
      };

      await createTag({
        tagName: '1.0.0',
        push: false,
        dryRun: false,
        sign: false,
      });

      expect(mockTag).toHaveBeenCalledWith(['-a', '1.0.0', '-m', 'Tag 1.0.0', '--no-sign']);
    });

    it('agrega flag -u con keyid cuando gpgSign está definido', async () => {
      const mockTag = vi.fn().mockResolvedValue(undefined);
      const mockRevparse = vi.fn().mockResolvedValue('abc123');
      const mockRaw = vi.fn().mockResolvedValue('');
      gitInstance = {
        tag: mockTag,
        revparse: mockRevparse,
        raw: mockRaw,
      };

      await createTag({
        tagName: '1.0.0',
        push: false,
        dryRun: false,
        gpgSign: '3AA5C34371567BD2',
      });

      expect(mockTag).toHaveBeenCalledWith([
        '-a',
        '1.0.0',
        '-m',
        'Tag 1.0.0',
        '-u',
        '3AA5C34371567BD2',
      ]);
    });

    it('gpgSign tiene precedencia sobre sign', async () => {
      const mockTag = vi.fn().mockResolvedValue(undefined);
      const mockRevparse = vi.fn().mockResolvedValue('abc123');
      const mockRaw = vi.fn().mockResolvedValue('');
      gitInstance = {
        tag: mockTag,
        revparse: mockRevparse,
        raw: mockRaw,
      };

      await createTag({
        tagName: '1.0.0',
        push: false,
        dryRun: false,
        sign: true,
        gpgSign: 'KEYID',
      });

      // Debe usar -u KEYID, no -s
      expect(mockTag).toHaveBeenCalledWith(['-a', '1.0.0', '-m', 'Tag 1.0.0', '-u', 'KEYID']);
    });

    it('usa mensaje personalizado cuando se proporciona', async () => {
      const mockTag = vi.fn().mockResolvedValue(undefined);
      const mockRevparse = vi.fn().mockResolvedValue('abc123');
      const mockRaw = vi.fn().mockResolvedValue('');
      gitInstance = {
        tag: mockTag,
        revparse: mockRevparse,
        raw: mockRaw,
      };

      await createTag({
        tagName: '1.0.0',
        message: 'Release version 1.0.0',
        push: false,
        dryRun: false,
        sign: true,
      });

      expect(mockTag).toHaveBeenCalledWith(['-a', '1.0.0', '-m', 'Release version 1.0.0', '-s']);
    });
  });
});
