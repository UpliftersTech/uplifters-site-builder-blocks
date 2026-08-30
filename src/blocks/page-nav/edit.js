import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
/* edit.js */
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import {
	PanelBody,
	RangeControl,
	BoxControl,
	Spinner,
	Notice,
	CheckboxControl,
	Button,
	SelectControl,
	ColorPalette,
} from "@wordpress/components";
import { useEffect, useMemo, useState } from "@wordpress/element";
import { select, subscribe } from "@wordpress/data";

import { fetchPages } from "../../api-requests";
import { FontFamilyControl, getFontFamilyCss } from "../../assets-shared/fonts-family/font-family-control";
import './editor.scss';


const DEFAULT_BOX = {
  top: "0px",
  right: "0px",
  bottom: "0px",
  left: "0px",
};

const DEVICES = ["desktop", "tablet", "mobile"];

function normalizeDevice(device) {
  const value = String(device || "").toLowerCase();

  if (value.includes("mobile") || value.includes("phone")) {
    return "mobile";
  }

  if (value.includes("tablet")) {
    return "tablet";
  }

  if (value.includes("desktop")) {
    return "desktop";
  }

  return "";
}

function getDeviceFromCustomToolbar() {
  try {
    if (
      window.upliftersSiteBuilderBlocksResponsive &&
      typeof window.upliftersSiteBuilderBlocksResponsive.getDevice === "function"
    ) {
      const device = normalizeDevice(
        window.upliftersSiteBuilderBlocksResponsive.getDevice()
      );

      if (device) {
        return device;
      }
    }

    const globalDevice = normalizeDevice(
      window.upliftersSiteBuilderBlocksCurrentDevice ||
        window.upliftersSiteBuilderBlocksResponsiveDevice ||
        ""
    );

    if (globalDevice) {
      return globalDevice;
    }
  } catch (error) {
    // Ignore unavailable globals.
  }

  return "";
}

function getDeviceFromWordPressStore() {
  const storeNames = [
    "core/edit-site",
    "core/edit-post",
    "core/editor",
    "core/block-editor",
  ];

  for (const storeName of storeNames) {
    try {
      const store = select(storeName);

      if (!store) {
        continue;
      }

      const methods = [
        "__experimentalGetPreviewDeviceType",
        "getPreviewDeviceType",
        "getDeviceType",
      ];

      for (const method of methods) {
        if (typeof store[method] === "function") {
          const device = normalizeDevice(store[method]());

          if (device) {
            return device;
          }
        }
      }
    } catch (error) {
      // Ignore unavailable stores.
    }
  }

  return "";
}

function getDeviceFromPressedToolbarButton() {
  try {
    const docs = [document];

    if (window.parent && window.parent !== window) {
      try {
        docs.push(window.parent.document);
      } catch (error) {
        // Cross-origin parent.
      }
    }

    for (const doc of docs) {
      const pressedElements = Array.from(
        doc.querySelectorAll(
          [
            '[aria-pressed="true"]',
            '[aria-current="true"]',
            '[data-selected="true"]',
            '[data-active="true"]',
            ".is-pressed",
            ".is-active",
            ".active",
          ].join(",")
        )
      );

      for (const element of pressedElements) {
        const label = [
          element.getAttribute("aria-label") || "",
          element.getAttribute("title") || "",
          element.getAttribute("data-device") || "",
          element.getAttribute("data-preview-device-type") || "",
          element.getAttribute("data-value") || "",
          element.textContent || "",
        ]
          .join(" ")
          .toLowerCase();

        if (
          label.includes("mobile") ||
          label.includes("phone")
        ) {
          return "mobile";
        }

        if (label.includes("tablet")) {
          return "tablet";
        }

        if (label.includes("desktop")) {
          return "desktop";
        }
      }
    }
  } catch (error) {
    // Ignore DOM detection errors.
  }

  return "";
}

function getCurrentDevice() {
  return (
    getDeviceFromPressedToolbarButton() ||
    getDeviceFromCustomToolbar() ||
    getDeviceFromWordPressStore() ||
    "desktop"
  );
}

function useGlobalResponsiveDevice() {
  const [device, setDevice] = useState(
    () => getCurrentDevice() || "desktop"
  );

  useEffect(() => {
    const getExplicitToolbarDevice = () =>
      getDeviceFromPressedToolbarButton() ||
      getDeviceFromCustomToolbar();

    const updateDevice = (forcedDevice = "") => {
      const explicitToolbarDevice =
        getExplicitToolbarDevice();

      const nextDevice = forcedDevice
        ? normalizeDevice(forcedDevice)
        : explicitToolbarDevice ||
          getDeviceFromWordPressStore() ||
          "desktop";

      if (!nextDevice) {
        return;
      }

      setDevice((currentDevice) => {
        if (
          currentDevice === "mobile" &&
          nextDevice === "desktop" &&
          explicitToolbarDevice !== "desktop"
        ) {
          return currentDevice;
        }

        if (
          currentDevice === "mobile" &&
          nextDevice === "tablet" &&
          explicitToolbarDevice !== "tablet"
        ) {
          return currentDevice;
        }

        return currentDevice !== nextDevice
          ? nextDevice
          : currentDevice;
      });
    };

    const handleDeviceChange = (event) => {
      const eventDevice =
        event?.detail?.device ||
        event?.detail?.previewDeviceType ||
        event?.detail?.type ||
        event?.detail?.value ||
        "";

      updateDevice(eventDevice);
    };

    window.addEventListener(
      "uplifters-site-builder-blocks-responsive-device-change",
      handleDeviceChange
    );

    window.addEventListener(
      "upliftersSiteBuilderBlocksResponsiveDeviceChange",
      handleDeviceChange
    );

    window.addEventListener(
      "resize",
      handleDeviceChange
    );

    window.addEventListener(
      "orientationchange",
      handleDeviceChange
    );

    let unsubscribe = null;

    try {
      unsubscribe = subscribe(() => {
        updateDevice();
      });
    } catch (error) {
      unsubscribe = null;
    }

    const interval = window.setInterval(() => {
      updateDevice();
    }, 500);

    updateDevice();

    return () => {
      window.removeEventListener(
        "uplifters-site-builder-blocks-responsive-device-change",
        handleDeviceChange
      );

      window.removeEventListener(
        "upliftersSiteBuilderBlocksResponsiveDeviceChange",
        handleDeviceChange
      );

      window.removeEventListener(
        "resize",
        handleDeviceChange
      );

      window.removeEventListener(
        "orientationchange",
        handleDeviceChange
      );

      if (typeof unsubscribe === "function") {
        unsubscribe();
      }

      window.clearInterval(interval);
    };
  }, []);

  return DEVICES.includes(device)
    ? device
    : "desktop";
}

function getResponsiveValue(
  attributes,
  key,
  device,
  fallback
) {
  const safeDevice = DEVICES.includes(device)
    ? device
    : "desktop";

  const value = attributes?.[key];

  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return fallback;
  }

  if (
    value[safeDevice] !== undefined &&
    value[safeDevice] !== null
  ) {
    return value[safeDevice];
  }

  if (
    value.desktop !== undefined &&
    value.desktop !== null
  ) {
    return value.desktop;
  }

  if (
    value.tablet !== undefined &&
    value.tablet !== null
  ) {
    return value.tablet;
  }

  if (
    value.mobile !== undefined &&
    value.mobile !== null
  ) {
    return value.mobile;
  }

  return fallback;
}

function setResponsiveValue(
  attributes,
  setAttributes,
  key,
  device,
  value
) {
  const safeDevice = DEVICES.includes(device)
    ? device
    : "desktop";

  setAttributes({
    [key]: {
      ...(attributes[key] || {}),
      [safeDevice]: value,
    },
  });
}

const getPagePositionJustify = (
  position = "center"
) => {
  if (
    position === "start" ||
    position === "left"
  ) {
    return "flex-start";
  }

  if (
    position === "end" ||
    position === "right"
  ) {
    return "flex-end";
  }

  return "center";
};

const sortPages = (pages = []) =>
  [...pages].sort(
    (a, b) =>
      Number(a.menu_order || 0) -
        Number(b.menu_order || 0) ||
      String(a.title || "").localeCompare(
        String(b.title || "")
      )
  );

const toPaddingStyle = (box = {}) => ({
  paddingTop: box?.top || "0px",
  paddingRight: box?.right || "0px",
  paddingBottom: box?.bottom || "0px",
  paddingLeft: box?.left || "0px",
});

const toMarginStyle = (box = {}) => ({
  marginTop: box?.top || "0px",
  marginRight: box?.right || "0px",
  marginBottom: box?.bottom || "0px",
  marginLeft: box?.left || "0px",
});

const computeVisiblePages = (
  allPages,
  selectedIds
) => {
  const selected = new Set(
    (selectedIds || []).map((number) =>
      Number(number)
    )
  );

  if (selected.size === 0) {
    return sortPages(allPages);
  }

  return sortPages(
    allPages.filter((page) =>
      selected.has(Number(page.id))
    )
  );
};

const DeviceBadge = ({ device }) => {
  const label =
    device === "tablet"
      ? "Tablet values"
      : device === "mobile"
      ? "Mobile values"
      : "Desktop values";

  return (
    <div
      style={{
        marginBottom: "12px",
        padding: "6px 10px",
        borderRadius: "999px",
        background: "#f1f5f9",
        color: "#334155",
        fontSize: "12px",
        fontWeight: 600,
        display: "inline-flex",
      }}
    >
      {label}
    </div>
  );
};

const TitleList = ({
  pages,
  titleStyle,
}) => {
  if (!pages?.length) {
    return null;
  }

  return (
    <ul className="uplifters-site-builder-blocks-page-menu-list">
      {pages.map((page) => (
        <li key={page.id}>
          <a
            href={page.permalink}
            target="_blank"
            rel="noreferrer"
            className="uplifters-site-builder-blocks-page-menu-item"
          >
            <div
              className="uplifters-site-builder-blocks-page-menu-title"
              style={titleStyle}
            >
              {page.title || "Untitled"}
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
};

const PagePickerList = ({
  pages,
  selectedSet,
  onToggle,
}) => {
  if (!pages?.length) {
    return null;
  }

  return (
    <div>
      {pages.map((page) => {
        const id = Number(page.id);

        return (
          <div
            key={id}
            className="uplifters-site-builder-blocks-page-menu-picker-row"
          >
            <CheckboxControl
              label={
                page.title ||
                `Untitled (#${id})`
              }
              checked={selectedSet.has(id)}
              onChange={() => onToggle(id)}
            />
          </div>
        );
      })}
    </div>
  );
};

function Editor({
  attributes,
  setAttributes,
}) {
  const device = useGlobalResponsiveDevice();

  const {
    perPage = 50,
    selectedPageIds = [],
  } = attributes;

  const pagePosition = getResponsiveValue(
    attributes,
    "pagePosition",
    device,
    "center"
  );

  const titlePadding = getResponsiveValue(
    attributes,
    "titlePadding",
    device,
    DEFAULT_BOX
  );

  const titleMargin = getResponsiveValue(
    attributes,
    "titleMargin",
    device,
    DEFAULT_BOX
  );

  const titleBg = getResponsiveValue(
    attributes,
    "titleBg",
    device,
    ""
  );

  const titleColor = getResponsiveValue(
    attributes,
    "titleColor",
    device,
    ""
  );

  const titleFontFamily = getResponsiveValue(
    attributes,
    "titleFontFamily",
    device,
    "default"
  );

  const titleFontSize = getResponsiveValue(
    attributes,
    "titleFontSize",
    device,
    16
  );

  const hoverBg = getResponsiveValue(
    attributes,
    "hoverBg",
    device,
    ""
  );

  const hoverTextColor = getResponsiveValue(
    attributes,
    "hoverTextColor",
    device,
    ""
  );

  const activeTextColor = getResponsiveValue(
    attributes,
    "activeTextColor",
    device,
    "#dc2626"
  );

  const hamburgerBg = getResponsiveValue(
    attributes,
    "hamburgerBg",
    device,
    "#ffffff"
  );

  const hamburgerColor = getResponsiveValue(
    attributes,
    "hamburgerColor",
    device,
    "#334155"
  );

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  ] = useState(false);

  const [
    openSettingsPanel,
    setOpenSettingsPanel,
  ] = useState(null);

  const [
    openStylesPanel,
    setOpenStylesPanel,
  ] = useState(null);

  const toggleSettingsPanel = (panelName) =>
    setOpenSettingsPanel((current) =>
      current === panelName
        ? null
        : panelName
    );

  const toggleStylesPanel = (panelName) =>
    setOpenStylesPanel((current) =>
      current === panelName
        ? null
        : panelName
    );

  const sortedPages = useMemo(
    () => sortPages(pages),
    [pages]
  );

  const selectedSet = useMemo(
    () =>
      new Set(
        (selectedPageIds || []).map(
          (number) => Number(number)
        )
      ),
    [selectedPageIds]
  );

  const onTogglePage = (id) => {
    const next = new Set(selectedSet);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    setAttributes({
      selectedPageIds: Array.from(next),
    });
  };

  const visiblePages = useMemo(
    () =>
      computeVisiblePages(
        pages,
        selectedPageIds
      ),
    [pages, selectedPageIds]
  );

  const titleStyle = useMemo(() => {
    const fontSize = Number(
      titleFontSize || 16
    );

    const fontFamily =
      getFontFamilyCss(titleFontFamily);

    return {
      ...toPaddingStyle(titlePadding),
      ...toMarginStyle(titleMargin),

      ...(titleBg
        ? {
            backgroundColor: titleBg,
          }
        : {}),

      ...(titleColor
        ? {
            color: titleColor,
          }
        : {}),

      ...(fontFamily
        ? {
            fontFamily,
          }
        : {}),

      fontSize: `${
        Number.isFinite(fontSize)
          ? fontSize
          : 16
      }px`,

      textAlign: "center",
      borderRadius: "8px",
    };
  }, [
    titlePadding,
    titleMargin,
    titleBg,
    titleColor,
    titleFontFamily,
    titleFontSize,
  ]);

  useEffect(() => {
    let alive = true;

    setLoading(true);
    setErr("");

    fetchPages({ perPage })
      .then((data) => {
        if (!alive) {
          return;
        }

        setPages(
          Array.isArray(data)
            ? data
            : []
        );
      })
      .catch((error) => {
        if (!alive) {
          return;
        }

        setErr(
          error?.message ||
            "Failed to load pages."
        );
      })
      .finally(() => {
        if (!alive) {
          return;
        }

        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [perPage]);

  useEffect(() => {
    if (device !== "mobile") {
      setIsMobileMenuOpen(false);
    }
  }, [device]);

  const selectedFontCss =
    getFontFamilyCss(titleFontFamily);

  const blockProps = useBlockProps({
    className:
      `uplifters-site-builder-blocks-fse-page-menu ` +
      `uplifters-site-builder-blocks-fse-page-menu-editor ` +
      `uplifters-site-builder-blocks-page-menu-device-${device}`,

    "data-uplifters-site-builder-blocks-editor-device": device,

    style: {
      "--uplifters-site-builder-blocks-page-position-justify":
        getPagePositionJustify(
          pagePosition
        ),

      ...(hoverBg
        ? {
            "--uplifters-site-builder-blocks-hover-bg": hoverBg,
          }
        : {}),

      ...(hoverTextColor
        ? {
            "--uplifters-site-builder-blocks-hover-text":
              hoverTextColor,
          }
        : {}),

      "--uplifters-site-builder-blocks-active-text":
        activeTextColor || "#dc2626",

      ...(titleColor
        ? {
            "--uplifters-site-builder-blocks-title-color":
              titleColor,
          }
        : {}),

      "--uplifters-site-builder-blocks-title-font-family":
        selectedFontCss || "inherit",

      "--uplifters-site-builder-blocks-hamburger-bg":
        hamburgerBg || "#ffffff",

      "--uplifters-site-builder-blocks-hamburger-color":
        hamburgerColor || "#334155",
    },
  });

  return (
    <>

      <InspectorControls group="settings">
        <PanelBody
          title="Query"
          initialOpen={false}
          opened={
            openSettingsPanel ===
            "pagesQuery"
          }
          onToggle={() =>
            toggleSettingsPanel(
              "pagesQuery"
            )
          }
        >
          <RangeControl
            label="How many pages?"
            value={perPage}
            onChange={(value) =>
              setAttributes({
                perPage: value ?? 50,
              })
            }
            min={1}
            max={1000}
          />
        </PanelBody>

        <PanelBody
          title="Pages"
          initialOpen={false}
          opened={
            openSettingsPanel ===
            "showsPages"
          }
          onToggle={() =>
            toggleSettingsPanel(
              "showsPages"
            )
          }
        >
          {loading ? (
            <Spinner />
          ) : err ? (
            <Notice
              status="error"
              isDismissible={false}
            >
              {err}
            </Notice>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() =>
                  setAttributes({
                    selectedPageIds: [],
                  })
                }
              >
                Show All
              </Button>

              <div
                style={{
                  marginTop: "12px",
                }}
              >
                <PagePickerList
                  pages={sortedPages}
                  selectedSet={selectedSet}
                  onToggle={onTogglePage}
                />
              </div>
            </>
          )}
        </PanelBody>
      </InspectorControls>

      <InspectorControls group="styles">
        <PanelBody
          title="Layout"
          initialOpen={false}
          opened={
            openStylesPanel ===
            "layoutStyle"
          }
          onToggle={() =>
            toggleStylesPanel(
              "layoutStyle"
            )
          }
        >
          <DeviceBadge device={device} />

          <SelectControl
            label="Position"
            value={
              pagePosition || "center"
            }
            options={[
              {
                label: "Start",
                value: "start",
              },
              {
                label: "Center",
                value: "center",
              },
              {
                label: "End",
                value: "end",
              },
            ]}
            onChange={(value) =>
              setResponsiveValue(
                attributes,
                setAttributes,
                "pagePosition",
                device,
                value || "center"
              )
            }
          />
        </PanelBody>

        <PanelBody
          title="Spacing"
          initialOpen={false}
          opened={
            openStylesPanel ===
            "spacingStyle"
          }
          onToggle={() =>
            toggleStylesPanel(
              "spacingStyle"
            )
          }
        >
          <DeviceBadge device={device} />

          <BoxControl
            label="Title Padding"
            values={
              titlePadding ||
              DEFAULT_BOX
            }
            onChange={(value) =>
              setResponsiveValue(
                attributes,
                setAttributes,
                "titlePadding",
                device,
                value || DEFAULT_BOX
              )
            }
          />

          <BoxControl
            label="Title Margin"
            values={
              titleMargin ||
              DEFAULT_BOX
            }
            onChange={(value) =>
              setResponsiveValue(
                attributes,
                setAttributes,
                "titleMargin",
                device,
                value || DEFAULT_BOX
              )
            }
          />
        </PanelBody>

        <PanelBody
          title="Typography"
          initialOpen={false}
          opened={
            openStylesPanel ===
            "titleStyle"
          }
          onToggle={() =>
            toggleStylesPanel(
              "titleStyle"
            )
          }
        >
          <DeviceBadge device={device} />

          <FontFamilyControl
            label="Font Family"
            value={
              titleFontFamily ||
              "default"
            }
            onChange={(value) =>
              setResponsiveValue(
                attributes,
                setAttributes,
                "titleFontFamily",
                device,
                value || "default"
              )
            }
          />

          <RangeControl
            label="Title Font Size (px)"
            value={Number(
              titleFontSize || 16
            )}
            onChange={(value) =>
              setResponsiveValue(
                attributes,
                setAttributes,
                "titleFontSize",
                device,
                value ?? 16
              )
            }
            min={10}
            max={40}
          />
        </PanelBody>

        <PanelBody
          title="Colors"
          initialOpen={false}
          opened={
            openStylesPanel ===
            "colorsStyle"
          }
          onToggle={() =>
            toggleStylesPanel(
              "colorsStyle"
            )
          }
        >
          <DeviceBadge device={device} />

          <div className="components-base-control">
            <div className="components-base-control__label">
              Title Color
            </div>

            <ColorPalette
              value={titleColor}
              onChange={(color) =>
                setResponsiveValue(
                  attributes,
                  setAttributes,
                  "titleColor",
                  device,
                  color || ""
                )
              }
              enableAlpha
            />
          </div>

          <div className="components-base-control">
            <div className="components-base-control__label">
              Title Background
            </div>

            <ColorPalette
              value={titleBg}
              onChange={(color) =>
                setResponsiveValue(
                  attributes,
                  setAttributes,
                  "titleBg",
                  device,
                  color || ""
                )
              }
              enableAlpha
            />
          </div>

          <div className="components-base-control">
            <div className="components-base-control__label">
              Hover Background
            </div>

            <ColorPalette
              value={hoverBg}
              onChange={(color) =>
                setResponsiveValue(
                  attributes,
                  setAttributes,
                  "hoverBg",
                  device,
                  color || ""
                )
              }
              enableAlpha
            />
          </div>

          <div className="components-base-control">
            <div className="components-base-control__label">
              Hover Text Color
            </div>

            <ColorPalette
              value={hoverTextColor}
              onChange={(color) =>
                setResponsiveValue(
                  attributes,
                  setAttributes,
                  "hoverTextColor",
                  device,
                  color || ""
                )
              }
              enableAlpha
            />
          </div>

          <div className="components-base-control">
            <div className="components-base-control__label">
              Active Text Color
            </div>

            <ColorPalette
              value={activeTextColor}
              onChange={(color) =>
                setResponsiveValue(
                  attributes,
                  setAttributes,
                  "activeTextColor",
                  device,
                  color || "#dc2626"
                )
              }
              enableAlpha
            />
          </div>

          <div className="components-base-control">
            <div className="components-base-control__label">
              Hamburger Background
            </div>

            <ColorPalette
              value={hamburgerBg}
              onChange={(color) =>
                setResponsiveValue(
                  attributes,
                  setAttributes,
                  "hamburgerBg",
                  device,
                  color || "#ffffff"
                )
              }
              enableAlpha
            />
          </div>

          <div className="components-base-control">
            <div className="components-base-control__label">
              Hamburger Icon Color
            </div>

            <ColorPalette
              value={hamburgerColor}
              onChange={(color) =>
                setResponsiveValue(
                  attributes,
                  setAttributes,
                  "hamburgerColor",
                  device,
                  color || "#334155"
                )
              }
              enableAlpha
            />
          </div>
        </PanelBody>
      </InspectorControls>

      <div {...blockProps}>
        <div className="uplifters-site-builder-blocks-page-menu-preview-wrap">
          {loading ? (
            <div className="uplifters-site-builder-blocks-page-menu-placeholder-label">
              <Spinner />

              <span
                style={{
                  marginLeft: 8,
                }}
              >
                Loading Page Menu...
              </span>
            </div>
          ) : err ? (
            <Notice
              status="error"
              isDismissible={false}
            >
              {err}
            </Notice>
          ) : visiblePages.length === 0 ? (
            <div className="uplifters-site-builder-blocks-page-menu-placeholder-label">
              Select pages from block
              settings, or keep empty to
              show all pages.
            </div>
          ) : (
            <>
              <div className="uplifters-site-builder-blocks-page-menu-desktop-shell">
                <TitleList
                  pages={visiblePages}
                  titleStyle={titleStyle}
                />
              </div>

              <div className="uplifters-site-builder-blocks-page-menu-mobile-shell">
                <Button
                  type="button"
                  className="uplifters-site-builder-blocks-page-menu-mobile-trigger"
                  aria-expanded={
                    isMobileMenuOpen
                  }
                  aria-label="Open menu"
                  onClick={() =>
                    setIsMobileMenuOpen(
                      (isOpen) => !isOpen
                    )
                  }
                >
                  <span
                    className="uplifters-site-builder-blocks-page-menu-hamburger"
                    aria-hidden="true"
                  >
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </Button>

                <div
                  className={
                    `uplifters-site-builder-blocks-page-menu-mobile-layer` +
                    `${
                      isMobileMenuOpen
                        ? " is-open"
                        : ""
                    }`
                  }
                >
                  <div className="uplifters-site-builder-blocks-page-menu-panel-header">
                    <strong>Pages</strong>

                    <Button
                      type="button"
                      className="uplifters-site-builder-blocks-page-menu-close-btn"
                      aria-label="Close menu"
                      onClick={() =>
                        setIsMobileMenuOpen(
                          false
                        )
                      }
                    >
                      ×
                    </Button>
                  </div>

                  <TitleList
                    pages={visiblePages}
                    titleStyle={titleStyle}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="page-nav" /> : <Editor {...props} />;
}
