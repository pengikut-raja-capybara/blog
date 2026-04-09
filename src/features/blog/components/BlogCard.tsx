import type { BlogPost } from '../../../types/blog';
import { Link } from 'react-router';
import CdnImage from '../../../components/ui/CdnImage';
import type { CmsSourceConfig } from '../types/cms';

type BlogCardProps = Pick<
  BlogPost,
  'title' | 'excerpt' | 'date' | 'image' | 'slug' | 'tags' | 'author'
> & {
  cmsSource?: CmsSourceConfig;
};

function BlogCard({
  title,
  excerpt,
  date,
  image,
  slug,
  tags,
  author,
  cmsSource,
}: BlogCardProps) {
  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const safeTags = Array.isArray(tags) && tags.length > 0 ? tags : ['Catatan'];

  return (
    <article className="group flex h-full overflow-hidden rounded-2xl border border-tan/20 bg-gradient-to-b from-cream to-cream/80 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-dark/10 dark:border-dark-bg-light/30 dark:from-dark-bg-light dark:to-dark-bg dark:hover:shadow-dark-bg-light/30">
      <Link to={`/blog/${slug}`} aria-label={`Buka artikel: ${title}`} className="flex h-full w-full flex-col">
        <div className="relative h-52 overflow-hidden bg-tan/20 dark:bg-dark-bg-light/30">
          <CdnImage
            src={image}
            cmsSource={cmsSource}
            alt={title}
            proxyWidth={480}
            proxyQuality={48}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            decoding="async"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>

        <div className="flex flex-1 flex-col space-y-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="line-clamp-2 text-base font-semibold leading-snug text-dark dark:text-dark-text">
              {title}
            </h2>
          </div>
          <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-dark/70 dark:text-dark-text/70">
            {excerpt}
          </p>

          <ul className="flex flex-wrap gap-1.5 overflow-hidden max-h-[22px]">
            {safeTags.map((tag) => (
              <li
                key={tag}
                className="truncate rounded-full border border-tan/20 dark:border-dark-bg-light/30 bg-cream/80 dark:bg-dark-bg-light/20 px-2 py-0.5 text-[10px] font-medium text-dark/70 dark:text-dark-text/70"
                style={{ maxWidth: '120px' }}
              >
                #{tag}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-tan/20 pt-3 text-[11px] text-dark/50 dark:border-dark-bg-light/30 dark:text-dark-text/50">
            <time className="block font-medium" dateTime={date}>
              {formattedDate}
            </time>
            {author ? (
              <p className="truncate text-right text-xs font-semibold text-dark/70 dark:text-dark-text/70">
                {author}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}

export default BlogCard;