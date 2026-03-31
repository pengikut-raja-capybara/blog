import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BLOG_CMS_SOURCE } from '../config/cmsSource';
import {
  fetchPostBySlug,
  fetchPosts,
  fetchSiteSettings,
  type CmsSourceConfig,
} from '../services/cms';
import { blogQueryKeys } from '../services/queryKeys';
import type { BlogPost, SiteSettings } from '../../../types/blog';

export function useBlogPostsQuery(source: CmsSourceConfig = BLOG_CMS_SOURCE) {
  return useQuery<BlogPost[]>({
    queryKey: blogQueryKeys.posts(source),
    queryFn: () => fetchPosts(source),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSiteSettingsQuery(source: CmsSourceConfig = BLOG_CMS_SOURCE) {
  return useQuery<SiteSettings>({
    queryKey: blogQueryKeys.settings(source),
    queryFn: () => fetchSiteSettings(source),
    staleTime: 30 * 60 * 1000,
  });
}

export function useBlogPostQuery(
  slug: string | undefined,
  source: CmsSourceConfig = BLOG_CMS_SOURCE,
) {
  const queryClient = useQueryClient();
  const cachedPosts = queryClient.getQueryData<BlogPost[]>(blogQueryKeys.posts(source));
  const cachedPost = cachedPosts?.find((item) => item.slug === slug);

  return useQuery<BlogPost>({
    queryKey: blogQueryKeys.post(source, slug),
    queryFn: () => fetchPostBySlug(source, slug ?? ''),
    enabled: Boolean(slug) && !cachedPost,
    initialData: cachedPost,
    staleTime: 5 * 60 * 1000,
  });
}
