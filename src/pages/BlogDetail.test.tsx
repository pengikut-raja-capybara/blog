import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BLOG_CMS_SOURCE } from '../features/blog/config/cmsSource';
import { blogQueryKeys } from '../features/blog/services/queryKeys';
import BlogDetail from './BlogDetail';
import type { BlogPost } from '../types/blog';
import { createTestQueryClient, renderWithProviders } from '../test/utils';

const { mockFetchPostBySlug } = vi.hoisted(() => {
  return {
    mockFetchPostBySlug: vi.fn(),
  };
});

vi.mock('../features/blog/services/cms', () => ({
  fetchPostBySlug: mockFetchPostBySlug,
  resolveCmsImageUrl: (imagePath: string | undefined) => {
    if (!imagePath) return '/images/placeholder-blog.jpg';
    if (/^https?:\/\//i.test(imagePath)) return imagePath;
    return `https://cdn.jsdelivr.net/gh/pengikut-raja-capybara/blog@content/public${imagePath}`;
  },
}));

function renderDetail(path: string, queryClient = createTestQueryClient()) {
  return renderWithProviders(<BlogDetail />, {
    queryClient,
    route: path,
    routePath: '/blog/:slug',
  });
}

describe('BlogDetail', () => {
  it('menggunakan data cache dari list posts tanpa fetch detail baru', async () => {
    const post: BlogPost = {
      title: 'Pengikut Raja Capybara',
      slug: 'pengikut-raja-capybara',
      image: '/images/capybara-forest.jpg',
      date: '2026-03-31',
      author: 'Raja Capybara',
      tags: ['alam'],
      excerpt: 'Catatan damai dari tepian sungai.',
      body: 'Konten artikel cache.',
    };

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(blogQueryKeys.posts(BLOG_CMS_SOURCE), [post]);

    renderDetail('/blog/pengikut-raja-capybara', queryClient);

    expect(await screen.findByRole('heading', { name: post.title })).toBeTruthy();
    expect(mockFetchPostBySlug).not.toHaveBeenCalled();
  });

  it('melakukan fetch detail jika cache tidak tersedia', async () => {
    const post: BlogPost = {
      title: 'Strategi Sungai Raja Capybara',
      slug: 'strategi-sungai-raja-capybara',
      image: '/images/capybara-river.jpg',
      date: '2026-03-30',
      author: 'Raja Capybara',
      tags: ['strategi'],
      excerpt: 'Strategi hidup damai.',
      body: 'Konten artikel jaringan.',
    };

    mockFetchPostBySlug.mockResolvedValueOnce(post);

    const queryClient = createTestQueryClient();

    renderDetail('/blog/strategi-sungai-raja-capybara', queryClient);

    expect(await screen.findByRole('heading', { name: post.title })).toBeTruthy();
    expect(mockFetchPostBySlug).toHaveBeenCalledWith(post.slug, BLOG_CMS_SOURCE);
  });

  it('merender body markdown menjadi HTML', async () => {
    const post: BlogPost = {
      title: 'Markdown Raja Capybara',
      slug: 'markdown-raja-capybara',
      image: '/images/capybara-markdown.jpg',
      date: '2026-03-29',
      author: 'Raja Capybara',
      tags: ['markdown'],
      excerpt: 'Contoh markdown.',
      body: '## Subjudul Markdown\n\nIni **tebal** dan [Tautan](https://example.com).\n\n![Capybara](/images/capybara-inline.jpg)',
    };

    mockFetchPostBySlug.mockResolvedValueOnce(post);

    const queryClient = createTestQueryClient();

    renderDetail('/blog/markdown-raja-capybara', queryClient);

    expect(await screen.findByRole('heading', { name: post.title })).toBeTruthy();
    expect(screen.getByText('Subjudul Markdown')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Tautan' }).getAttribute('href')).toBe(
      'https://example.com',
    );
    expect(screen.getByAltText('Capybara').getAttribute('src')).toBe(
      'https://cdn.jsdelivr.net/gh/pengikut-raja-capybara/blog@content/public/images/capybara-inline.jpg',
    );
  });

  it('merender body HTML dan menyaring elemen berbahaya', async () => {
    const post: BlogPost = {
      title: 'HTML Raja Capybara',
      slug: 'html-raja-capybara',
      image: '/images/capybara-html.jpg',
      date: '2026-03-28',
      author: 'Raja Capybara',
      tags: ['html'],
      excerpt: 'Contoh html.',
      body: '<h2>Subjudul HTML</h2><p>Isi aman</p><script>alert(1)</script>',
    };

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(blogQueryKeys.posts(BLOG_CMS_SOURCE), [post]);

    const { container } = renderDetail('/blog/html-raja-capybara', queryClient);

    expect(await screen.findByRole('heading', { name: post.title })).toBeTruthy();
    expect(screen.getByText('Subjudul HTML')).toBeTruthy();
    expect(container.querySelector('script')).toBeNull();
  });

  it('merender body rich-text JSON dari CMS', async () => {
    const post: BlogPost = {
      title: 'Rich Text Raja Capybara',
      slug: 'rich-text-raja-capybara',
      image: '/images/capybara-richtext.jpg',
      date: '2026-03-27',
      author: 'Raja Capybara',
      tags: ['rich-text'],
      excerpt: 'Contoh rich-text JSON.',
      body: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Subjudul JSON' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Ini konten ' },
              {
                type: 'text',
                text: 'tebal',
                marks: [{ type: 'strong' }],
              },
            ],
          },
        ],
      },
    };

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(blogQueryKeys.posts(BLOG_CMS_SOURCE), [post]);

    renderDetail('/blog/rich-text-raja-capybara', queryClient);

    expect(await screen.findByRole('heading', { name: post.title })).toBeTruthy();
    expect(screen.getByText('Subjudul JSON')).toBeTruthy();
    expect(screen.getByText('tebal').tagName).toBe('STRONG');
  });
});
