import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import {
	__,
	sprintf,
} from '@wordpress/i18n';
import { useEffect,
	useState } from '@wordpress/element';

import './editor.scss';
import {
	useBlockProps,
	RichText,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	ToggleControl,
	BaseControl,
	SelectControl,
	TextControl,
	Button,
	ColorPalette,
} from '@wordpress/components';
import { FontFamilyControl, getFontFamilyCss } from '../../assets-shared/fonts-family/font-family-control';

const DEVICES = ['desktop', 'tablet', 'mobile'];
const CONTENT_PARTS = ['mark', 'text', 'year'];

function normalizeDevice(value) {
  const device = String(value || '').toLowerCase();
  if (DEVICES.includes(device)) return device;
  if (device.includes('tablet') || device === 'medium') return 'tablet';
  if (device.includes('mobile') || device.includes('phone') || device === 'small') return 'mobile';
  return 'desktop';
}


function normalizeContentOrder(value) {
  const parts = String(value || '')
    .split('-')
    .filter((part) => CONTENT_PARTS.includes(part));

  return parts.length === CONTENT_PARTS.length && new Set(parts).size === CONTENT_PARTS.length
    ? parts
    : [...CONTENT_PARTS];
}

function moveContentPart(parts, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || toIndex >= parts.length) {
    return parts;
  }

  const next = [...parts];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
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
  return <div className="uplifters-site-builder-blocks-copyright-component-rearrange-device-badge">{label}</div>;
}

function Editor({ attributes, setAttributes }) {
  const device = useGlobalResponsiveDevice();

  const currentText = getResponsiveValue(attributes.text, device, '');
  const currentSecondText = getResponsiveValue(attributes.secondText, device, '');
  const currentPosition = getResponsiveValue(attributes.position, device, 'start');
  const currentContentOrder = getResponsiveValue(attributes.contentOrder, device, 'mark-text-year');
  const currentContentParts = normalizeContentOrder(currentContentOrder);
  const currentMarkFontSize = Number(getResponsiveValue(attributes.markFontSize, device, 20));
  const currentMarkColor = getResponsiveValue(attributes.markColor, device, '');
  const currentMarkBackgroundColor = getResponsiveValue(attributes.markBackgroundColor, device, '');
  const currentMarkOpacity = Number(getResponsiveValue(attributes.markOpacity, device, 1));
  const currentYearFontSize = Number(getResponsiveValue(attributes.yearFontSize, device, 16));
  const currentYearColor = getResponsiveValue(attributes.yearColor, device, '');
  const currentYearBackgroundColor = getResponsiveValue(attributes.yearBackgroundColor, device, '');
  const currentYearOpacity = Number(getResponsiveValue(attributes.yearOpacity, device, 1));
  const currentMainTextFontSize = Number(getResponsiveValue(attributes.mainTextFontSize, device, 16));
  const currentMainTextColor = getResponsiveValue(attributes.mainTextColor, device, '');
  const currentMainTextOpacity = Number(getResponsiveValue(attributes.mainTextOpacity, device, 1));
  const currentMainTextFontWeight = getResponsiveValue(attributes.mainTextFontWeight, device, '400');
  const currentMainTextItalic = !!getResponsiveValue(attributes.mainTextItalic, device, false);
  const currentMainTextLineHeight = getResponsiveValue(attributes.mainTextLineHeight, device, '');
  const currentMainTextFontFamily = getResponsiveValue(attributes.mainTextFontFamily, device, 'inherit');
  const currentSecondTextFontSize = Number(getResponsiveValue(attributes.secondTextFontSize, device, 14));
  const currentSecondTextColor = getResponsiveValue(attributes.secondTextColor, device, '');
  const currentSecondTextOpacity = Number(getResponsiveValue(attributes.secondTextOpacity, device, 1));
  const currentSecondTextFontWeight = getResponsiveValue(attributes.secondTextFontWeight, device, '400');
  const currentSecondTextItalic = !!getResponsiveValue(attributes.secondTextItalic, device, false);
  const currentSecondTextLineHeight = getResponsiveValue(attributes.secondTextLineHeight, device, '');
  const currentSecondTextFontFamily = getResponsiveValue(attributes.secondTextFontFamily, device, 'inherit');
  const currentShowMark = !!getResponsiveValue(attributes.showMark, device, true);
  const currentShowYear = !!getResponsiveValue(attributes.showYear, device, true);
  const currentShowText = !!getResponsiveValue(attributes.showText, device, true);
  const currentShowSecondLine = !!getResponsiveValue(attributes.showSecondLine, device, true);
  const savedYearMode = getResponsiveValue(attributes.yearMode, device, 'current');
  const currentYearMode = ['current', 'range', 'fixed'].includes(savedYearMode)
    ? savedYearMode
    : 'current';
  const currentStartingYear = getResponsiveValue(attributes.startingYear, device, '');
  const currentFixedYear = getResponsiveValue(attributes.fixedYear, device, '');
  const currentPadding = Number(getResponsiveValue(attributes.padding, device, 2));
  const currentMargin = Number(getResponsiveValue(attributes.margin, device, 2));
  const currentFontSize = Number(getResponsiveValue(attributes.fontSize, device, 16));
  const currentOpacity = Number(getResponsiveValue(attributes.opacity, device, 1));
  const currentIsBold = !!getResponsiveValue(attributes.isBold, device, false);
  const currentTextColor = getResponsiveValue(attributes.textColor, device, '');
  const currentBackgroundColor = getResponsiveValue(attributes.backgroundColor, device, '');

  const currentLineHeight = getResponsiveValue(attributes.lineHeight, device, '');
  const currentIsItalic = !!getResponsiveValue(attributes.isItalic, device, false);
  const currentFontWeight = getResponsiveValue(attributes.fontWeight, device, '400');

  const [openSettingsPanel, setOpenSettingsPanel] = useState(null);
  const [openStylesPanel, setOpenStylesPanel] = useState(null);
  const [draggedPart, setDraggedPart] = useState(null);
  const toggleSettingsPanel = (name) => () => setOpenSettingsPanel((current) => (current === name ? null : name));
  const toggleStylesPanel = (name) => () => setOpenStylesPanel((current) => (current === name ? null : name));

  const markMap = { copyright: '©', registered: '®', trademark: '™' };
  const selectedMark = markMap[attributes['copyrightMark']] || '©';
  const effectiveWeight = currentIsBold ? '700' : currentFontWeight;
  const currentCalendarYear = new Date().getFullYear();
  const normalizedStartYear = String(currentStartingYear || '').trim();
  const normalizedFixedYear = String(currentFixedYear || '').trim();
  const displayedYear = currentYearMode === 'range'
    ? (normalizedStartYear && normalizedStartYear !== String(currentCalendarYear)
      ? `${normalizedStartYear}–${currentCalendarYear}`
      : String(currentCalendarYear))
    : currentYearMode === 'fixed'
      ? (normalizedFixedYear || String(currentCalendarYear))
      : String(currentCalendarYear);
  const isYearVisible = currentShowYear;
  const visibleParts = currentContentParts.filter((part) => (
    part === 'mark' ? currentShowMark : part === 'text' ? currentShowText : isYearVisible
  ));

  const saveContentParts = (parts) => {
    setResponsiveValue(attributes, setAttributes, 'contentOrder', device, parts.join('-'));
  };

  const movePart = (part, direction) => {
    const fromIndex = currentContentParts.indexOf(part);
    const nextParts = moveContentPart(currentContentParts, fromIndex, fromIndex + direction);
    saveContentParts(nextParts);
  };

  const dropPart = (targetPart) => {
    if (!draggedPart || draggedPart === targetPart) return;
    const fromIndex = currentContentParts.indexOf(draggedPart);
    const toIndex = currentContentParts.indexOf(targetPart);
    saveContentParts(moveContentPart(currentContentParts, fromIndex, toIndex));
    setDraggedPart(null);
  };

  const blockProps = useBlockProps({
    className: `copyright-component-rearrange-block uplifters-site-builder-blocks-copyright-component-rearrange-device-${device}`,
    style: {
      padding: `${Number.isFinite(currentPadding) ? currentPadding : 2}px`,
      margin: `${Number.isFinite(currentMargin) ? currentMargin : 2}px`,
      fontSize: `${Number.isFinite(currentFontSize) ? currentFontSize : 16}px`,
      lineHeight: hasValue(currentLineHeight) ? Number(currentLineHeight) : 1.625,
      opacity: Number.isFinite(currentOpacity) ? currentOpacity : 1,
      fontWeight: effectiveWeight,
      fontStyle: currentIsItalic ? 'italic' : 'normal',
      color: currentTextColor || undefined,
      backgroundColor: currentBackgroundColor || undefined,
      textAlign: currentPosition,
    },
  });

  return (
    <>

      <InspectorControls group="settings">

        <PanelBody
          title={__('Content', 'uplifters-site-builder-blocks')}
          initialOpen={false}
          opened={openSettingsPanel === 'copyright-settings'}
          onToggle={toggleSettingsPanel('copyright-settings')}
        >
          <DeviceBadge device={device} />

          <TextControl
            label={__('Main Copyright Text', 'uplifters-site-builder-blocks')}
            value={currentText}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'text', device, value)}
          />

          <TextControl
            label={__('Second Line Text', 'uplifters-site-builder-blocks')}
            value={currentSecondText}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'secondText', device, value)}
            help={__('Leave empty to hide the second line on the frontend.', 'uplifters-site-builder-blocks')}
          />

          <SelectControl
            label={__('Intellectual Property Symbol', 'uplifters-site-builder-blocks')}
            value={attributes['copyrightMark']}
            options={[
              { label: __('Copyright Symbol (©)', 'uplifters-site-builder-blocks'), value: 'copyright' },
              { label: __('Registered Symbol (®)', 'uplifters-site-builder-blocks'), value: 'registered' },
              { label: __('Trademark Symbol (™)', 'uplifters-site-builder-blocks'), value: 'trademark' },
            ]}
            onChange={(value) => setAttributes({ 'copyrightMark': value })}
          />

        </PanelBody>

        <PanelBody
          title={__('Year', 'uplifters-site-builder-blocks')}
          initialOpen={false}
          opened={openSettingsPanel === 'year-settings'}
          onToggle={toggleSettingsPanel('year-settings')}
        >
          <DeviceBadge device={device} />
          <SelectControl
            label={__('Year Display', 'uplifters-site-builder-blocks')}
            value={currentYearMode}
            options={[
              { label: __('Current year', 'uplifters-site-builder-blocks'), value: 'current' },
              { label: __('Starting year – current year', 'uplifters-site-builder-blocks'), value: 'range' },
              { label: __('Fixed custom year', 'uplifters-site-builder-blocks'), value: 'fixed' },
            ]}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'yearMode', device, value)}
          />
          {currentYearMode === 'range' && (
            <TextControl
              label={__('Starting Year', 'uplifters-site-builder-blocks')}
              value={currentStartingYear}
              onChange={(value) => setResponsiveValue(attributes, setAttributes, 'startingYear', device, value.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="2022"
            />
          )}
          {currentYearMode === 'fixed' && (
            <TextControl
              label={__('Fixed Year', 'uplifters-site-builder-blocks')}
              value={currentFixedYear}
              onChange={(value) => setResponsiveValue(attributes, setAttributes, 'fixedYear', device, value)}
              placeholder="2026"
            />
          )}
        </PanelBody>

        <PanelBody
          title={__('Content Visibility', 'uplifters-site-builder-blocks')}
          initialOpen={false}
          opened={openSettingsPanel === 'visibility'}
          onToggle={toggleSettingsPanel('visibility')}
        >
          <DeviceBadge device={device} />
          <ToggleControl label={__('Show IP Symbol', 'uplifters-site-builder-blocks')} checked={currentShowMark} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'showMark', device, !!value)} />
          <ToggleControl label={__('Show Main Text', 'uplifters-site-builder-blocks')} checked={currentShowText} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'showText', device, !!value)} />
          <ToggleControl label={__('Show Year', 'uplifters-site-builder-blocks')} checked={currentShowYear} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'showYear', device, !!value)} />
          <ToggleControl label={__('Show Second Line', 'uplifters-site-builder-blocks')} checked={currentShowSecondLine} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'showSecondLine', device, !!value)} />
        </PanelBody>
      </InspectorControls>

      <InspectorControls group="styles">

        <PanelBody
          title={__('Block Style', 'uplifters-site-builder-blocks')}
          initialOpen={false}
          opened={openStylesPanel === 'block-style'}
          onToggle={toggleStylesPanel('block-style')}
        >
          <DeviceBadge device={device} />

          <SelectControl
            label={__('Position', 'uplifters-site-builder-blocks')}
            value={currentPosition}
            options={[
              { label: __('Start', 'uplifters-site-builder-blocks'), value: 'start' },
              { label: __('Center', 'uplifters-site-builder-blocks'), value: 'center' },
              { label: __('End', 'uplifters-site-builder-blocks'), value: 'end' },
            ]}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'position', device, value)}
          />

          <RangeControl
            label={__('Padding (px)', 'uplifters-site-builder-blocks')}
            value={currentPadding}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'padding', device, value ?? 2)}
            min={0}
            max={100}
          />

          <RangeControl
            label={__('Margin (px)', 'uplifters-site-builder-blocks')}
            value={currentMargin}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'margin', device, value ?? 2)}
            min={0}
            max={100}
          />

          <RangeControl
            label={__('Font Size (px)', 'uplifters-site-builder-blocks')}
            value={currentFontSize}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'fontSize', device, value ?? 16)}
            min={10}
            max={96}
          />

          <RangeControl
            label={__('Opacity', 'uplifters-site-builder-blocks')}
            value={currentOpacity}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'opacity', device, value ?? 1)}
            min={0}
            max={1}
            step={0.1}
          />

          <ToggleControl
            label={__('Bold', 'uplifters-site-builder-blocks')}
            checked={currentIsBold}
            onChange={(value) => setResponsiveValue(attributes, setAttributes, 'isBold', device, !!value)}
          />
        

                    <DeviceBadge device={device} />
                    <BaseControl label={__('Background Color', 'uplifters-site-builder-blocks')}>
                      <ColorPalette
                        value={currentBackgroundColor}
                        onChange={(value) => setResponsiveValue(attributes, setAttributes, 'backgroundColor', device, value || '')}
                        enableAlpha
                      />
                    </BaseControl>
                    <BaseControl label={__('Text Color', 'uplifters-site-builder-blocks')}>
                      <ColorPalette
                        value={currentTextColor}
                        onChange={(value) => setResponsiveValue(attributes, setAttributes, 'textColor', device, value || '')}
                        enableAlpha
                      />
                    </BaseControl>
                  

                    <DeviceBadge device={device} />
                    <ToggleControl
                      label={__('Italic', 'uplifters-site-builder-blocks')}
                      checked={currentIsItalic}
                      onChange={(value) => setResponsiveValue(attributes, setAttributes, 'isItalic', device, !!value)}
                    />
                    <SelectControl
                      label={__('Font Weight', 'uplifters-site-builder-blocks')}
                      value={currentFontWeight}
                      options={['100','200','300','400','500','600','700','800','900'].map((value) => ({ label: value, value }))}
                      onChange={(value) => setResponsiveValue(attributes, setAttributes, 'fontWeight', device, value)}
                      help={currentIsBold ? __('Bold is enabled, so weight 700 is currently applied.', 'uplifters-site-builder-blocks') : undefined}
                    />
                    <RangeControl
                      label={__('Line Height', 'uplifters-site-builder-blocks')}
                      value={hasValue(currentLineHeight) ? Number(currentLineHeight) : undefined}
                      onChange={(value) => setResponsiveValue(attributes, setAttributes, 'lineHeight', device, value === undefined ? '' : value)}
                      min={0.8}
                      max={3}
                      step={0.05}
                      allowReset
                    />
                  
        </PanelBody>

        <PanelBody title={__('Main Text Style', 'uplifters-site-builder-blocks')} initialOpen={false} opened={openStylesPanel === 'main-text-style'} onToggle={toggleStylesPanel('main-text-style')}>
          <DeviceBadge device={device} />
          <RangeControl label={__('Font Size (px)', 'uplifters-site-builder-blocks')} value={currentMainTextFontSize} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'mainTextFontSize', device, value ?? 16)} min={8} max={120} />
          <SelectControl label={__('Font Weight', 'uplifters-site-builder-blocks')} value={currentMainTextFontWeight} options={['100','200','300','400','500','600','700','800','900'].map((value) => ({label:value,value}))} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'mainTextFontWeight', device, value)} />
          <FontFamilyControl label={__('Font Family', 'uplifters-site-builder-blocks')} value={currentMainTextFontFamily} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'mainTextFontFamily', device, value)} />
          <ToggleControl label={__('Italic', 'uplifters-site-builder-blocks')} checked={currentMainTextItalic} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'mainTextItalic', device, !!value)} />
          <RangeControl label={__('Line Height', 'uplifters-site-builder-blocks')} value={hasValue(currentMainTextLineHeight) ? Number(currentMainTextLineHeight) : undefined} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'mainTextLineHeight', device, value === undefined ? '' : value)} min={0.8} max={3} step={0.05} allowReset />
          <RangeControl label={__('Opacity', 'uplifters-site-builder-blocks')} value={currentMainTextOpacity} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'mainTextOpacity', device, value ?? 1)} min={0} max={1} step={0.1} />
          <BaseControl label={__('Text Color', 'uplifters-site-builder-blocks')}><ColorPalette value={currentMainTextColor} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'mainTextColor', device, value || '')} enableAlpha /></BaseControl>
        </PanelBody>

        <PanelBody title={__('Second Line Text Style', 'uplifters-site-builder-blocks')} initialOpen={false} opened={openStylesPanel === 'second-line-style'} onToggle={toggleStylesPanel('second-line-style')}>
          <DeviceBadge device={device} />
          <RangeControl label={__('Font Size (px)', 'uplifters-site-builder-blocks')} value={currentSecondTextFontSize} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'secondTextFontSize', device, value ?? 14)} min={8} max={120} />
          <SelectControl label={__('Font Weight', 'uplifters-site-builder-blocks')} value={currentSecondTextFontWeight} options={['100','200','300','400','500','600','700','800','900'].map((value) => ({label:value,value}))} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'secondTextFontWeight', device, value)} />
          <FontFamilyControl label={__('Font Family', 'uplifters-site-builder-blocks')} value={currentSecondTextFontFamily} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'secondTextFontFamily', device, value)} />
          <ToggleControl label={__('Italic', 'uplifters-site-builder-blocks')} checked={currentSecondTextItalic} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'secondTextItalic', device, !!value)} />
          <RangeControl label={__('Line Height', 'uplifters-site-builder-blocks')} value={hasValue(currentSecondTextLineHeight) ? Number(currentSecondTextLineHeight) : undefined} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'secondTextLineHeight', device, value === undefined ? '' : value)} min={0.8} max={3} step={0.05} allowReset />
          <RangeControl label={__('Opacity', 'uplifters-site-builder-blocks')} value={currentSecondTextOpacity} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'secondTextOpacity', device, value ?? 1)} min={0} max={1} step={0.1} />
          <BaseControl label={__('Text Color', 'uplifters-site-builder-blocks')}><ColorPalette value={currentSecondTextColor} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'secondTextColor', device, value || '')} enableAlpha /></BaseControl>
        </PanelBody>

        <PanelBody title={__('IP Symbol Style', 'uplifters-site-builder-blocks')} initialOpen={false} opened={openStylesPanel === 'mark-style'} onToggle={toggleStylesPanel('mark-style')}>
          <DeviceBadge device={device} />
          <RangeControl label={__('IP Symbol Size (px)', 'uplifters-site-builder-blocks')} value={currentMarkFontSize} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'markFontSize', device, value ?? 20)} min={8} max={120} />
          <RangeControl label={__('IP Symbol Opacity', 'uplifters-site-builder-blocks')} value={currentMarkOpacity} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'markOpacity', device, value ?? 1)} min={0} max={1} step={0.1} />
          <BaseControl label={__('IP Symbol Color', 'uplifters-site-builder-blocks')}><ColorPalette value={currentMarkColor} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'markColor', device, value || '')} enableAlpha /></BaseControl>
          <BaseControl label={__('IP Symbol Background Color', 'uplifters-site-builder-blocks')}><ColorPalette value={currentMarkBackgroundColor} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'markBackgroundColor', device, value || '')} enableAlpha /></BaseControl>
        </PanelBody>

        <PanelBody title={__('Year Style', 'uplifters-site-builder-blocks')} initialOpen={false} opened={openStylesPanel === 'year-style'} onToggle={toggleStylesPanel('year-style')}>
          <DeviceBadge device={device} />
          <RangeControl label={__('Year Size (px)', 'uplifters-site-builder-blocks')} value={currentYearFontSize} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'yearFontSize', device, value ?? 16)} min={8} max={120} />
          <RangeControl label={__('Year Opacity', 'uplifters-site-builder-blocks')} value={currentYearOpacity} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'yearOpacity', device, value ?? 1)} min={0} max={1} step={0.1} />
          <BaseControl label={__('Year Color', 'uplifters-site-builder-blocks')}><ColorPalette value={currentYearColor} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'yearColor', device, value || '')} enableAlpha /></BaseControl>
          <BaseControl label={__('Year Background Color', 'uplifters-site-builder-blocks')}><ColorPalette value={currentYearBackgroundColor} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'yearBackgroundColor', device, value || '')} enableAlpha /></BaseControl>
        </PanelBody>
      </InspectorControls>

      <div {...blockProps}>
        <div className="uplifters-site-builder-blocks-copyright-component-rearrange-order-editor" contentEditable={false}>
          <span className="uplifters-site-builder-blocks-copyright-component-rearrange-order-editor__label">
            {__('Drag to reorder content', 'uplifters-site-builder-blocks')}
          </span>
          <div className="uplifters-site-builder-blocks-copyright-component-rearrange-order-editor__items">
            {currentContentParts.map((part, index) => {
              const labels = {
                mark: __('IP', 'uplifters-site-builder-blocks'),
                text: __('Text', 'uplifters-site-builder-blocks'),
                year: __('Year', 'uplifters-site-builder-blocks'),
              };

              return (
                <div
                  key={part}
                  className={`uplifters-site-builder-blocks-copyright-component-rearrange-order-item${draggedPart === part ? ' is-dragging' : ''}${(part === 'mark' ? !currentShowMark : part === 'text' ? !currentShowText : !isYearVisible) ? ' is-hidden' : ''}`}
                  draggable
                  onDragStart={() => setDraggedPart(part)}
                  onDragEnd={() => setDraggedPart(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => dropPart(part)}
                >
                  <Button
                    size="small"
                    variant="tertiary"
                    disabled={index === 0}
                    onClick={() => movePart(part, -1)}
                    aria-label={sprintf(__('Move %s left', 'uplifters-site-builder-blocks'), labels[part])}
                  >
                    ←
                  </Button>
                  <span className="uplifters-site-builder-blocks-copyright-component-rearrange-order-item__name">⋮⋮ {labels[part]}</span>
                  <Button
                    size="small"
                    variant="tertiary"
                    disabled={index === currentContentParts.length - 1}
                    onClick={() => movePart(part, 1)}
                    aria-label={sprintf(__('Move %s right', 'uplifters-site-builder-blocks'), labels[part])}
                  >
                    →
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="copyright-component-rearrange-primary-line copyright-component-rearrange-layout-inline">
          {visibleParts.length > 0 ? visibleParts.map((part, index) => {
            if (part === 'mark') {
              return (
                <span key={`mark-${index}`} className="copyright-component-rearrange-part copyright-component-rearrange-part-mark" style={{fontSize:`${currentMarkFontSize}px`,color:currentMarkColor || undefined,backgroundColor:currentMarkBackgroundColor || undefined,opacity:currentMarkOpacity}}>
                  <span className={`copyright-component-rearrange-mark copyright-component-rearrange-mark-${attributes['copyrightMark'] || 'copyright'}`}>
                    {selectedMark}
                  </span>
                </span>
              );
            }

            if (part === 'text') {
              return (
                <span key={`text-${index}`} className="copyright-component-rearrange-part copyright-component-rearrange-part-text" style={{fontSize:`${currentMainTextFontSize}px`,color:currentMainTextColor || undefined,opacity:currentMainTextOpacity,fontWeight:currentMainTextFontWeight,fontStyle:currentMainTextItalic ? 'italic' : 'normal',lineHeight:hasValue(currentMainTextLineHeight) ? Number(currentMainTextLineHeight) : undefined,fontFamily:getFontFamilyCss(currentMainTextFontFamily)}}>
                  <RichText
                    tagName="span"
                    className="copyright-component-rearrange-text"
                    value={currentText}
                    onChange={(value) => setResponsiveValue(attributes, setAttributes, 'text', device, value)}
                    placeholder={__('Enter copyright text…', 'uplifters-site-builder-blocks')}
                    allowedFormats={[
                      'core/bold',
                      'core/italic',
                      'core/link',
                      'uplifters-site-builder-blocks/underline',
                      'core/strikethrough',
                      'core/text-color',
                      'core/subscript',
                      'core/superscript',
                      'core/code',
                      'core/keyboard',
                    ]}
                  />
                </span>
              );
            }

            return (
              <span key={`year-${index}`} style={{fontSize:`${currentYearFontSize}px`,color:currentYearColor || undefined,backgroundColor:currentYearBackgroundColor || undefined,opacity:currentYearOpacity}} className="copyright-component-rearrange-part copyright-component-rearrange-part-year copyright-component-rearrange-year">
                {displayedYear}
              </span>
            );
          }) : (
            <span className="uplifters-site-builder-blocks-copyright-component-rearrange-hidden-note">{__('All first-line items are hidden for this device.', 'uplifters-site-builder-blocks')}</span>
          )}
        </div>

        {currentShowSecondLine && (
          <div>
            <RichText
              tagName="div"
              className="copyright-component-rearrange-second-line"
              style={{fontSize:`${currentSecondTextFontSize}px`,color:currentSecondTextColor || undefined,opacity:currentSecondTextOpacity,fontWeight:currentSecondTextFontWeight,fontStyle:currentSecondTextItalic ? 'italic' : 'normal',lineHeight:hasValue(currentSecondTextLineHeight) ? Number(currentSecondTextLineHeight) : undefined,fontFamily:getFontFamilyCss(currentSecondTextFontFamily)}}
              value={currentSecondText}
              onChange={(value) => setResponsiveValue(attributes, setAttributes, 'secondText', device, value)}
              placeholder={__('Add optional second line…', 'uplifters-site-builder-blocks')}
              allowedFormats={[
                'core/bold',
                'core/italic',
                'core/link',
                'uplifters-site-builder-blocks/underline',
                'core/strikethrough',
                'core/text-color',
                'core/subscript',
                'core/superscript',
                'core/code',
                'core/keyboard',
              ]}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="copyright-component-rearrange" /> : <Editor {...props} />;
}
