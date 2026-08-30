// src/api-requests/index.js
export { fetchPages } from './content-queries/page-query';
export { searchContent } from './content-queries/search-live';

export { fetchPostsList } from './content-queries/posts-list';
export { fetchPostsRelated } from './content-queries/posts-related';

export { fetchPostsContent } from './content-queries/posts-content';

export { fetchPostsCommentList } from './content-queries/posts-comment-list';
export { fetchPostsCommentForm } from './content-queries/posts-comment-form';

//  ADD: shared post context helpers (single source of truth)
export { inferCurrentPostId, inferPostIdFromBodyClass } from './content-queries/posts-context';


export {
  SAFE_ENDPOINTS,  SAFE_POST_TYPES,  mapPostTypeToEndpoint,
  clamp,  hexToRgba,  formatDate,  extractAuthorFromPost,
  extractCategoriesFromPost,  getJustifyContent,
  buildTextStyleObject,  buildContainerStyleObject,
  buildSeparatorStyleObject,  getRestRoot,
  fetchWpJson,  getPreviewStateFromPost,
  getEmptyPreviewState,  loadPostsMetadataWithApiFetch,
  loadPostsMetadataWithWindowFetch,
} from './content-queries/posts-metadata';

