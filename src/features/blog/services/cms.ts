import type { BlogPost, SiteSettings } from '../../../types/blog';

export interface CmsSourceConfig {
  owner: string;
  repo: string;
  branch?: string;
}

const DEFAULT_BRANCH = 'content';

interface JsDelivrFlatFile {
  name: string;
}

interface JsDelivrFlatResponse {
  files: JsDelivrFlatFile[];
}

function buildCdnBaseUrl({ owner, repo, branch = DEFAULT_BRANCH }: CmsSourceConfig) {
  return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}`;
}

function buildDataApiFlatUrl({ owner, repo, branch = DEFAULT_BRANCH }: CmsSourceConfig) {
  return `https://data.jsdelivr.com/v1/package/gh/${owner}/${repo}@${branch}/flat`;
}

function ensureArrayOfPosts(data: unknown): BlogPost[] {
  if (!Array.isArray(data)) {
    throw new Error('Invalid posts payload: expected an array.');
  }

  return data as BlogPost[];
}

function ensureFlatResponse(data: unknown): JsDelivrFlatResponse {
  if (!data || typeof data !== 'object' || !Array.isArray((data as JsDelivrFlatResponse).files)) {
    throw new Error('Invalid jsDelivr flat payload: expected files array.');
  }

  return data as JsDelivrFlatResponse;
}

function getPostJsonPaths(files: JsDelivrFlatFile[]): string[] {
  return files
    .map((file) => file.name)
    .filter((name) => name.startsWith('/content/posts/') && name.endsWith('.json'))
    .sort();
}

export function resolveCmsImageUrl(imagePath: string | undefined, source: CmsSourceConfig): string {
  if (!imagePath) {
    return '/images/placeholder-blog.jpg';
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  const baseUrl = buildCdnBaseUrl(source);
  return imagePath.startsWith('/') ? `${baseUrl}${imagePath}` : `${baseUrl}/${imagePath}`;
}

export async function fetchPosts(source: CmsSourceConfig): Promise<BlogPost[]> {
  const listResponse = await fetch(buildDataApiFlatUrl(source));

  if (!listResponse.ok) {
    throw new Error(`Failed to fetch posts index: ${listResponse.status}`);
  }

  const listPayload: unknown = await listResponse.json();
  const flatData = ensureFlatResponse(listPayload);
  const postPaths = getPostJsonPaths(flatData.files);

  const baseUrl = buildCdnBaseUrl(source);
  const postResponses = await Promise.all(
    postPaths.map(async (path) => {
      const postResponse = await fetch(`${baseUrl}${path}`);

      if (!postResponse.ok) {
        throw new Error(`Failed to fetch post file ${path}: ${postResponse.status}`);
      }

      return (await postResponse.json()) as BlogPost;
    }),
  );

  return ensureArrayOfPosts(postResponses);
}

export async function fetchPostBySlug(
  source: CmsSourceConfig,
  slug: string,
): Promise<BlogPost> {
  const safeSlug = slug.trim();

  if (!safeSlug) {
    throw new Error('Invalid post slug.');
  }

  const baseUrl = buildCdnBaseUrl(source);
  const response = await fetch(`${baseUrl}/content/posts/${safeSlug}.json`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Artikel tidak ditemukan.');
    }

    throw new Error(`Failed to fetch post detail: ${response.status}`);
  }

  return (await response.json()) as BlogPost;
}

export async function fetchSiteSettings(source: CmsSourceConfig): Promise<SiteSettings> {
  const baseUrl = buildCdnBaseUrl(source);
  const response = await fetch(`${baseUrl}/data/settings.json`);

  if (!response.ok) {
    throw new Error(`Failed to fetch site settings: ${response.status}`);
  }

  return (await response.json()) as SiteSettings;
}
