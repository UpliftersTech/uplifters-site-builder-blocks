const DEFAULT_PER_PAGE = 6;
const MAX_PER_PAGE = 100;

const toSafeInteger = (value, fallback = DEFAULT_PER_PAGE) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.trunc(number);
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const trimSlashes = (value) => String(value || '').replace(/^\/+|\/+$/g, '');

const getWpRestRoot = () => {
  const settingsRoot = typeof window !== 'undefined' ? window.wpApiSettings?.root : '';

  if (settingsRoot) {
    return `${settingsRoot.replace(/\/+$/g, '')}/`;
  }

  return '/wp-json/';
};

const getNonce = () => (typeof window !== 'undefined' ? window.wpApiSettings?.nonce || '' : '');

const buildWpRestUrl = (path, params = {}) => {
  const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost';
  const url = new URL(`${getWpRestRoot()}${trimSlashes(path)}`, origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
};

const normalizeRenderedField = (field) => {
  if (!field) {
    return '';
  }

  if (typeof field === 'string') {
    return field;
  }

  if (typeof field.rendered === 'string') {
    return field.rendered;
  }

  return String(field);
};

const normalizePost = (post) => ({
  id: Number(post?.id) || 0,
  link: post?.link || '',
  permalink: post?.link || '',
  title: {
    rendered: normalizeRenderedField(post?.title),
  },
  excerpt: {
    rendered: normalizeRenderedField(post?.excerpt),
  },
  content: {
    rendered: normalizeRenderedField(post?.content),
  },
});

export const fetchPostsContent = async ({ perPage = DEFAULT_PER_PAGE } = {}) => {
  const safePerPage = clamp(toSafeInteger(perPage, DEFAULT_PER_PAGE), 1, MAX_PER_PAGE);
  const url = buildWpRestUrl('wp/v2/posts', {
    per_page: safePerPage,
    status: 'publish',
    orderby: 'date',
    order: 'desc',
    _fields: 'id,link,title,excerpt,content',
  });

  const headers = {
    Accept: 'application/json',
  };

  const nonce = getNonce();

  if (nonce) {
    headers['X-WP-Nonce'] = nonce;
  }

  if (typeof window === 'undefined' || typeof window.fetch !== 'function') {
    throw new Error('PostsTextContent requires the browser fetch API.');
  }

  const response = await window.fetch(url, {
    method: 'GET',
    credentials: 'same-origin',
    headers,
  });

  if (!response.ok) {
    throw new Error(`PostsTextContent request failed with status ${response.status}`);
  }

  const data = await response.json();

  return Array.isArray(data) ? data.map(normalizePost).filter((post) => post.id) : [];
};
