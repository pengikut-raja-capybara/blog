import { useEffect, useMemo } from 'react';

type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>;

type SeoMetaProps = {
  title: string;
  description: string;
  path?: string;
  type?: 'website' | 'article';
  image?: string;
  noIndex?: boolean;
  jsonLd?: JsonLdValue;
};

const SITE_NAME = 'Pengikut Raja Capybara';
const FALLBACK_SITE_URL = import.meta.env.VITE_SITE_URL ?? '';

const toArray = (value: JsonLdValue): Array<Record<string, unknown>> => {
  return Array.isArray(value) ? value : [value];
};

const resolveSiteUrl = (): string => {
  if (FALLBACK_SITE_URL) {
    return FALLBACK_SITE_URL.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }

  return '';
};

const toAbsoluteUrl = (pathOrUrl: string | undefined): string => {
  if (!pathOrUrl) {
    return '';
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const base = resolveSiteUrl();

  if (!base) {
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${normalizedPath}`;
};

const upsertMeta = (key: string, content: string, isProperty = false) => {
  if (typeof document === 'undefined') {
    return;
  }

  const selector = isProperty ? `meta[property="${key}"]` : `meta[name="${key}"]`;
  let meta = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!meta) {
    meta = document.createElement('meta');

    if (isProperty) {
      meta.setAttribute('property', key);
    } else {
      meta.setAttribute('name', key);
    }

    document.head.appendChild(meta);
  }

  meta.setAttribute('content', content);
};

const upsertCanonical = (href: string) => {
  if (typeof document === 'undefined') {
    return;
  }

  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }

  link.setAttribute('href', href);
};

const upsertJsonLd = (jsonLd: JsonLdValue | undefined) => {
  if (typeof document === 'undefined') {
    return;
  }

  const existing = document.head.querySelector('script[data-seo-jsonld="true"]');
  if (existing) {
    existing.remove();
  }

  if (!jsonLd) {
    return;
  }

  const payload = toArray(jsonLd);
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.dataset.seoJsonld = 'true';
  script.text = JSON.stringify(payload.length === 1 ? payload[0] : payload);
  document.head.appendChild(script);
};

function SeoMeta({ title, description, path = '/blog/', type = 'website', image, noIndex = false, jsonLd }: SeoMetaProps) {
  const fullTitle = useMemo(() => {
    if (!title.trim()) {
      return SITE_NAME;
    }

    if (title.trim().toLowerCase() === SITE_NAME.toLowerCase()) {
      return SITE_NAME;
    }

    return `${title} | ${SITE_NAME}`;
  }, [title]);

  const canonicalUrl = useMemo(() => toAbsoluteUrl(path), [path]);
  const imageUrl = useMemo(() => toAbsoluteUrl(image), [image]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.title = fullTitle;

    upsertMeta('description', description);
    upsertMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    upsertMeta('og:title', fullTitle, true);
    upsertMeta('og:description', description, true);
    upsertMeta('og:type', type, true);
    upsertMeta('og:site_name', SITE_NAME, true);

    if (canonicalUrl) {
      upsertCanonical(canonicalUrl);
      upsertMeta('og:url', canonicalUrl, true);
    }

    if (imageUrl) {
      upsertMeta('og:image', imageUrl, true);
      upsertMeta('twitter:image', imageUrl);
    }

    upsertMeta('twitter:card', imageUrl ? 'summary_large_image' : 'summary');
    upsertMeta('twitter:title', fullTitle);
    upsertMeta('twitter:description', description);

    upsertJsonLd(jsonLd);
  }, [canonicalUrl, description, fullTitle, imageUrl, jsonLd, noIndex, type]);

  return null;
}

export default SeoMeta;
