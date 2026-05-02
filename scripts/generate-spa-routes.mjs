import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DIST_DIR = process.env.DIST_DIR ?? 'dist';
const SITE_URL = (process.env.SITE_URL?.trim() || 'https://pengikut-raja-capybara.github.io').replace(/\/$/, '');
const APP_BASE_PATH = normalizeBasePath(process.env.APP_BASE_PATH ?? '/blog');
const CONTENT_OWNER = (process.env.CONTENT_OWNER ?? 'pengikut-raja-capybara').trim();
const CONTENT_REPO = (process.env.CONTENT_REPO ?? 'blog').trim();
const CONTENT_BRANCH = (process.env.CONTENT_BRANCH ?? 'content').trim();
const CONTENT_POSTS_PATH = trimSlashes(process.env.CONTENT_POSTS_PATH ?? 'content/posts');
const CONTENT_TOC_FILENAME = (process.env.CONTENT_TOC_FILENAME ?? 'content-index.json').trim() || 'content-index.json';
const CONTENT_TOC_OUTPUT_PATH = (process.env.CONTENT_TOC_OUTPUT_PATH ?? '').trim();
const SITEMAP_OUTPUT_PATH = process.env.SITEMAP_OUTPUT_PATH ?? path.join(DIST_DIR, 'sitemap.xml');
const STATIC_ROUTES = (process.env.STATIC_ROUTES ?? 'about,contact')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)
  .map((value) => trimSlashes(value));

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

function parseSlugFromFileName(fileName) {
  const slug = fileName.replace(/\.json$/i, '').trim();
  return slug.length > 0 ? slug : null;
}

function normalizeString(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeString(item))
    .filter(Boolean);
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function buildAbsoluteUrl(routePath) {
  const cleanRoute = routePath ? `/${trimSlashes(routePath)}` : '/';
  return `${SITE_URL}${APP_BASE_PATH}${cleanRoute === '/' ? '/' : cleanRoute}`;
}

function buildSitemapUrl(routePath) {
  const url = buildAbsoluteUrl(routePath);
  return url.endsWith('/') ? url : `${url}/`;
}

function buildContentRawUrl(contentPath) {
  const encodedPath = contentPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `https://cdn.jsdelivr.net/gh/${CONTENT_OWNER}/${CONTENT_REPO}@${encodeURIComponent(CONTENT_BRANCH)}/${encodedPath}`;
}

function resolveImageForMeta(imagePath) {
  if (!imagePath || typeof imagePath !== 'string') {
    return null;
  }

  const trimmed = imagePath.trim();

  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      parsed.pathname = parsed.pathname
        .split('/')
        .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
        .join('/');
      return parsed.toString();
    } catch {
      return trimmed;
    }
  }

  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const repoAssetPath = normalized.startsWith('/images/') ? `/public${normalized}` : normalized;

  const encodedRepoAssetPath = repoAssetPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `https://cdn.jsdelivr.net/gh/${CONTENT_OWNER}/${CONTENT_REPO}@${encodeURIComponent(CONTENT_BRANCH)}${encodedRepoAssetPath}`;
}

function buildSeoHead({ title, description, url, image, type = 'website' }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeUrl = escapeHtml(url);
  const safeImage = image ? escapeHtml(image) : null;

  const lines = [
    '<!-- route-seo:start -->',
    `<title>${safeTitle}</title>`,
    `<meta name="description" content="${safeDescription}" />`,
    '<meta property="og:locale" content="id_ID" />',
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:title" content="${safeTitle}" />`,
    `<meta property="og:description" content="${safeDescription}" />`,
    `<meta property="og:url" content="${safeUrl}" />`,
    '<meta property="og:site_name" content="Pengikut Raja Capybara" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${safeTitle}" />`,
    `<meta name="twitter:description" content="${safeDescription}" />`,
    `<link rel="canonical" href="${safeUrl}" />`,
  ];

  if (safeImage) {
    lines.push(`<meta property="og:image" content="${safeImage}" />`);
    lines.push(`<meta name="twitter:image" content="${safeImage}" />`);
  }

  lines.push('<!-- route-seo:end -->');
  return lines.join('\n    ');
}

function withSeoHead(indexHtml, seoHead) {
  const noOldRouteSeo = indexHtml.replace(/\s*<!-- route-seo:start -->[\s\S]*?<!-- route-seo:end -->\s*/g, '\n    ');
  const noTitleTag = noOldRouteSeo.replace(/\s*<title>[\s\S]*?<\/title>\s*/i, '\n    ');

  return noTitleTag.replace('</head>', `    ${seoHead}\n  </head>`);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Request failed (${response.status}) to ${url}\n${body}`);
  }

  return response.json();
}

async function getPostEntries() {
  const encodedPath = encodeURI(CONTENT_POSTS_PATH);
  const apiUrl = `https://api.github.com/repos/${CONTENT_OWNER}/${CONTENT_REPO}/contents/${encodedPath}?ref=${encodeURIComponent(CONTENT_BRANCH)}`;
  const entries = await fetchJson(apiUrl, { headers: githubHeaders });

  if (!Array.isArray(entries)) {
    throw new Error('Invalid response from GitHub contents API.');
  }

  return entries
    .filter((entry) => entry.type === 'file' && entry.name.endsWith('.json'))
    .map((entry) => {
      const slug = parseSlugFromFileName(entry.name);

      if (!slug) {
        return null;
      }

      return {
        slug,
        path: `${CONTENT_POSTS_PATH}/${entry.name}`,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

async function getPostsMetadata() {
  const postEntries = await getPostEntries();

  const metadata = await Promise.all(
    postEntries.map(async (entry) => {
      try {
        const rawUrl = buildContentRawUrl(entry.path);
        const response = await fetch(rawUrl);

        if (!response.ok) {
          throw new Error(`Request failed (${response.status}) to ${rawUrl}`);
        }

        const content = await response.json();
        const title = normalizeString(content.title)
          ? normalizeString(content.title)
          : entry.slug;
        const excerpt = normalizeString(content.excerpt)
          ? normalizeString(content.excerpt)
          : `Baca artikel ${title} di Pengikut Raja Capybara.`;

        return {
          slug: entry.slug,
          title,
          description: excerpt,
          image: resolveImageForMeta(content.image),
          author: normalizeString(content.author),
          date: normalizeString(content.date),
          tags: normalizeStringArray(content.tags),
          path: entry.path,
        };
      } catch (error) {
        console.warn(`Failed to parse metadata for ${entry.slug}, fallback to slug-based meta.`, error);

        return {
          slug: entry.slug,
          title: entry.slug,
          description: `Baca artikel ${entry.slug} di Pengikut Raja Capybara.`,
          image: null,
          author: null,
          date: null,
          tags: [],
          path: entry.path,
        };
      }
    }),
  );

  return metadata.sort((a, b) => a.slug.localeCompare(b.slug));
}

function getStaticRouteMetadata(routePath) {
  const route = trimSlashes(routePath);

  if (route === 'about') {
    return {
      title: 'Tentang Kami | Pengikut Raja Capybara',
      description: 'Mengenal nilai, filosofi, dan pendekatan komunitas Pengikut Raja Capybara.',
      image: null,
      type: 'website',
    };
  }

  if (route === 'contact') {
    return {
      title: 'Kontak | Pengikut Raja Capybara',
      description: 'Hubungi Pengikut Raja Capybara untuk kolaborasi, diskusi, atau pertanyaan.',
      image: null,
      type: 'website',
    };
  }

  return {
    title: 'Arsip Pengetahuan | Pengikut Raja Capybara',
    description: 'Menelusuri jejak digital Sang Raja melalui artikel, catatan, dan praktik terbaik.',
    image: null,
    type: 'website',
  };
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
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  lines.push('');

  return lines.join('\n');
}

function buildSitemapTxt(urlEntries) {
  return `${urlEntries.map((entry) => entry.loc).join('\n')}\n`;
}

function buildContentToc(postsMetadata) {
  return {
    generatedAt: new Date().toISOString(),
    source: {
      owner: CONTENT_OWNER,
      repo: CONTENT_REPO,
      branch: CONTENT_BRANCH,
      postsPath: CONTENT_POSTS_PATH,
    },
    total: postsMetadata.length,
    posts: postsMetadata.map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      tags: post.tags,
      image: post.image,
      author: post.author,
      path: post.path,
      url: buildAbsoluteUrl(post.slug),
    })),
  };
}

async function writeContentToc(postsMetadata) {
  const contentToc = buildContentToc(postsMetadata);
  const tocJson = `${JSON.stringify(contentToc, null, 2)}\n`;

  const distTocPath = path.join(DIST_DIR, CONTENT_TOC_FILENAME);
  await writeFile(distTocPath, tocJson, 'utf8');

  if (CONTENT_TOC_OUTPUT_PATH) {
    const customOutputPath = path.isAbsolute(CONTENT_TOC_OUTPUT_PATH)
      ? CONTENT_TOC_OUTPUT_PATH
      : path.resolve(CONTENT_TOC_OUTPUT_PATH);

    await mkdir(path.dirname(customOutputPath), { recursive: true });
    await writeFile(customOutputPath, tocJson, 'utf8');
    console.log(`Generated content TOC: ${distTocPath} and ${customOutputPath}`);
    return;
  }

  console.log(`Generated content TOC: ${distTocPath}`);
}

async function writeSitemap(postsMetadata) {
  const today = new Date().toISOString().split('T')[0];

  const urls = [
    {
      loc: buildSitemapUrl(''),
      lastmod: today,
    },
    ...STATIC_ROUTES.map((route) => ({
      loc: buildSitemapUrl(route),
      lastmod: today,
    })),
    ...postsMetadata
      .map((post) => ({
        loc: buildSitemapUrl(encodeURIComponent(post.slug)),
        lastmod: post.date ?? today,
      }))
      .sort((a, b) => a.loc.localeCompare(b.loc)),
  ];

  const xml = buildSitemapXml(urls);
  await writeFile(SITEMAP_OUTPUT_PATH, xml, 'utf8');

  const txt = buildSitemapTxt(urls);
  const txtPath = SITEMAP_OUTPUT_PATH.endsWith('.xml')
    ? `${SITEMAP_OUTPUT_PATH.slice(0, -4)}.txt`
    : `${SITEMAP_OUTPUT_PATH}.txt`;

  await writeFile(txtPath, txt, 'utf8');

  console.log(`Generated sitemap with ${urls.length} URLs: ${SITEMAP_OUTPUT_PATH} and ${txtPath}`);
}

async function createRouteFile(routePath, indexHtml, metadata) {
  const normalized = trimSlashes(routePath);
  const routeMetadata = metadata ?? getStaticRouteMetadata(normalized);
  const routeUrl = buildAbsoluteUrl(normalized);
  const routeHtml = withSeoHead(
    indexHtml,
    buildSeoHead({
      title: routeMetadata.title,
      description: routeMetadata.description,
      url: routeUrl,
      image: routeMetadata.image,
      type: routeMetadata.type,
    }),
  );

  if (!normalized) {
    await writeFile(path.join(DIST_DIR, 'index.html'), routeHtml, 'utf8');
    return;
  }

  const targetDir = path.join(DIST_DIR, normalized);
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, 'index.html'), routeHtml, 'utf8');
}

async function main() {
  const indexPath = path.join(DIST_DIR, 'index.html');
  const indexHtml = await readFile(indexPath, 'utf8');

  let postsMetadata = [];

  try {
    postsMetadata = await getPostsMetadata();
  } catch (error) {
    console.warn('Failed to fetch post metadata. Proceeding with static routes only.', error);
  }

  const postRoutes = postsMetadata.map((post) => ({
    route: post.slug,
    metadata: {
      title: `${post.title} | Pengikut Raja Capybara`,
      description: post.description,
      image: post.image,
      type: 'article',
    },
  }));

  const staticRoutes = STATIC_ROUTES.map((route) => ({
    route,
    metadata: getStaticRouteMetadata(route),
  }));

  const uniqueRoutes = new Map();
  uniqueRoutes.set('', getStaticRouteMetadata(''));

  for (const item of [...staticRoutes, ...postRoutes]) {
    if (!uniqueRoutes.has(item.route)) {
      uniqueRoutes.set(item.route, item.metadata);
    }
  }

  await Promise.all(
    Array.from(uniqueRoutes.entries()).map(([route, metadata]) => createRouteFile(route, indexHtml, metadata)),
  );

  await writeContentToc(postsMetadata);
  await writeSitemap(postsMetadata);

  console.log(`Generated SPA route files with static SEO: ${uniqueRoutes.size}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
