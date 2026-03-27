import { describe, it, expect, vi, beforeEach } from 'vitest';
import { simpleGit } from 'simple-git';

vi.mock('simple-git');

describe('git/repo', () => {
  describe('getConfig', () => {
    let repo: typeof import('./repo.js');

    beforeEach(async () => {
      vi.clearAllMocks();
      vi.resetModules();

      // Importar el módulo después de resetear
      repo = await import('./repo.js');
    });

    it('retorna el valor de configuración cuando existe', async () => {
      const mockRaw = vi.fn().mockResolvedValue('true\n');
      vi.mocked(simpleGit).mockReturnValue({
        raw: mockRaw,
      } as any);

      const result = await repo.getConfig('tag.gpgSign');

      expect(result).toBe('true');
      expect(mockRaw).toHaveBeenCalledWith(['config', '--get', 'tag.gpgSign']);
    });

    it('retorna null cuando la configuración no existe', async () => {
      const mockRaw = vi.fn().mockRejectedValue(new Error('Config not found'));
      vi.mocked(simpleGit).mockReturnValue({
        raw: mockRaw,
      } as any);

      const result = await repo.getConfig('tag.gpgSign');

      expect(result).toBe(null);
    });

    it('retorna null cuando el valor está vacío', async () => {
      const mockRaw = vi.fn().mockResolvedValue('');
      vi.mocked(simpleGit).mockReturnValue({
        raw: mockRaw,
      } as any);

      const result = await repo.getConfig('some.config');

      expect(result).toBe(null);
    });

    it('trimea espacios en blanco del valor', async () => {
      const mockRaw = vi.fn().mockResolvedValue('  false  \n');
      vi.mocked(simpleGit).mockReturnValue({
        raw: mockRaw,
      } as any);

      const result = await repo.getConfig('tag.gpgSign');

      expect(result).toBe('false');
    });
  });
});
