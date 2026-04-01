import { Link, useParams } from 'react-router';
import { Share2 } from 'lucide-react';
import { SeoMeta } from '../components/seo';
import CdnImage from '../components/ui/CdnImage';
import { BLOG_CMS_SOURCE } from '../features/blog/config/cmsSource';
import { useBlogPostQuery } from '../features/blog/hooks/useBlogQueries';
import { resolveCmsImageUrl } from '../features/blog/services/cms';
import { toSafeHtml } from '../utils/richContent';

const WORDS_PER_MINUTE = 200;

function countWordsFromHtml(html: string): number {
  const plainText = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!plainText) {
    return 0;
  }

  return plainText.split(' ').length;
}

function estimateReadMinutes(wordCount: number): number {
  if (wordCount <= 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

function BlogDetail() {
  const { slug } = useParams();
  const postQuery = useBlogPostQuery(slug, BLOG_CMS_SOURCE);

  const post = postQuery.data;

  if (postQuery.isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <SeoMeta
          title="Memuat Artikel"
          description="Sedang memuat artikel dari arsip Pengikut Raja Capybara."
          path={slug ? `/blog/${slug}` : '/blog/'}
        />

        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-green-200 rounded-full mb-4"></div>
          <p className="text-sm font-medium text-dark/40">Menyusun catatan...</p>
        </div>
      </div>
    );
  }

  if (postQuery.error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <SeoMeta
          title="Artikel Tidak Ditemukan"
          description="Artikel yang kamu cari tidak ditemukan di arsip Pengikut Raja Capybara."
          path={slug ? `/blog/${slug}` : '/blog/'}
          noIndex
        />

        <p className="text-lg font-medium text-rose-600">Catatan tidak ditemukan di dalam arsip.</p>
        <Link to="/" className="text-dark/50 underline mt-4 inline-block italic">Kembali ke gerbang utama</Link>
      </div>
    );
  }

  const renderedBody = toSafeHtml(post.body, BLOG_CMS_SOURCE);
  const postImage = resolveCmsImageUrl(post.image, BLOG_CMS_SOURCE);
  const canonicalPath = `/blog/${post.slug}`;
  const wordCount = countWordsFromHtml(renderedBody);
  const readingMinutes = estimateReadMinutes(wordCount);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${canonicalPath}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt ?? `Baca artikel ${post.title}`,
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
    } catch {
        return;
    }
  };

  return (
    <article className="max-w-4xl mx-auto py-12 px-6">
      <SeoMeta
        title={post.title}
        description={post.excerpt ?? `Baca artikel ${post.title} di Pengikut Raja Capybara.`}
        path={canonicalPath}
        type="article"
        image={post.image ? postImage : undefined}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt ?? undefined,
          datePublished: post.date,
          author: {
            '@type': 'Person',
            name: post.author ?? 'Pengikut Raja Capybara',
          },
          image: post.image ? [postImage] : undefined,
          keywords: post.tags,
          mainEntityOfPage: canonicalPath,
        }}
      />

      {/* Tombol Kembali yang Minimalis */}
      <Link 
        className="group inline-flex items-center text-sm font-bold text-green-700 dark:text-green-500 mb-12 transition-all hover:translate-x-[-4px]"
        to="/"
      >
        <span className="mr-2">←</span> 
        <span className="uppercase tracking-widest">Kembali</span>
      </Link>

      {/* Header Artikel */}
      <header className="mb-12">
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags?.map((tag) => (
            <span key={tag} className="px-3 py-1 text-[10px] uppercase tracking-tighter font-black bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-md">
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-5xl md:text-6xl font-black leading-[1.1] text-dark dark:text-dark-text mb-8 tracking-tight">
          {post.title}
        </h1>
        
        <div className="flex items-center gap-6 p-4 rounded-2xl bg-stone-100 dark:bg-white/5 border border-dark/5">
          <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {post.author?.charAt(0) || 'C'}
          </div>
          <div className="text-sm flex-1">
            <p className="font-bold text-dark dark:text-dark-text">{post.author || 'Anonim'}</p>
            <time className="text-dark/50 dark:text-dark-text/40" dateTime={post.date}>Terbit pada {post.date}</time>
            <p className="text-dark/45 dark:text-dark-text/45 mt-1">
              {wordCount} kata • estimasi baca {readingMinutes} menit
            </p>
          </div>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-500 text-white text-xs font-bold uppercase tracking-wide transition-all"
            aria-label="Bagikan artikel"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </header>

      {/* Gambar Cover - Skala Penuh untuk Impact Maksimal */}
      {post.image && (
        <div className="mb-16 relative">
          <div className="absolute inset-0 bg-green-700/5 blur-3xl -z-10 rounded-full" />
          <CdnImage
            src={post.image}
            cmsSource={BLOG_CMS_SOURCE}
            alt={post.title}
            className="w-[25em] h-auto mx-auto rounded-[2rem] shadow-lg shadow-dark/10"
          />
        </div>
      )}

      {/* Area Konten dengan Tipografi yang Luas */}
      <div className="prose prose-stone dark:prose-invert lg:prose-xl max-w-none 
        prose-p:leading-[1.8] prose-p:text-dark/80 dark:prose-p:text-dark-text/80
        prose-headings:font-black prose-headings:tracking-tight
        prose-img:rounded-[2rem] prose-img:shadow-lg
        prose-blockquote:border-l-4 prose-blockquote:border-green-700 prose-blockquote:italic
        prose-strong:text-green-800 dark:prose-strong:text-green-400">
        <div dangerouslySetInnerHTML={{ __html: renderedBody }} />
      </div>

      {/* Footer Artikel */}
      <footer className="mt-20 pt-10 border-t border-dark/5 dark:border-white/5 text-center">
        <p className="text-sm italic text-dark/40 dark:text-dark-text/30 mb-4">
          Semoga catatan ini membawamu pada kejernihan pikiran.
        </p>
        <div className="flex justify-center gap-2">
          <span className="w-2 h-2 bg-green-700/20 rounded-full" />
          <span className="w-2 h-2 bg-green-700/40 rounded-full" />
          <span className="w-2 h-2 bg-green-700/20 rounded-full" />
        </div>
      </footer>
    </article>
  );
}

export default BlogDetail;