import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks.
 * This function uses DOMPurify to strip dangerous tags and attributes.
 *
 * It is designed to be used with dangerouslySetInnerHTML.
 * On the server, it returns an empty string to avoid hydration mismatches
 * (since DOMPurify requires a DOM, which is only available on the client).
 *
 * @param html The potentially unsafe HTML string.
 * @returns The sanitized HTML string (or empty string on server).
 */
export const sanitizeHtml = (html: string): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'a', 'abbr', 'address', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo',
      'blockquote', 'br', 'caption', 'cite', 'code', 'col', 'colgroup',
      'data', 'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em',
      'figcaption', 'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'header', 'hgroup', 'hr', 'i', 'img', 'ins', 'kbd', 'label', 'legend',
      'li', 'main', 'mark', 'meter', 'nav', 'ol', 'p', 'pre', 'progress',
      'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'small', 'span',
      'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot',
      'th', 'thead', 'time', 'tr', 'u', 'ul', 'var', 'video', 'wbr'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'class', 'style',
      'width', 'height', 'title', 'align', 'valign', 'data-reference',
      'colspan', 'rowspan', 'headers', 'scope'
    ],
    ADD_ATTR: ['target'], // Ensure target is allowed if not already covered by ALLOWED_ATTR
  });
};
