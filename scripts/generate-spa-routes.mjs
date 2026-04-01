import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DIST_DIR = process.env.DIST_DIR ?? 'dist';
const CONTENT_OWNER = (process.env.CONTENT_OWNER ?? 'pengikut-raja-capybara').trim();
const CONTENT_REPO = (process.env.CONTENT_REPO ?? 'blog').trim();
const CONTENT_BRANCH = (process.env.CONTENT_BRANCH ?? 'content').trim();
const CONTENT_POSTS_PATH = trimSlashes(process.env.CONTENT_POSTS_PATH ?? 'content/posts');
const STATIC_ROUTES = (process.env.STATIC_ROUTES ?? 'about,contact')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)
  .map((value) => value.replace(/^\/+|\/+$/g, ''));

const githubHeaders = {
  Accept: 'application/vnd.github+json',
};

if (process.env.GITHUB_TOKEN) {
  githubHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

function trimSlashes(value) {
  return value.replace(/^\/+|\/+$/g, '');
}

function parseSlugFromFileName(fileName) {
  const slug = fileName.replace(/\.json$/i, '').trim();
  return slug.length > 0 ? slug : null;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Request failed (${response.status}) to ${url}\n${body}`);
  }

  return response.json();
}

async function getPostSlugs() {
  const encodedPath = encodeURI(CONTENT_POSTS_PATH);
  const apiUrl = `https://api.github.com/repos/${CONTENT_OWNER}/${CONTENT_REPO}/contents/${encodedPath}?ref=${encodeURIComponent(CONTENT_BRANCH)}`;
  const entries = await fetchJson(apiUrl, { headers: githubHeaders });

  if (!Array.isArray(entries)) {
    throw new Error('Invalid response from GitHub contents API.');
  }

  return entries
    .filter((entry) => entry.type === 'file' && entry.name.endsWith('.json'))
    .map((entry) => parseSlugFromFileName(entry.name))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

async function createRouteFile(routePath, indexHtml) {
  const normalized = routePath.replace(/^\/+|\/+$/g, '');

  if (!normalized) {
    return;
  }

  const targetDir = path.join(DIST_DIR, normalized);
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, 'index.html'), indexHtml, 'utf8');
}

async function main() {
  const indexPath = path.join(DIST_DIR, 'index.html');
  const indexHtml = await readFile(indexPath, 'utf8');

  let postSlugs = [];

  try {
    postSlugs = await getPostSlugs();
  } catch (error) {
    console.warn('Failed to fetch post slugs. Proceeding with static routes only.', error);
  }

  const allRoutes = [...new Set([...STATIC_ROUTES, ...postSlugs])];
  await Promise.all(allRoutes.map((route) => createRouteFile(route, indexHtml)));

  console.log(`Generated SPA route files: ${allRoutes.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
