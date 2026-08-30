// src/api-requests/content-queries/posts-list.js (WordPress core REST API wp/v2/posts + wp/v2/media)

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

const stripHtml = (html) => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(String(html), 'text/html');
  return (doc.body?.textContent || '').replace(/\s+/g, ' ').trim();
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

const pickBestMediaUrl = (m) => {
  if (!m) return '';
  const sizes = m?.media_details?.sizes || {};
  return (
    sizes?.medium?.source_url ||
    sizes?.large?.source_url ||
    sizes?.full?.source_url ||
    m?.source_url ||
    ''
  );
};

const fetchMediaMap = async (ids) => {
  const clean = Array.from(new Set(ids.map((x) => Number(x)).filter((x) => x > 0)));
  if (clean.length === 0) return new Map();

  const url = new URL(`${getRestBase()}wp/v2/media`);
  url.searchParams.set('include', clean.join(','));
  url.searchParams.set('per_page', String(Math.min(100, clean.length)));
  url.searchParams.set('_fields', 'id,source_url,alt_text,media_details');

  const mediaItems = await fetchJson(url.toString());
  const map = new Map();

  (Array.isArray(mediaItems) ? mediaItems : []).forEach((m) => {
    const id = Number(m?.id) || 0;
    if (!id) return;

    map.set(id, {
      url: String(pickBestMediaUrl(m) || ''),
      alt: String(m?.alt_text || ''),
    });
  });

  return map;
};

export const fetchPostsList = async ({ perPage = 6 } = {}) => {
  const per = clampInt(perPage, 1, 24, 6);

  const url = new URL(`${getRestBase()}wp/v2/posts`);
  url.searchParams.set('per_page', String(per));

  // The posts response needs the featured_media ID.
  url.searchParams.set(
    '_fields',
    'id,title,excerpt,link,date,date_gmt,modified,modified_gmt,featured_media'
  );

  const items = await fetchJson(url.toString());
  const posts = Array.isArray(items) ? items : [];

  // ✅ batch fetch media (guaranteed)
  const mediaIds = posts.map((p) => p?.featured_media).filter((x) => Number(x) > 0);
  const mediaMap = await fetchMediaMap(mediaIds);

  return posts.map((p) => {
    const title = stripHtml(p?.title?.rendered);
    const excerpt = stripHtml(p?.excerpt?.rendered);

    const fmId = Number(p?.featured_media) || 0;
    const media = fmId ? mediaMap.get(fmId) : null;

    return {
      id: Number(p?.id) || 0,
      title,
      excerpt, // Full plain text; trimming happens in the UI.
      permalink: String(p?.link || ''),

      date: String(p?.date || ''),
      date_gmt: String(p?.date_gmt || ''),
      modified: String(p?.modified || ''),
      modified_gmt: String(p?.modified_gmt || ''),

      featuredImageUrl: String(media?.url || ''),
      featuredImageAlt: String(media?.alt || ''),
    };
  });
};
