// src/api-requests/content-queries/search-live.js
// PHP-free: uses WP core endpoints wp/v2/posts + wp/v2/pages for FULL content

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
  return base.endsWith("/") ? base : `${base}/`;
};

const stripHtml = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(String(html), "text/html");
  return (doc.body?.textContent || "").replace(/\s+/g, " ").trim();
};

const fetchJson = async (url, signal) => {
  const res = await fetch(url, {
    method: "GET",
    credentials: "same-origin",
    headers: { Accept: "application/json" },
    signal,
  });

  if (res.ok) return res.json();

  const text = await res.text().catch(() => "");
  throw new Error(`HTTP ${res.status}${text ? `: ${text}` : ""}`);
};

const fetchType = async ({ q, perPage, type, signal }) => {
  const url = new URL(`${getRestBase()}wp/v2/${type}`);
  url.searchParams.set("search", q);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("orderby", "relevance");
  url.searchParams.set("_fields", "id,title,link,content,excerpt");

  const items = await fetchJson(url.toString(), signal);
  return Array.isArray(items) ? items : [];
};

export const searchContent = async ({ query, perPage = 8, signal } = {}) => {
  const q = String(query || "").trim();
  if (!q) return [];

  const per = clampInt(perPage, 1, 20, 8);

  const [posts, pages] = await Promise.all([
    fetchType({ q, perPage: per, type: "posts", signal }),
    fetchType({ q, perPage: per, type: "pages", signal }),
  ]);

  const mapItem = (it, subtype) => {
    const title = stripHtml(it?.title?.rendered);
    const content =
      stripHtml(it?.content?.rendered) || stripHtml(it?.excerpt?.rendered) || "";
    return {
      id: Number(it?.id) || 0,
      subtype, // "post" | "page"
      title: title || "Untitled",
      content, // FULL text
      permalink: String(it?.link || ""),
    };
  };

  const merged = [
    ...posts.map((x) => mapItem(x, "post")),
    ...pages.map((x) => mapItem(x, "page")),
  ];

  // de-dupe
  const seen = new Set();
  const out = [];
  for (const x of merged) {
    const key = `${x.subtype}:${x.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(x);
  }
  return out.slice(0, per);
};
