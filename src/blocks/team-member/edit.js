import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from '@wordpress/element';
import {
  useBlockProps,
  RichText,
  MediaUpload,
  MediaUploadCheck,
  InspectorControls
} from '@wordpress/block-editor';
import {
	Button,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	BoxControl,
	ColorPalette,
} from '@wordpress/components';
import { ResponsiveFontFamilyControl, getFontFamilyCss } from '../../assets-shared/fonts-family/font-family-control';

const ALLOWED_MEDIA_TYPES = ['image'];
const EMPTY_BOX = { top: '', right: '', bottom: '', left: '' };

function createCard(index = 0) {
  return {
    id: `team-card-${Date.now()}-${index}`,
    imageId: 0,
    imageUrl: '',
    imageAlt: '',
    name: sprintf(__('Team Member %d', 'uplifters-site-builder-blocks'), index + 1),
    designation: __('Designation', 'uplifters-site-builder-blocks'),
    content: __('Add bio, social links, etc...', 'uplifters-site-builder-blocks')
  };
}

function getGlobalResponsiveDevice() {
  if (typeof window !== 'undefined' && window.UpliftersSiteBuilderBlocksResponsive?.getDevice) {
    return window.UpliftersSiteBuilderBlocksResponsive.getDevice();
  }
  return 'desktop';
}

function useGlobalResponsiveDevice() {
  const [device, setDevice] = useState(getGlobalResponsiveDevice());
  useEffect(() => {
    const syncDevice = (event) => setDevice(event?.detail?.device || getGlobalResponsiveDevice());
    if (typeof window === 'undefined') return undefined;
    window.addEventListener('uplifters-site-builder-blocks-responsive-device-change', syncDevice);
    const interval = window.setInterval(() => syncDevice(), 500);
    return () => {
      window.removeEventListener('uplifters-site-builder-blocks-responsive-device-change', syncDevice);
      window.clearInterval(interval);
    };
  }, []);
  return ['desktop', 'tablet', 'mobile'].includes(device) ? device : 'desktop';
}

function getResponsiveValue(attributes, key, device, fallback = '') {
  const value = attributes[key];
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[device] ?? value.desktop ?? value.tablet ?? value.mobile ?? fallback;
  }
  return value ?? fallback;
}

function setResponsiveValue(attributes, setAttributes, key, device, value) {
  const current = attributes[key] && typeof attributes[key] === 'object' && !Array.isArray(attributes[key]) ? attributes[key] : {};
  setAttributes({ [key]: { ...current, [device]: value } });
}

function getResponsiveBoxValue(attributes, key, device) {
  const value = attributes[key];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return EMPTY_BOX;
  const branch = value[device] || value.desktop || value.tablet || value.mobile || (typeof value.top !== 'undefined' ? value : EMPTY_BOX);
  return { ...EMPTY_BOX, ...(branch || {}) };
}

function setResponsiveBoxValue(attributes, setAttributes, key, device, value) {
  const current = attributes[key] && typeof attributes[key] === 'object' && !Array.isArray(attributes[key]) ? attributes[key] : {};
  setAttributes({ [key]: { ...current, [device]: value } });
}

function boxToStyle(prefix, box) {
  const style = {};
  const map = { top: 'Top', right: 'Right', bottom: 'Bottom', left: 'Left' };
  Object.keys(map).forEach((key) => {
    if (box?.[key] !== undefined && box?.[key] !== null && String(box[key]).trim() !== '') {
      style[`${prefix}${map[key]}`] = box[key];
    }
  });
  return style;
}

function getShadowValue(level = 8) {
  const normalized = Number.isFinite(Number(level)) ? Number(level) : 8;
  if (normalized <= 0) return 'none';
  return `0 ${Math.round(normalized * 1.5)}px ${Math.round(normalized * 4)}px 0 rgba(0,0,0,${Math.max(0.06, Math.min(0.22, normalized / 50)).toFixed(2)})`;
}

function DeviceBadge({ device }) {
  return <div style={{ display: 'inline-flex', marginBottom: 12, padding: '5px 10px', borderRadius: 999, background: '#f0f0f1', fontSize: 12, fontWeight: 600 }}>{sprintf(__('%s controls', 'uplifters-site-builder-blocks'), device.charAt(0).toUpperCase() + device.slice(1))}</div>;
}

function Editor({ attributes, setAttributes }) {
  const device = useGlobalResponsiveDevice();
  const [openSettingsPanel, setOpenSettingsPanel] = useState(null);
  const [openStylesPanel, setOpenStylesPanel] = useState(null);
  const toggleSettingsPanel = (key) => setOpenSettingsPanel((current) => (current === key ? null : key));
  const toggleStylesPanel = (key) => setOpenStylesPanel((current) => (current === key ? null : key));

  const cards = useMemo(() => {
    if (Array.isArray(attributes.cards) && attributes.cards.length) return attributes.cards;
    return [createCard(0)];
  }, [attributes.cards]);

  useEffect(() => {
    if (!Array.isArray(attributes.cards) || !attributes.cards.length) setAttributes({ cards });
  }, []);

  const updateCard = (index, patch) => {
    setAttributes({ cards: cards.map((card, cardIndex) => cardIndex === index ? { ...card, ...patch } : card) });
  };
  const addCard = () => setAttributes({ cards: [...cards, createCard(cards.length)] });
  const removeCard = (index) => {
    if (cards.length <= 1) return;
    setAttributes({ cards: cards.filter((_, cardIndex) => cardIndex !== index) });
  };
  const moveCard = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= cards.length) return;
    const nextCards = [...cards];
    [nextCards[index], nextCards[nextIndex]] = [nextCards[nextIndex], nextCards[index]];
    setAttributes({ cards: nextCards });
  };

  const imageWidth = Number(getResponsiveValue(attributes, 'imageWidth', device, 112));
  const imageHeight = Number(getResponsiveValue(attributes, 'imageHeight', device, 112));
  const cardShadow = Number(getResponsiveValue(attributes, 'cardShadow', device, 8));
  const cardColumns = Number(getResponsiveValue(attributes, 'cardColumns', device, device === 'desktop' ? 3 : device === 'tablet' ? 2 : 1));
  const fontFamily = getResponsiveValue(attributes, 'fontFamily', device, 'default');
  const nameFontFamily = getResponsiveValue(attributes, 'nameFontFamily', device, 'default');
  const designationFontFamily = getResponsiveValue(attributes, 'designationFontFamily', device, 'default');
  const nameFontSize = Number(getResponsiveValue(attributes, 'nameFontSize', device, 20));
  const designationFontSize = Number(getResponsiveValue(attributes, 'designationFontSize', device, 14));
  const nameColor = getResponsiveValue(attributes, 'nameColor', device, '#0f172a');
  const designationColor = getResponsiveValue(attributes, 'designationColor', device, '#475569');
  const backgroundColor = getResponsiveValue(attributes, 'backgroundColor', device, '#ffffff');
  const contentBackgroundColor = getResponsiveValue(attributes, 'contentBackgroundColor', device, '#f1f5f9');
  const padding = getResponsiveBoxValue(attributes, 'padding', device);
  const margin = getResponsiveBoxValue(attributes, 'margin', device);
  const gap = Number(getResponsiveValue(attributes, 'gap', device, 24));
  const maxWidth = getResponsiveValue(attributes, 'maxWidth', device, '24rem');

  const blockProps = useBlockProps({ className: `uplifters-site-builder-blocks-team-member uplifters-site-builder-blocks-team-member-device-${device}` });
  const cardStyle = {
    width: '100%', maxWidth: maxWidth || '24rem', justifySelf: 'center', borderRadius: 16,
    backgroundColor: backgroundColor || '#fff', textAlign: 'center', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 12, boxShadow: getShadowValue(cardShadow), border: '1px solid rgba(0,0,0,.06)',
    boxSizing: 'border-box', fontFamily: getFontFamilyCss(fontFamily), ...boxToStyle('padding', padding), ...boxToStyle('margin', margin)
  };

  return <>
    <InspectorControls group="settings">
      <p>{sprintf(__('%d cards added', 'uplifters-site-builder-blocks'), cards.length)}</p>
      {cards.map((card, index) => {
        const panelKey = `card-${index}`;
        return <PanelBody key={card.id || index} title={sprintf(__('Card %d: %s', 'uplifters-site-builder-blocks'), index + 1, card.name || __('Unnamed', 'uplifters-site-builder-blocks'))} initialOpen={false} opened={openSettingsPanel === panelKey} onToggle={() => toggleSettingsPanel(panelKey)}>
          <TextControl label={__('Name', 'uplifters-site-builder-blocks')} value={card.name || ''} onChange={(value) => updateCard(index, { name: value })} />
          <TextControl label={__('Designation', 'uplifters-site-builder-blocks')} value={card.designation || ''} onChange={(value) => updateCard(index, { designation: value })} />
          <MediaUploadCheck><MediaUpload allowedTypes={ALLOWED_MEDIA_TYPES} value={card.imageId || 0} onSelect={(media) => updateCard(index, { imageId: media?.id || 0, imageUrl: media?.url || '', imageAlt: media?.alt || media?.title || '' })} render={({ open }) => <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}><Button variant="secondary" onClick={open}>{card.imageUrl ? __('Replace Image', 'uplifters-site-builder-blocks') : __('Select Image', 'uplifters-site-builder-blocks')}</Button>{card.imageUrl && <Button isDestructive onClick={() => updateCard(index, { imageId: 0, imageUrl: '', imageAlt: '' })}>{__('Remove Image', 'uplifters-site-builder-blocks')}</Button>}</div>} /></MediaUploadCheck>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="secondary" disabled={index === 0} onClick={() => moveCard(index, -1)}>{__('Move Up', 'uplifters-site-builder-blocks')}</Button>
            <Button variant="secondary" disabled={index === cards.length - 1} onClick={() => moveCard(index, 1)}>{__('Move Down', 'uplifters-site-builder-blocks')}</Button>
            <Button isDestructive disabled={cards.length <= 1} onClick={() => removeCard(index)}>{__('Delete Card', 'uplifters-site-builder-blocks')}</Button>
          </div>
        </PanelBody>;
      })}
      <Button variant="primary" onClick={addCard} style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>{__('Add More', 'uplifters-site-builder-blocks')}</Button>
    </InspectorControls>

    <InspectorControls group="styles">
      <PanelBody title={__('Layout', 'uplifters-site-builder-blocks')} initialOpen={false} opened={openStylesPanel === 'layout'} onToggle={() => toggleStylesPanel('layout')}>
        <DeviceBadge device={device} />
        <RangeControl label={__('Cards Per Row', 'uplifters-site-builder-blocks')} value={cardColumns} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'cardColumns', device, value || 1)} min={1} max={6} step={1} />
        <RangeControl label={__('Grid Gap (px)', 'uplifters-site-builder-blocks')} value={gap} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'gap', device, value ?? 24)} min={0} max={80} />
        <RangeControl label={__('Shadow', 'uplifters-site-builder-blocks')} value={cardShadow} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'cardShadow', device, value ?? 0)} min={0} max={30} />
        <SelectControl label={__('Card Max Width', 'uplifters-site-builder-blocks')} value={maxWidth} options={[{ label: '20rem', value: '20rem' }, { label: '24rem', value: '24rem' }, { label: '28rem', value: '28rem' }, { label: '100%', value: '100%' }]} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'maxWidth', device, value)} />
      </PanelBody>
      <PanelBody title={__('Image', 'uplifters-site-builder-blocks')} initialOpen={false} opened={openStylesPanel === 'image'} onToggle={() => toggleStylesPanel('image')}>
        <DeviceBadge device={device} />
        <RangeControl label={__('Image Width (px)', 'uplifters-site-builder-blocks')} value={imageWidth} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'imageWidth', device, value ?? 112)} min={40} max={260} />
        <RangeControl label={__('Image Height (px)', 'uplifters-site-builder-blocks')} value={imageHeight} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'imageHeight', device, value ?? 112)} min={40} max={260} />
      </PanelBody>
      <PanelBody title={__('Spacing', 'uplifters-site-builder-blocks')} initialOpen={false} opened={openStylesPanel === 'spacing'} onToggle={() => toggleStylesPanel('spacing')}>
        <DeviceBadge device={device} />
        <BoxControl label={__('Card Padding', 'uplifters-site-builder-blocks')} values={padding} onChange={(value) => setResponsiveBoxValue(attributes, setAttributes, 'padding', device, value)} />
        <div style={{ height: 12 }} /><BoxControl label={__('Card Margin', 'uplifters-site-builder-blocks')} values={margin} onChange={(value) => setResponsiveBoxValue(attributes, setAttributes, 'margin', device, value)} />
      </PanelBody>
      <PanelBody title={__('Typography', 'uplifters-site-builder-blocks')} initialOpen={false} opened={openStylesPanel === 'typography'} onToggle={() => toggleStylesPanel('typography')}>
        <DeviceBadge device={device} />
        <ResponsiveFontFamilyControl label={__('Name Section Fonts', 'uplifters-site-builder-blocks')} device={device} attributes={attributes} setAttributes={setAttributes} attributeName="nameFontFamily" getResponsiveValue={getResponsiveValue} setResponsiveValue={setResponsiveValue} />
        <ResponsiveFontFamilyControl label={__('Designation Section Fonts', 'uplifters-site-builder-blocks')} device={device} attributes={attributes} setAttributes={setAttributes} attributeName="designationFontFamily" getResponsiveValue={getResponsiveValue} setResponsiveValue={setResponsiveValue} />
        <ResponsiveFontFamilyControl label={__('About Section Fonts', 'uplifters-site-builder-blocks')} device={device} attributes={attributes} setAttributes={setAttributes} attributeName="fontFamily" getResponsiveValue={getResponsiveValue} setResponsiveValue={setResponsiveValue} />
        <RangeControl label={__('Name Font Size (px)', 'uplifters-site-builder-blocks')} value={nameFontSize} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'nameFontSize', device, value ?? 20)} min={10} max={56} />
        <RangeControl label={__('Designation Font Size (px)', 'uplifters-site-builder-blocks')} value={designationFontSize} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'designationFontSize', device, value ?? 14)} min={10} max={42} />
      </PanelBody>
      <PanelBody title={__('Colors', 'uplifters-site-builder-blocks')} initialOpen={false} opened={openStylesPanel === 'colors'} onToggle={() => toggleStylesPanel('colors')}>
        <DeviceBadge device={device} />
        <p className="components-base-control__label">{__('Name Color', 'uplifters-site-builder-blocks')}</p><ColorPalette value={nameColor} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'nameColor', device, value || '')}  enableAlpha/>
        <p className="components-base-control__label">{__('Designation Color', 'uplifters-site-builder-blocks')}</p><ColorPalette value={designationColor} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'designationColor', device, value || '')}  enableAlpha/>
        <p className="components-base-control__label">{__('Card Background', 'uplifters-site-builder-blocks')}</p><ColorPalette value={backgroundColor} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'backgroundColor', device, value || '')}  enableAlpha/>
        <p className="components-base-control__label">{__('Content Background', 'uplifters-site-builder-blocks')}</p><ColorPalette value={contentBackgroundColor} onChange={(value) => setResponsiveValue(attributes, setAttributes, 'contentBackgroundColor', device, value || '')}  enableAlpha/>
      </PanelBody>
    </InspectorControls>

    <div {...blockProps}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, cardColumns)}, minmax(0, 1fr))`, gap: `${gap}px`, width: '100%' }}>
        {cards.map((card, index) => <article key={card.id || index} style={cardStyle}>
          <MediaUploadCheck>
            <MediaUpload
              allowedTypes={ALLOWED_MEDIA_TYPES}
              value={card.imageId || 0}
              onSelect={(media) => updateCard(index, { imageId: media?.id || 0, imageUrl: media?.url || '', imageAlt: media?.alt || media?.title || '' })}
              render={({ open }) => (
                <button
                  type="button"
                  onClick={open}
                  style={{ cursor: 'pointer', border: '0', backgroundColor: 'transparent', padding: '0', margin: '0', display: 'block' }}
                  aria-label={__('Upload team member image', 'uplifters-site-builder-blocks')}
                >
                  <div style={{ width: imageWidth, height: imageHeight, borderRadius: 9999, overflow: 'hidden', background: 'rgba(148,163,184,.2)', border: '1px solid rgba(0,0,0,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {card.imageUrl ? <img src={card.imageUrl} alt={card.imageAlt || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 13, color: '#64748b' }}>{__('Upload Image', 'uplifters-site-builder-blocks')}</span>}
                  </div>
                </button>
              )}
            />
          </MediaUploadCheck>
          <RichText tagName="h3" value={card.name || ''} onChange={(value) => updateCard(index, { name: value })} placeholder={__('Name', 'uplifters-site-builder-blocks')} allowedFormats={[]} style={{ margin: '8px 0 0', fontSize: nameFontSize, lineHeight: 1.2, fontWeight: 600, color: nameColor, fontFamily: getFontFamilyCss(nameFontFamily) }} />
          <RichText tagName="p" value={card.designation || ''} onChange={(value) => updateCard(index, { designation: value })} placeholder={__('Designation', 'uplifters-site-builder-blocks')} allowedFormats={[]} style={{ margin: 0, fontSize: designationFontSize, lineHeight: 1.4, fontWeight: 500, color: designationColor, fontFamily: getFontFamilyCss(designationFontFamily) }} />
          <div style={{ width: '100%', marginTop: 4, padding: 16, textAlign: 'left', borderRadius: 12, backgroundColor: contentBackgroundColor, border: '1px solid rgba(0,0,0,.05)' }}>
            <RichText tagName="div" value={card.content || ''} onChange={(value) => updateCard(index, { content: value })} placeholder={__('Add bio, social links, etc...', 'uplifters-site-builder-blocks')} />
          </div>
        </article>)}
      </div>
      <Button variant="primary" onClick={addCard} style={{ display: 'flex', margin: '20px auto 0' }}>{__('Add More', 'uplifters-site-builder-blocks')}</Button>
    </div>
  </>;
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="team-member" /> : <Editor {...props} />;
}
