// src/api-requests/content-queries/posts-related.js
// REST APIs used:
// - wp/v2/posts/{id}?_fields=categories,tags,type,status
// - wp/v2/posts?categories=...&tags=...&exclude=...&_embed=1

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

const fetchPostTax = async (postId) => {
  const pid = Number(postId) || 0;
  if (!pid) return null;

  const url = new URL(`${getRestBase()}wp/v2/posts/${pid}`);
  url.searchParams.set('_fields', 'id,categories,tags,type,status');

  const data = await fetchJson(url.toString());
  return {
    id: Number(data?.id) || pid,
    categories: Array.isArray(data?.categories) ? data.categories : [],
    tags: Array.isArray(data?.tags) ? data.tags : [],
    type: String(data?.type || 'post'),
    status: String(data?.status || ''),
  };
};

const fetchRecentPosts = async ({ excludeId, perPage, order, orderBy } = {}) => {
  const per = clampInt(perPage, 1, 24, 6);
  const ord = order === 'asc' ? 'asc' : 'desc';
  const ob = String(orderBy || 'date');

  const url = new URL(`${getRestBase()}wp/v2/posts`);
  url.searchParams.set('per_page', String(per));
  url.searchParams.set('order', ord);
  url.searchParams.set('orderby', ob);
  url.searchParams.set('_embed', '1');

  if (excludeId) url.searchParams.set('exclude', String(Number(excludeId) || 0));

  const items = await fetchJson(url.toString());
  return Array.isArray(items) ? items : [];
};

export const fetchPostsRelated = async ({
  postId,
  perPage = 6,
  order = 'desc',
  orderBy = 'date',
  relateBy = 'categories', // 'categories' | 'tags' | 'both'
  fallbackToRecent = true,
} = {}) => {
  const pid = Number(postId) || 0;
  if (!pid) return [];

  const per = clampInt(perPage, 1, 24, 6);
  const ord = order === 'asc' ? 'asc' : 'desc';
  const ob = String(orderBy || 'date');
  const mode = String(relateBy || 'categories');

  const tax = await fetchPostTax(pid);

  const cats = (tax?.categories || []).slice(0, 10).map(Number).filter(Boolean);
  const tags = (tax?.tags || []).slice(0, 10).map(Number).filter(Boolean);

  const base = new URL(`${getRestBase()}wp/v2/posts`);
  base.searchParams.set('per_page', String(per));
  base.searchParams.set('order', ord);
  base.searchParams.set('orderby', ob);
  base.searchParams.set('_embed', '1');
  base.searchParams.set('exclude', String(pid));

  const doQuery = async (u) => {
    const items = await fetchJson(u.toString());
    return Array.isArray(items) ? items : [];
  };

  const hasCats = cats.length > 0;
  const hasTags = tags.length > 0;

  const setCats = (u) => {
    if (hasCats) u.searchParams.set('categories', cats.join(','));
  };
  const setTags = (u) => {
    if (hasTags) u.searchParams.set('tags', tags.join(','));
  };

  let items = [];

  if (mode === 'tags') {
    if (hasTags) {
      const u = new URL(base.toString());
      setTags(u);
      items = await doQuery(u);
    }
  } else if (mode === 'both') {
    if (hasCats || hasTags) {
      const u = new URL(base.toString());
      if (hasCats) setCats(u);
      if (hasTags) setTags(u);
      items = await doQuery(u);

      if (items.length === 0 && hasCats) {
        const u2 = new URL(base.toString());
        setCats(u2);
        items = await doQuery(u2);
      }
      if (items.length === 0 && hasTags) {
        const u3 = new URL(base.toString());
        setTags(u3);
        items = await doQuery(u3);
      }
    }
  } else {
    // default categories
    if (hasCats) {
      const u = new URL(base.toString());
      setCats(u);
      items = await doQuery(u);
    }
  }

  if (items.length === 0 && fallbackToRecent) {
    return fetchRecentPosts({ excludeId: pid, perPage: per, order: ord, orderBy: ob });
  }

  return items;
};
