// src/api-requests/content-queries/page-query.js

const clampInt = (value, min, max, fallback) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? Math.trunc(n) : fallback;
  return Math.min(max, Math.max(min, safe));
};

const stripHtml = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(String(html), "text/html");
  return (doc.body?.textContent || "").replace(/\s+/g, " ").trim();
};

const mapPage = (p) => ({
  id: Number(p?.id) || 0,
  parent: Number(p?.parent) || 0,
  menu_order: Number(p?.menu_order) || 0,
  title: stripHtml(p?.title?.rendered) || "Untitled",
  permalink: String(p?.link || ""),
});

const fetchJson = async (url) => {
  const res = await fetch(url, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}${text ? `: ${text}` : ""}`);
  }

  return {
    items: await res.json(),
    totalPages: Number(res.headers.get("X-WP-TotalPages") || 1) || 1,
  };
};

const getRestBases = () => {
  const candidates = [];
  const wp = window.wpApiSettings ?? {};

  if (wp.root) {
    candidates.push(String(wp.root).trim());
  }

  const apiLink = document.querySelector('link[rel="https://api.w.org/"]')?.href;
  if (apiLink) {
    candidates.push(String(apiLink).trim());
  }

  candidates.push(`${window.location.origin}/wp-json/`);
  candidates.push(`${window.location.origin}/index.php?rest_route=/`);

  return [...new Set(candidates.filter(Boolean))];
};

const buildEndpoint = (base, pageNo, per) => {
  const isQueryRoute = base.includes("rest_route=");

  if (isQueryRoute) {
    const url = new URL(base, window.location.href);
    url.searchParams.set("rest_route", "/wp/v2/pages");
    url.searchParams.set("per_page", String(per));
    url.searchParams.set("page", String(pageNo));
    url.searchParams.set("orderby", "menu_order");
    url.searchParams.set("order", "asc");
    url.searchParams.set("status", "publish");
    url.searchParams.set("_fields", "id,parent,menu_order,title,link");
    return url.toString();
  }

  const normalized = base.endsWith("/") ? base : `${base}/`;
  const url = new URL(`${normalized}wp/v2/pages`, window.location.href);
  url.searchParams.set("per_page", String(per));
  url.searchParams.set("page", String(pageNo));
  url.searchParams.set("orderby", "menu_order");
  url.searchParams.set("order", "asc");
  url.searchParams.set("status", "publish");
  url.searchParams.set("_fields", "id,parent,menu_order,title,link");
  return url.toString();
};

export const fetchPages = async ({ perPage = 50 } = {}) => {
  const wanted = clampInt(perPage, 1, 1000, 50);
  const per = Math.min(wanted, 100);

  const restBases = getRestBases();

  let lastError = null;

  for (const base of restBases) {
    try {
      let pageNo = 1;
      let totalPages = 1;
      const collected = [];

      do {
        const url = buildEndpoint(base, pageNo, per);
        const { items, totalPages: pagesTotal } = await fetchJson(url);

        if (Array.isArray(items)) {
          collected.push(...items.map(mapPage));
        }

        totalPages = pagesTotal;
        pageNo += 1;
      } while (pageNo <= totalPages && collected.length < wanted);

      return collected.slice(0, wanted);
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error("Failed to load pages.");
};
