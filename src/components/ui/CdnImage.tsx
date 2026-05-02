import { useMemo, useState, type ImgHTMLAttributes } from 'react';
import { BLOG_CMS_SOURCE, IMAGE_PROXY_CONFIG, resolveCmsImageUrl } from '../../features/blog/services/cms';
import type { CmsSourceConfig } from '../../features/blog/services/cms';

type CdnImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string;
  cmsSource?: CmsSourceConfig;
  fallbackSrc?: string;
  proxyWidth?: number;
  proxyQuality?: number;
};

const DEFAULT_PLACEHOLDER = '/images/placeholder-blog.jpg';

function CdnImage({
  src,
  cmsSource = BLOG_CMS_SOURCE,
  fallbackSrc = DEFAULT_PLACEHOLDER,
  proxyWidth = IMAGE_PROXY_CONFIG.width,
  proxyQuality = IMAGE_PROXY_CONFIG.quality,
  alt,
  onError,
  ...imgProps
}: CdnImageProps) {
  // Gunakan fungsi resolve dari cms.ts yang sudah dioptimasi dengan SHA cache
  const resolvedUrl = useMemo(() => {
    if (!src) return fallbackSrc;
    const url = resolveCmsImageUrl(src, cmsSource);
    
    // Jika ada override width/quality manual dari prop, injeksi ke URL wsrv.nl
    if (url.includes('wsrv.nl')) {
      try {
        const u = new URL(url);
        if (proxyWidth) u.searchParams.set('w', String(proxyWidth));
        if (proxyQuality) u.searchParams.set('q', String(proxyQuality));
        return u.toString();
      } catch {
        return url;
      }
    }
    return url;
  }, [src, cmsSource, fallbackSrc, proxyWidth, proxyQuality]);

  // Fallback chain jika proxy gagal
  const candidates = useMemo(() => {
    const list = [resolvedUrl];
    
    // Jika resolvedUrl adalah proxy, tambahkan versi aslinya sebagai backup
    if (resolvedUrl.includes('wsrv.nl')) {
      try {
        const originalUrl = new URL(resolvedUrl).searchParams.get('url');
        if (originalUrl) list.push(originalUrl);
      } catch {
        // ignore URL parsing error
      }
    }
    
    if (!list.includes(fallbackSrc)) list.push(fallbackSrc);
    return list;
  }, [resolvedUrl, fallbackSrc]);

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <img
      key={resolvedUrl}
      {...imgProps}
      src={candidates[activeIndex]}
      alt={alt}
      loading={imgProps.loading ?? 'lazy'}
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