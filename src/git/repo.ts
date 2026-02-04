import { simpleGit, type SimpleGit } from 'simple-git';
import type { BranchWarning } from '../types/index.js';

let gitInstance: SimpleGit | null = null;

/**
 * Obtiene la instancia de SimpleGit (singleton)
 * @param baseDir - Directorio base del repositorio
 * @returns Instancia de SimpleGit
 */
export function getGit(baseDir = process.cwd()): SimpleGit {
  gitInstance ??= simpleGit(baseDir);
  return gitInstance;
}

/**
 * Verifica si el directorio actual es un repositorio Git
 * @returns true si es un repositorio Git válido
 */
export async function isGitRepo(): Promise<boolean> {
  try {
    const git = getGit();
    await git.status();
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifica si existe un remote específico
 * @param remoteName - Nombre del remote (default: 'origin')
 * @returns true si el remote existe
 */
export async function hasRemote(remoteName = 'origin'): Promise<boolean> {
  try {
    const git = getGit();
    const remotes = await git.getRemotes(false);
    return remotes.some((remote) => remote.name === remoteName);
  } catch {
    return false;
  }
}

/**
 * Obtiene la rama actual
 * @returns Nombre de la rama actual
 */
export async function getCurrentBranch(): Promise<string> {
  const git = getGit();
  const status = await git.status();
  return status.current ?? 'unknown';
}

/**
 * Verifica el estado de la rama y retorna advertencias si no es main/master
 * @returns Información sobre la rama actual
 */
export async function checkBranchStatus(): Promise<BranchWarning> {
  const currentBranch = await getCurrentBranch();
  const mainBranches = ['main', 'master'];
  const isMain = mainBranches.includes(currentBranch);

  return {
    currentBranch,
    isMain,
    shouldWarn: !isMain,
  };
}

/**
 * Obtiene la URL del remote origin
 * @returns URL del remote o null si no existe
 */
export async function getRemoteUrl(remoteName = 'origin'): Promise<string | null> {
  try {
    const git = getGit();
    const remotes = await git.getRemotes(true);
    const remote = remotes.find((r) => r.name === remoteName);
    return remote?.refs.fetch ?? null;
  } catch {
    return null;
  }
}
