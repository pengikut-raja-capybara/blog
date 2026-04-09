import { Link, useParams } from 'react-router';
import { Share2, ArrowLeft, Clock, CalendarDays, User, Sparkles } from 'lucide-react';
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
      <div className="max-w-4xl mx-auto px-4 py-32 text-center min-h-[60vh] flex flex-col justify-center">
        <SeoMeta
          title="Memuat Artikel"
          description="Sedang memuat artikel dari arsip Pengikut Raja Capybara."
          path={slug ? `/blog/${slug}` : '/blog/'}
        />

        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-light/20 rounded-full mb-6 relative">
             <div className="absolute inset-0 border-4 border-light/40 border-t-light rounded-full animate-spin" />
             <div className="absolute inset-0 border-4 border-transparent border-b-amber rounded-full animate-spin-[2s_linear_infinite_reverse]" />
          </div>
          <p className="text-lg font-bold text-dark/60 dark:text-dark-text/60 tracking-wider uppercase">Menyusun catatan...</p>
        </div>
      </div>
    );
  }

  if (postQuery.error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <SeoMeta
          title="Artikel Tidak Ditemukan"
          description="Artikel yang kamu cari tidak ditemukan di arsip Pengikut Raja Capybara."
          path={slug ? `/blog/${slug}` : '/blog/'}
          noIndex
        />
        
        <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 rounded-3xl flex items-center justify-center mb-8 rotate-12">
           <span className="text-4xl block animate-bounce">⚠️</span>
        </div>

        <h1 className="text-3xl font-black text-dark dark:text-dark-text mb-4">Catatan Tidak Ditemukan</h1>
        <p className="text-lg text-dark/70 dark:text-dark-text/70 mb-10 w-full max-w-md">Arsip yang mendalam ini tidak menyimpan catatan yang sedang Anda cari.</p>
        
        <Link to="/" className="px-8 py-4 rounded-full bg-dark dark:bg-dark-text text-cream dark:text-dark font-bold hover:shadow-lg transition-all hover:-translate-y-1 flex items-center gap-2 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Kembali ke Gerbang Utama
        </Link>
      </div>
    );
  }

  const renderedBody = toSafeHtml(post.body, BLOG_CMS_SOURCE);
  const postImage = resolveCmsImageUrl(post.image, BLOG_CMS_SOURCE);
  const canonicalPath = `/blog/${post.slug}`;
  const wordCount = countWordsFromHtml(renderedBody);
  const readingMinutes = estimateReadMinutes(wordCount);

  const formattedDate = new Date(post.date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

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
    <div className="max-w-5xl mx-auto py-12 px-4 md:px-6 mb-24">
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

      {/* Top Navigation */}
      <nav className="mb-12">
        <Link 
          className="group inline-flex items-center gap-3 text-sm font-bold text-dark/60 dark:text-dark-text/60 hover:text-dark dark:hover:text-dark-text transition-all bg-dark/5 dark:bg-dark-text/5 px-4 py-2.5 rounded-full backdrop-blur-sm border border-dark/10 dark:border-dark-text/10 hover:-translate-x-1"
          to="/"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="uppercase tracking-widest">Kembali</span>
        </Link>
      </nav>

      <article className="relative">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-light/10 dark:bg-light/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

        {/* Header Artikel */}
        <header className="mb-16">
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags?.map((tag) => (
              <span key={tag} className="px-4 py-1.5 text-xs uppercase tracking-widest font-bold bg-dark/5 dark:bg-dark-text/5 border border-dark/10 dark:border-dark-text/10 text-dark dark:text-dark-text rounded-full shadow-sm hover:border-amber/50 transition-colors">
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-dark dark:text-dark-text mb-10 tracking-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-[2rem] bg-cream/50 dark:bg-dark-bg-light/10 border border-dark/10 dark:border-dark-text/10 backdrop-blur-md shadow-lg shadow-dark/5">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-light to-dark rounded-2xl flex items-center justify-center text-cream text-xl font-black shadow-md md:rotate-3">
                {post.author?.charAt(0) || 'C'}
              </div>
              <div className="space-y-1">
                <p className="font-bold text-lg text-dark dark:text-dark-text flex items-center gap-2">
                   <User size={16} className="text-amber" />
                   {post.author || 'Anonim'}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-dark/70 dark:text-dark-text/70 font-medium">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={14} className="text-light" />
                    {formattedDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-light" />
                    {readingMinutes} menit
                  </span>
                </div>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleShare}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-dark/5 dark:bg-dark-text/5 hover:bg-dark hover:text-cream dark:hover:bg-dark-text dark:hover:text-dark text-dark dark:text-dark-text text-sm font-bold uppercase tracking-widest transition-all hover:-translate-y-1 border border-dark/10 dark:border-dark-text/10"
              aria-label="Bagikan artikel"
            >
              <Share2 size={16} />
              Bagikan
            </button>
          </div>
        </header>

        {/* Gambar Cover */}
        {post.image && (
          <div className="mb-20 relative group">
            <div className="absolute inset-0 bg-light/20 blur-[60px] -z-10 rounded-[3rem] transition-all group-hover:bg-amber/20" />
            <CdnImage
              src={post.image}
              cmsSource={BLOG_CMS_SOURCE}
              alt={post.title}
              className="w-[32em] h-auto mx-auto rounded-[2.5rem] shadow-2xl shadow-dark/15 border border-white/20 dark:border-dark-bg/50 object-cover"
            />
          </div>
        )}

        {/* Area Konten */}
        <div className="prose prose-stone dark:prose-invert lg:prose-xl max-w-none 
          prose-p:leading-relaxed prose-p:text-dark/85 dark:prose-p:text-dark-text/85
          prose-headings:font-black prose-headings:tracking-tight prose-headings:text-dark dark:prose-headings:text-dark-text
          prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:pb-4 prose-h2:border-b prose-h2:border-dark/10 dark:prose-h2:border-dark-text/10
          prose-h3:text-2xl
          prose-img:rounded-[2rem] prose-img:shadow-xl prose-img:border prose-img:border-dark/5
          prose-blockquote:border-l-8 prose-blockquote:border-light prose-blockquote:bg-light/5 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-dark/70 dark:prose-blockquote:text-dark-text/70
          prose-strong:text-dark dark:prose-strong:text-dark-text
          prose-a:text-amber prose-a:no-underline hover:prose-a:underline hover:prose-a:text-light transition-all
          prose-li:marker:text-light font-medium">
          <div dangerouslySetInnerHTML={{ __html: renderedBody }} />
        </div>

        {/* Footer Artikel */}
        <footer className="mt-24 pt-12 border-t border-dark/10 dark:border-dark-text/10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber/10 blur-[50px] rounded-full -z-10 pointer-events-none" />
          <p className="text-lg md:text-xl italic text-dark/70 dark:text-dark-text/70 mb-8 font-medium leading-relaxed">
            "Semoga catatan ini membawamu pada kejernihan pikiran."
          </p>
          <div className="flex justify-center items-center gap-3">
             <Sparkles size={20} className="text-amber" />
             <div className="flex gap-2">
               <span className="w-1.5 h-1.5 bg-dark/30 dark:bg-dark-text/30 rounded-full" />
               <span className="w-1.5 h-1.5 bg-dark/60 dark:bg-dark-text/60 rounded-full" />
               <span className="w-1.5 h-1.5 bg-dark/30 dark:bg-dark-text/30 rounded-full" />
             </div>
             <Sparkles size={20} className="text-amber" />
          </div>
        </footer>
      </article>
    </div>
  );
}

export default BlogDetail;