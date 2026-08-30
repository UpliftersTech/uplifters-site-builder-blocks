import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import {
	__,
} from "@wordpress/i18n";
import {
	InspectorControls,
	useBlockProps,
} from "@wordpress/block-editor";
import {
	PanelBody,
	TextControl,
	Notice,
	ColorPalette,
} from "@wordpress/components";
import { Fragment, useState } from "@wordpress/element";

const buildGoogleMapsUrl = (location) => {
  const query = (location || "").trim();

  if (!query) {
    return "https://www.google.com/maps";
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
};

const buildGoogleMapsEmbedUrl = (location) => {
  const query = (location || "").trim();

  if (!query) {
    return "";
  }

  return `https://www.google.com/maps?output=embed&q=${encodeURIComponent(
    query
  )}`;
};

const DEFAULT_COLORS = [
  {
    name: "White",
    color: "#ffffff",
  },
  {
    name: "Slate 50",
    color: "#f8fafc",
  },
  {
    name: "Slate 100",
    color: "#f1f5f9",
  },
  {
    name: "Amber 50",
    color: "#fffbeb",
  },
  {
    name: "Emerald 50",
    color: "#ecfdf5",
  },
  {
    name: "Sky 50",
    color: "#f0f9ff",
  },
  {
    name: "Rose 50",
    color: "#fff1f2",
  },
];

function MapPreview({ locationName }) {
  const mapUrl = buildGoogleMapsUrl(locationName);
  const embedUrl = buildGoogleMapsEmbedUrl(locationName);

  if (!locationName) {
    return (
      <div
        className="uplifters-site-builder-blocks-location-map__empty-preview"
        style={{
          minHeight: "20rem",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "1rem",
          border: "1px solid #e2e8f0",
          background: "linear-gradient(to bottom, #f8fafc, #ffffff)",
          padding: "2rem",
          boxSizing: "border-box",
        }}
      >
        <div
          className="uplifters-site-builder-blocks-location-map__empty-card"
          style={{
            width: "100%",
            maxWidth: "28rem",
            borderRadius: "1rem",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            padding: "1.5rem",
            textAlign: "center",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
            boxSizing: "border-box",
          }}
        >
          <div
            className="uplifters-site-builder-blocks-location-map__empty-icon"
            style={{
              width: "3rem",
              height: "3rem",
              margin: "0 auto 0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "1rem",
              backgroundColor: "#f1f5f9",
            }}
          >
            <span
              className="uplifters-site-builder-blocks-location-map__empty-icon-symbol"
              style={{
                fontSize: "1.25rem",
              }}
              aria-hidden="true"
            >
              🗺️
            </span>
          </div>

          <div
            className="uplifters-site-builder-blocks-location-map__empty-title"
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#0f172a",
            }}
          >
            {__("Map preview", "uplifters-site-builder-blocks")}
          </div>

          <div
            className="uplifters-site-builder-blocks-location-map__empty-description"
            style={{
              marginTop: "0.25rem",
              fontSize: "0.875rem",
              color: "#475569",
            }}
          >
            {__(
              "Enter a place name in Settings -> Location to show a live map preview here.",
              "uplifters-site-builder-blocks"
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="uplifters-site-builder-blocks-location-map__map-card"
      style={{
        overflow: "hidden",
        borderRadius: "1rem",
        border: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
      }}
    >
      <div
        className="uplifters-site-builder-blocks-location-map__map-wrapper"
        style={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <iframe
          className="uplifters-site-builder-blocks-location-map__iframe"
          title={
            locationName
              ? `${__("Map preview", "uplifters-site-builder-blocks")}: ${locationName}`
              : __("Map preview", "uplifters-site-builder-blocks")
          }
          src={embedUrl}
          style={{
            display: "block",
            width: "100%",
            height: "28rem",
            minHeight: "28rem",
            border: 0,
          }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />

        <a
          className="uplifters-site-builder-blocks-location-map__open-maps"
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "0.75rem",
            border: "1px solid #cbd5e1",
            backgroundColor: "#ffffff",
            padding: "0.5rem 0.75rem",
            fontSize: "0.75rem",
            fontWeight: 600,
            lineHeight: 1,
            color: "#0f172a",
            textDecoration: "none",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
          }}
          title={__("Open in Google Maps", "uplifters-site-builder-blocks")}
        >
          {__("Open Maps", "uplifters-site-builder-blocks")}
        </a>
      </div>

      <div
        className="uplifters-site-builder-blocks-location-map__map-information"
        style={{
          padding: "0.75rem",
        }}
      >
        <div
          className="uplifters-site-builder-blocks-location-map__map-location-name"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#0f172a",
          }}
        >
          {locationName}
        </div>

        <div
          className="uplifters-site-builder-blocks-location-map__map-url"
          style={{
            marginTop: "0.25rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "0.75rem",
            color: "#475569",
          }}
        >
          {mapUrl}
        </div>
      </div>
    </div>
  );
}

function Editor({ attributes, setAttributes }) {
  const { locationName, backgroundColor } = attributes;

  const [openSettingsAccordion, setOpenSettingsAccordion] = useState(null);
  const [openStylesAccordion, setOpenStylesAccordion] = useState(null);

  const mapUrl = buildGoogleMapsUrl(locationName);
  const titleText = locationName || __("Location", "uplifters-site-builder-blocks");

  const blockProps = useBlockProps({
    className: "uplifters-site-builder-blocks-location-map",
    style: {
      width: "100%",
      maxWidth: "none",
      borderRadius: "1rem",
      border: "1px solid #e2e8f0",
      padding: "1rem",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
      backgroundColor: backgroundColor || undefined,
      boxSizing: "border-box",
    },
  });

  const onChangeLocation = (value) => {
    setAttributes({
      locationName: value ?? "",
    });
  };

  const setBackgroundColor = (color) => {
    setAttributes({
      backgroundColor: color || "",
    });
  };

  const toggleSettingsAccordion = (panelName) => {
    setOpenSettingsAccordion((currentPanel) =>
      currentPanel === panelName ? null : panelName
    );
  };

  const toggleStylesAccordion = (panelName) => {
    setOpenStylesAccordion((currentPanel) =>
      currentPanel === panelName ? null : panelName
    );
  };

  return (
    <Fragment>
      <InspectorControls group="settings">
        <PanelBody
          title={__("Content", "uplifters-site-builder-blocks")}
          initialOpen={false}
          opened={openSettingsAccordion === "location-settings"}
          onToggle={() => toggleSettingsAccordion("location-settings")}
        >
          {openSettingsAccordion === "location-settings" && (
            <>
              <TextControl
                label={__("Location", "uplifters-site-builder-blocks")}
                value={locationName}
                onChange={onChangeLocation}
                placeholder={__("e.g. Gulshan, Dhaka", "uplifters-site-builder-blocks")}
                help={__(
                  "Typing here will auto-update the editor preview and the frontend map.",
                  "uplifters-site-builder-blocks"
                )}
              />

              <div
                className="uplifters-site-builder-blocks-location-map__settings-map-url"
                style={{
                  marginTop: "0.75rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                  padding: "0.75rem",
                  boxSizing: "border-box",
                }}
              >
                <div
                  className="uplifters-site-builder-blocks-location-map__settings-map-url-label"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  {__("Google Maps (auto)", "uplifters-site-builder-blocks")}
                </div>

                <div
                  className="uplifters-site-builder-blocks-location-map__settings-map-url-value"
                  style={{
                    marginTop: "0.25rem",
                    wordBreak: "break-all",
                    fontSize: "0.75rem",
                    color: "#334155",
                  }}
                >
                  {mapUrl}
                </div>
              </div>
            </>
          )}
        </PanelBody>
      </InspectorControls>

      <InspectorControls group="styles">
        <PanelBody
          title={__("Colors", "uplifters-site-builder-blocks")}
          initialOpen={false}
          opened={openStylesAccordion === "color-settings"}
          onToggle={() => toggleStylesAccordion("color-settings")}
        >
          {openStylesAccordion === "color-settings" && (
            <>
              <div
                className="uplifters-site-builder-blocks-location-map__background-color-label"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#0f172a",
                }}
              >
                {__("Background Color", "uplifters-site-builder-blocks")}
              </div>

              <div
                className="uplifters-site-builder-blocks-location-map__background-color-control"
                style={{
                  marginTop: "0.5rem",
                }}
              >
                <ColorPalette
                  colors={DEFAULT_COLORS}
                  value={backgroundColor || undefined}
                  onChange={setBackgroundColor}
                  disableCustomColors={false}
                  clearable={true}
                 enableAlpha/>
              </div>

              <div
                className="uplifters-site-builder-blocks-location-map__selected-color"
                style={{
                  marginTop: "0.75rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                  padding: "0.75rem",
                  boxSizing: "border-box",
                }}
              >
                <div
                  className="uplifters-site-builder-blocks-location-map__selected-color-label"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  {__("Selected", "uplifters-site-builder-blocks")}
                </div>

                <div
                  className="uplifters-site-builder-blocks-location-map__selected-color-value"
                  style={{
                    marginTop: "0.25rem",
                    fontSize: "0.75rem",
                    color: "#334155",
                  }}
                >
                  {backgroundColor ||
                    __("Default (no color)", "uplifters-site-builder-blocks")}
                </div>
              </div>
            </>
          )}
        </PanelBody>
      </InspectorControls>

      <div {...blockProps}>
        <div
          className="uplifters-site-builder-blocks-location-map__editor-header"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <div className="uplifters-site-builder-blocks-location-map__editor-heading-wrapper">
            <h3
              className="uplifters-site-builder-blocks-location-map__editor-title"
              style={{
                margin: 0,
                fontSize: "1rem",
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              {titleText}
            </h3>

            <p
              className="uplifters-site-builder-blocks-location-map__editor-description"
              style={{
                margin: "0.25rem 0 0",
                fontSize: "0.875rem",
                color: "#475569",
              }}
            >
              {__(
                "Type a location in Settings to see live Google Map preview.",
                "uplifters-site-builder-blocks"
              )}
            </p>
          </div>
        </div>

        <div
          className="uplifters-site-builder-blocks-location-map__editor-preview"
          style={{
            marginTop: "1rem",
          }}
        >
          <MapPreview locationName={locationName} />
        </div>

        {!locationName && (
          <Notice
            className="uplifters-site-builder-blocks-location-map__editor-notice"
            status="warning"
            isDismissible={false}
            style={{
              marginTop: "0.75rem",
            }}
          >
            {__("Please type a Location in the settings.", "uplifters-site-builder-blocks")}
          </Notice>
        )}
      </div>
    </Fragment>
  );
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="location-map" /> : <Editor {...props} />;
}
