export const SAFE_ENDPOINTS = new Set(['posts', 'pages']);
export const SAFE_POST_TYPES = new Set(['post', 'page']);

export const mapPostTypeToEndpoint = (postType) => {
  const mapping = { post: 'posts', page: 'pages' };
  return mapping[postType] || postType || 'posts';
};

export const clamp = (n, min, max) => Math.min(max, Math.max(min, Number(n)));

export const hexToRgba = (hex, alpha = 1) => {
  if (!hex) return `rgba(17, 24, 39, ${alpha})`;

  let value = String(hex).replace('#', '').trim();

  if (value.length === 3) {
    value = value.split('').map((part) => part + part).join('');
  }

  if (value.length !== 6) return `rgba(17, 24, 39, ${alpha})`;

  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const formatDate = (dateValue, formatKey) => {
  if (!dateValue) return '';

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';

  const pad2 = (n) => String(n).padStart(2, '0');
  const day = pad2(date.getDate());
  const month = pad2(date.getMonth() + 1);
  const year = String(date.getFullYear());
  const monthShort = date.toLocaleString(undefined, { month: 'short' });
  const time12 = date.toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  switch (formatKey) {
    case 'd/m/Y':
      return `${day}/${month}/${year}`;
    case 'Mon-dd-YYYY':
      return `${monthShort}-${day}-${year}`;
    case 'Mon-dd-YYYY-time':
      return `${monthShort}-${day}-${year} ${time12}`;
    case 'd-m-Y':
    default:
      return `${day}-${month}-${year}`;
  }
};

export const extractAuthorFromPost = (postData) => {
  if (!postData) return { name: '', link: '' };

  let name =
    postData.author_name ||
    postData.authorName ||
    postData?.author?.name ||
    postData?.yoast_head_json?.author ||
    '';

  let link =
    postData.author_link ||
    postData.authorLink ||
    postData?.author?.link ||
    '';

  const embedded = postData?._embedded?.author?.[0];
  if (embedded) {
    name = name || embedded.name || '';
    link = link || embedded.link || embedded.url || '';
  }

  return { name, link };
};

export const extractCategoriesFromPost = (postData) => {
  const result = [];
  const termsGroups = postData?._embedded?.['wp:term'];

  if (!Array.isArray(termsGroups)) return result;

  for (const group of termsGroups) {
    if (!Array.isArray(group)) continue;

    for (const term of group) {
      if (term?.taxonomy === 'category' && term?.name) {
        result.push({
          name: term.name,
          link: term.link || '',
        });
      }
    }
  }

  return result;
};

export const getJustifyContent = (textAlign) => {
  if (textAlign === 'center') return 'center';
  if (textAlign === 'right') return 'flex-end';
  return 'flex-start';
};

export const buildTextStyleObject = ({
  textColor,
  textOpacity,
  fontSize,
  fontWeight,
  uppercase,
}) => ({
  color: hexToRgba(textColor, textOpacity),
  fontSize: `${clamp(fontSize, 10, 60)}px`,
  fontWeight: String(fontWeight || '500'),
  textDecoration: 'none',
  textTransform: uppercase ? 'uppercase' : 'none',
});

export const buildContainerStyleObject = (textAlign) => ({
  textAlign: textAlign || 'left',
  justifyContent: getJustifyContent(textAlign),
  gap: '0px',
});

export const buildSeparatorStyleObject = (textStyle, metaGap = 8) => ({
  ...textStyle,
  marginLeft: `${clamp(metaGap, 0, 60)}px`,
  marginRight: `${clamp(metaGap, 0, 60)}px`,
});

export const getRestRoot = () => {
  if (window?.wpApiSettings?.root) return window.wpApiSettings.root;

  const link = document.querySelector('link[rel="https://api.w.org/"]');
  if (link?.href) return link.href.endsWith('/') ? link.href : `${link.href}/`;

  return `${window.location.origin}/wp-json/`;
};

export const fetchWpJson = async (path) => {
  const root = getRestRoot();
  const url = `${root}${String(path).replace(/^\/+/, '')}`;
  const response = await window.fetch(url, { credentials: 'same-origin' });

  if (!response.ok) {
    throw new Error(`WP REST failed: ${response.status}`);
  }

  return response.json();
};

export const getPreviewStateFromPost = (postData) => ({
  author: extractAuthorFromPost(postData),
  categories: extractCategoriesFromPost(postData),
  date: postData?.date || '',
  loading: false,
  error: '',
});

export const getEmptyPreviewState = ({ loading = false, error = '' } = {}) => ({
  author: { name: '', link: '' },
  categories: [],
  date: '',
  loading,
  error,
});

export const loadPostsMetadataWithApiFetch = async ({ apiFetch, endpoint, postId }) => {
  if (postId) {
    return apiFetch({
      path: `/wp/v2/${endpoint}/${postId}?_embed=1`,
    });
  }

  const posts = await apiFetch({
    path: `/wp/v2/${endpoint}?per_page=1&_embed=1`,
  });

  return Array.isArray(posts) ? posts[0] : null;
};

export const loadPostsMetadataWithWindowFetch = async ({ endpoint, postId }) => {
  if (postId) {
    return fetchWpJson(`wp/v2/${endpoint}/${postId}?_embed=1`);
  }

  const posts = await fetchWpJson(`wp/v2/${endpoint}?per_page=1&_embed=1`);
  return Array.isArray(posts) ? posts[0] : null;
};