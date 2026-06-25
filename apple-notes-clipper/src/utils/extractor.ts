import { Readability } from '@mozilla/readability';
import DOMPurify from 'dompurify';
import { ALLOWED_TAGS, ALLOWED_ATTR } from './constants';
import { extractMetadata, PageMetadata } from './metadata';

export interface ClipResult {
  metadata: PageMetadata;
  content: string;
  textContent: string;
  isSelection: boolean;
}

export function clipPage(useSelection: boolean): ClipResult | null {
  const metadata = extractMetadata(document);

  if (useSelection) {
    const selectionHtml = getSelectionHtml();
    if (selectionHtml) {
      const sanitized = sanitize(selectionHtml);
      return {
        metadata,
        content: sanitized,
        textContent: stripHtml(sanitized).slice(0, 300),
        isSelection: true,
      };
    }
  }

  const docClone = document.cloneNode(true) as Document;
  const reader = new Readability(docClone);
  const article = reader.parse();

  if (!article) {
    const fallback = sanitize(document.body.innerHTML);
    return {
      metadata,
      content: fallback,
      textContent: stripHtml(fallback).slice(0, 300),
      isSelection: false,
    };
  }

  const sanitized = sanitize(article.content);

  if (article.title) metadata.title = article.title;
  if (article.byline) metadata.author = article.byline;
  if (article.excerpt) metadata.description = article.excerpt;
  if (article.siteName) metadata.siteName = article.siteName;

  return {
    metadata,
    content: sanitized,
    textContent: (article.textContent || '').slice(0, 300),
    isSelection: false,
  };
}

function getSelectionHtml(): string | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;

  const range = sel.getRangeAt(0);
  const container = document.createElement('div');
  container.appendChild(range.cloneContents());
  return container.innerHTML || null;
}

function sanitize(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    KEEP_CONTENT: true,
    ALLOW_DATA_ATTR: false,
  });
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}
