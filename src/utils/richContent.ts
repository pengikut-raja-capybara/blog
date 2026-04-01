import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { resolveCmsImageUrl, type CmsSourceConfig } from '../features/blog/services/cms';
import type { BlogBody } from '../types/blog';

const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;

export type ContentFormat = 'markdown' | 'html';

function toRenderableImagePath(path: string, cmsSource?: CmsSourceConfig): string {
  const trimmedPath = path.trim();

  if (!trimmedPath || /^(?:https?:|data:|blob:|\/\/)/i.test(trimmedPath)) {
    return trimmedPath;
  }

  const withoutDotPrefix = trimmedPath.replace(/^\.\//, '');
  const normalizedPath = withoutDotPrefix.startsWith('/')
    ? withoutDotPrefix
    : `/${withoutDotPrefix}`;

  if (normalizedPath.startsWith('/public/')) {
    return normalizedPath;
  }

  if (normalizedPath.startsWith('/images/')) {
    return cmsSource ? resolveCmsImageUrl(normalizedPath, cmsSource) : normalizedPath;
  }

  return normalizedPath;
}

function normalizeInlineImageSrc(html: string, cmsSource?: CmsSourceConfig): string {
  return html.replace(
    /(<img\b[^>]*\bsrc\s*=\s*["'])([^"']+)(["'][^>]*>)/gi,
    (_match, prefix: string, src: string, suffix: string) =>
      `${prefix}${toRenderableImagePath(src, cmsSource)}${suffix}`,
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stringifyTextValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function parseMarkdownToHtml(markdown: string): string {
  const result = marked.parse(markdown, {
    async: false,
    gfm: true,
    breaks: true,
  });

  return typeof result === 'string' ? result : '';
}

function getRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function renderMarks(text: string, marks: unknown): string {
  if (!Array.isArray(marks)) {
    return text;
  }

  return marks.reduce((acc, markValue) => {
    const mark = getRecord(markValue);

    if (!mark) {
      return acc;
    }

    const markType = stringifyTextValue(mark.type).toLowerCase();
    const attrs = getRecord(mark.attrs);

    if (markType === 'bold' || markType === 'strong') {
      return `<strong>${acc}</strong>`;
    }

    if (markType === 'italic' || markType === 'em') {
      return `<em>${acc}</em>`;
    }

    if (markType === 'code') {
      return `<code>${acc}</code>`;
    }

    if (markType === 'link') {
      const href = stringifyTextValue(attrs?.href).trim();
      const safeHref = href ? escapeHtml(href) : '#';
      return `<a href="${safeHref}" rel="noopener noreferrer" target="_blank">${acc}</a>`;
    }

    return acc;
  }, text);
}

function renderRichNode(node: unknown): string {
  if (typeof node === 'string') {
    return `<p>${escapeHtml(node)}</p>`;
  }

  const record = getRecord(node);

  if (!record) {
    return '';
  }

  const textValue = stringifyTextValue(record.text);
  if (textValue) {
    const safeText = escapeHtml(textValue);
    return renderMarks(safeText, record.marks);
  }

  const type = stringifyTextValue(record.type).toLowerCase();
  const attrs = getRecord(record.attrs);
  const children = Array.isArray(record.children)
    ? record.children
    : Array.isArray(record.content)
      ? record.content
      : [];
  const childHtml = children.map(renderRichNode).join('');

  if (type === 'doc' || type === 'root') {
    return childHtml;
  }

  if (type === 'paragraph') {
    return `<p>${childHtml}</p>`;
  }

  if (type.startsWith('heading')) {
    const level = type === 'heading' ? Number(attrs?.level ?? 2) : Number(type.replace('heading', ''));
    const safeLevel = Number.isFinite(level) && level >= 1 && level <= 6 ? level : 2;
    return `<h${safeLevel}>${childHtml}</h${safeLevel}>`;
  }

  if (type === 'bulletlist' || type === 'unorderedlist' || type === 'list') {
    return `<ul>${childHtml}</ul>`;
  }

  if (type === 'orderedlist') {
    return `<ol>${childHtml}</ol>`;
  }

  if (type === 'listitem' || type === 'list_item') {
    return `<li>${childHtml}</li>`;
  }

  if (type === 'blockquote' || type === 'quote') {
    return `<blockquote>${childHtml}</blockquote>`;
  }

  if (type === 'codeblock' || type === 'code_block') {
    return `<pre><code>${escapeHtml(stringifyTextValue(record.value) || childHtml)}</code></pre>`;
  }

  if (type === 'hardbreak' || type === 'linebreak' || type === 'br') {
    return '<br />';
  }

  if (type === 'link') {
    const href = stringifyTextValue(attrs?.href).trim();
    const safeHref = href ? escapeHtml(href) : '#';
    return `<a href="${safeHref}" rel="noopener noreferrer" target="_blank">${childHtml}</a>`;
  }

  if (type === 'image') {
    const src = stringifyTextValue(attrs?.src).trim();
    const alt = escapeHtml(stringifyTextValue(attrs?.alt));

    if (!src) {
      return '';
    }

    return `<img src="${escapeHtml(src)}" alt="${alt}" />`;
  }

  return childHtml;
}

function extractContentString(body: BlogBody): string {
  if (typeof body === 'string') {
    return body;
  }

  if (Array.isArray(body)) {
    return body.map(renderRichNode).join('');
  }

  const bodyRecord = getRecord(body);

  if (!bodyRecord) {
    return '';
  }

  const html = stringifyTextValue(bodyRecord.html);
  if (html) {
    return html;
  }

  const markdown = stringifyTextValue(bodyRecord.markdown || bodyRecord.md);
  if (markdown) {
    return parseMarkdownToHtml(markdown);
  }

  if (typeof bodyRecord.body === 'string') {
    return bodyRecord.body;
  }

  const content = bodyRecord.content;
  if (Array.isArray(content)) {
    return content.map(renderRichNode).join('');
  }

  const root = getRecord(bodyRecord.root);
  if (root && Array.isArray(root.children)) {
    return root.children.map(renderRichNode).join('');
  }

  return renderRichNode(bodyRecord);
}

export function detectContentFormat(body: string): ContentFormat {
  const content = body.trim();

  if (!content) {
    return 'markdown';
  }

  return HTML_TAG_PATTERN.test(content) ? 'html' : 'markdown';
}

export function extractMarkdownBody(body: BlogBody): string | null {
  if (typeof body === 'string') {
    return detectContentFormat(body) === 'markdown' ? body : null;
  }

  if (Array.isArray(body)) {
    return null;
  }

  const record = getRecord(body);
  if (!record) {
    return null;
  }

  const markdown = stringifyTextValue(record.markdown || record.md);
  if (markdown) {
    return markdown;
  }

  const rawBody = stringifyTextValue(record.body);
  if (rawBody && detectContentFormat(rawBody) === 'markdown') {
    return rawBody;
  }

  return null;
}

export function toSafeHtml(body: BlogBody, cmsSource?: CmsSourceConfig): string {
  const content = extractContentString(body).trim();

  if (!content) {
    return '';
  }

  const format = detectContentFormat(content);
  const rawHtml = format === 'html' ? content : parseMarkdownToHtml(content);

  const safeHtml = DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
  });

  return normalizeInlineImageSrc(safeHtml, cmsSource);
}