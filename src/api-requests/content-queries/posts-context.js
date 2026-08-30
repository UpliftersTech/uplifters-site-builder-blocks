// src/api-requests/content-queries/posts-context.js
// Shared helpers for getting current post/page ID

// ✅ Frontend: infer post/page ID from body classes (FSE + classic)
export const inferPostIdFromBodyClass = () => {
  const cls = document?.body?.className || '';

  // Common WP classes:
  // postid-123 (single post), page-id-123 (page), attachment-id-123
  const m =
    cls.match(/\bpostid-(\d+)\b/i) ||
    cls.match(/\bpage-id-(\d+)\b/i) ||
    cls.match(/\battachment-id-(\d+)\b/i);

  return m ? Number(m[1]) || 0 : 0;
};

// ✅ Editor: best-effort inference (post/page editor; site editor often)
export const inferCurrentPostId = () => {
  try {
    const id = window?.wp?.data?.select?.('core/editor')?.getCurrentPostId?.();
    if (id) return Number(id) || 0;
  } catch {
    // ignore
  }

  // fallback
  return inferPostIdFromBodyClass();
};


