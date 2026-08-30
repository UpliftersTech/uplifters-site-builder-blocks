// src/api-requests/content-queries/posts-comment-form.js
// Uses @wordpress/api-fetch so nonce/root is handled by WP core.

import apiFetch from '@wordpress/api-fetch';

const normalizeWpError = (err) => {
  // apiFetch throws objects like: { code, message, data }
  if (!err) return new Error('Unknown error');
  if (err instanceof Error) return err;

  const msg =
    (typeof err?.message === 'string' && err.message) ||
    (typeof err?.code === 'string' && err.code) ||
    'Request failed';

  const status = err?.data?.status ? ` (HTTP ${err.data.status})` : '';
  return new Error(`${msg}${status}`);
};

export const fetchPostsCommentForm = async ({
  postId,
  content,
  parent = 0,
  authorName,
  authorEmail,
  authorUrl,
} = {}) => {
  const pid = Number(postId) || 0;
  if (!pid) throw new Error('Missing postId');

  const text = String(content ?? '').trim();
  if (!text) throw new Error('Missing content');

  const body = {
    post: pid,
    content: text,
  };

  const parentId = Number(parent) || 0;
  if (parentId) body.parent = parentId;

  if (authorName) body.author_name = String(authorName).trim();
  if (authorEmail) body.author_email = String(authorEmail).trim();
  if (authorUrl) body.author_url = String(authorUrl).trim();

  try {
    // wp-api-fetch automatically uses wpApiSettings.root and wpApiSettings.nonce (cookie auth)
    // Path should be without /wp-json prefix
    const resp = await apiFetch({
      path: '/wp/v2/comments',
      method: 'POST',
      data: body,
    });

    return resp;
  } catch (err) {
    throw normalizeWpError(err);
  }
};
