import { useMemo } from 'react';
import BlogCard from '../features/blog/components/BlogCard';
import { BLOG_CMS_SOURCE } from '../features/blog/config/cmsSource';
import {
  useBlogPostsQuery,
  useSiteSettingsQuery,
} from '../features/blog/hooks/useBlogQueries';

function Home() {
  const postsQuery = useBlogPostsQuery(BLOG_CMS_SOURCE);
  const settingsQuery = useSiteSettingsQuery(BLOG_CMS_SOURCE);

  const posts = postsQuery.data ?? [];
  const settings = settingsQuery.data ?? null;
  const isLoading = postsQuery.isLoading || settingsQuery.isLoading;
  const queryError = postsQuery.error ?? settingsQuery.error;
  const error = queryError instanceof Error ? queryError.message : null;

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [posts]);

  const siteTitle = settings?.site_title ?? 'Pengikut Raja Capybara';
  const siteDescription =
    settings?.description ??
    'Catatan kerajaan capybara tentang alam, ketenangan, dan strategi hidup lambat.';

  return (
    <>
      <header className="mx-auto max-w-6xl px-6 pt-12 pb-10 md:px-8 md:pt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
          Kerajaan Digital
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-stone-900 md:text-5xl">
          {siteTitle}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-700 md:text-lg">
          {siteDescription}
        </p>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-14 md:px-8">
        {isLoading ? (
          <div className="rounded-2xl border border-stone-200 bg-white/70 p-6 text-sm text-stone-600 shadow-sm">
            Memuat naskah dari perpustakaan kerajaan...
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
            Terjadi gangguan saat mengambil data dari jsDelivr: {error}
          </div>
        ) : null}

        {!isLoading && !error && sortedPosts.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white/80 p-6 text-sm text-stone-600 shadow-sm">
            Belum ada artikel di content/posts.
          </div>
        ) : null}

        {!isLoading && !error && sortedPosts.length > 0 ? (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sortedPosts.map((post) => (
              <BlogCard
                key={post.slug}
                title={post.title}
                excerpt={post.excerpt ?? ''}
                date={post.date}
                image={post.image}
                slug={post.slug}
                tags={post.tags}
                author={post.author}
                cmsSource={BLOG_CMS_SOURCE}
              />
            ))}
          </section>
        ) : null}
      </main>
    </>
  );
}

export default Home;
