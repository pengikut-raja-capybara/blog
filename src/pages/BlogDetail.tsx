import { Link, useParams } from 'react-router';
import { Share2, ArrowLeft, Clock, CalendarDays, User, Sparkles, List } from 'lucide-react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { SeoMeta } from '../components/seo';
import CdnImage from '../components/ui/CdnImage';
import { BLOG_CMS_SOURCE } from '../features/blog/services/cms';
import { useBlogPostQuery, useBlogPostsQuery } from '../features/blog/hooks/useBlogQueries';
import { resolveCmsImageUrl } from '../features/blog/services/cms';
import { toSafeHtml } from '../utils/richContent';
import BlogCard from '../features/blog/components/BlogCard';

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

/** Strip emoji and other non-text symbols */
function stripEmoji(text: string): string {
  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
    .replace(/[\u{200D}]/gu, '')
    .replace(/[\u{20E3}]/gu, '')
    .replace(/[\u{E0020}-\u{E007F}]/gu, '')
    .trim();
}

function slugify(text: string): string {
  const cleaned = stripEmoji(text);
  return cleaned
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Pre-process HTML using DOMParser to safely inject `id` attributes into real
 * h2/h3 elements and extract a TOC. Using the DOM parser (not regex) means we
 * never accidentally match h2/h3 *text* inside <pre>/<code> blocks.
 */
function processHtmlForToc(html: string): { html: string; toc: TocItem[] } {
  // DOMParser only exists in a browser context
  if (typeof DOMParser === 'undefined' || !html) {
    return { html, toc: [] };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="__root">${html}</div>`, 'text/html');
  const root = doc.getElementById('__root');
  if (!root) return { html, toc: [] };

  const tocItems: TocItem[] = [];
  const usedIds = new Set<string>();

  root.querySelectorAll('h2, h3').forEach((heading, index) => {
    const rawText = heading.textContent || '';
    const cleanText = stripEmoji(rawText);

    let id = heading.getAttribute('id');
    if (!id) {
      id = slugify(rawText) || `heading-${index}`;
      // Ensure uniqueness
      let uniqueId = id;
      let counter = 1;
      while (usedIds.has(uniqueId)) {
        uniqueId = `${id}-${counter++}`;
      }
      id = uniqueId;
      heading.setAttribute('id', id);
    }

    usedIds.add(id);
    (heading as HTMLElement).style.scrollMarginTop = '6rem';

    const level = heading.tagName === 'H2' ? 2 : 3;
    tocItems.push({ id, text: cleanText, level });
  });

  // Serialize the modified DOM back to HTML string
  const processedHtml = root.innerHTML;
  return { html: processedHtml, toc: tocItems };
}

function BlogDetail() {
  const { slug } = useParams();
  const postQuery = useBlogPostQuery(slug, BLOG_CMS_SOURCE);
  const allPostsQuery = useBlogPostsQuery(BLOG_CMS_SOURCE);
  
  const post = postQuery.data;

  // Pre-process HTML to inject heading IDs and extract TOC
  const { html: renderedBody, toc, rawBody } = useMemo(() => {
    const raw = post ? toSafeHtml(post.body, BLOG_CMS_SOURCE) : '';
    const { html, toc: tocList } = processHtmlForToc(raw);
    return { html, toc: tocList, rawBody: raw };
  }, [post]);

  // States for interactive widgets
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeTocId, setActiveTocId] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll Progress Bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for TOC active highlighting
  useEffect(() => {
    if (!contentRef.current || !post) return;

    const headings = Array.from(contentRef.current.querySelectorAll('h2[id], h3[id]'));
    if (headings.length === 0) return;

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setActiveTocId(entry.target.id);
              break;
            }
          }
        },
        { rootMargin: '-80px 0px -70% 0px' }
      );
      headings.forEach((h) => observer?.observe(h));
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [post, slug]);

  // Related Posts
  const relatedPosts = useMemo(() => {
    if (!allPostsQuery.data || !post) return [];
    
    const targetTags = new Set(post.tags || []);
    
    return allPostsQuery.data
      .filter((p) => p.slug !== post.slug)
      .map((p) => {
        // Hitung irisan (intersection) tag yang sama
        const score = (p.tags || []).filter(tag => targetTags.has(tag)).length;
        return { post: p, score };
      })
      .sort((a, b) => {
        // Prioritaskan skor tag tertinggi
        if (a.score !== b.score) {
          return b.score - a.score;
        }
        // Jika skor sama, urutkan berdasarkan yang terbaru
        return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
      })
      .slice(0, 3)
      .map(item => item.post);
  }, [allPostsQuery.data, post]);

  const scrollToHeading = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

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

  const postImage = resolveCmsImageUrl(post.image, BLOG_CMS_SOURCE);
  const canonicalPath = `/blog/${post.slug}`;
  const wordCount = countWordsFromHtml(rawBody);
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
    <>
      {/* Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-light via-amber to-light z-50 rounded-r-full transition-[width] duration-100 ease-out" 
        style={{ width: `${scrollProgress}%` }} 
      />

      <div className="max-w-7xl mx-auto py-12 px-4 md:px-6 mb-24 relative lg:grid lg:grid-cols-[1fr_260px] lg:gap-12 items-start">
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

        {/* Main Article Column */}
        <div className="w-full min-w-0">
          {/* Top Navigation */}
          <nav className="mb-12">
            <Link 
              className="group inline-flex items-center gap-3 text-sm font-bold text-dark/60 dark:text-dark-text/60 hover:text-dark dark:hover:text-dark-text transition-all bg-dark/5 dark:bg-dark-text/5 px-4 py-2.5 rounded-full backdrop-blur-sm border border-dark/10 dark:border-dark-text/10 hover:-translate-x-1"
              to="/"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              <span className="uppercase tracking-widest">Beranda</span>
            </Link>
          </nav>

          <article className="relative max-w-3xl">
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-light/10 dark:bg-light/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

            {/* Header Artikel */}
            <header className="mb-16">
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags?.map((tag) => (
                  <span key={tag} className="px-4 py-1.5 text-xs uppercase tracking-widest font-bold bg-dark/5 dark:bg-dark-text/5 border border-dark/10 dark:border-dark-text/10 text-dark dark:text-dark-text rounded-full shadow-sm">
                    #{tag}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-dark dark:text-dark-text mb-10 tracking-tight">
                {post.title}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-5 rounded-2xl bg-cream/50 dark:bg-dark-bg-light/10 border border-dark/10 dark:border-dark-text/10 backdrop-blur-md shadow-lg shadow-dark/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-light to-dark rounded-xl flex items-center justify-center text-cream text-lg font-black shadow-md">
                    {post.author?.charAt(0) || 'C'}
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-base text-dark dark:text-dark-text flex items-center gap-2">
                      <User size={14} className="text-amber" />
                      {post.author || 'Anonim'}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-dark/60 dark:text-dark-text/60 font-medium">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-light" />
                        {formattedDate}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-light" />
                        {readingMinutes} menit baca
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inline Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dark/5 dark:bg-dark-text/5 hover:bg-dark/10 dark:hover:bg-dark-text/10 text-dark/70 dark:text-dark-text/70 text-sm font-semibold transition-all border border-dark/5 dark:border-dark-text/5"
                  aria-label="Bagikan artikel"
                >
                  <Share2 size={14} />
                  Bagikan
                </button>
              </div>
            </header>

            {/* Gambar Cover */}
            {post.image && (
              <div className="mb-16 relative group">
                <div className="absolute inset-0 bg-light/20 blur-[60px] -z-10 rounded-3xl transition-all group-hover:bg-amber/20" />
                <CdnImage
                  src={post.image}
                  cmsSource={BLOG_CMS_SOURCE}
                  alt={post.title}
                  className="w-full max-w-2xl h-auto mx-auto rounded-2xl shadow-2xl shadow-dark/15 border border-white/20 dark:border-dark-bg/50 object-cover relative z-10"
                />
              </div>
            )}

            {/* Content Area */}
            <div 
              ref={contentRef}
              className="prose prose-stone dark:prose-invert lg:prose-lg max-w-none 
              prose-p:leading-relaxed prose-p:text-dark/85 dark:prose-p:text-dark-text/85
              prose-headings:font-black prose-headings:tracking-tight prose-headings:text-dark dark:prose-headings:text-dark-text
              prose-h2:text-3xl prose-h2:mt-14 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-dark/10 dark:prose-h2:border-dark-text/10
              prose-h3:text-xl
              prose-img:rounded-2xl prose-img:shadow-xl prose-img:border prose-img:border-dark/5
              prose-blockquote:border-l-4 prose-blockquote:border-light prose-blockquote:bg-light/5 prose-blockquote:p-5 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-dark/70 dark:prose-blockquote:text-dark-text/70
              prose-strong:text-dark dark:prose-strong:text-dark-text
              prose-a:text-amber prose-a:no-underline hover:prose-a:underline hover:prose-a:text-light transition-all
              prose-li:marker:text-light font-medium"
            >
              <div dangerouslySetInnerHTML={{ __html: renderedBody }} />
            </div>

            {/* Footer Artikel */}
            <footer className="mt-20 pt-10 border-t border-dark/10 dark:border-dark-text/10 text-center relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber/10 blur-[50px] rounded-full -z-10 pointer-events-none" />
              <p className="text-base md:text-lg italic text-dark/60 dark:text-dark-text/60 mb-6 font-medium leading-relaxed">
                "Semoga catatan ini membawamu pada kejernihan pikiran."
              </p>
              <div className="flex justify-center items-center gap-3">
                <Sparkles size={16} className="text-amber" />
                <div className="flex gap-1.5">
                  <span className="w-1 h-1 bg-dark/20 dark:bg-dark-text/20 rounded-full" />
                  <span className="w-1 h-1 bg-dark/40 dark:bg-dark-text/40 rounded-full" />
                  <span className="w-1 h-1 bg-dark/20 dark:bg-dark-text/20 rounded-full" />
                </div>
                <Sparkles size={16} className="text-amber" />
              </div>
            </footer>
          </article>

          {/* Related Posts Widget */}
          {relatedPosts.length > 0 && (
            <div className="mt-24">
              <h2 className="text-2xl font-black text-dark dark:text-dark-text mb-8 flex items-center gap-3">
                <Sparkles className="text-amber" size={22} />
                Catatan Terkait
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard key={relatedPost.slug} {...relatedPost} cmsSource={BLOG_CMS_SOURCE} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Table of Contents (Desktop Only) */}
        <aside className="hidden lg:block sticky top-28 overflow-y-auto max-h-[calc(100vh-8rem)] pb-8">
          {toc.length > 0 && (
            <div className="p-5 rounded-2xl bg-dark/[0.03] dark:bg-dark-text/[0.03] border border-dark/[0.06] dark:border-dark-text/[0.06]">
              <h3 className="uppercase tracking-widest text-[11px] font-bold text-dark/40 dark:text-dark-text/40 mb-4 flex items-center gap-2">
                <List size={12} />
                Daftar Isi
              </h3>
              <nav className="flex flex-col gap-1 border-l-2 border-dark/[0.06] dark:border-dark-text/[0.06]">
                {toc.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToHeading(item.id)}
                    className={`text-left text-[13px] leading-snug py-1.5 transition-all duration-200 border-l-2 -ml-[2px] ${
                      item.level === 3 ? 'pl-5' : 'pl-3'
                    } ${
                      activeTocId === item.id 
                        ? 'border-amber text-dark dark:text-dark-text font-bold' 
                        : 'border-transparent text-dark/40 dark:text-dark-text/40 hover:text-dark/70 dark:hover:text-dark-text/70 hover:border-dark/20 dark:hover:border-dark-text/20 font-medium'
                    }`}
                  >
                    {item.text}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile-only floating share button */}
      <button
        onClick={handleShare}
        className="lg:hidden fixed bottom-6 right-6 w-12 h-12 rounded-full bg-dark dark:bg-dark-text text-cream dark:text-dark shadow-xl flex items-center justify-center z-40 hover:scale-105 active:scale-95 transition-transform"
        aria-label="Bagikan artikel"
      >
        <Share2 size={18} />
      </button>
    </>
  );
}

export default BlogDetail;