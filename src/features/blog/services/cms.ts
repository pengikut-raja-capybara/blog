import type { BlogPost, SiteSettings } from '../../../types/blog';
import { BLOG_CMS_SOURCE, CACHE_CONFIG, IMAGE_PROXY_CONFIG } from '../config/cmsSource';

export interface CmsSourceConfig {
  owner: string;
  repo: string;
  branch?: string;
}

const GITHUB_OWNER = BLOG_CMS_SOURCE.owner;
const GITHUB_REPO = BLOG_CMS_SOURCE.repo;
const GITHUB_BRANCH = BLOG_CMS_SOURCE.branch ?? 'content';
const GITHUB_BASE_PATH = 'content';

const CONTENT_FOLDER = 'posts';
const SETTINGS_PATH = 'data/settings.json';
// const CONTENT_IMAGE_PROXY = IMAGE_PROXY_CONFIG.proxy;
const CONTENT_IMAGE_QUALITY = IMAGE_PROXY_CONFIG.quality;
const CONTENT_IMAGE_WIDTH = IMAGE_PROXY_CONFIG.width;
const SIMULATE_ALL_CDN_DOWN = import.meta.env.VITE_SIMULATE_ALL_CDN_DOWN === 'true';

let latestContentRefCache: {
  ref: string;
  fetchedAt: number;
} | null = null;

let latestRefRequestWindowCache: {
  startsAt: number;
  hits: number;
} | null = null;

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

const buildBranchApiUrl = () => {
  return `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/branches/${encodeURIComponent(GITHUB_BRANCH)}`;
};

const buildRawUrl = (path: string, ref: string = GITHUB_BRANCH) => {
  const encodedPath = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `https://cdn.jsdelivr.net/gh/${GITHUB_OWNER}/${GITHUB_REPO}@${encodeURIComponent(ref)}/${encodedPath}`;
};

const buildGitHubRawUrl = (path: string, ref: string = GITHUB_BRANCH) => {
  const encodedPath = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${encodeURIComponent(ref)}/${encodedPath}`;
};

const buildJsDelivrFlatApiUrl = (ref: string = GITHUB_BRANCH) => {
  return `https://data.jsdelivr.com/v1/package/gh/${GITHUB_OWNER}/${GITHUB_REPO}@${encodeURIComponent(ref)}/flat`;
};

const isAbsoluteHttpUrl = (value: string) => {
  return value.startsWith('http://') || value.startsWith('https://');
};

const CDN_HOSTS = new Set([
  'cdn.jsdelivr.net',
  'data.jsdelivr.com',
  'raw.githubusercontent.com',
  'images.weserv.nl',
  'cdn.statically.io',
]);

const isCdnUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return CDN_HOSTS.has(parsedUrl.host);
  } catch {
    return false;
  }
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

export const resolveContentAssetUrl = (assetPath: string): string => {
  const trimmedPath = assetPath.trim();

  if (trimmedPath.length === 0) {
    return '';
  }

  if (!isAbsoluteHttpUrl(trimmedPath)) {
    const normalized = trimmedPath.replace(/^\/+/, '');
    const prefixedPath = normalized.startsWith('assets/') ? `public/${normalized}` : normalized;

    return toOptimizedImageUrl(buildRawUrl(prefixedPath));
  }

  return toOptimizedImageUrl(trimmedPath);
};

export function resolveCmsImageUrl(imagePath: string | undefined, source: CmsSourceConfig): string {
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

  const cdnUrl = `https://cdn.jsdelivr.net/gh/${source.owner}/${source.repo}@${source.branch ?? 'main'}${repoAssetPath}`;
  return toOptimizedImageUrl(cdnUrl);
}

const parseJsonContent = <T>(rawText: string, sourcePath: string): T => {
  try {
    return JSON.parse(rawText.trim()) as T;
  } catch (error) {
    throw new Error(`Content at ${sourcePath} is not valid JSON`, { cause: error });
  }
};

const fetchJson = async <T>(url: string): Promise<T> => {
  if (SIMULATE_ALL_CDN_DOWN && isCdnUrl(url)) {
    throw new Error(`Simulated CDN outage for ${url}`);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) to ${url}`);
  }

  return (await response.json()) as T;
};

const fetchText = async (url: string): Promise<string> => {
  if (SIMULATE_ALL_CDN_DOWN && isCdnUrl(url)) {
    throw new Error(`Simulated CDN outage for ${url}`);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) to ${url}`);
  }

  return response.text();
};

const getLatestContentRef = async (): Promise<string> => {
  const now = Date.now();

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
    latestRefRequestWindowCache = {
      startsAt: now,
      hits: 0,
    };
  }

  if (latestRefRequestWindowCache.hits >= maxHits) {
    if (latestContentRefCache) {
      return latestContentRefCache.ref;
    }

    console.warn(
      `Latest ref API hit limit reached (${maxHits}/hour), fallback to branch ref`,
    );
    return GITHUB_BRANCH;
  }

  latestRefRequestWindowCache.hits += 1;

  try {
    const branchResponse = await fetchJson<GitHubBranchResponse>(buildBranchApiUrl());
    const ref = branchResponse.commit.sha;

    latestContentRefCache = {
      ref,
      fetchedAt: now,
    };

    return ref;
  } catch (error) {
    console.warn('Failed to resolve latest commit SHA, fallback to branch ref', error);
    return GITHUB_BRANCH;
  }
};

const getDetailByRawPath = async <T>(path: string, ref?: string): Promise<T> => {
  const targetRef = ref ?? (await getLatestContentRef());

  try {
    const rawUrl = buildRawUrl(path, targetRef);
    const rawText = await fetchText(rawUrl);

    return parseJsonContent<T>(rawText, path);
  } catch (error) {
    console.warn('Failed to fetch detail from jsDelivr, fallback to GitHub raw', error);
    const rawText = await fetchText(buildGitHubRawUrl(path, targetRef));
    return parseJsonContent<T>(rawText, path);
  }
};

export async function fetchPosts(): Promise<BlogPost[]> {
  const latestRef = await getLatestContentRef();
  const response = await fetchJson<JsDelivrFlatResponse>(buildJsDelivrFlatApiUrl(latestRef));

  const folderPath = `${GITHUB_BASE_PATH}/${CONTENT_FOLDER}`.replace(/^\/+|\/+$/g, '');
  const folderPrefix = `/${folderPath}/`;

  const postFiles = response.files
    .filter((entry) => entry.name.startsWith(folderPrefix) && entry.name.endsWith('.json'))
    .sort((a, b) => a.name.localeCompare(b.name));

  const posts = await Promise.all(
    postFiles.map(async (file) => {
      const normalizedPath = file.name.replace(/^\/+/, '');
      return getDetailByRawPath<BlogPost>(normalizedPath, latestRef);
    }),
  );

  return posts;
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost> {
  const safeSlug = slug.trim();

  if (!safeSlug) {
    throw new Error('Invalid post slug.');
  }

  const path = `${GITHUB_BASE_PATH}/${CONTENT_FOLDER}/${safeSlug}.json`;
  const latestRef = await getLatestContentRef();

  try {
    return await getDetailByRawPath<BlogPost>(path, latestRef);
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      throw new Error('Artikel tidak ditemukan.');
    }
    throw error;
  }
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const path = SETTINGS_PATH;
  const latestRef = await getLatestContentRef();
  return getDetailByRawPath<SiteSettings>(path, latestRef);
}
