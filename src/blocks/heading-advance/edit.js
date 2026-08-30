import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import './editor.scss';
import {
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
  RichText,
  URLInput,
  useBlockProps
} from '@wordpress/block-editor';
import {
	Button,
	ButtonGroup,
	PanelBody,
	RangeControl,
	SelectControl,
	BoxControl,
	ColorPalette,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { FontFamilyControl, getFontFamilyCss } from '../../assets-shared/fonts-family/font-family-control';
import {
  applyFormat,
  create,
  getActiveFormat,
  insertObject,
  registerFormatType,
  removeFormat,
  toHTMLString,
  toggleFormat
} from '@wordpress/rich-text';

const DEVICES = ['desktop', 'tablet', 'mobile'];
const TYPE_OPTIONS = [
  { label: 'Title', value: 'h1' },
  { label: 'Heading', value: 'h2' },
  { label: 'Subheading', value: 'h3' },
  { label: 'Paragraph', value: 'p' }
];
const WEIGHT_OPTIONS = [
  { label: 'Smart default', value: '' },
  ...[100, 200, 300, 400, 500, 600, 700, 800, 900].map((weight) => ({ label: String(weight), value: String(weight) }))
];
const INLINE_COLOR = 'uplifters-site-builder-blocks/inline-text-color';
const INLINE_HIGHLIGHT = 'uplifters-site-builder-blocks/inline-highlight-color';
const INLINE_FOOTNOTE = 'uplifters-site-builder-blocks/inline-footnote';
const INLINE_FONT_FAMILY = 'uplifters-site-builder-blocks/inline-font-family';

[
  [INLINE_COLOR, { title: 'Inline font color', tagName: 'span', className: 'uplifters-site-builder-blocks-inline-text-color', attributes: { style: 'style' } }],
  [INLINE_HIGHLIGHT, { title: 'Inline highlight color', tagName: 'mark', className: 'uplifters-site-builder-blocks-inline-highlight-color', attributes: { style: 'style' } }],
  [INLINE_FOOTNOTE, { title: 'Footnote', tagName: 'sup', className: 'uplifters-site-builder-blocks-inline-footnote' }],
  [INLINE_FONT_FAMILY, { title: 'Inline font family', tagName: 'span', className: 'uplifters-site-builder-blocks-inline-font-family', attributes: { style: 'style' } }]
].forEach(([name, settings]) => {
  try { registerFormatType(name, settings); } catch (error) { /* Already registered during hot reload. */ }
});

const hasValue = (value) => value !== undefined && value !== null && value !== '';
const normalizeDevice = (device) => DEVICES.includes(device) ? device : 'desktop';
const deviceLabel = (device) => device.charAt(0).toUpperCase() + device.slice(1);

function globalDevice() {
  if (window.UpliftersSiteBuilderBlocksResponsive?.getDevice) return normalizeDevice(window.UpliftersSiteBuilderBlocksResponsive.getDevice());
  if (typeof window.upliftersSiteBuilderBlocksResponsiveDevice === 'string') return normalizeDevice(window.upliftersSiteBuilderBlocksResponsiveDevice);
  return normalizeDevice(document.body?.dataset?.upliftersSiteBuilderBlocksResponsiveDevice);
}

function useGlobalDevice() {
  const [device, setDevice] = useState(globalDevice);
  useEffect(() => {
    const update = (event) => setDevice(normalizeDevice(event?.detail?.device || globalDevice()));
    window.addEventListener('uplifters-site-builder-blocks-responsive-device-change', update);
    window.addEventListener('uplifters-site-builder-blocks-global-responsive-device-change', update);
    const timer = window.setInterval(() => setDevice((current) => globalDevice() === current ? current : globalDevice()), 400);
    return () => {
      window.removeEventListener('uplifters-site-builder-blocks-responsive-device-change', update);
      window.removeEventListener('uplifters-site-builder-blocks-global-responsive-device-change', update);
      window.clearInterval(timer);
    };
  }, []);
  return device;
}

function responsiveValue(attributes, key, device, fallback = '') {
  const values = attributes[key];
  if (!values || typeof values !== 'object' || Array.isArray(values)) return hasValue(values) ? values : fallback;
  for (const candidate of [device, 'desktop', 'tablet', 'mobile']) if (hasValue(values[candidate])) return values[candidate];
  return fallback;
}

function responsiveObject(attributes, key, device) {
  const values = attributes[key];
  if (!values || typeof values !== 'object' || Array.isArray(values)) return {};
  for (const candidate of [device, 'desktop', 'tablet', 'mobile']) {
    if (values[candidate] && typeof values[candidate] === 'object' && !Array.isArray(values[candidate])) return values[candidate];
  }
  return {};
}

function smartDefaults(type, device) {
  const defaults = {
    h1: [[64, 1.04, '800'], [48, 1.08, '800'], [36, 1.12, '800']],
    h2: [[48, 1.1, '700'], [38, 1.14, '700'], [30, 1.18, '700']],
    h3: [[32, 1.18, '700'], [28, 1.22, '700'], [24, 1.28, '700']],
    p: [[18, 1.75, '400'], [17, 1.72, '400'], [16, 1.68, '400']]
  };
  const [fontSize, lineHeight, fontWeight] = (defaults[type] || defaults.h1)[DEVICES.indexOf(device)];
  return { fontSize, lineHeight, fontWeight };
}

function normalizeBoxSide(value) {
  if (!hasValue(value)) return undefined;

  if (typeof value === 'object' && !Array.isArray(value)) {
    const amount = value.value ?? value.amount;
    const unit = value.unit || 'px';
    if (!hasValue(amount)) return undefined;
    return Number(amount) === 0 ? '0' : `${amount}${unit}`;
  }

  if (typeof value === 'number') return value === 0 ? '0' : `${value}px`;

  const stringValue = String(value).trim();
  if (!stringValue) return undefined;
  if (/^-?(?:\d+|\d*\.\d+)$/.test(stringValue)) {
    return Number(stringValue) === 0 ? '0' : `${stringValue}px`;
  }
  return stringValue;
}

function normalizeBoxValues(values) {
  return ['top', 'right', 'bottom', 'left'].reduce((next, side) => {
    const value = normalizeBoxSide(values?.[side]);
    if (value !== undefined) next[side] = value;
    return next;
  }, {});
}


function boxStyles(prefix, values) {
  return ['top', 'right', 'bottom', 'left'].reduce((styles, side) => {
    const value = normalizeBoxSide(values?.[side]);
    if (value !== undefined) {
      styles[`${prefix}${side.charAt(0).toUpperCase()}${side.slice(1)}`] = value;
    }
    return styles;
  }, {});
}

function Editor({ attributes, setAttributes, clientId }) {
  const device = useGlobalDevice();
  const label = deviceLabel(device);
  const selected = useSelect((select) => !!select('core/block-editor')?.isBlockSelected?.(clientId), [clientId]);
  const selection = useRef({ start: 0, end: 0 });
  const savedTextSelection = useRef({ start: 0, end: 0 });
  const editorElementRef = useRef(null);
  const editorRootRef = useRef(null);
  // True for the whole duration of a pointer drag inside a ColorPalette.
  const colorDragRef = useRef(false);
  // The RichTextValue captured when the colour session started. The colour is
  // applied to this snapshot rather than to the re-rendered `content`, so
  // repeated picks inside one session can't compound or drift.
  const colorBaseRef = useRef(null);
  // Last colour the picker reported. It is held here — not written to the
  // block — for as long as the colour UI is in use, then committed once when
  // the session ends. Writing `content` mid-session is what used to kill the
  // picker: setAttributes makes RichText re-apply its record, RichText pulls
  // focus back into the canvas, the Popover sees focus leave and unmounts, and
  // the pointer being dragged loses the element underneath it.
  const colorLastRef = useRef(null);
  const { selectionChange, __unstableMarkNextChangeAsNotPersistent } = useDispatch('core/block-editor');
  const [, refreshSelection] = useState(0);
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedTextFormat, setSelectedTextFormat] = useState('');
  const [selectedTextFontFamily, setSelectedTextFontFamily] = useState('inherit');
  const [openSettingsPanel, setOpenSettingsPanel] = useState(null);
  const [openStylesPanel, setOpenStylesPanel] = useState(null);
  const toggleSettingsPanel = (key) => setOpenSettingsPanel((current) => (current === key ? null : key));
  const toggleStylesPanel = (key) => setOpenStylesPanel((current) => (current === key ? null : key));

  useEffect(() => {
    if (!selected) return undefined;
    const className = 'uplifters-site-builder-blocks-heading-advance-is-selected';
    const documents = [document];
    try { if (window.parent !== window) documents.push(window.parent.document); } catch (error) { /* Cross-origin editor. */ }
    documents.forEach((doc) => {
      doc.body?.classList.add(className);
    });
    return () => documents.forEach((doc) => doc.body?.classList.remove(className));
  }, [selected]);

  useEffect(() => {
    selection.current = { start: 0, end: 0 };
    savedTextSelection.current = { start: 0, end: 0 };
    refreshSelection((value) => value + 1);
  }, [device]);

  const value = (key, fallback = '') => responsiveValue(attributes, key, device, fallback);
  const content = value('content');
  const textType = value('textType', 'h1');
  const fontFamily = value('fontFamily', 'inherit');
  const fontSize = value('fontSize');
  const lineHeight = value('lineHeight');
  const fontWeight = value('fontWeight');
  const textColor = value('textColor');
  const backgroundColor = value('backgroundColor');
  const textAlign = value('textAlign', 'left');
  const textTransform = value('textTransform', 'none');
  const letterSpacing = value('letterSpacing');
  const wordSpacing = value('wordSpacing');
  const padding = responsiveObject(attributes, 'padding', device);
  const margin = responsiveObject(attributes, 'margin', device);
  const defaults = smartDefaults(textType, device);
  const update = (key, nextValue) => setAttributes({ [key]: { ...(attributes[key] || {}), [device]: nextValue } });
  const number = (input) => hasValue(input) && !Number.isNaN(Number(input)) ? Number(input) : undefined;
  const activeSelection = savedTextSelection.current.end > savedTextSelection.current.start
    ? savedTextSelection.current
    : selection.current;
  const hasSelection = activeSelection.end > activeSelection.start;


  const saveSelection = (startValue, endValue) => {
    const start = Math.max(0, Number(startValue) || 0);
    const end = Math.max(start, Number(endValue) || start);
    selection.current = { start, end };

    if (end > start) {
      savedTextSelection.current = { start, end };
    }

    refreshSelection((current) => current + 1);
  };

  const captureDomSelection = () => {
    // While the colour UI is in use focus sits in the sidebar popover, so the
    // browser selection inside the block is collapsed or gone. Reading it here
    // would overwrite the saved offsets with an empty range and the colour
    // would stop applying part-way through.
    if (colorDragRef.current || colorBaseRef.current) return;

    const root = editorRootRef.current?.querySelector?.('[contenteditable="true"]');
    const domSelection = root?.ownerDocument?.getSelection?.();

    if (!root || !domSelection || domSelection.rangeCount === 0) return;

    const range = domSelection.getRangeAt(0);
    if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return;

    // Let RichText's own create() convert the DOM range to text offsets —
    // the same conversion it uses internally to report onSelectionChange —
    // instead of a hand-rolled TreeWalker count, so offsets always match
    // what RichText itself considers the selection to be.
    const domValue = create({ element: root, range, __unstableIsEditableTree: true });
    saveSelection(domValue.start, domValue.end);
  };


  useEffect(() => {
    const documents = [document];
    try { if (window.parent !== window) documents.push(window.parent.document); } catch (error) { /* Cross-origin editor. */ }

    const handleSelectionChange = () => captureDomSelection();
    documents.forEach((doc) => doc.addEventListener('selectionchange', handleSelectionChange));

    return () => documents.forEach((doc) => doc.removeEventListener('selectionchange', handleSelectionChange));
  });

  // The sidebar lives in the top document while the canvas is in the editor
  // iframe, so the release event has to be watched in both. No dependency
  // array, matching the effect above, keeps the handler from closing over a
  // stale `device`/`attributes` pair when it writes the final colour.
  useEffect(() => {
    const documents = [document];
    try { if (window.parent !== window) documents.push(window.parent.document); } catch (error) { /* Cross-origin editor. */ }

    // Capture phase, so this runs before react-colorful's own handler focuses
    // the slider and before the Popover's outside-interaction logic can react
    // to a drag that has travelled past the popover's right edge.
    const handlePointerDown = (event) => {
      if (isColorPickerTarget(event.target)) beginColorDrag();
      // A press anywhere else — another sidebar control, the toolbar, the
      // document outline — ends the colour session and banks the colour.
      else flushColor();
    };

    const handlePointerRelease = () => endColorDrag();

    // Covers the paths a pointerup can't see: closing the popover with Escape,
    // tabbing away from the hex field, or clicking back into the canvas iframe.
    // Deferred a tick because focusout fires before the new element is focused.
    const handleFocusOut = () => {
      if (!colorBaseRef.current) return;
      window.setTimeout(() => {
        if (colorDragRef.current || isColorUiEngaged()) return;
        flushColor();
      }, 0);
    };

    documents.forEach((doc) => {
      doc.addEventListener('pointerdown', handlePointerDown, true);
      doc.addEventListener('pointerup', handlePointerRelease);
      doc.addEventListener('pointercancel', handlePointerRelease);
      doc.addEventListener('focusout', handleFocusOut);
    });

    return () => documents.forEach((doc) => {
      doc.removeEventListener('pointerdown', handlePointerDown, true);
      doc.removeEventListener('pointerup', handlePointerRelease);
      doc.removeEventListener('pointercancel', handlePointerRelease);
      doc.removeEventListener('focusout', handleFocusOut);
    });
  });

  // Build the RichTextValue to apply/remove formats on. Prefers the live DOM
  // selection, parsed the exact same way RichText parses it internally
  // (create() with element+range+__unstableIsEditableTree), so offsets
  // always match what's actually highlighted on screen. Falls back to the
  // last saved selection applied to the stored `content` string when the
  // browser selection inside the block is no longer live — e.g. once focus
  // has moved to a sidebar control.
  const getCurrentValue = () => {
    const root = editorRootRef.current?.querySelector?.('[contenteditable="true"]');
    const domSelection = root?.ownerDocument?.getSelection?.();

    if (!colorDragRef.current && root && domSelection && domSelection.rangeCount > 0) {
      const range = domSelection.getRangeAt(0);
      if (root.contains(range.startContainer) && root.contains(range.endContainer)) {
        const domValue = create({ element: root, range, __unstableIsEditableTree: true });
        if (domValue.end > domValue.start) {
          // Update the refs directly — no refreshSelection()/state bump here.
          // Forcing a re-render mid-interaction (e.g. right as a ColorPalette
          // popover is open) can tear the popover down before its onChange
          // even has a chance to commit the picked color.
          selection.current = { start: domValue.start, end: domValue.end };
          savedTextSelection.current = { start: domValue.start, end: domValue.end };
          return domValue;
        }
      }
    }

    const next = create({ html: content || '' });
    next.start = activeSelection.start; next.end = activeSelection.end;
    return next;
  };
  // `refocus` pulls focus back into the block after the change. That is right
  // for one-shot actions, but fatal mid-drag: grabbing focus while the pointer
  // is still down on a picker handle breaks the popover's pointer capture and
  // collapses the selection. `persist: false` keeps a drag from filling the
  // undo stack with one entry per frame.
  const commit = (next, { refocus = true, persist = true } = {}) => {
    if (!persist) __unstableMarkNextChangeAsNotPersistent?.();
    update('content', toHTMLString({ value: next }));
    if (refocus) window.requestAnimationFrame(() => editorElementRef.current?.focus?.());
  };

  // Put the caret back on the range the user highlighted. focus() alone only
  // restores a collapsed caret, so ask the store to reselect the offsets — this
  // relies on the RichText below declaring identifier="content".
  const restoreSelection = () => {
    const { start, end } = savedTextSelection.current;
    window.requestAnimationFrame(() => {
      editorElementRef.current?.focus?.();
      if (end > start) selectionChange?.(clientId, 'content', start, end);
    });
  };

  const toggleInline = (type) => hasSelection && commit(toggleFormat(getCurrentValue(), { type }));
  const removeInline = (type) => hasSelection && commit(removeFormat(getCurrentValue(), type));

  const colorValue = (base, type, property, color) => color
    ? applyFormat(base, { type, attributes: { style: `${property}:${color}` } })
    : removeFormat(base, type);

  const applyColor = (type, property, color) => {
    const target = getCurrentValue();
    if (target.end <= target.start) return;
    commit(colorValue(target, type, property, color));
  };

  // Fires on every pointer move inside the picker, on every keystroke in its
  // hex field, and on a swatch click. While the colour UI is engaged the value
  // is only parked on the refs — nothing is written to the block, so no
  // re-render can tear the popover down and the saturation square, hue bar and
  // opacity bar stay draggable for as long as the user wants.
  const applyColorLive = (type, property, color) => {
    if (!colorDragRef.current && !isColorUiEngaged()) {
      applyColor(type, property, color);
      return;
    }

    // If the pointerdown happened when no range was resolvable, try once more
    // here from the saved offsets rather than dropping through to applyColor —
    // that path refocuses the block and would break the interaction.
    if (!colorBaseRef.current) {
      const retry = getCurrentValue();
      if (retry.end > retry.start) colorBaseRef.current = retry;
    }

    const base = colorBaseRef.current;
    if (!base || base.end <= base.start) return;

    colorLastRef.current = { type, property, color };
  };

  // Anything that counts as "inside the colour UI". The picker renders through
  // a Popover portal, so a wrapper div in our own tree is not a reliable place
  // to catch this — the check is done against the real DOM ancestry instead.
  const isColorPickerTarget = (target) => !!target?.closest?.(
    '.components-color-picker, .components-circular-option-picker, .components-color-palette, .block-editor-panel-color-gradient-settings'
  );

  // Narrower: the custom-colour popover itself (saturation square, hue bar,
  // opacity bar, hex field) as opposed to the plain preset swatches.
  const isColorPickerPopover = (target) => !!target?.closest?.('.components-color-picker');

  const activeElements = () => {
    const documents = [document];
    try { if (window.parent !== window) documents.push(window.parent.document); } catch (error) { /* Cross-origin editor. */ }
    return documents.map((doc) => doc.activeElement).filter(Boolean);
  };

  const isColorUiEngaged = () => activeElements().some(isColorPickerTarget);
  const isColorPickerOpen = () => activeElements().some(isColorPickerPopover);

  // End of a colour session: write the last picked colour once, as a single
  // persistent undo step, then put the caret back on the range it applied to.
  const flushColor = () => {
    const last = colorLastRef.current;
    const base = colorBaseRef.current;
    colorBaseRef.current = null;
    colorLastRef.current = null;

    if (!base || !last) return;

    commit(colorValue(base, last.type, last.property, last.color), { refocus: false });
    restoreSelection();
  };

  const beginColorDrag = () => {
    // Capture once per session: getCurrentValue() prefers the live DOM
    // selection, and falls back to the saved offsets once focus has moved into
    // the sidebar. Keeping an existing snapshot means dragging the hue bar and
    // then the opacity bar both target the same range.
    if (!colorBaseRef.current) {
      const target = getCurrentValue();
      colorBaseRef.current = target.end > target.start ? target : null;
    }
    colorDragRef.current = true;
  };

  const endColorDrag = () => {
    if (!colorDragRef.current) return;
    colorDragRef.current = false;

    // react-colorful keeps focus on the handle it was dragging, so an open
    // picker means the user is probably still adjusting — hold the value back
    // and let the focus/pointer handlers commit it once they move on. A preset
    // swatch has no picker behind it, so that applies straight away.
    if (isColorPickerOpen()) return;

    flushColor();
  };

  const clearFormats = () => {
    const current = getCurrentValue();
    if (current.end <= current.start) return;
    const formats = ['core/bold', 'core/italic', 'core/underline', 'core/link', 'core/code', 'core/strikethrough', 'core/subscript', 'core/superscript', INLINE_FOOTNOTE, INLINE_COLOR, INLINE_HIGHLIGHT, INLINE_FONT_FAMILY];
    commit(formats.reduce((next, type) => removeFormat(next, type, current.start, current.end), current));
    setSelectedTextFontFamily('inherit');
  };
  const resetStyles = () => {
    ['fontSize', 'lineHeight', 'fontWeight', 'textColor', 'backgroundColor', 'letterSpacing', 'wordSpacing'].forEach((key) => update(key, ''));
    update('textAlign', 'left'); update('textTransform', 'none'); update('padding', {}); update('margin', {});
  };

  const style = {
    fontFamily: getFontFamilyCss(fontFamily),
    fontSize: `${number(fontSize) ?? defaults.fontSize}px`, lineHeight: number(lineHeight) ?? defaults.lineHeight,
    fontWeight: fontWeight || defaults.fontWeight,
    color: textColor || undefined, backgroundColor: backgroundColor || undefined,
    textAlign, textTransform,
    letterSpacing: number(letterSpacing) === undefined ? undefined : `${number(letterSpacing)}px`,
    wordSpacing: number(wordSpacing) === undefined ? undefined : `${number(wordSpacing)}px`,
    ...boxStyles('padding', padding), ...boxStyles('margin', margin)
  };
  const units = [{ value: 'px', label: 'px', default: 0 }, { value: '%', label: '%', default: 0 }, { value: 'em', label: 'em', default: 0 }, { value: 'rem', label: 'rem', default: 0 }];
  const FORMAT_MAP = {
    bold: 'core/bold',
    italic: 'core/italic',
    underline: 'core/underline',
    strikethrough: 'core/strikethrough',
    code: 'core/code',
    subscript: 'core/subscript',
    superscript: 'core/superscript'
  };
  // core/underline has no semantic tag of its own (it renders as a bare
  // <span>), so unlike the other formats it only becomes visible once this
  // style attribute is attached — WordPress's own underline toolbar button
  // applies this same attribute when toggling it.
  const FORMAT_TYPE_ATTRIBUTES = {
    'core/underline': { style: 'text-decoration: underline;' }
  };

  const selectedTextFormatOptions = [
    { label: hasSelection ? 'Choose formatting…' : 'Select text in the block first', value: '' },
    { label: 'Bold', value: 'bold' },
    { label: 'Italic', value: 'italic' },
    { label: 'Underline', value: 'underline' },
    { label: 'Strikethrough', value: 'strikethrough' },
    { label: 'Inline code', value: 'code' },
    { label: 'Subscript', value: 'subscript' },
    { label: 'Superscript', value: 'superscript' }
  ];

  const applySelectedTextFormat = (key) => {
    const type = FORMAT_MAP[key];
    const current = getCurrentValue();

    if (!type || current.end <= current.start) {
      setSelectedTextFormat('');
      return;
    }

    const isActive = (() => {
      try { return !!getActiveFormat(current, type); } catch (error) { return false; }
    })();

    const next = isActive
      ? removeFormat(current, type)
      : applyFormat(current, FORMAT_TYPE_ATTRIBUTES[type] ? { type, attributes: FORMAT_TYPE_ATTRIBUTES[type] } : { type });

    update('content', toHTMLString({ value: next }));

    setSelectedTextFormat('');
    window.requestAnimationFrame(() => {
      const editable = editorRootRef.current?.querySelector?.('[contenteditable="true"]');
      editable?.focus?.();
    });
  };

  // The registered stacks quote multi-word family names ('"Gravitas One", serif').
  // Inside an inline style attribute RichText escapes those quotes to &quot;, and
  // the semicolons in that entity make wp_kses_post()'s safecss_filter_attr()
  // split the declaration into fragments and drop all of them — the style
  // survives the editor canvas but arrives empty on the frontend. Unquoted
  // identifiers are valid CSS for these names, so drop the quotes instead.
  const inlineFontStack = (stack) => (stack || '').replace(/["']/g, '').trim();

  // Same idea as the Styles tab font picker, but written as an inline format so
  // the stack lands on a <span> wrapping just the highlighted range instead of
  // on the block element. Picking "inherit" (or clearing) drops the format so
  // the text falls back to the block-level font family.
  const applySelectedTextFontFamily = (next) => {
    setSelectedTextFontFamily(next || 'inherit');

    const current = getCurrentValue();
    if (current.end <= current.start) return;

    const stack = !next || next === 'inherit' ? '' : inlineFontStack(getFontFamilyCss(next));

    commit(stack
      ? applyFormat(current, { type: INLINE_FONT_FAMILY, attributes: { style: `font-family:${stack}` } })
      : removeFormat(current, INLINE_FONT_FAMILY));
  };

  const blockProps = useBlockProps({
    className: `uplifters-site-builder-blocks-heading-advance-editor uplifters-site-builder-blocks-heading-advance-editor--${device}`,
    style,
    onMouseUp: captureDomSelection,
    onKeyUp: captureDomSelection
  });

  return <>
    <InspectorControls group="settings">
      <PanelBody
        title={`Content — ${label}`}
        initialOpen={false}
        opened={openSettingsPanel === 'content'}
        onToggle={() => toggleSettingsPanel('content')}
      >
        <SelectControl label="Text role" value={textType} options={TYPE_OPTIONS} onChange={(next) => update('textType', next)} />
      </PanelBody>
      <PanelBody
        title={`Format Selected Text`}
        initialOpen={false}
        opened={openSettingsPanel === 'formatting'}
        onToggle={() => toggleSettingsPanel('formatting')}
      >
        <SelectControl
          label="Selected Text Format"
          help={hasSelection ? 'Applies to the last text you selected. Choosing an active format removes it.' : 'Highlight some text inside the block, then pick a format.'}
          value={selectedTextFormat}
          options={selectedTextFormatOptions}
          __nextHasNoMarginBottom
          onChange={(key) => {
            setSelectedTextFormat(key);
            applySelectedTextFormat(key);
          }}
        />
        <p>Selected Text Link</p>
        <URLInput value={linkUrl} onChange={setLinkUrl} />
        <ButtonGroup>
          <Button variant="secondary" disabled={!hasSelection || !linkUrl} onClick={() => commit(applyFormat(getCurrentValue(), { type: 'core/link', attributes: { url: linkUrl } }))}>Apply link</Button>
          <Button variant="secondary" disabled={!hasSelection} onClick={() => removeInline('core/link')}>Remove link</Button>
        </ButtonGroup>
        <p>Selected Text Color</p>
        <ColorPalette disableCustomColors={false} onChange={(color) => applyColorLive(INLINE_COLOR, 'color', color || '')} enableAlpha />
        <p>Selected Text Highlight</p>
        <ColorPalette disableCustomColors={false} onChange={(color) => applyColorLive(INLINE_HIGHLIGHT, 'background-color', color || '')} enableAlpha />
        <FontFamilyControl
          label="Selected Text Font family"
          help={hasSelection ? 'Applies only to the text you selected. Choose “inherit” to remove it.' : 'Highlight some text inside the block, then pick a font.'}
          value={selectedTextFontFamily}
          onChange={applySelectedTextFontFamily}
        />
        <MediaUploadCheck><MediaUpload allowedTypes={['image']} onSelect={(media) => {
          if (!media?.url) return;
          const current = getCurrentValue();
          commit(insertObject(current, { type: 'core/image', attributes: { url: media.url, alt: media.alt || media.title || '', className: media.id ? `wp-image-${media.id}` : '' } }, current.end, current.end));
        }} render={({ open }) => <Button variant="secondary" onClick={open}>Insert inline image</Button>} /></MediaUploadCheck>
        <Button variant="secondary" disabled={!hasSelection} onClick={clearFormats}>Clear selected formatting</Button>
      </PanelBody>
    </InspectorControls>
    <InspectorControls group="styles">
      <PanelBody
        title={`Layout — ${label}`}
        initialOpen={false}
        opened={openStylesPanel === 'layout'}
        onToggle={() => toggleStylesPanel('layout')}
      >
        <SelectControl label="Block alignment" value={attributes.align || ''} options={[{ label: 'Default', value: '' }, { label: 'Wide', value: 'wide' }, { label: 'Full width', value: 'full' }]} onChange={(next) => setAttributes({ align: next || undefined })} />
      </PanelBody>
      <PanelBody
        title={`Typography — ${label}`}
        initialOpen={false}
        opened={openStylesPanel === 'typography'}
        onToggle={() => toggleStylesPanel('typography')}
      >
        <FontFamilyControl label="Font family" value={fontFamily} onChange={(next) => update('fontFamily', next)} />
        <RangeControl label="Font size (px)" value={number(fontSize) ?? defaults.fontSize} min={10} max={120} allowReset onChange={(next) => update('fontSize', next ?? '')} />
        <RangeControl label="Line height" value={number(lineHeight) ?? defaults.lineHeight} min={0.8} max={3} step={0.05} allowReset onChange={(next) => update('lineHeight', next ?? '')} />
        <SelectControl label="Font weight" value={fontWeight || ''} options={WEIGHT_OPTIONS} onChange={(next) => update('fontWeight', next)} />
        <SelectControl label="Text alignment" value={textAlign} options={['left', 'center', 'right', 'justify'].map((item) => ({ label: item[0].toUpperCase() + item.slice(1), value: item }))} onChange={(next) => update('textAlign', next)} />
        <SelectControl label="Text transform" value={textTransform} options={['none', 'uppercase', 'lowercase', 'capitalize'].map((item) => ({ label: item[0].toUpperCase() + item.slice(1), value: item }))} onChange={(next) => update('textTransform', next)} />
        <RangeControl label="Letter spacing (px)" value={number(letterSpacing)} min={-5} max={20} step={0.1} allowReset onChange={(next) => update('letterSpacing', next ?? '')} />
        <RangeControl label="Word spacing (px)" value={number(wordSpacing)} min={-10} max={40} step={0.5} allowReset onChange={(next) => update('wordSpacing', next ?? '')} />
      </PanelBody>
      <PanelBody
        title={`Colors — ${label}`}
        initialOpen={false}
        opened={openStylesPanel === 'colors'}
        onToggle={() => toggleStylesPanel('colors')}
      >
        <p>Text color</p><ColorPalette value={textColor} onChange={(next) => update('textColor', next || '')}  enableAlpha/>
        <p>Background color</p><ColorPalette value={backgroundColor} onChange={(next) => update('backgroundColor', next || '')}  enableAlpha/>
      </PanelBody>
      <PanelBody
        title={`Spacing — ${label}`}
        initialOpen={false}
        opened={openStylesPanel === 'spacing'}
        onToggle={() => toggleStylesPanel('spacing')}
      >
        <BoxControl
          label="Padding"
          values={normalizeBoxValues(padding)}
          units={units}
          allowReset
          onChange={(next) => update('padding', normalizeBoxValues(next))}
        />
        <BoxControl
          label="Margin"
          values={normalizeBoxValues(margin)}
          units={units}
          allowReset
          onChange={(next) => update('margin', normalizeBoxValues(next))}
        />
        <Button variant="secondary" onClick={resetStyles}>Reset all {label.toLowerCase()} styling</Button>
      </PanelBody>
    </InspectorControls>
    <div ref={editorRootRef}>
    <RichText
      {...blockProps}
      ref={editorElementRef}
      identifier="content"
      tagName={['h1', 'h2', 'h3', 'p'].includes(textType) ? textType : 'h1'}
      value={content}
      onChange={(next) => update('content', next)}
      onSelectionChange={(startOrSelection, maybeEnd) => {
        const start = typeof startOrSelection === 'object' ? Number(startOrSelection?.start || 0) : Number(startOrSelection || 0);
        const end = typeof startOrSelection === 'object' ? Number(startOrSelection?.end ?? start) : Number(maybeEnd ?? start);
        saveSelection(start, end);
      }}
      placeholder={`Start writing your ${textType === 'p' ? 'paragraph' : 'heading'}…`}
      allowedFormats={['core/bold', 'core/italic', 'core/underline', 'core/link', 'core/image', 'core/strikethrough', 'core/subscript', 'core/superscript', 'core/code', INLINE_FOOTNOTE, INLINE_COLOR, INLINE_HIGHLIGHT, INLINE_FONT_FAMILY]}
    />
    </div>
  </>;
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="heading-advance" /> : <Editor {...props} />;
}