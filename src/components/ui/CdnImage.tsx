/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState, type ImgHTMLAttributes } from 'react';
import type { CmsSourceConfig } from '../../features/blog/types/cms';

type CdnImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string;
  cmsSource?: CmsSourceConfig;
  fallbackSrc?: string;
  proxyWidth?: number;
  proxyQuality?: number;
};

const DEFAULT_PLACEHOLDER = '/images/placeholder-blog.jpg';
const DEFAULT_BRANCH = 'content';

function toRepoAssetPath(imagePath: string): string {
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  // Pages CMS outputs "/images/..." for frontend usage,
  // while the repository stores files under "public/images/...".
  if (normalizedPath.startsWith('/images/')) {
    return `/public${normalizedPath}`;
  }

  return normalizedPath;
}

function toAbsoluteCmsUrls(imagePath: string, cmsSource?: CmsSourceConfig): string[] {
  if (/^https?:\/\//i.test(imagePath)) {
    return [imagePath];
  }

  if (!cmsSource) {
    return [imagePath];
  }

  const normalizedPath = toRepoAssetPath(imagePath);
  const branch = cmsSource.branch ?? DEFAULT_BRANCH;
  const jsDelivr = `https://cdn.jsdelivr.net/gh/${cmsSource.owner}/${cmsSource.repo}@${branch}${normalizedPath}`;
  const githubRaw = `https://raw.githubusercontent.com/${cmsSource.owner}/${cmsSource.repo}/${branch}${normalizedPath}`;

  return [jsDelivr, githubRaw];
}

function toWeservUrl(imageUrl: string, options?: { width?: number; quality?: number }): string {
  const params = new URLSearchParams({
    url: imageUrl,
    output: 'webp',
  });

  if (Number.isFinite(options?.width) && (options?.width ?? 0) > 0) {
    params.set('w', String(options?.width));
  }

  if (Number.isFinite(options?.quality) && (options?.quality ?? 0) > 0) {
    params.set('q', String(options?.quality));
  }

  return `https://wsrv.nl/?${params.toString()}`;
}

function isAbsoluteHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function buildCandidateUrls(
  src: string | undefined,
  cmsSource: CmsSourceConfig | undefined,
  fallbackSrc: string,
  options?: { width?: number; quality?: number },
): string[] {
  if (!src) {
    return [fallbackSrc];
  }

  const [primary, backup] = toAbsoluteCmsUrls(src, cmsSource);
  const candidates = isAbsoluteHttpUrl(primary) ? [toWeservUrl(primary, options), primary] : [primary];

  if (backup && backup !== primary) {
    candidates.push(backup);
  }

  if (!candidates.includes(fallbackSrc)) {
    candidates.push(fallbackSrc);
  }

  return candidates;
}

function CdnImage({
  src,
  cmsSource,
  fallbackSrc = DEFAULT_PLACEHOLDER,
  proxyWidth,
  proxyQuality,
  alt,
  onError,
  ...imgProps
}: CdnImageProps) {
  const candidates = useMemo(
    () =>
      buildCandidateUrls(src, cmsSource, fallbackSrc, {
        width: proxyWidth,
        quality: proxyQuality,
      }),
    [src, cmsSource, fallbackSrc, proxyWidth, proxyQuality],
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [src, cmsSource, fallbackSrc, proxyWidth, proxyQuality]);

  return (
    <img
      {...imgProps}
      src={candidates[activeIndex]}
      alt={alt}
      onError={(event) => {
        if (activeIndex < candidates.length - 1) {
          setActiveIndex((current) => current + 1);
          return;
        }

        onError?.(event);
      }}
    />
  );
}

export default CdnImage;