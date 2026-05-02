// =============================================================================
// cms.ts — Portable CMS Fetch Utility
//
// Satu file lengkap untuk mengambil file JSON dari GitHub repo via jsDelivr CDN
// (fallback ke GitHub raw). Copy file ini ke proyek manapun untuk pakai ulang.
//
// Dependensi: tidak ada (hanya Web Fetch API standar).
//
// ─── Cara Pakai ──────────────────────────────────────────────────────────────
//
//   const cms = new CmsFetcher({ owner: 'org', repo: 'repo', branch: 'content' });
//
//   // Ambil seluruh koleksi (semua .json dalam folder)
//   const posts = await cms.fetchCollection<BlogPost>('posts');
//
//   // Ambil satu entry berdasarkan slug
//   const post = await cms.fetchEntry<BlogPost>('posts', 'my-article');
//
//   // Ambil satu file berdasarkan path penuh dari root repo
//   const settings = await cms.fetchFile<SiteSettings>('data/settings.json');
//
// =============================================================================

import type { BlogPost, SiteSettings } from '../../../types/blog';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CmsSourceConfig {
  owner: string;
  repo: string;
  branch?: string;
}

export type CmsSourceOverride = Partial<CmsSourceConfig> | undefined;

// ─── Source Configuration ─────────────────────────────────────────────────────

/** Ubah nilai ini sesuai repo target proyek. */
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
  /** TTL cache commit SHA terbaru (ms). */
  latestRefTtlMs: 60 * 1000,
  /** Maks hit ke GitHub Branch API per window. */
  latestRefMaxHitsPerHour: 4,
  /** Durasi window rate-limit (ms). */
  latestRefWindowMs: 60 * 60 * 1000,
};

// ─── HTTP Utilities ───────────────────────────────────────────────────────────

const CDN_HOSTS = new Set([
  'cdn.jsdelivr.net',
  'data.jsdelivr.net',
  'raw.githubusercontent.com',
  'wsrv.nl',
  'images.weserv.nl',
  'cdn.statically.io',
]);

// Gunakan env variable ini saat development untuk simulasi CDN down.
// Contoh di .env.local: VITE_SIMULATE_ALL_CDN_DOWN=true
const SIMULATE_ALL_CDN_DOWN = import.meta.env.VITE_SIMULATE_ALL_CDN_DOWN === 'true';

function isCdnUrl(url: string): boolean {
  try {
    return CDN_HOSTS.has(new URL(url).host);
  } catch {
    return false;
  }
}

async function assertResponse(url: string): Promise<Response> {
  if (SIMULATE_ALL_CDN_DOWN && isCdnUrl(url)) {
    throw new Error(`Simulated CDN outage for ${url}`);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) to ${url}`);
  }

  return response;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await assertResponse(url);
  return (await response.json()) as T;
}

async function fetchText(url: string): Promise<string> {
  const response = await assertResponse(url);
  return response.text();
}

// ─── Internal Types ───────────────────────────────────────────────────────────

type JsDelivrFlatFileEntry = { name: string; hash: string; size: number };
type JsDelivrFlatResponse = { files: JsDelivrFlatFileEntry[] };
type GitHubBranchResponse = { commit: { sha: string } };
type ContentIndexPostEntry = {
  slug?: unknown;
  title?: unknown;
  description?: unknown;
  excerpt?: unknown;
  date?: unknown;
  tags?: unknown;
  image?: unknown;
  author?: unknown;
};
type ContentIndexFile = {
  posts?: unknown;
};

// ─── URL Builders ─────────────────────────────────────────────────────────────

function getSourceBranch(source: CmsSourceConfig): string {
  return source.branch ?? 'content';
}

function getSourceKey(source: CmsSourceConfig): string {
  return `${source.owner}/${source.repo}@${getSourceBranch(source)}`;
}

function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

function buildJsDelivrRawUrl(path: string, source: CmsSourceConfig, ref: string): string {
  return `https://cdn.jsdelivr.net/gh/${source.owner}/${source.repo}@${encodeURIComponent(ref)}/${encodePath(path)}`;
}

function buildGitHubRawUrl(path: string, source: CmsSourceConfig, ref: string): string {
  return `https://raw.githubusercontent.com/${source.owner}/${source.repo}/${encodeURIComponent(ref)}/${encodePath(path)}`;
}

function buildBranchApiUrl(source: CmsSourceConfig): string {
  return `https://api.github.com/repos/${source.owner}/${source.repo}/branches/${encodeURIComponent(getSourceBranch(source))}`;
}

function buildJsDelivrFlatApiUrl(source: CmsSourceConfig, ref: string): string {
  return `https://data.jsdelivr.com/v1/package/gh/${source.owner}/${source.repo}@${encodeURIComponent(ref)}/flat`;
}

// ─── Image URL Helpers ────────────────────────────────────────────────────────

const isAbsoluteHttpUrl = (value: string) =>
  value.startsWith('http://') || value.startsWith('https://');

function buildWeservUrl(sourceUrl: string): string {
  const params = new URLSearchParams({
    url: sourceUrl,
    q: String(IMAGE_PROXY_CONFIG.quality),
    output: 'webp',
  });

  if (IMAGE_PROXY_CONFIG.width > 0) {
    params.set('w', String(IMAGE_PROXY_CONFIG.width));
  }

  return `https://wsrv.nl/?${params.toString()}`;
}

function toOptimizedImageUrl(sourceUrl: string): string {
  try {
    return buildWeservUrl(sourceUrl);
  } catch (error) {
    console.warn('Failed to build optimized image URL, fallback to source URL', error);
    return sourceUrl;
  }
}

/**
 * Resolve URL aset konten (gambar, dsb.) dari path relatif repo atau URL absolut.
 * Path relatif akan diarahkan ke jsDelivr CDN dan dioptimasi via weserv.
 */
export const resolveContentAssetUrl = (
  assetPath: string,
  source: CmsSourceConfig = BLOG_CMS_SOURCE,
): string => {
  const trimmedPath = assetPath.trim();

  if (trimmedPath.length === 0) return '';

  if (!isAbsoluteHttpUrl(trimmedPath)) {
    const normalized = trimmedPath.replace(/^\/+/, '');
    const prefixedPath = normalized.startsWith('assets/') ? `public/${normalized}` : normalized;
    return toOptimizedImageUrl(buildJsDelivrRawUrl(prefixedPath, source, getSourceBranch(source)));
  }

  return toOptimizedImageUrl(trimmedPath);
};

/**
 * Resolve URL gambar artikel: path relatif → jsDelivr CDN → weserv.
 * Mengembalikan placeholder jika path kosong.
 */
export function resolveCmsImageUrl(
  imagePath: string | undefined,
  source: CmsSourceConfig = BLOG_CMS_SOURCE,
): string {
  if (!imagePath) return '/images/placeholder-blog.jpg';

  if (/^https?:\/\//i.test(imagePath)) return imagePath;

  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  const repoAssetPath = normalizedPath.startsWith('/images/')
    ? `/public${normalizedPath}`
    : normalizedPath;

  // Optimasi: Gunakan SHA dari cache jika tersedia agar cache CDN bersifat permanen (immutable)
  const sourceKey = getSourceKey(source);
  const cachedRef = latestContentRefCacheBySource.get(sourceKey);
  const ref = cachedRef?.ref ?? getSourceBranch(source);

  const cdnUrl = `https://cdn.jsdelivr.net/gh/${source.owner}/${source.repo}@${ref}${repoAssetPath}`;
  return toOptimizedImageUrl(cdnUrl);
}

// ─── Commit SHA Cache ─────────────────────────────────────────────────────────

const latestContentRefCacheBySource = new Map<string, { ref: string; fetchedAt: number }>();
const latestRefRequestWindowCacheBySource = new Map<string, { startsAt: number; hits: number }>();

async function getLatestContentRef(source: CmsSourceConfig): Promise<string> {
  const sourceKey = getSourceKey(source);
  const sourceBranch = getSourceBranch(source);
  const now = Date.now();

  const latestContentRefCache = latestContentRefCacheBySource.get(sourceKey);
  const latestRefRequestWindowCache = latestRefRequestWindowCacheBySource.get(sourceKey);

  if (latestContentRefCache && now - latestContentRefCache.fetchedAt < CACHE_CONFIG.latestRefTtlMs) {
    return latestContentRefCache.ref;
  }

  const windowMs = CACHE_CONFIG.latestRefWindowMs;
  const maxHits = CACHE_CONFIG.latestRefMaxHitsPerHour;

  if (!latestRefRequestWindowCache || now - latestRefRequestWindowCache.startsAt >= windowMs) {
    latestRefRequestWindowCacheBySource.set(sourceKey, { startsAt: now, hits: 0 });
  }

  const currentWindowCache = latestRefRequestWindowCacheBySource.get(sourceKey);

  if (currentWindowCache && currentWindowCache.hits >= maxHits) {
    if (latestContentRefCache) return latestContentRefCache.ref;
    console.warn(`Latest ref API hit limit reached (${maxHits}/hour), fallback to branch ref`);
    return sourceBranch;
  }

  if (currentWindowCache) {
    currentWindowCache.hits += 1;
    latestRefRequestWindowCacheBySource.set(sourceKey, currentWindowCache);
  }

  try {
    const branchResponse = await fetchJson<GitHubBranchResponse>(buildBranchApiUrl(source));
    const ref = branchResponse.commit.sha;
    latestContentRefCacheBySource.set(sourceKey, { ref, fetchedAt: now });
    return ref;
  } catch (error) {
    console.warn('Failed to resolve latest commit SHA, fallback to branch ref', error);
    return sourceBranch;
  }
}

// ─── JSON Parse Helper ────────────────────────────────────────────────────────

function parseJsonContent<T>(rawText: string, sourcePath: string): T {
  try {
    return JSON.parse(rawText.trim()) as T;
  } catch (error) {
    throw new Error(`Content at ${sourcePath} is not valid JSON`, { cause: error });
  }
}

function toStringOrNull(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => toStringOrNull(item))
    .filter((item): item is string => Boolean(item));
}

function mapContentIndexPosts(data: ContentIndexFile): BlogPost[] | null {
  if (!Array.isArray(data.posts)) {
    return null;
  }

  const mapped = data.posts
    .map((entry): BlogPost | null => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const item = entry as ContentIndexPostEntry;
      const slug = toStringOrNull(item.slug);

      if (!slug) {
        return null;
      }

      const title = toStringOrNull(item.title) ?? slug;
      const excerpt = toStringOrNull(item.description) ?? toStringOrNull(item.excerpt) ?? undefined;
      const date = toStringOrNull(item.date) ?? '1970-01-01';
      const image = toStringOrNull(item.image) ?? undefined;
      const author = toStringOrNull(item.author) ?? undefined;

      return {
        slug,
        title,
        excerpt,
        date,
        image,
        author,
        tags: toStringArray(item.tags),
        body: '',
      };
    })
    .filter((item): item is BlogPost => Boolean(item))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  return mapped;
}

async function getPostsFromContentIndex(source: CmsSourceConfig): Promise<BlogPost[] | null> {
  const branchRef = getSourceBranch(source);
  const sourceKey = getSourceKey(source);
  const cachedRef = latestContentRefCacheBySource.get(sourceKey)?.ref;

  const refsToTry = [branchRef, cachedRef].filter((ref, index, arr): ref is string =>
    typeof ref === 'string' && ref.length > 0 && arr.indexOf(ref) === index,
  );

  for (const ref of refsToTry) {
    try {
      const contentIndex = await getDetailByRawPath<ContentIndexFile>('content-index.json', source, ref);
      const mappedPosts = mapContentIndexPosts(contentIndex);

      if (mappedPosts) {
        return mappedPosts;
      }

      console.warn('content-index.json ditemukan tapi format posts tidak valid, fallback ke koleksi posts/*.json');
      return null;
    } catch (error) {
      console.warn(`Gagal mengambil content-index.json dari ref ${ref}`, error);
    }
  }

  console.warn('Gagal mengambil content-index.json, fallback ke koleksi posts/*.json');
  return null;
}

async function getDetailByRawPath<T>(
  path: string,
  source: CmsSourceConfig,
  ref?: string,
): Promise<T> {
  const targetRef = ref ?? (await getLatestContentRef(source));

  try {
    const rawText = await fetchText(buildJsDelivrRawUrl(path, source, targetRef));
    return parseJsonContent<T>(rawText, path);
  } catch (error) {
    console.warn('Failed to fetch detail from jsDelivr, fallback to GitHub raw', error);
    const rawText = await fetchText(buildGitHubRawUrl(path, source, targetRef));
    return parseJsonContent<T>(rawText, path);
  }
}

// ─── CmsFetcher ───────────────────────────────────────────────────────────────

/**
 * CmsFetcher adalah modul reusable untuk mengambil konten JSON dari GitHub repo
 * via jsDelivr CDN (fallback ke GitHub raw).
 *
 * @example
 * const cms = new CmsFetcher({ owner: 'org', repo: 'repo', branch: 'content' });
 *
 * // Semua .json dalam folder → array
 * const posts = await cms.fetchCollection<BlogPost>('posts');
 *
 * // Satu entry berdasarkan slug
 * const post = await cms.fetchEntry<BlogPost>('posts', 'my-article');
 *
 * // Satu file berdasarkan path penuh dari root repo
 * const settings = await cms.fetchFile<SiteSettings>('data/settings.json');
 */
export class CmsFetcher {
  defaultSource: CmsSourceConfig;
  basePath: string;

  constructor(defaultSource: CmsSourceConfig, basePath: string = 'content') {
    this.defaultSource = defaultSource;
    this.basePath = basePath;
  }

  /**
   * Ambil semua file `.json` dalam folder di dalam `basePath`.
   * @example cms.fetchCollection<BlogPost>('posts') // → BlogPost[]
   */
  async fetchCollection<T>(
    folder: string,
    source: CmsSourceConfig = this.defaultSource,
  ): Promise<T[]> {
    const normalizedFolder = folder.trim().replace(/^\/+|\/+$/g, '');

    if (normalizedFolder === 'posts') {
      const postsFromIndex = await getPostsFromContentIndex(source);

      if (postsFromIndex) {
        return postsFromIndex as T[];
      }
    }

    const latestRef = await getLatestContentRef(source);
    const response = await fetchJson<JsDelivrFlatResponse>(
      buildJsDelivrFlatApiUrl(source, latestRef),
    );

    const folderPath = `${this.basePath}/${normalizedFolder}`.replace(/^\/+|\/+$/g, '');
    const folderPrefix = `/${folderPath}/`;

    const entryFiles = response.files
      .filter((entry) => entry.name.startsWith(folderPrefix) && entry.name.endsWith('.json'))
      .sort((a, b) => a.name.localeCompare(b.name));

    return Promise.all(
      entryFiles.map((file) =>
        getDetailByRawPath<T>(file.name.replace(/^\/+/, ''), source, latestRef),
      ),
    );
  }

  /**
   * Ambil satu file `.json` berdasarkan slug di dalam folder.
   * @example cms.fetchEntry<BlogPost>('posts', 'my-article')
   */
  async fetchEntry<T>(
    folder: string,
    slug: string,
    source: CmsSourceConfig = this.defaultSource,
  ): Promise<T> {
    const safeSlug = slug.trim();

    if (!safeSlug) throw new Error('Invalid entry slug.');

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
   * Ambil satu file `.json` berdasarkan path penuh dari root repo.
   * @example cms.fetchFile<SiteSettings>('data/settings.json')
   */
  async fetchFile<T>(path: string, source: CmsSourceConfig = this.defaultSource): Promise<T> {
    const latestRef = await getLatestContentRef(source);
    return getDetailByRawPath<T>(path, source, latestRef);
  }
}

// ─── Default Instance ─────────────────────────────────────────────────────────

/** Instance siap pakai untuk proyek pengikut-raja-capybara/blog. */
export const blogCmsFetcher = new CmsFetcher(BLOG_CMS_SOURCE, 'content');

// ─── Blog-specific Exports ────────────────────────────────────────────────────

export async function fetchPosts(source: CmsSourceConfig = BLOG_CMS_SOURCE): Promise<BlogPost[]> {
  return blogCmsFetcher.fetchCollection<BlogPost>('posts', source);
}

export async function fetchPostBySlug(
  slug: string,
  source: CmsSourceConfig = BLOG_CMS_SOURCE,
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
  source: CmsSourceConfig = BLOG_CMS_SOURCE,
): Promise<SiteSettings> {
  return blogCmsFetcher.fetchFile<SiteSettings>('data/settings.json', source);
}
