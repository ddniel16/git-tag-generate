export interface Tag {
  fullName: string;
  prefix?: string;
  version: string;
  date?: string;
  hash?: string;
}

export interface TagGroup {
  prefix: string | null;
  tags: Tag[];
  latest: Tag;
}

export type SemVerLevel =
  | 'patch'
  | 'minor'
  | 'major'
  | 'prepatch'
  | 'preminor'
  | 'premajor'
  | 'prerelease';

export interface CliArgs {
  command?: string;
  level?: SemVerLevel;
  noPush?: boolean;
  dryRun?: boolean;
  prefixes?: boolean;
  beta?: boolean;
  alpha?: boolean;
  id?: string;
}

export interface GitOperationResult {
  success: boolean;
  message: string;
  error?: Error;
}

export interface CreateTagOptions {
  tagName: string;
  message?: string;
  push?: boolean;
  dryRun?: boolean;
}

export interface DeleteTagOptions {
  tagName: string;
  deleteRemote?: boolean;
  dryRun?: boolean;
}

export interface ListTagsOptions {
  sortBy?: string;
  prefix?: string;
}

export interface BranchWarning {
  currentBranch: string;
  isMain: boolean;
  shouldWarn: boolean;
}
