import DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string): string => {
  if (typeof window === 'undefined') {
    return '';
  }
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target', 'data-reference'],
    ADD_TAGS: ['span'],
  });
};
