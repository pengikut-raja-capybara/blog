import type { CmsSourceConfig, CmsSourceOverride } from '../types/cms';

export function resolveCmsSource(
  baseSource: CmsSourceConfig,
  overrideSource?: CmsSourceOverride,
): CmsSourceConfig {
  if (!overrideSource) {
    return baseSource;
  }

  return {
    owner: overrideSource.owner ?? baseSource.owner,
    repo: overrideSource.repo ?? baseSource.repo,
    branch: overrideSource.branch ?? baseSource.branch,
  };
}

export function resolveCmsSourceFromEnv(baseSource: CmsSourceConfig): CmsSourceConfig {
  const envOwner = import.meta.env.VITE_CMS_OWNER?.trim();
  const envRepo = import.meta.env.VITE_CMS_REPO?.trim();
  const envBranch = import.meta.env.VITE_CMS_BRANCH?.trim();

  return resolveCmsSource(baseSource, {
    owner: envOwner || undefined,
    repo: envRepo || undefined,
    branch: envBranch || undefined,
  });
}
