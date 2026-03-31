/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState, type ImgHTMLAttributes } from 'react';
import type { CmsSourceConfig } from '../../features/blog/services/cms';

type CdnImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string;
  cmsSource?: CmsSourceConfig;
  fallbackSrc?: string;
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

function toWeservUrl(imageUrl: string): string {
  return `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&output=webp`;
}

function buildCandidateUrls(
  src: string | undefined,
  cmsSource: CmsSourceConfig | undefined,
  fallbackSrc: string,
): string[] {
  if (!src) {
    return [fallbackSrc];
  }

  const [primary, backup] = toAbsoluteCmsUrls(src, cmsSource);
  const candidates = [toWeservUrl(primary), primary];

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
  alt,
  onError,
  ...imgProps
}: CdnImageProps) {
  const candidates = useMemo(
    () => buildCandidateUrls(src, cmsSource, fallbackSrc),
    [src, cmsSource, fallbackSrc],
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [src, cmsSource, fallbackSrc]);

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