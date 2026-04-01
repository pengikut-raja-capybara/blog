import { useMemo } from 'react';
import BlogCard from '../features/blog/components/BlogCard';
import { SeoMeta } from '../components/seo';
import { BLOG_CMS_SOURCE } from '../features/blog/config/cmsSource';
import {
  useBlogPostsQuery,
  useSiteSettingsQuery,
} from '../features/blog/hooks/useBlogQueries';
import { SkeletonGrid } from '../components/ui/SkeletonCard';

function Home() {
  const postsQuery = useBlogPostsQuery(BLOG_CMS_SOURCE);
  const settingsQuery = useSiteSettingsQuery(BLOG_CMS_SOURCE);

  const settings = settingsQuery.data ?? null;
  const isLoading = postsQuery.isLoading || settingsQuery.isLoading;
  const queryError = postsQuery.error ?? settingsQuery.error;
  const error = queryError instanceof Error ? queryError.message : null;

  const sortedPosts = useMemo(() => {
    const posts = postsQuery.data ?? [];

    return [...posts].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [postsQuery.data]);

  return (
    <div className="space-y-24">
      <SeoMeta
        title={settings?.site_title ?? 'Pengikut Raja Capybara'}
        description={settings?.description ?? 'Manifesto kolaborasi open source yang mengutamakan kebermanfaatan, etika, dan harmoni.'}
        path="/blog/"
        type="website"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: settings?.site_title ?? 'Pengikut Raja Capybara',
          description: settings?.description ?? 'Manifesto kolaborasi open source yang mengutamakan kebermanfaatan, etika, dan harmoni.',
          url: '/blog/',
        }}
      />

      {/* Hero Section - Lebih Berkarakter */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        {/* Dekorasi Latar Belakang Halus */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-green-200/20 dark:bg-green-900/10 blur-[120px] rounded-full -z-10" />

        <div className="text-center max-w-4xl mx-auto px-6">
          <h1 className="text-6xl md:text-8xl font-black leading-[1.1] text-dark dark:text-dark-text mb-8 tracking-tight">
            Ketenangan dalam <span className="text-green-700 dark:text-green-500">Kode.</span>
          </h1>
          <p className="text-xl md:text-2xl text-dark/60 dark:text-dark-text/60 max-w-2xl mx-auto leading-relaxed font-medium">
            {settings?.description ?? 'Manifesto kolaborasi open source yang mengutamakan kebermanfaatan, etika, dan harmoni.'}
          </p>
          
          <div className="mt-12 flex justify-center gap-4">
            <div className="h-1 w-24 bg-green-700/20 rounded-full" />
            <div className="h-1 w-4 bg-green-700/40 rounded-full" />
            <div className="h-1 w-1 bg-green-700/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* Content Section - Grid yang Lebih Rapi */}
      <section className="px-4">
        <div className="flex items-end justify-between mb-12 border-b border-dark/5 dark:border-white/5 pb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-dark dark:text-dark-text">
              Arsip Pengetahuan
            </h2>
            <p className="text-dark/50 dark:text-dark-text/40 mt-2">Menelusuri jejak digital Sang Raja</p>
          </div>
          <div className="hidden md:block text-sm font-bold text-green-700 dark:text-green-500 uppercase tracking-widest">
            {sortedPosts.length} Artikel Terbit
          </div>
        </div>

        {error ? (
          <div className="rounded-3xl border-2 border-rose-100 bg-rose-50/50 p-8 text-center text-rose-700 animate-pulse">
             <span className="text-2xl block mb-2">⚠️</span>
             Gangguan transmisi data: {error}
          </div>
        ) : null}

        {isLoading ? (
          <SkeletonGrid count={6} />
        ) : sortedPosts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 dark:border-white/10 p-20 text-center">
            <p className="text-xl text-stone-500">Belum ada catatan yang dibagikan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {sortedPosts.map((post) => (
              <div key={post.slug} className="group h-full transition-transform duration-500 hover:-translate-y-2">
                <BlogCard {...post} cmsSource={BLOG_CMS_SOURCE} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;