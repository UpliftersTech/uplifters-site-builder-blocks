// Gen/PostList.js  (UPDATED)  -> now provides: fetchPostsCommentList + post-id inference helpers
// WordPress core REST API: wp/v2/comments

const clampInt = (value, min, max, fallback) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? Math.trunc(n) : fallback;
  return Math.min(max, Math.max(min, safe));
};

const getRestBase = () => {
  const wp = window.wpApiSettings ?? {};
  let base =
    wp.root ||
    document.querySelector('link[rel="https://api.w.org/"]')?.href ||
    `${window.location.origin}/wp-json/`;
  return base.endsWith('/') ? base : `${base}/`;
};

const fetchJson = async (url) => {
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });

  if (res.ok) return res.json();

  const text = await res.text().catch(() => '');
  throw new Error(`HTTP ${res.status}${text ? `: ${text}` : ''}`);
};

// ✅ Frontend: infer post/page ID from body classes (works in themes + FSE templates)
export const inferPostIdFromBodyClass = () => {
  const cls = document?.body?.className || '';

  // common WP classes:
  // - postid-123 (single post)
  // - page-id-123 (page)
  // - attachment-id-123 (attachment)
  const m =
    cls.match(/\bpostid-(\d+)\b/i) ||
    cls.match(/\bpage-id-(\d+)\b/i) ||
    cls.match(/\battachment-id-(\d+)\b/i);

  return m ? Number(m[1]) || 0 : 0;
};

// ✅ Editor: best-effort inference (post editor, sometimes site editor)
export const inferCurrentPostId = () => {
  try {
    // Editor context (post/page editor)
    const id = window?.wp?.data?.select?.('core/editor')?.getCurrentPostId?.();
    if (id) return Number(id) || 0;
  } catch {
    // ignore
  }

  // Fallback: body class
  return inferPostIdFromBodyClass();
};

export const fetchPostsCommentList = async ({ postId, perPage = 10, order = 'asc' } = {}) => {
  const pid = Number(postId) || 0;
  if (!pid) return [];

  const per = clampInt(perPage, 1, 100, 10);
  const ord = order === 'desc' ? 'desc' : 'asc';

  const url = new URL(`${getRestBase()}wp/v2/comments`);
  url.searchParams.set('post', String(pid));
  url.searchParams.set('per_page', String(per));
  url.searchParams.set('order', ord);
  url.searchParams.set('orderby', 'date');

  // keep payload small but useful
  url.searchParams.set(
    '_fields',
    'id,parent,author_name,author_url,author_avatar_urls,date,date_gmt,link,content'
  );

  const items = await fetchJson(url.toString());
  return Array.isArray(items) ? items : [];
};