import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { searchContent } from "../../api-requests";
import { __ } from '@wordpress/i18n';

import './editor.scss';

import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import {
	PanelBody,
	RangeControl,
	TextControl,
	Spinner,
	Notice,
	ToggleControl,
	ColorPalette,
} from "@wordpress/components";
import { useEffect, useMemo, useRef, useState } from "@wordpress/element";

const VALID_DEVICES = ["desktop", "tablet", "mobile"];

function getCurrentDevice() {
  if (
    window.UpliftersSiteBuilderBlocksResponsive &&
    typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice === "function"
  ) {
    const device = window.UpliftersSiteBuilderBlocksResponsive.getDevice();
    return VALID_DEVICES.includes(device) ? device : "desktop";
  }

  return "desktop";
}

function useGlobalResponsiveDevice() {
  const [device, setDevice] = useState(getCurrentDevice());

  useEffect(() => {
    function handleDeviceChange(event) {
      const nextDevice = event?.detail?.device || getCurrentDevice();
      setDevice(VALID_DEVICES.includes(nextDevice) ? nextDevice : "desktop");
    }

    window.addEventListener("uplifters-site-builder-blocks-responsive-device-change", handleDeviceChange);

    const interval = window.setInterval(() => {
      const nextDevice = getCurrentDevice();

      setDevice((currentDevice) => {
        return currentDevice !== nextDevice ? nextDevice : currentDevice;
      });
    }, 500);

    return () => {
      window.removeEventListener(
        "uplifters-site-builder-blocks-responsive-device-change",
        handleDeviceChange
      );
      window.clearInterval(interval);
    };
  }, []);

  return VALID_DEVICES.includes(device) ? device : "desktop";
}

function isResponsiveObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function getResponsiveValue(attributes, key, device, fallback) {
  const value = attributes[key];

  if (isResponsiveObject(value)) {
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
}

function setResponsiveValue(attributes, setAttributes, key, device, value) {
  const currentValue = attributes[key];
  const currentObject = isResponsiveObject(currentValue)
    ? currentValue
    : { desktop: currentValue };

  setAttributes({
    [key]: {
      ...currentObject,
      [device]: value,
    },
  });
}

function DeviceBadge({ device }) {
  const labels = {
    desktop: "Desktop variant",
    tablet: "Tablet variant",
    mobile: "Mobile variant",
  };

  return (
    <div
      style={{
        marginBottom: "12px",
        padding: "8px 10px",
        borderRadius: "8px",
        background: "rgb(248 250 252)",
        border: "1px solid rgb(226 232 240)",
        color: "rgb(71 85 105)",
        fontSize: "12px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: ".04em",
      }}
    >
      {labels[device] || labels.desktop}
    </div>
  );
}

const useDebouncedValue = (value, delay = 250) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
};

const escapeHtml = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const highlightHtml = (text, query) => {
  const raw = String(text ?? "");
  const q = String(query ?? "").trim();

  if (!q) return escapeHtml(raw);

  const parts = q.split(/\s+/).filter(Boolean).slice(0, 10);
  if (!parts.length) return escapeHtml(raw);

  const re = new RegExp(`(${parts.map(escapeRegExp).join("|")})`, "gi");
  const safe = escapeHtml(raw);

  return safe.replace(
    re,
    `<mark style="background:#fef08a;padding:0 2px;border-radius:2px;">$1</mark>`
  );
};

const colors = [
  { name: "White", color: "#ffffff" },
  { name: "Slate 50", color: "#f8fafc" },
  { name: "Slate 100", color: "#f1f5f9" },
  { name: "Slate 500", color: "#64748b" },
  { name: "Slate 900", color: "#0f172a" },
  { name: "Black", color: "#000000" },
  { name: "Blue", color: "#2563eb" },
  { name: "Red", color: "#dc2626" },
  { name: "Green", color: "#16a34a" },
];

const styles = {
  block: {
    width: "100%",
    boxSizing: "border-box",
  },

  iconOnlyBlock: {
    width: "46px",
    maxWidth: "46px",
    minWidth: "46px",
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "46px",
    boxSizing: "border-box",
    position: "relative",
    overflow: "visible",
  },

  wrapper: {
    position: "relative",
    width: "100%",
    boxSizing: "border-box",
  },

  iconOnlyWrapper: {
    position: "relative",
    width: "46px",
    minWidth: "46px",
    maxWidth: "46px",
    boxSizing: "border-box",
    overflow: "visible",
  },

  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "18px",
    height: "18px",
    color: "rgb(100 116 139)",
    pointerEvents: "none",
    zIndex: 1,
  },

  iconButton: {
    width: "46px",
    minWidth: "46px",
    height: "46px",
    border: "1px solid rgb(226 232 240)",
    borderRadius: "999px",
    background: "#ffffff",
    color: "rgb(100 116 139)",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  },

  iconButtonSvg: {
    width: "18px",
    height: "18px",
    display: "block",
  },

  iconOnlyPanel: {
    position: "fixed",
    left: "16px",
    right: "16px",
    top: "0px",
    transform: "none",
    width: "calc(100vw - 32px)",
    maxWidth: "calc(100vw - 32px)",
    minWidth: "0",
    zIndex: 99999,
    boxSizing: "border-box",
  },

  clearButton: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "28px",
    height: "28px",
    border: "0",
    borderRadius: "999px",
    background: "transparent",
    color: "rgb(100 116 139)",
    cursor: "pointer",
    padding: 0,
    fontSize: "22px",
    lineHeight: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  input: {
    width: "100%",
    border: "1px solid rgb(226 232 240)",
    background: "#ffffff",
    padding: "0 42px 0 42px",
    fontSize: "16px",
    lineHeight: "24px",
    outline: "none",
    boxSizing: "border-box",
  },

  dropdown: {
    position: "absolute",
    zIndex: 20,
    marginTop: "8px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "80vw",
    maxWidth: "calc(100vw - 32px)",
    overflow: "hidden",
    borderRadius: "12px",
    border: "1px solid rgb(226 232 240)",
    background: "#ffffff",
    boxShadow: "0 10px 15px rgba(0,0,0,.08)",
    boxSizing: "border-box",
  },

  iconOnlyDropdown: {
    position: "absolute",
    zIndex: 100000,
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
    borderRadius: "12px",
    border: "1px solid rgb(226 232 240)",
    background: "#ffffff",
    boxShadow: "0 10px 15px rgba(0,0,0,.08)",
    boxSizing: "border-box",
  },

  loading: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    color: "rgb(71 85 105)",
  },

  loadingText: {
    fontSize: "14px",
    lineHeight: "20px",
  },

  noticeWrap: {
    padding: "12px",
  },

  noResults: {
    padding: "12px",
    fontSize: "14px",
    lineHeight: "20px",
    color: "rgb(71 85 105)",
  },

  list: {
    maxHeight: "24rem",
    overflow: "auto",
    margin: 0,
    padding: 0,
  },

  item: {
    borderBottom: "1px solid rgb(241 245 249)",
    listStyle: "none",
  },

  link: {
    display: "block",
    padding: "12px",
    textDecoration: "none",
    background: "transparent",
  },

  title: {
    wordBreak: "break-word",
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 600,
    color: "rgb(15 23 42)",
  },

  content: {
    marginTop: "4px",
    wordBreak: "break-word",
    whiteSpace: "normal",
    fontSize: "14px",
    lineHeight: "20px",
    color: "rgb(51 65 85)",
  },

  subtype: {
    marginTop: "4px",
    fontSize: "12px",
    lineHeight: "16px",
    color: "rgb(100 116 139)",
  },
};

const SearchIcon = ({ color }) => (
  <svg
    style={{
      ...styles.searchIcon,
      color: color || "rgb(100 116 139)",
    }}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InlineSearchIcon = ({ color }) => (
  <svg
    style={{
      ...styles.iconButtonSvg,
      color: color || "rgb(100 116 139)",
    }}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function Editor({ attributes, setAttributes, clientId }) {
  const device = useGlobalResponsiveDevice();
  const [openSettingsPanel, setOpenSettingsPanel] = useState(null);
  const toggleSettingsPanel = (panel) => {
    setOpenSettingsPanel((currentPanel) => (currentPanel === panel ? null : panel));
  };

  const [openStylesPanel, setOpenStylesPanel] = useState(null);
  const toggleStylesPanel = (panel) => {
    setOpenStylesPanel((currentPanel) => (currentPanel === panel ? null : panel));
  };

  const {
    placeholder,
    perPage,
    minChars,
  } = attributes;

  const inputHeight = getResponsiveValue(
    attributes,
    "inputHeight",
    device,
    44
  );

  const inputBorderRadius = getResponsiveValue(
    attributes,
    "inputBorderRadius",
    device,
    12
  );

  const inputBackgroundColor = getResponsiveValue(
    attributes,
    "inputBackgroundColor",
    device,
    "#ffffff"
  );

  const placeholderColor = getResponsiveValue(
    attributes,
    "placeholderColor",
    device,
    "rgb(100 116 139)"
  );

  const searchIconColor = getResponsiveValue(
    attributes,
    "searchIconColor",
    device,
    "rgb(100 116 139)"
  );

  const iconOnlySearch = !!getResponsiveValue(
    attributes,
    "iconOnlySearch",
    device,
    false
  );

  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [iconInputOpen, setIconInputOpen] = useState(false);
  const [iconPanelTop, setIconPanelTop] = useState(null);

  const debouncedQ = useDebouncedValue(q, 250);
  const abortRef = useRef(null);
  const inputRef = useRef(null);
  const iconButtonRef = useRef(null);

  const editorClassName = `uplifters-site-builder-blocks-search-live-editor-${String(clientId).replaceAll(
    "-",
    ""
  )}`;

  const showDropdown = useMemo(() => {
    return (
      debouncedQ.trim().length >= (minChars || 2) &&
      (loading || err || items.length > 0)
    );
  }, [debouncedQ, minChars, loading, err, items.length]);

  useEffect(() => {
    const term = debouncedQ.trim();
    setErr("");

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    if (term.length < (minChars || 2)) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    searchContent({
      query: term,
      perPage,
      signal: abortRef.current.signal,
    })
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((e) => {
        if (e?.name === "AbortError") return;
        setErr(e?.message || "Search failed.");
        setItems([]);
      })
      .finally(() => setLoading(false));

    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [debouncedQ, perPage, minChars]);

  useEffect(() => {
    setIconInputOpen(false);
    setQ("");
    setItems([]);
    setErr("");
    setLoading(false);

    if (abortRef.current) abortRef.current.abort();
  }, [device, iconOnlySearch]);

  const focusInput = () => {
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const openIconInput = () => {
    const rect = iconButtonRef.current?.getBoundingClientRect();

    if (rect) {
      setIconPanelTop(rect.top);
    }

    setIconInputOpen(true);
    focusInput();
  };

  const closeIconInput = () => {
    if (abortRef.current) abortRef.current.abort();

    setIconInputOpen(false);
    setQ("");
    setItems([]);
    setErr("");
    setLoading(false);
  };

  const clearSearch = () => {
    if (abortRef.current) abortRef.current.abort();

    setQ("");
    setItems([]);
    setErr("");
    setLoading(false);

    if (iconOnlySearch) {
      setIconInputOpen(true);
    }

    focusInput();
  };

  const blockProps = useBlockProps({
    className: `${editorClassName} uplifters-site-builder-blocks-search-live-device-${device}`,
    style: {
      ...(iconOnlySearch ? styles.iconOnlyBlock : styles.block),
      ...(placeholderColor
        ? { "--uplifters-site-builder-blocks-search-live-placeholder-color": placeholderColor }
        : {}),
    },
  });

  const inputElement = (
    <>
      <SearchIcon color={searchIconColor} />

      <input
        ref={inputRef}
        type="text"
        style={{
          ...styles.input,
          height: `${Number(inputHeight) || 44}px`,
          borderRadius: `${Number(inputBorderRadius) || 12}px`,
          background: inputBackgroundColor || "#ffffff",
        }}
        placeholder={placeholder || "Search..."}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && iconOnlySearch) {
            closeIconInput();
          }
        }}
        aria-label={placeholder || "Search"}
      />

      {q.length > 0 && (
        <button
          type="button"
          style={styles.clearButton}
          onClick={clearSearch}
          aria-label="Clear search"
          title="Clear search"
        >
          ×
        </button>
      )}

      {iconOnlySearch && q.length === 0 && (
        <button
          type="button"
          style={styles.clearButton}
          onClick={closeIconInput}
          aria-label="Close search"
          title="Close search"
        >
          ×
        </button>
      )}
    </>
  );

  const dropdownElement = showDropdown && (
    <div style={iconOnlySearch ? styles.iconOnlyDropdown : styles.dropdown}>
      {loading && (
        <div style={styles.loading}>
          <Spinner />
          <span style={styles.loadingText}>Searching…</span>
        </div>
      )}

      {!loading && err && (
        <div style={styles.noticeWrap}>
          <Notice status="error" isDismissible={false}>
            {err}
          </Notice>
        </div>
      )}

      {!loading && !err && items.length === 0 && (
        <div style={styles.noResults}>No results</div>
      )}

      {!loading && !err && items.length > 0 && (
        <ul style={styles.list}>
          {items.map((it, index) => (
            <li
              key={`${it.subtype}:${it.id}`}
              style={{
                ...styles.item,
                borderBottom:
                  index === items.length - 1 ? "0" : styles.item.borderBottom,
              }}
            >
              <a
                href={it.permalink}
                target="_blank"
                rel="noreferrer"
                style={styles.link}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgb(248 250 252)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div
                  style={styles.title}
                  dangerouslySetInnerHTML={{
                    __html: highlightHtml(it.title || "Untitled", debouncedQ),
                  }}
                />
                <div
                  style={styles.content}
                  dangerouslySetInnerHTML={{
                    __html: highlightHtml(it.content || "", debouncedQ),
                  }}
                />
                <div style={styles.subtype}>({it.subtype})</div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <>
      <InspectorControls group="settings">
        <PanelBody
          title="Behavior"
          initialOpen={false}
          opened={openSettingsPanel === "behavior"}
          onToggle={() => toggleSettingsPanel("behavior")}
        >
          <DeviceBadge device={device} />

          <ToggleControl
            label="Icon only search"
            help="Ei value selected responsive device variant-er jonno save hobe. Device mode floating responsive toolbar theke ashe."
            checked={!!iconOnlySearch}
            onChange={(v) => {
              setResponsiveValue(
                attributes,
                setAttributes,
                "iconOnlySearch",
                device,
                !!v
              );
              setIconInputOpen(false);
              setQ("");
              setItems([]);
              setErr("");
              setLoading(false);
            }}
          />

          <TextControl
            label="Placeholder"
            value={placeholder}
            onChange={(v) => setAttributes({ placeholder: v })}
          />

          <RangeControl
            label="Suggestions limit"
            value={perPage}
            onChange={(v) => setAttributes({ perPage: v ?? 8 })}
            min={1}
            max={20}
          />

          <RangeControl
            label="Minimum characters"
            value={minChars}
            onChange={(v) => setAttributes({ minChars: v ?? 2 })}
            min={1}
            max={5}
          />

        </PanelBody>
      </InspectorControls>

      <InspectorControls group="styles">
        <PanelBody
          title="Layout"
          initialOpen={false}
          opened={openStylesPanel === "layout"}
          onToggle={() => toggleStylesPanel("layout")}
        >
          <DeviceBadge device={device} />

          <RangeControl
            label="Input height"
            value={Number(inputHeight) || 44}
            onChange={(v) =>
              setResponsiveValue(
                attributes,
                setAttributes,
                "inputHeight",
                device,
                v ?? 44
              )
            }
            min={32}
            max={96}
          />

          <RangeControl
            label="Input radius"
            value={Number(inputBorderRadius) || 12}
            onChange={(v) =>
              setResponsiveValue(
                attributes,
                setAttributes,
                "inputBorderRadius",
                device,
                v ?? 12
              )
            }
            min={0}
            max={64}
            step={1}
          />
        </PanelBody>

        <PanelBody
          title="Colors"
          initialOpen={false}
          opened={openStylesPanel === "colors"}
          onToggle={() => toggleStylesPanel("colors")}
        >
          <DeviceBadge device={device} />

          <p>Input background</p>
          <ColorPalette
            colors={colors}
            value={inputBackgroundColor}
            onChange={(v) =>
              setResponsiveValue(
                attributes,
                setAttributes,
                "inputBackgroundColor",
                device,
                v || "#ffffff"
              )
            }
            enableAlpha
            clearable
          />

          <p>Placeholder text</p>
          <ColorPalette
            colors={colors}
            value={placeholderColor}
            onChange={(v) =>
              setResponsiveValue(
                attributes,
                setAttributes,
                "placeholderColor",
                device,
                v || "rgb(100 116 139)"
              )
            }
            enableAlpha
            clearable
          />

          <p>Search icon</p>
          <ColorPalette
            colors={colors}
            value={searchIconColor}
            onChange={(v) =>
              setResponsiveValue(
                attributes,
                setAttributes,
                "searchIconColor",
                device,
                v || "rgb(100 116 139)"
              )
            }
            enableAlpha
            clearable
          />
        </PanelBody>
      </InspectorControls>

      <div {...blockProps}>
        {!iconOnlySearch && (
          <div style={styles.wrapper}>
            {inputElement}
            {dropdownElement}
          </div>
        )}

        {iconOnlySearch && (
          <div style={styles.iconOnlyWrapper}>
            <button
              ref={iconButtonRef}
              type="button"
              style={{
                ...styles.iconButton,
                color: searchIconColor || "rgb(100 116 139)",
              }}
              onClick={openIconInput}
              aria-label="Open search"
              title="Search"
            >
              <InlineSearchIcon color={searchIconColor} />
            </button>

            {iconInputOpen && (
              <div
                style={{
                  ...styles.iconOnlyPanel,
                  top: iconPanelTop !== null ? `${iconPanelTop}px` : "0px",
                }}
              >
                <div style={styles.wrapper}>
                  {inputElement}
                  {dropdownElement}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="search-live" /> : <Editor {...props} />;
}
