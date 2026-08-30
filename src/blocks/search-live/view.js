import { __ } from "@wordpress/i18n";
import { searchContent } from "../../api-requests";

const SEARCH_MIN_WIDTH = "46px";
const VALID_DEVICES = ["desktop", "tablet", "mobile"];

const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const escRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const highlightHtml = (text, query) => {
  const raw = String(text ?? "");
  const q = String(query ?? "").trim();

  if (!q) return esc(raw);

  const parts = q.split(/\s+/).filter(Boolean).slice(0, 10);
  if (!parts.length) return esc(raw);

  const re = new RegExp(`(${parts.map(escRe).join("|")})`, "gi");
  const safe = esc(raw);

  return safe.replace(
    re,
    `<mark style="background:#fef08a;padding:0 2px;border-radius:2px;">$1</mark>`
  );
};

const debounce = (fn, delay = 250) => {
  let t;

  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

const styleString = (rules) =>
  Object.entries(rules)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");

const parseJson = (value, fallback = {}) => {
  try {
    const parsed = JSON.parse(value || "{}");
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
};

const getDeviceFromViewport = () => {
  const width = window.innerWidth || document.documentElement.clientWidth || 1200;

  if (width <= 767) return "mobile";
  if (width <= 1024) return "tablet";

  return "desktop";
};

const resolveResponsiveValue = (settings, key, device, fallback) => {
  const value = settings?.[key];

  if (value && typeof value === "object" && !Array.isArray(value)) {
    if (value[device] !== undefined && value[device] !== "") {
      return value[device];
    }

    if (value.desktop !== undefined && value.desktop !== "") {
      return value.desktop;
    }

    if (value.tablet !== undefined && value.tablet !== "") {
      return value.tablet;
    }

    if (value.mobile !== undefined && value.mobile !== "") {
      return value.mobile;
    }

    return fallback;
  }

  if (value !== undefined && value !== "") {
    return value;
  }

  return fallback;
};

const readConfig = (el, device) => {
  const settings = parseJson(el.dataset.responsiveSettings, {});

  return {
    placeholder: el.dataset.placeholder || "Search…",
    perPage: Number(el.dataset.perPage || 8) || 8,
    minChars: Number(el.dataset.minChars || 2) || 2,
    inputHeight:
      Number(resolveResponsiveValue(settings, "inputHeight", device, 44)) || 44,
    inputBorderRadius:
      Number(resolveResponsiveValue(settings, "inputBorderRadius", device, 12)) ||
      12,
    inputBackgroundColor: resolveResponsiveValue(
      settings,
      "inputBackgroundColor",
      device,
      "#ffffff"
    ),
    placeholderColor: resolveResponsiveValue(
      settings,
      "placeholderColor",
      device,
      "rgb(100 116 139)"
    ),
    searchIconColor: resolveResponsiveValue(
      settings,
      "searchIconColor",
      device,
      "rgb(100 116 139)"
    ),
    iconOnlySearch: !!resolveResponsiveValue(
      settings,
      "iconOnlySearch",
      device,
      false
    ),
  };
};

const applyResponsiveRootStyle = (el, iconOnlySearch = false) => {
  if (iconOnlySearch) {
    el.style.width = SEARCH_MIN_WIDTH;
    el.style.maxWidth = SEARCH_MIN_WIDTH;
    el.style.minWidth = SEARCH_MIN_WIDTH;
    el.style.flexGrow = "0";
    el.style.flexShrink = "0";
    el.style.flexBasis = SEARCH_MIN_WIDTH;
    el.style.position = "relative";
    el.style.overflow = "visible";
    el.style.boxSizing = "border-box";
    el.classList.add("uplifters-site-builder-blocks-m-search-icon-only");
    return;
  }

  el.style.width = "auto";
  el.style.maxWidth = "100%";
  el.style.minWidth = SEARCH_MIN_WIDTH;
  el.style.flexGrow = "1";
  el.style.flexShrink = "1";
  el.style.flexBasis = SEARCH_MIN_WIDTH;
  el.style.position = "";
  el.style.overflow = "";
  el.style.boxSizing = "border-box";
  el.classList.remove("uplifters-site-builder-blocks-m-search-icon-only");
};

const getWrapStyle = (iconOnlySearch = false) =>
  styleString({
    width: iconOnlySearch ? SEARCH_MIN_WIDTH : "100%",
    "max-width": iconOnlySearch ? SEARCH_MIN_WIDTH : "100%",
    "min-width": iconOnlySearch ? SEARCH_MIN_WIDTH : "0",
    "box-sizing": "border-box",
    overflow: iconOnlySearch ? "visible" : "initial",
  });

const getRelativeStyle = (iconOnlySearch = false) =>
  styleString({
    position: "relative",
    width: iconOnlySearch ? SEARCH_MIN_WIDTH : "100%",
    "max-width": iconOnlySearch ? SEARCH_MIN_WIDTH : "100%",
    "min-width": iconOnlySearch ? SEARCH_MIN_WIDTH : "0",
    "box-sizing": "border-box",
    overflow: iconOnlySearch ? "visible" : "initial",
  });

const getSearchIconStyle = (searchIconColor = "rgb(100 116 139)") =>
  styleString({
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "18px",
    height: "18px",
    color: searchIconColor || "rgb(100 116 139)",
    "pointer-events": "none",
    "z-index": "1",
  });

const getIconButtonStyle = (searchIconColor = "rgb(100 116 139)") =>
  styleString({
    width: SEARCH_MIN_WIDTH,
    "min-width": SEARCH_MIN_WIDTH,
    height: SEARCH_MIN_WIDTH,
    border: "1px solid rgb(226 232 240)",
    "border-radius": "999px",
    background: "#ffffff",
    color: searchIconColor || "rgb(100 116 139)",
    cursor: "pointer",
    padding: "0",
    display: "flex",
    "align-items": "center",
    "justify-content": "center",
    "box-sizing": "border-box",
  });

const getIconButtonSvg = (searchIconColor = "rgb(100 116 139)") => `
  <svg
    style="width:18px;height:18px;display:block;color:${
      searchIconColor || "rgb(100 116 139)"
    };"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
  </svg>
`;

const getIconPanelStyle = () =>
  styleString({
    position: "fixed",
    left: "16px",
    right: "16px",
    top: "0px",
    transform: "none",
    width: "calc(100vw - 32px)",
    "max-width": "calc(100vw - 32px)",
    "min-width": "0",
    "z-index": "99999",
    "box-sizing": "border-box",
    display: "none",
  });

const getClearButtonStyle = (isVisible = false) =>
  styleString({
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "28px",
    height: "28px",
    border: "0",
    "border-radius": "999px",
    background: "transparent",
    color: "rgb(100 116 139)",
    cursor: "pointer",
    padding: "0",
    "font-size": "22px",
    "line-height": "28px",
    display: isVisible ? "flex" : "none",
    "align-items": "center",
    "justify-content": "center",
    "z-index": "2",
  });

const getInputStyle = (
  inputHeight = 44,
  inputBorderRadius = 12,
  inputBackgroundColor = "#ffffff",
  placeholderColor = "rgb(100 116 139)"
) =>
  styleString({
    "--uplifters-site-builder-blocks-placeholder-color": placeholderColor || "rgb(100 116 139)",
    display: "block",
    width: "100%",
    "max-width": "100%",
    "min-width": "0",
    height: `${inputHeight}px`,
    "border-radius": `${inputBorderRadius}px`,
    border: "1px solid rgb(226 232 240)",
    background: inputBackgroundColor || "#ffffff",
    padding: "0 42px 0 42px",
    "font-size": "16px",
    "line-height": "24px",
    outline: "none",
    "box-sizing": "border-box",
  });

const getDropdownStyle = () =>
  styleString({
    position: "absolute",
    "z-index": "20",
    "margin-top": "8px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "80vw",
    "max-width": "calc(100vw - 32px)",
    overflow: "hidden",
    "border-radius": "12px",
    border: "1px solid rgb(226 232 240)",
    background: "#ffffff",
    "box-shadow": "0 10px 15px rgba(0,0,0,.08)",
    "box-sizing": "border-box",
  });

const getIconOnlyDropdownStyle = () =>
  styleString({
    position: "absolute",
    "z-index": "100000",
    top: "calc(100% + 8px)",
    left: "0",
    right: "0",
    width: "100%",
    "max-width": "100%",
    overflow: "hidden",
    "border-radius": "12px",
    border: "1px solid rgb(226 232 240)",
    background: "#ffffff",
    "box-shadow": "0 10px 15px rgba(0,0,0,.08)",
    "box-sizing": "border-box",
  });

const getItemLinkStyle = () =>
  styleString({
    display: "block",
    padding: "12px",
    "text-decoration": "none",
    background: "transparent",
  });

const getTitleTextStyle = () =>
  styleString({
    "word-break": "break-word",
    "font-size": "16px",
    "line-height": "24px",
    "font-weight": "600",
    color: "rgb(15 23 42)",
  });

const getContentTextStyle = () =>
  styleString({
    "margin-top": "4px",
    "word-break": "break-word",
    "white-space": "normal",
    "font-size": "14px",
    "line-height": "20px",
    color: "rgb(51 65 85)",
  });

const getSubtypeStyle = () =>
  styleString({
    "margin-top": "4px",
    "font-size": "12px",
    "line-height": "16px",
    color: "rgb(100 116 139)",
  });

const getMessageStyle = (color = "rgb(71 85 105)") =>
  styleString({
    padding: "12px",
    "font-size": "14px",
    "line-height": "20px",
    color,
  });

const getSearchIconSvg = (searchIconColor = "rgb(100 116 139)") => `
  <svg
    style="${getSearchIconStyle(searchIconColor)}"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
  </svg>
`;

function mount(el) {
  if (el.dataset.upliftersSiteBuilderBlocksSearchMounted === "1") return;
  el.dataset.upliftersSiteBuilderBlocksSearchMounted = "1";

  let currentDevice = getDeviceFromViewport();
  let abortCtrl = null;
  let resizeTimer = null;

  const render = () => {
    const config = readConfig(el, currentDevice);
    const {
      placeholder,
      perPage,
      minChars,
      inputHeight,
      inputBorderRadius,
      inputBackgroundColor,
      placeholderColor,
      searchIconColor,
      iconOnlySearch,
    } = config;

    if (abortCtrl) abortCtrl.abort();

    applyResponsiveRootStyle(el, iconOnlySearch);
    el.dataset.upliftersSiteBuilderBlocksSearchDevice = currentDevice;

    const inputHtml = `
      <div class="uplifters-site-builder-blocks-ms-relative" style="${getRelativeStyle(false)}">
        ${getSearchIconSvg(searchIconColor)}
        <input
          class="uplifters-site-builder-blocks-ms-input"
          type="text"
          style="${getInputStyle(
            inputHeight,
            inputBorderRadius,
            inputBackgroundColor,
            placeholderColor
          )}"
          placeholder="${esc(placeholder)}"
          aria-label="${esc(__("Search", "uplifters-site-builder-blocks"))}"
        />
        <button
          class="uplifters-site-builder-blocks-ms-clear"
          type="button"
          style="${getClearButtonStyle(iconOnlySearch)}"
          aria-label="${esc(__("Clear search", "uplifters-site-builder-blocks"))}"
          title="${esc(__("Clear search", "uplifters-site-builder-blocks"))}"
        >×</button>
        <div
          class="uplifters-site-builder-blocks-ms-dropdown"
          style="${
            iconOnlySearch ? getIconOnlyDropdownStyle() : getDropdownStyle()
          };display:none;"
        ></div>
      </div>
    `;

    if (iconOnlySearch) {
      el.innerHTML = `
        <div class="uplifters-site-builder-blocks-ms-wrap" style="${getWrapStyle(true)}">
          <div class="uplifters-site-builder-blocks-ms-relative" style="${getRelativeStyle(true)}">
            <button
              class="uplifters-site-builder-blocks-ms-icon-toggle"
              type="button"
              style="${getIconButtonStyle(searchIconColor)}"
              aria-label="${esc(__("Open search", "uplifters-site-builder-blocks"))}"
              title="${esc(__("Search", "uplifters-site-builder-blocks"))}"
            >${getIconButtonSvg(searchIconColor)}</button>
            <div class="uplifters-site-builder-blocks-ms-icon-panel" style="${getIconPanelStyle()}">
              ${inputHtml}
            </div>
          </div>
        </div>
      `;
    } else {
      el.innerHTML = `
        <div class="uplifters-site-builder-blocks-ms-wrap" style="${getWrapStyle(false)}">
          ${inputHtml}
        </div>
      `;
    }

    const input = el.querySelector("input");
    const clearButton = el.querySelector(".uplifters-site-builder-blocks-ms-clear");
    const dropdown = el.querySelector(".uplifters-site-builder-blocks-ms-dropdown");
    const iconToggle = el.querySelector(".uplifters-site-builder-blocks-ms-icon-toggle");
    const iconPanel = el.querySelector(".uplifters-site-builder-blocks-ms-icon-panel");

    if (!input || !clearButton || !dropdown) return;

    const updateClearButton = () => {
      if (iconOnlySearch) {
        clearButton.style.display = "flex";
        return;
      }

      clearButton.style.display = input.value.length > 0 ? "flex" : "none";
    };

    const hide = () => {
      dropdown.style.display = "none";
      dropdown.innerHTML = "";
    };

    const show = (html) => {
      dropdown.style.display = "block";
      dropdown.innerHTML = html;
    };

    const openIconPanel = () => {
      if (!iconOnlySearch || !iconPanel) return;

      const rect = iconToggle?.getBoundingClientRect();

      if (rect) {
        iconPanel.style.top = `${rect.top}px`;
      }

      iconPanel.style.display = "block";

      window.requestAnimationFrame(() => {
        input.focus();
      });
    };

    const closeIconPanel = () => {
      if (!iconOnlySearch || !iconPanel) return;

      if (abortCtrl) abortCtrl.abort();

      input.value = "";
      updateClearButton();
      hide();
      iconPanel.style.display = "none";
    };

    const clearSearch = () => {
      if (abortCtrl) abortCtrl.abort();

      if (iconOnlySearch && input.value.length === 0) {
        closeIconPanel();
        return;
      }

      input.value = "";
      updateClearButton();
      hide();

      if (iconOnlySearch) {
        openIconPanel();
      } else {
        input.focus();
      }
    };

    const doSearch = async (term) => {
      const q = String(term || "").trim();

      if (abortCtrl) abortCtrl.abort();
      abortCtrl = new AbortController();

      if (q.length < minChars) {
        hide();
        return;
      }

      show(
        `<div style="${getMessageStyle()}">${esc(
          __("Searching…", "uplifters-site-builder-blocks")
        )}</div>`
      );

      try {
        const items = await searchContent({
          query: q,
          perPage,
          signal: abortCtrl.signal,
        });

        const safeItems = Array.isArray(items) ? items : [];

        const list = safeItems
          .map((it, index) => {
            const isLast = index === safeItems.length - 1;

            return `
              <li style="border-bottom:${
                isLast ? "0" : "1px solid rgb(241 245 249)"
              };list-style:none;">
                <a
                  href="${esc(it.permalink)}"
                  style="${getItemLinkStyle()}"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div style="${getTitleTextStyle()}">
                    ${highlightHtml(it.title || "Untitled", q)}
                  </div>
                  <div style="${getContentTextStyle()}">
                    ${highlightHtml(it.content || "", q)}
                  </div>
                  <div style="${getSubtypeStyle()}">(${esc(
              it.subtype
            )})</div>
                </a>
              </li>
            `;
          })
          .join("");

        show(
          list
            ? `<ul style="max-height:24rem;overflow:auto;margin:0;padding:0;">${list}</ul>`
            : `<div style="${getMessageStyle()}">${esc(
                __("No results", "uplifters-site-builder-blocks")
              )}</div>`
        );

        dropdown.querySelectorAll("a").forEach((link) => {
          link.addEventListener("mouseenter", () => {
            link.style.backgroundColor = "rgb(248 250 252)";
          });

          link.addEventListener("mouseleave", () => {
            link.style.backgroundColor = "transparent";
          });
        });
      } catch (e) {
        if (e?.name === "AbortError") return;

        show(
          `<div style="${getMessageStyle("#b91c1c")}">${esc(
            __("Failed:", "uplifters-site-builder-blocks")
          )} ${esc(e?.message || "Unknown error")}</div>`
        );
      }
    };

    const debounced = debounce(doSearch, 250);

    updateClearButton();

    if (iconToggle) {
      iconToggle.addEventListener("click", () => {
        openIconPanel();
      });
    }

    input.addEventListener("input", (e) => {
      updateClearButton();
      debounced(e.target.value);
    });

    clearButton.addEventListener("click", clearSearch);

    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (iconOnlySearch) {
          closeIconPanel();
        } else {
          hide();
        }
      }
    });

    input.addEventListener("focus", () => {
      if (String(input.value || "").trim().length >= minChars) {
        debounced(input.value);
      }
    });
  };

  const handleResize = () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      const nextDevice = getDeviceFromViewport();

      if (!VALID_DEVICES.includes(nextDevice)) return;

      if (nextDevice !== currentDevice) {
        currentDevice = nextDevice;
        render();
      }
    }, 150);
  };

  document.addEventListener("click", (e) => {
    const iconPanel = el.querySelector(".uplifters-site-builder-blocks-ms-icon-panel");
    const dropdown = el.querySelector(".uplifters-site-builder-blocks-ms-dropdown");
    const iconOnlySearch = el.classList.contains("uplifters-site-builder-blocks-m-search-icon-only");

    if (!el.contains(e.target) && !iconPanel?.contains(e.target)) {
      if (dropdown) {
        dropdown.style.display = "none";
        dropdown.innerHTML = "";
      }

      if (iconOnlySearch && iconPanel) {
        iconPanel.style.display = "none";
      }
    }
  });

  window.addEventListener("resize", handleResize);

  render();
}

const init = () => {
  document.querySelectorAll(".uplifters-site-builder-blocks-m-search").forEach((el) => mount(el));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
