export interface PageMetadata {
  title: string;
  author: string | null;
  description: string | null;
  siteName: string | null;
  publishedDate: string | null;
  url: string;
  favicon: string | null;
}

export function extractMetadata(doc: Document): PageMetadata {
  const getMeta = (selectors: string[]): string | null => {
    for (const sel of selectors) {
      const el = doc.querySelector(sel);
      if (el) {
        const content = el.getAttribute('content') || el.textContent;
        if (content?.trim()) return content.trim();
      }
    }
    return null;
  };

  let hostname = '';
  try {
    hostname = new URL(doc.URL).hostname;
  } catch {
    // ignore invalid URLs
  }

  return {
    title: getMeta([
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
    ]) || doc.title || '',
    author: getMeta([
      'meta[name="author"]',
      'meta[property="article:author"]',
    ]),
    description: getMeta([
      'meta[property="og:description"]',
      'meta[name="description"]',
    ]),
    siteName: getMeta([
      'meta[property="og:site_name"]',
    ]) || hostname,
    publishedDate: getMeta([
      'meta[property="article:published_time"]',
      'meta[name="date"]',
    ]),
    url: doc.URL,
    favicon: getFavicon(doc),
  };
}

function getFavicon(doc: Document): string | null {
  const link = doc.querySelector(
    'link[rel="icon"], link[rel="shortcut icon"]'
  ) as HTMLLinkElement | null;
  if (link?.href) return link.href;
  try {
    return new URL('/favicon.ico', doc.URL).href;
  } catch {
    return null;
  }
}
