import type { CmsSourceConfig } from '../services/cms';

export const BLOG_CMS_SOURCE: CmsSourceConfig = {
  owner: 'pengikut-raja-capybara',
  repo: 'blog',
  branch: 'content',
};

export const IMAGE_PROXY_CONFIG = {
  proxy: 'weserv' as const,
  quality: 75,
  width: 1200,
};

export const CACHE_CONFIG = {
  latestRefTtlMs: 60 * 1000,
  latestRefMaxHitsPerHour: 4,
  latestRefWindowMs: 60 * 60 * 1000,
};
