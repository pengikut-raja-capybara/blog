import { writeFile } from 'node:fs/promises';

const SITE_URL = (process.env.SITE_URL?.trim() || 'https://pengikut-raja-capybara.github.io');
const APP_BASE_PATH = normalizeBasePath(process.env.APP_BASE_PATH ?? '/blog');
const CONTENT_OWNER = (process.env.CONTENT_OWNER ?? 'pengikut-raja-capybara').trim();
const CONTENT_REPO = (process.env.CONTENT_REPO ?? 'blog').trim();
const CONTENT_BRANCH = (process.env.CONTENT_BRANCH ?? 'content').trim();
const CONTENT_POSTS_PATH = trimSlashes(process.env.CONTENT_POSTS_PATH ?? 'content/posts');
const OUTPUT_PATH = process.env.SITEMAP_OUTPUT_PATH ?? 'dist/sitemap.xml';

const githubHeaders = {
  Accept: 'application/vnd.github+json',
};

if (process.env.GITHUB_TOKEN) {
  githubHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

function trimSlashes(value) {
  return value.replace(/^\/+|\/+$/g, '');
}

function normalizeBasePath(value) {
  const trimmed = value.trim();

  if (!trimmed || trimmed === '/') {
    return '';
  }

  return `/${trimSlashes(trimmed)}`;
}

function normalizeSiteUrl(value) {
  return value.replace(/\/$/, '');
}

function buildUrl(pathname) {
  const base = normalizeSiteUrl(SITE_URL);
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const pathWithSlash = normalizedPath.endsWith('/') ? normalizedPath : `${normalizedPath}/`;
  return `${base}${pathWithSlash}`;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Request failed (${response.status}) to ${url}\n${body}`);
  }

  return response.json();
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function getPostFileEntries() {
  const encodedPath = encodeURI(CONTENT_POSTS_PATH);
  const apiUrl = `https://api.github.com/repos/${CONTENT_OWNER}/${CONTENT_REPO}/contents/${encodedPath}?ref=${encodeURIComponent(CONTENT_BRANCH)}`;

  const entries = await fetchJson(apiUrl, { headers: githubHeaders });

  if (!Array.isArray(entries)) {
    throw new Error('Invalid response from GitHub contents API.');
  }

  return entries.filter((entry) => entry.type === 'file' && entry.name.endsWith('.json'));
}

function parseSlugFromFileName(fileName) {
  const slugCandidate = fileName.replace(/\.json$/i, '').trim();
  return slugCandidate.length > 0 ? slugCandidate : null;
}

function buildSitemapXml(urlEntries) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const entry of urlEntries) {
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(entry.loc)}</loc>`);
    if (entry.lastmod) {
      lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
    }
    if (entry.changefreq) {
      lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    }
    if (entry.priority) {
      lines.push(`    <priority>${entry.priority}</priority>`);
    }
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  lines.push('');

  return lines.join('\n');
}

async function main() {
  const files = await getPostFileEntries();
  const posts = files
    .map((entry) => parseSlugFromFileName(entry.name))
    .filter(Boolean)
    .map((slug) => ({
      slug,
      lastmod: null,
    }));

  const urls = [
    {
      loc: buildUrl(`${APP_BASE_PATH}/`),
      changefreq: 'daily',
      priority: '1.0',
      lastmod: null,
    },
    {
      loc: buildUrl(`${APP_BASE_PATH}/about`),
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: null,
    },
    {
      loc: buildUrl(`${APP_BASE_PATH}/contact`),
      changefreq: 'monthly',
      priority: '0.6',
      lastmod: null,
    },
    ...posts
      .map((post) => ({
        loc: buildUrl(`${APP_BASE_PATH}/${encodeURIComponent(post.slug)}`),
        changefreq: 'weekly',
        priority: '0.8',
        lastmod: post.lastmod,
      }))
      .sort((a, b) => a.loc.localeCompare(b.loc)),
  ];

  const xml = buildSitemapXml(urls);
  await writeFile(OUTPUT_PATH, xml, 'utf8');

  console.log(`Generated sitemap with ${urls.length} URLs -> ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
