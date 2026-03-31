import type { BlogPost } from '../../../types/blog';
import { Link } from 'react-router';
import CdnImage from '../../../components/ui/CdnImage';
import type { CmsSourceConfig } from '../services/cms';

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
  const displayedTags = tags.slice(0, 2);

  return (
    <article className="group overflow-hidden rounded-2xl border border-stone-200/70 bg-gradient-to-b from-stone-50 to-amber-50 shadow-sm transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:shadow-stone-900/10">
      <Link to={`/blog/${slug}`} aria-label={`Buka artikel: ${title}`}>
        <div className="relative h-52 overflow-hidden bg-stone-200">
          <CdnImage
            src={image}
            cmsSource={cmsSource}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            decoding="async"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>

        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold leading-snug text-stone-900">
              {title}
            </h2>
          </div>
          <p className="line-clamp-3 text-sm leading-relaxed text-stone-700">
            {excerpt}
          </p>

          {displayedTags.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {displayedTags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-stone-300/70 bg-stone-100/80 px-2.5 py-1 text-[11px] font-medium text-stone-700"
                >
                  #{tag}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex items-center justify-between gap-3 border-t border-stone-200/80 pt-3 text-[11px] text-stone-500">
            <time className="block font-medium" dateTime={date}>
              {formattedDate}
            </time>
            {author ? (
              <p className="truncate text-right text-xs font-semibold text-stone-700">
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