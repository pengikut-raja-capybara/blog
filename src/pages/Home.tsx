import { useMemo } from 'react';
import BlogCard from '../features/blog/components/BlogCard';
import { SeoMeta } from '../components/seo';
import { BLOG_CMS_SOURCE } from '../features/blog/config/cmsSource';
import {
  useBlogPostsQuery,
  useSiteSettingsQuery,
} from '../features/blog/hooks/useBlogQueries';
import { SkeletonGrid } from '../components/ui/SkeletonCard';
import { ArrowRight, Terminal, Cpu } from 'lucide-react';

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
    <div className="flex flex-col gap-16 md:gap-32 mb-24 font-sans">
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

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-32 overflow-hidden px-4 md:px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-light/20 dark:bg-light/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-amber/20 dark:bg-amber/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

        <div className="text-center max-w-5xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark/5 dark:bg-dark-text/5 border border-dark/10 dark:border-dark-text/10 text-sm font-semibold mb-8 text-dark dark:text-dark-text backdrop-blur-sm transition-all hover:scale-105 hover:bg-dark/10 dark:hover:bg-dark-text/10 cursor-default">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber"></span>
            </span>
            Eksplorasi Teknologi & Ketenangan
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] text-dark dark:text-dark-text mb-8 tracking-tight">
            Ketenangan dalam <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-light to-amber">Kode.</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-dark/70 dark:text-dark-text/70 max-w-2xl mx-auto leading-relaxed font-medium mb-12">
            {settings?.description ?? 'Manifesto kolaborasi open source yang mengutamakan kebermanfaatan, etika, dan harmoni.'}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
            <button 
              onClick={() => document.getElementById('arsip')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-dark dark:bg-dark-text text-cream dark:text-dark font-bold hover:shadow-[0_0_40px_-10px_rgba(45,92,78,0.5)] dark:hover:shadow-[0_0_40px_-10px_rgba(245,241,234,0.3)] transition-all hover:-translate-y-1 flex items-center justify-center gap-2 group"
            >
              Mulai Membaca <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="https://github.com/pengikut-raja-capybara" 
              target="_blank" 
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-transparent border-2 border-dark/20 dark:border-dark-text/20 text-dark dark:text-dark-text font-bold hover:border-dark dark:hover:border-dark-text hover:bg-dark/5 dark:hover:bg-dark-text/5 transition-all flex items-center justify-center gap-2"
            >
              <Terminal size={20} />
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section id="arsip" className="container mx-auto max-w-7xl px-4 md:px-6 scroll-mt-24">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 border-b border-dark/10 dark:border-dark-text/10 pb-8 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-dark dark:text-dark-text flex items-center gap-4 tracking-tight">
              <Cpu className="text-amber" size={40} />
              Arsip Pengetahuan
            </h2>
            <p className="text-dark/60 dark:text-dark-text/60 mt-3 font-medium text-lg md:text-xl">Menelusuri jejak digital dan pemikiran Sang Raja</p>
          </div>
          <div className="flex items-center gap-2 px-5 py-2.5 bg-dark/5 dark:bg-dark-text/5 rounded-2xl text-sm font-bold text-dark dark:text-dark-text whitespace-nowrap shadow-sm">
            <div className="h-2 w-2 rounded-full bg-light"></div>
            <span>{sortedPosts.length} Artikel Terbit</span>
          </div>
        </div>

        {error ? (
          <div className="rounded-3xl border-2 border-rose-200 bg-rose-50 dark:bg-rose-950/30 p-10 text-center text-rose-700 dark:text-rose-400 max-w-2xl mx-auto">
             <span className="text-4xl block mb-4 animate-bounce">⚠️</span>
             <p className="font-bold text-xl">Gangguan transmisi data</p>
             <p className="opacity-80 mt-2">{error}</p>
          </div>
        ) : null}

        {isLoading ? (
          <SkeletonGrid count={6} />
        ) : sortedPosts.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-dark/20 dark:border-dark-text/20 p-24 text-center bg-dark/5 dark:bg-dark-text/5 max-w-3xl mx-auto">
            <Terminal size={64} className="mx-auto mb-6 text-dark/30 dark:text-dark-text/30" />
            <p className="text-2xl font-bold text-dark/60 dark:text-dark-text/60">Belum ada catatan yang dibagikan.</p>
            <p className="mt-3 text-dark/40 dark:text-dark-text/40 text-lg">Sistem masih menunggu input pertama.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {sortedPosts.map((post, index) => (
              <div key={post.slug} className="group flex h-full">
                <BlogCard {...post} cmsSource={BLOG_CMS_SOURCE} priority={index < 2} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;