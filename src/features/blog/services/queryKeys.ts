import type { CmsSourceConfig } from '../types/cms';

export const blogQueryKeys = {
  posts: (source: CmsSourceConfig) => ['cms', 'posts', source] as const,
  settings: (source: CmsSourceConfig) => ['cms', 'settings', source] as const,
  post: (source: CmsSourceConfig, slug: string | undefined) =>
    ['cms', 'post', source, slug] as const,
};
