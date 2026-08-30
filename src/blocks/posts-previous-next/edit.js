import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';

import './editor.scss';
import {
	BaseControl,
	PanelBody,
	RangeControl,
	TextControl,
	ToggleControl,
	ColorPalette,
} from '@wordpress/components';
import { FontFamilyControl, getFontFamilyCss } from '../../assets-shared/fonts-family/font-family-control';

const DEVICES = ['desktop', 'tablet', 'mobile'];

function normalizeDevice(value) {
  const device = String(value || '').toLowerCase();
  if (DEVICES.includes(device)) return device;
  if (device.includes('tablet') || device === 'medium') return 'tablet';
  if (device.includes('mobile') || device.includes('phone') || device === 'small') return 'mobile';
  return 'desktop';
}

function getDeviceFromWindow() {
  const windows = [window];

  try {
    if (window.parent && window.parent !== window) windows.push(window.parent);
  } catch (error) {}

  for (const currentWindow of windows) {
    try {
      if (currentWindow.UpliftersSiteBuilderBlocksResponsive?.getDevice) {
        return normalizeDevice(currentWindow.UpliftersSiteBuilderBlocksResponsive.getDevice());
      }

      if (currentWindow.upliftersSiteBuilderBlocksResponsiveDevice) {
        return normalizeDevice(currentWindow.upliftersSiteBuilderBlocksResponsiveDevice);
      }

      const stored = currentWindow.localStorage?.getItem('upliftersSiteBuilderBlocksResponsiveDevice');
      if (stored) return normalizeDevice(stored);
    } catch (error) {}
  }

  return 'desktop';
}

function useGlobalResponsiveDevice() {
  const [device, setDevice] = useState(getDeviceFromWindow);

  useEffect(() => {
    const update = (event) => {
      setDevice(
        normalizeDevice(
          event?.detail?.device ||
            event?.detail?.deviceType ||
            event?.detail?.previewDeviceType ||
            getDeviceFromWindow()
        )
      );
    };

    const windows = [window];

    try {
      if (window.parent && window.parent !== window) windows.push(window.parent);
    } catch (error) {}

    windows.forEach((currentWindow) => {
      try {
        currentWindow.addEventListener('uplifters-site-builder-blocks-responsive-device-change', update);
        currentWindow.addEventListener('uplifters-site-builder-blocks-global-responsive-device-change', update);
        currentWindow.addEventListener('uplifters-site-builder-blocks-device-change', update);
        currentWindow.addEventListener('storage', update);
      } catch (error) {}
    });

    const interval = window.setInterval(update, 300);

    return () => {
      windows.forEach((currentWindow) => {
        try {
          currentWindow.removeEventListener('uplifters-site-builder-blocks-responsive-device-change', update);
          currentWindow.removeEventListener('uplifters-site-builder-blocks-global-responsive-device-change', update);
          currentWindow.removeEventListener('uplifters-site-builder-blocks-device-change', update);
          currentWindow.removeEventListener('storage', update);
        } catch (error) {}
      });

      window.clearInterval(interval);
    };
  }, []);

  return device;
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== '';
}

function getResponsiveValue(value, device, fallback = '') {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (hasValue(value[device])) return value[device];
    if (hasValue(value.desktop)) return value.desktop;
    if (hasValue(value.tablet)) return value.tablet;
    if (hasValue(value.mobile)) return value.mobile;
    return fallback;
  }

  return hasValue(value) ? value : fallback;
}

function setResponsiveValue(attributes, setAttributes, key, device, nextValue) {
  const current =
    attributes[key] && typeof attributes[key] === 'object' && !Array.isArray(attributes[key])
      ? attributes[key]
      : {};

  setAttributes({
    [key]: {
      ...current,
      [device]: nextValue,
    },
  });
}

function DeviceBadge({ device }) {
  const label = device === 'tablet' ? 'Tablet' : device === 'mobile' ? 'Mobile' : 'Desktop';
  return <div className="uplifters-site-builder-blocks-posts-previous-next-device-badge">{label}</div>;
}


function Editor({ attributes, setAttributes }) {
  const device = useGlobalResponsiveDevice();
  const [openSettingsPanel, setOpenSettingsPanel] = useState(null);
  const [openStylesPanel, setOpenStylesPanel] = useState(null);
  const toggleSettingsPanel = (panel) => {
    setOpenSettingsPanel((currentPanel) => (currentPanel === panel ? null : panel));
  };
  const toggleStylesPanel = (panel) => {
    setOpenStylesPanel((currentPanel) => (currentPanel === panel ? null : panel));
  };

  const showPrevious = !!getResponsiveValue(attributes.showPrevious, device, true);
  const showNext = !!getResponsiveValue(attributes.showNext, device, true);
  const previousLabel = getResponsiveValue(attributes.previousLabel, device, 'Previous Post');
  const nextLabel = getResponsiveValue(attributes.nextLabel, device, 'Next Post');
  const previousArrow = getResponsiveValue(attributes.previousArrow, device, '←');
  const nextArrow = getResponsiveValue(attributes.nextArrow, device, '→');

  const buttonRadius = Number(getResponsiveValue(attributes.buttonRadius, device, 999));
  const buttonPaddingY = Number(getResponsiveValue(attributes.buttonPaddingY, device, 12));
  const buttonPaddingX = Number(getResponsiveValue(attributes.buttonPaddingX, device, 18));
  const gap = Number(getResponsiveValue(attributes.gap, device, 12));
  const fontSize = Number(getResponsiveValue(attributes.fontSize, device, 15));
  const fontWeight = Number(getResponsiveValue(attributes.fontWeight, device, 600));
  const fontFamily = getResponsiveValue(attributes.fontFamily, device, 'inherit');

  const textColor = getResponsiveValue(attributes.textColor, device, '#111827');
  const backgroundColor = getResponsiveValue(attributes.backgroundColor, device, '#ffffff');
  const borderColor = getResponsiveValue(attributes.borderColor, device, '#d1d5db');
  const hoverTextColor = getResponsiveValue(attributes.hoverTextColor, device, '#ffffff');
  const hoverBackgroundColor = getResponsiveValue(attributes.hoverBackgroundColor, device, '#111827');
  const hoverBorderColor = getResponsiveValue(attributes.hoverBorderColor, device, '#111827');

  const blockProps = useBlockProps({
    className: `uplifters-site-builder-blocks-posts-previous-next-editor uplifters-site-builder-blocks-posts-previous-next-device-${device}`,
    style: {
      gap: `${Number.isFinite(gap) ? gap : 12}px`,
      '--uplifters-site-builder-blocks-posts-previous-next-radius': `${Number.isFinite(buttonRadius) ? buttonRadius : 999}px`,
      '--uplifters-site-builder-blocks-posts-previous-next-padding-y': `${Number.isFinite(buttonPaddingY) ? buttonPaddingY : 12}px`,
      '--uplifters-site-builder-blocks-posts-previous-next-padding-x': `${Number.isFinite(buttonPaddingX) ? buttonPaddingX : 18}px`,
      '--uplifters-site-builder-blocks-posts-previous-next-font-size': `${Number.isFinite(fontSize) ? fontSize : 15}px`,
      '--uplifters-site-builder-blocks-posts-previous-next-font-weight': Number.isFinite(fontWeight) ? fontWeight : 600,
      '--uplifters-site-builder-blocks-posts-previous-next-font-family': getFontFamilyCss(fontFamily) || 'inherit',
      '--uplifters-site-builder-blocks-posts-previous-next-text': textColor,
      '--uplifters-site-builder-blocks-posts-previous-next-bg': backgroundColor,
      '--uplifters-site-builder-blocks-posts-previous-next-border': borderColor,
      '--uplifters-site-builder-blocks-posts-previous-next-hover-text': hoverTextColor,
      '--uplifters-site-builder-blocks-posts-previous-next-hover-bg': hoverBackgroundColor,
      '--uplifters-site-builder-blocks-posts-previous-next-hover-border': hoverBorderColor,
    },
  });

  const previewButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textDecoration: 'none',
    border: '1px solid var(--uplifters-site-builder-blocks-posts-previous-next-border)',
    borderRadius: 'var(--uplifters-site-builder-blocks-posts-previous-next-radius)',
    padding: 'var(--uplifters-site-builder-blocks-posts-previous-next-padding-y) var(--uplifters-site-builder-blocks-posts-previous-next-padding-x)',
    fontSize: 'var(--uplifters-site-builder-blocks-posts-previous-next-font-size)',
    fontWeight: 'var(--uplifters-site-builder-blocks-posts-previous-next-font-weight)',
    fontFamily: 'var(--uplifters-site-builder-blocks-posts-previous-next-font-family)',
    lineHeight: 1.2,
    color: 'var(--uplifters-site-builder-blocks-posts-previous-next-text)',
    background: 'var(--uplifters-site-builder-blocks-posts-previous-next-bg)',
    cursor: 'default',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
  };

  return (
    <>

      <InspectorControls group="settings">
        <PanelBody
          title={__('Behavior', 'uplifters-site-builder-blocks')}
          initialOpen={false}
          opened={openSettingsPanel === 'navigation'}
          onToggle={() => toggleSettingsPanel('navigation')}
        >
          <DeviceBadge device={device} />

          <ToggleControl
            label={__('Show previous', 'uplifters-site-builder-blocks')}
            checked={showPrevious}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'showPrevious', device, !!value)}
          />

          <ToggleControl
            label={__('Show next', 'uplifters-site-builder-blocks')}
            checked={showNext}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'showNext', device, !!value)}
          />

          <TextControl
            label={__('Previous label', 'uplifters-site-builder-blocks')}
            value={previousLabel}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'previousLabel', device, value)}
          />

          <TextControl
            label={__('Next label', 'uplifters-site-builder-blocks')}
            value={nextLabel}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'nextLabel', device, value)}
          />

          <TextControl
            label={__('Previous arrow', 'uplifters-site-builder-blocks')}
            value={previousArrow}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'previousArrow', device, value)}
          />

          <TextControl
            label={__('Next arrow', 'uplifters-site-builder-blocks')}
            value={nextArrow}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'nextArrow', device, value)}
          />

          <ToggleControl
            label={__('Open in same tab', 'uplifters-site-builder-blocks')}
            checked={attributes.openInSameTab !== false}
            onChange={(value) => setAttributes({ openInSameTab: !!value })}
            help={__('This link behavior is shared by all devices.', 'uplifters-site-builder-blocks')}
          />
        </PanelBody>
      </InspectorControls>

      <InspectorControls group="styles">
        <PanelBody
          title={__('Spacing', 'uplifters-site-builder-blocks')}
          initialOpen={false}
          opened={openStylesPanel === 'dimensions'}
          onToggle={() => toggleStylesPanel('dimensions')}
        >
          <DeviceBadge device={device} />

          <RangeControl
            label={__('Gap', 'uplifters-site-builder-blocks')}
            value={gap}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'gap', device, value ?? 12)}
            min={0}
            max={80}
          />

          <RangeControl
            label={__('Border Radius', 'uplifters-site-builder-blocks')}
            value={buttonRadius}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'buttonRadius', device, value ?? 999)}
            min={0}
            max={999}
          />

          <RangeControl
            label={__('Vertical Padding', 'uplifters-site-builder-blocks')}
            value={buttonPaddingY}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'buttonPaddingY', device, value ?? 12)}
            min={0}
            max={80}
          />

          <RangeControl
            label={__('Horizontal Padding', 'uplifters-site-builder-blocks')}
            value={buttonPaddingX}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'buttonPaddingX', device, value ?? 18)}
            min={0}
            max={120}
          />
        </PanelBody>

        <PanelBody
          title={__('Typography', 'uplifters-site-builder-blocks')}
          initialOpen={false}
          opened={openStylesPanel === 'typography'}
          onToggle={() => toggleStylesPanel('typography')}
        >
          <DeviceBadge device={device} />

          <FontFamilyControl
            label={__('Font Family', 'uplifters-site-builder-blocks')}
            value={fontFamily}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'fontFamily', device, value)}
          />

          <RangeControl
            label={__('Font Size', 'uplifters-site-builder-blocks')}
            value={fontSize}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'fontSize', device, value ?? 15)}
            min={8}
            max={80}
          />

          <RangeControl
            label={__('Font Weight', 'uplifters-site-builder-blocks')}
            value={fontWeight}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'fontWeight', device, value ?? 600)}
            min={100}
            max={900}
            step={100}
          />
        </PanelBody>

        <PanelBody
          title={__('Colors', 'uplifters-site-builder-blocks')}
          initialOpen={false}
          opened={openStylesPanel === 'colors'}
          onToggle={() => toggleStylesPanel('colors')}
        >
          <DeviceBadge device={device} />

          <BaseControl label={__('Text Color', 'uplifters-site-builder-blocks')}>
            <ColorPalette
              value={textColor}
              onChange={(value) => setResponsiveValue(attributes, setAttributes, 'textColor', device, value || '#111827')}
              clearable={false}
              enableAlpha
            />
          </BaseControl>

          <BaseControl label={__('Background Color', 'uplifters-site-builder-blocks')}>
            <ColorPalette
              value={backgroundColor}
              onChange={(value) => setResponsiveValue(attributes, setAttributes, 'backgroundColor', device, value || '#ffffff')}
              clearable={false}
              enableAlpha
            />
          </BaseControl>

          <BaseControl label={__('Border Color', 'uplifters-site-builder-blocks')}>
            <ColorPalette
              value={borderColor}
              onChange={(value) => setResponsiveValue(attributes, setAttributes, 'borderColor', device, value || '#d1d5db')}
              clearable={false}
              enableAlpha
            />
          </BaseControl>

          <BaseControl label={__('Hover Text Color', 'uplifters-site-builder-blocks')}>
            <ColorPalette
              value={hoverTextColor}
              onChange={(value) => setResponsiveValue(attributes, setAttributes, 'hoverTextColor', device, value || '#ffffff')}
              clearable={false}
              enableAlpha
            />
          </BaseControl>

          <BaseControl label={__('Hover Background Color', 'uplifters-site-builder-blocks')}>
            <ColorPalette
              value={hoverBackgroundColor}
              onChange={(value) => setResponsiveValue(attributes, setAttributes, 'hoverBackgroundColor', device, value || '#111827')}
              clearable={false}
              enableAlpha
            />
          </BaseControl>

          <BaseControl label={__('Hover Border Color', 'uplifters-site-builder-blocks')}>
            <ColorPalette
              value={hoverBorderColor}
              onChange={(value) => setResponsiveValue(attributes, setAttributes, 'hoverBorderColor', device, value || '#111827')}
              clearable={false}
              enableAlpha
            />
          </BaseControl>
        </PanelBody>
      </InspectorControls>

      <div {...blockProps}>
        {showPrevious && (
          <span className="uplifters-site-builder-blocks-posts-previous-next-editor-button uplifters-site-builder-blocks-posts-previous-next-editor-button-previous" style={previewButtonStyle}>
            <span aria-hidden="true">{previousArrow}</span>
            <span>{previousLabel || __('Previous Post', 'uplifters-site-builder-blocks')}</span>
          </span>
        )}

        <span className="uplifters-site-builder-blocks-posts-previous-next-editor-spacer" />

        {showNext && (
          <span className="uplifters-site-builder-blocks-posts-previous-next-editor-button uplifters-site-builder-blocks-posts-previous-next-editor-button-next" style={previewButtonStyle}>
            <span>{nextLabel || __('Next Post', 'uplifters-site-builder-blocks')}</span>
            <span aria-hidden="true">{nextArrow}</span>
          </span>
        )}
      </div>
    </>
  );
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="posts-previous-next" /> : <Editor {...props} />;
}
