import type { BlogPost, SiteSettings } from '../../../types/blog';
import { BLOG_CMS_SOURCE, CACHE_CONFIG, IMAGE_PROXY_CONFIG } from '../config/cmsSource';
import { fetchJson, fetchText } from './cmsHttp';
import { resolveCmsSourceFromEnv } from './cmsSourceResolver';
import type { CmsSourceConfig } from '../types/cms';

export type { CmsSourceConfig } from '../types/cms';

const DEFAULT_CMS_SOURCE = resolveCmsSourceFromEnv(BLOG_CMS_SOURCE);
const DEFAULT_CMS_BRANCH = DEFAULT_CMS_SOURCE.branch ?? 'content';
// const CONTENT_IMAGE_PROXY = IMAGE_PROXY_CONFIG.proxy;
const CONTENT_IMAGE_QUALITY = IMAGE_PROXY_CONFIG.quality;
const CONTENT_IMAGE_WIDTH = IMAGE_PROXY_CONFIG.width;

const latestContentRefCacheBySource = new Map<string, { ref: string; fetchedAt: number }>();
const latestRefRequestWindowCacheBySource = new Map<string, { startsAt: number; hits: number }>();

type JsDelivrFlatFileEntry = {
  name: string;
  hash: string;
  size: number;
};

type JsDelivrFlatResponse = {
  files: JsDelivrFlatFileEntry[];
};

type GitHubBranchResponse = {
  commit: {
    sha: string;
  };
};

const getSourceKey = (source: CmsSourceConfig): string => {
  return `${source.owner}/${source.repo}@${source.branch ?? DEFAULT_CMS_BRANCH}`;
};

const getSourceBranch = (source: CmsSourceConfig): string => {
  return source.branch ?? DEFAULT_CMS_BRANCH;
};

const buildBranchApiUrl = (source: CmsSourceConfig) => {
  return `https://api.github.com/repos/${source.owner}/${source.repo}/branches/${encodeURIComponent(getSourceBranch(source))}`;
};

const buildRawUrl = (
  path: string,
  source: CmsSourceConfig,
  ref: string = getSourceBranch(source),
) => {
  const encodedPath = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `https://cdn.jsdelivr.net/gh/${source.owner}/${source.repo}@${encodeURIComponent(ref)}/${encodedPath}`;
};

const buildGitHubRawUrl = (
  path: string,
  source: CmsSourceConfig,
  ref: string = getSourceBranch(source),
) => {
  const encodedPath = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `https://raw.githubusercontent.com/${source.owner}/${source.repo}/${encodeURIComponent(ref)}/${encodedPath}`;
};

const buildJsDelivrFlatApiUrl = (
  source: CmsSourceConfig,
  ref: string = getSourceBranch(source),
) => {
  return `https://data.jsdelivr.com/v1/package/gh/${source.owner}/${source.repo}@${encodeURIComponent(ref)}/flat`;
};

const isAbsoluteHttpUrl = (value: string) => {
  return value.startsWith('http://') || value.startsWith('https://');
};

const buildWeservUrl = (sourceUrl: string): string => {
  const parsed = new URL(sourceUrl);
  const weservSource = `${parsed.protocol === 'https:' ? 'ssl:' : ''}${parsed.host}${parsed.pathname}${parsed.search}`;
  const params = new URLSearchParams({
    url: weservSource,
    q: Number.isFinite(CONTENT_IMAGE_QUALITY) ? String(CONTENT_IMAGE_QUALITY) : '75',
    output: 'webp',
  });

  if (Number.isFinite(CONTENT_IMAGE_WIDTH) && CONTENT_IMAGE_WIDTH > 0) {
    params.set('w', String(CONTENT_IMAGE_WIDTH));
  }

  return `https://images.weserv.nl/?${params.toString()}`;
};

// const buildStaticallyUrl = (sourceUrl: string): string => {
//   const normalizedSource = sourceUrl.replace(/^https?:\/\//, '');
//   const params = new URLSearchParams({
//     quality: Number.isFinite(CONTENT_IMAGE_QUALITY) ? String(CONTENT_IMAGE_QUALITY) : '75',
//     f: 'auto',
//   });

//   return `https://cdn.statically.io/img/${encodeURIComponent(normalizedSource)}?${params.toString()}`;
// };

const toOptimizedImageUrl = (sourceUrl: string): string => {
  try {
    // if (CONTENT_IMAGE_PROXY === 'none') {
    //   return sourceUrl;
    // }

    // if (CONTENT_IMAGE_PROXY === 'statically') {
    //   return buildStaticallyUrl(sourceUrl);
    // }

    return buildWeservUrl(sourceUrl);
  } catch (error) {
    console.warn('Failed to build optimized image URL, fallback to source URL', error);
    return sourceUrl;
  }
};

export const resolveContentAssetUrl = (
  assetPath: string,
  source: CmsSourceConfig = DEFAULT_CMS_SOURCE,
): string => {
  const trimmedPath = assetPath.trim();

  if (trimmedPath.length === 0) {
    return '';
  }

  if (!isAbsoluteHttpUrl(trimmedPath)) {
    const normalized = trimmedPath.replace(/^\/+/, '');
    const prefixedPath = normalized.startsWith('assets/') ? `public/${normalized}` : normalized;

    return toOptimizedImageUrl(buildRawUrl(prefixedPath, source));
  }

  return toOptimizedImageUrl(trimmedPath);
};

export function resolveCmsImageUrl(
  imagePath: string | undefined,
  source: CmsSourceConfig = DEFAULT_CMS_SOURCE,
): string {
  if (!imagePath) {
    return '/images/placeholder-blog.jpg';
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  const repoAssetPath = normalizedPath.startsWith('/images/')
    ? `/public${normalizedPath}`
    : normalizedPath;

  const cdnUrl = `https://cdn.jsdelivr.net/gh/${source.owner}/${source.repo}@${getSourceBranch(source)}${repoAssetPath}`;
  return toOptimizedImageUrl(cdnUrl);
}

const parseJsonContent = <T>(rawText: string, sourcePath: string): T => {
  try {
    return JSON.parse(rawText.trim()) as T;
  } catch (error) {
    throw new Error(`Content at ${sourcePath} is not valid JSON`, { cause: error });
  }
};

const getLatestContentRef = async (source: CmsSourceConfig): Promise<string> => {
  const sourceKey = getSourceKey(source);
  const sourceBranch = getSourceBranch(source);
  const now = Date.now();
  const latestContentRefCache = latestContentRefCacheBySource.get(sourceKey);
  const latestRefRequestWindowCache = latestRefRequestWindowCacheBySource.get(sourceKey);

  if (
    latestContentRefCache &&
    now - latestContentRefCache.fetchedAt < CACHE_CONFIG.latestRefTtlMs
  ) {
    return latestContentRefCache.ref;
  }

  const windowMs = CACHE_CONFIG.latestRefWindowMs;
  const maxHits = CACHE_CONFIG.latestRefMaxHitsPerHour;

  if (
    !latestRefRequestWindowCache ||
    now - latestRefRequestWindowCache.startsAt >= windowMs
  ) {
    latestRefRequestWindowCacheBySource.set(sourceKey, {
      startsAt: now,
      hits: 0,
    });
  }

  const currentWindowCache = latestRefRequestWindowCacheBySource.get(sourceKey);

  if (currentWindowCache && currentWindowCache.hits >= maxHits) {
    if (latestContentRefCache) {
      return latestContentRefCache.ref;
    }

    console.warn(
      `Latest ref API hit limit reached (${maxHits}/hour), fallback to branch ref`,
    );
    return sourceBranch;
  }

  if (currentWindowCache) {
    currentWindowCache.hits += 1;
    latestRefRequestWindowCacheBySource.set(sourceKey, currentWindowCache);
  }

  try {
    const branchResponse = await fetchJson<GitHubBranchResponse>(buildBranchApiUrl(source));
    const ref = branchResponse.commit.sha;

    latestContentRefCacheBySource.set(sourceKey, {
      ref,
      fetchedAt: now,
    });

    return ref;
  } catch (error) {
    console.warn('Failed to resolve latest commit SHA, fallback to branch ref', error);
    return sourceBranch;
  }
};

const getDetailByRawPath = async <T>(
  path: string,
  source: CmsSourceConfig,
  ref?: string,
): Promise<T> => {
  const targetRef = ref ?? (await getLatestContentRef(source));

  try {
    const rawUrl = buildRawUrl(path, source, targetRef);
    const rawText = await fetchText(rawUrl);

    return parseJsonContent<T>(rawText, path);
  } catch (error) {
    console.warn('Failed to fetch detail from jsDelivr, fallback to GitHub raw', error);
    const rawText = await fetchText(buildGitHubRawUrl(path, source, targetRef));
    return parseJsonContent<T>(rawText, path);
  }
};

/**
 * CmsFetcher is a reusable module to fetch JSON contents from a GitHub repository
 * using JsDelivr and GitHub raw API.
 */
export class CmsFetcher {
  defaultSource: CmsSourceConfig;
  basePath: string;

  constructor(defaultSource: CmsSourceConfig, basePath: string = 'content') {
    this.defaultSource = defaultSource;
    this.basePath = basePath;
  }

  /**
   * Fetches all JSON files inside a specific folder within the base path.
   */
  async fetchCollection<T>(folder: string, source: CmsSourceConfig = this.defaultSource): Promise<T[]> {
    const latestRef = await getLatestContentRef(source);
    const response = await fetchJson<JsDelivrFlatResponse>(buildJsDelivrFlatApiUrl(source, latestRef));

    const folderPath = `${this.basePath}/${folder}`.replace(/^\/+|\/+$/g, '');
    const folderPrefix = `/${folderPath}/`;

    const entryFiles = response.files
      .filter((entry) => entry.name.startsWith(folderPrefix) && entry.name.endsWith('.json'))
      .sort((a, b) => a.name.localeCompare(b.name));

    const items = await Promise.all(
      entryFiles.map(async (file) => {
        const normalizedPath = file.name.replace(/^\/+/, '');
        return getDetailByRawPath<T>(normalizedPath, source, latestRef);
      }),
    );

    return items;
  }

  /**
   * Fetches a specific JSON file based on its slug inside the given folder.
   */
  async fetchEntry<T>(folder: string, slug: string, source: CmsSourceConfig = this.defaultSource): Promise<T> {
    const safeSlug = slug.trim();

    if (!safeSlug) {
      throw new Error('Invalid entry slug.');
    }

    const folderPath = `${this.basePath}/${folder}`.replace(/^\/+|\/+$/g, '');
    const path = `${folderPath}/${safeSlug}.json`;
    const latestRef = await getLatestContentRef(source);

    try {
      return await getDetailByRawPath<T>(path, source, latestRef);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Konten tidak ditemukan.');
      }
      throw error;
    }
  }

  /**
   * Fetches a specific JSON file given its relative path.
   */
  async fetchFile<T>(path: string, source: CmsSourceConfig = this.defaultSource): Promise<T> {
    const latestRef = await getLatestContentRef(source);
    return getDetailByRawPath<T>(path, source, latestRef);
  }
}

// -----------------------------------------------------
// Legacy / Current Blog Specific Exports
// -----------------------------------------------------

export const blogCmsFetcher = new CmsFetcher(DEFAULT_CMS_SOURCE, 'content');

export async function fetchPosts(source: CmsSourceConfig = DEFAULT_CMS_SOURCE): Promise<BlogPost[]> {
  return blogCmsFetcher.fetchCollection<BlogPost>('posts', source);
}

export async function fetchPostBySlug(
  slug: string,
  source: CmsSourceConfig = DEFAULT_CMS_SOURCE,
): Promise<BlogPost> {
  try {
    return await blogCmsFetcher.fetchEntry<BlogPost>('posts', slug, source);
  } catch (error) {
     if (error instanceof Error && error.message.includes('tidak ditemukan')) {
        throw new Error('Artikel tidak ditemukan.');
     }
     throw error;
  }
}

export async function fetchSiteSettings(
  source: CmsSourceConfig = DEFAULT_CMS_SOURCE,
): Promise<SiteSettings> {
  return blogCmsFetcher.fetchFile<SiteSettings>('data/settings.json', source);
}
