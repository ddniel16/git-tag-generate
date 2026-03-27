import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNewTag } from './tagService.js';
import * as gitTags from '../git/tags.js';
import * as gitRepo from '../git/repo.js';

vi.mock('../git/tags.js');
vi.mock('../git/repo.js');
vi.mock('../domain/semver.js', () => ({
  isValidSemVer: vi.fn((v: string) => /^\d+\.\d+\.\d+/.test(v)),
}));
vi.mock('../domain/tag.js', () => ({
  formatTag: vi.fn((version: string, prefix?: string) =>
    prefix ? `${prefix}-${version}` : version
  ),
}));
vi.mock('../i18n/config.js', () => ({
  getTranslation: () => (key: string) => key,
}));

describe('services/tagService', () => {
  describe('createNewTag - lectura de configuración de firma', () => {
    beforeEach(() => {
      vi.clearAllMocks();

      // Mock por defecto: tag no existe
      vi.mocked(gitTags.tagExists).mockResolvedValue(false);

      // Mock por defecto: createTag exitoso
      vi.mocked(gitTags.createTag).mockResolvedValue({
        success: true,
        message: 'Tag creado',
      });
    });

    it('no firma cuando no hay configuración tag.gpgSign', async () => {
      vi.mocked(gitRepo.getConfig).mockResolvedValue(null);

      await createNewTag('1.0.0', undefined, {
        push: false,
        dryRun: false,
      });

      expect(gitTags.createTag).toHaveBeenCalledWith(
        expect.objectContaining({
          sign: undefined,
          gpgSign: undefined,
        })
      );
    });

    it('firma cuando tag.gpgSign=true', async () => {
      vi.mocked(gitRepo.getConfig).mockResolvedValue('true');

      await createNewTag('1.0.0', undefined, {
        push: false,
        dryRun: false,
      });

      expect(gitTags.createTag).toHaveBeenCalledWith(
        expect.objectContaining({
          sign: true,
        })
      );
    });

    it('no firma cuando tag.gpgSign=false', async () => {
      vi.mocked(gitRepo.getConfig).mockResolvedValue('false');

      await createNewTag('1.0.0', undefined, {
        push: false,
        dryRun: false,
      });

      expect(gitTags.createTag).toHaveBeenCalledWith(
        expect.objectContaining({
          sign: undefined,
        })
      );
    });

    it('flag --sign tiene precedencia sobre config', async () => {
      vi.mocked(gitRepo.getConfig).mockResolvedValue('false');

      await createNewTag('1.0.0', undefined, {
        push: false,
        dryRun: false,
        sign: true,
      });

      expect(gitTags.createTag).toHaveBeenCalledWith(
        expect.objectContaining({
          sign: true,
        })
      );
    });

    it('flag --no-sign tiene precedencia sobre config', async () => {
      vi.mocked(gitRepo.getConfig).mockResolvedValue('true');

      await createNewTag('1.0.0', undefined, {
        push: false,
        dryRun: false,
        sign: false,
      });

      expect(gitTags.createTag).toHaveBeenCalledWith(
        expect.objectContaining({
          sign: false,
        })
      );
    });

    it('pasa gpgSign cuando se proporciona', async () => {
      vi.mocked(gitRepo.getConfig).mockResolvedValue(null);

      await createNewTag('1.0.0', undefined, {
        push: false,
        dryRun: false,
        gpgSign: '3AA5C34371567BD2',
      });

      expect(gitTags.createTag).toHaveBeenCalledWith(
        expect.objectContaining({
          gpgSign: '3AA5C34371567BD2',
        })
      );
    });

    it('continúa sin firma cuando falla lectura de config', async () => {
      vi.mocked(gitRepo.getConfig).mockRejectedValue(new Error('Git error'));

      await createNewTag('1.0.0', undefined, {
        push: false,
        dryRun: false,
      });

      expect(gitTags.createTag).toHaveBeenCalledWith(
        expect.objectContaining({
          sign: undefined,
        })
      );
    });

    it('gpgSign tiene precedencia sobre lectura de config', async () => {
      vi.mocked(gitRepo.getConfig).mockResolvedValue('true');

      await createNewTag('1.0.0', undefined, {
        push: false,
        dryRun: false,
        gpgSign: 'KEYID',
      });

      // No debe leer config si ya hay gpgSign
      expect(gitTags.createTag).toHaveBeenCalledWith(
        expect.objectContaining({
          sign: undefined,
          gpgSign: 'KEYID',
        })
      );
    });
  });
});
