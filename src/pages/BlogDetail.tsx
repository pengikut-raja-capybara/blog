import { Link, useParams } from 'react-router';
import { BLOG_CMS_SOURCE } from '../features/blog/config/cmsSource';
import { useBlogPostQuery } from '../features/blog/hooks/useBlogQueries';
import { toSafeHtml } from '../utils/richContent';

function BlogDetail() {
  const { slug } = useParams();
  const postQuery = useBlogPostQuery(slug, BLOG_CMS_SOURCE);

  const post = postQuery.data;

  if (postQuery.isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12 md:px-8">
        <p className="text-sm text-stone-600">Memuat artikel...</p>
      </main>
    );
  }

  if (postQuery.error) {
    const message =
      postQuery.error instanceof Error
        ? postQuery.error.message
        : 'Gagal memuat artikel.';

    return (
      <main className="mx-auto max-w-3xl px-6 py-12 md:px-8">
        <p className="text-sm text-rose-700">{message}</p>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12 md:px-8">
        <p className="text-sm text-stone-700">Artikel tidak ditemukan.</p>
      </main>
    );
  }

  const renderedBody = toSafeHtml(post.body);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:px-8">
      <Link className="text-sm font-medium text-amber-700 hover:underline" to="/">
        Kembali ke Home
      </Link>
      <h1 className="mt-4 text-3xl font-black text-stone-900">{post.title}</h1>
      <p className="mt-2 text-sm text-stone-500">{post.date}</p>
      <article className="prose prose-stone mt-8 max-w-none text-stone-700">
        <div dangerouslySetInnerHTML={{ __html: renderedBody }} />
      </article>
    </main>
  );
}

export default BlogDetail;
