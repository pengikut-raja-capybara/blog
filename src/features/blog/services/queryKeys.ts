import type { CmsSourceConfig } from './cms';

function serializeCmsSource(source: CmsSourceConfig): string {
  return `${source.owner}/${source.repo}@${source.branch}`;
}

export const blogQueryKeys = {
  posts: (source: CmsSourceConfig) => ['cms', 'posts', serializeCmsSource(source)] as const,
  settings: (source: CmsSourceConfig) => ['cms', 'settings', serializeCmsSource(source)] as const,
  post: (source: CmsSourceConfig, slug: string | undefined) =>
    ['cms', 'post', serializeCmsSource(source), slug] as const,
};
