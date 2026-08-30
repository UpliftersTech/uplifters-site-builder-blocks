import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import {
	InspectorControls,
	RichText,
	useBlockProps
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	SelectControl,
	Button,
	ColorPalette,
} from '@wordpress/components';

import { FontFamilyControl, getFontFamilyCss } from '../../assets-shared/fonts-family/font-family-control';

const MARKER_OPTIONS = [
	{ label: 'Check (✓)', value: 'check', icon: '✓' },
	{ label: 'Arrow (→)', value: 'arrow', icon: '→' },
	{ label: 'Bullet (•)', value: 'bullet', icon: '•' },
	{ label: 'Circle (○)', value: 'circle', icon: '○' },
	{ label: 'Square (■)', value: 'square', icon: '■' },
	{ label: 'Star (★)', value: 'star', icon: '★' },
	{ label: 'Heart (♥)', value: 'heart', icon: '♥' },
	{ label: 'Dash (—)', value: 'dash', icon: '—' },
	{ label: 'Plus (+)', value: 'plus', icon: '+' },
	{ label: 'Tick Box (☑)', value: 'box-check', icon: '☑' }
];

function getMarkerIcon(marker) {
	const found = MARKER_OPTIONS.find((option) => option.value === marker);
	return found ? found.icon : '✓';
}

function isEmptyRichTextValue(value) {
	return String(value || '')
		.replace(/<br\s*\/?>/gi, '')
		.replace(/&nbsp;/gi, ' ')
		.replace(/<\/?[^>]+(>|$)/g, '')
		.trim().length === 0;
}

function normalizeItems(rawValue) {
	if (Array.isArray(rawValue)) {
		return rawValue
			.flatMap((item) =>
				String(item || '')
					.replace(/<br\s*\/?>/gi, '\n')
					.split('\n')
			)
			.map((item) => item.trim())
			.filter((item) => !isEmptyRichTextValue(item));
	}

	return String(rawValue || '')
		.replace(/<br\s*\/?>/gi, '\n')
		.split('\n')
		.map((item) => item.trim())
		.filter((item) => !isEmptyRichTextValue(item));
}

function updateItemAt(items, index, value) {
	return items.map((item, currentIndex) =>
		currentIndex === index ? value : item
	);
}

function clampNumber(value, min, max, fallback) {
	const number = Number(value);

	if (!Number.isFinite(number)) {
		return fallback;
	}

	return Math.max(min, Math.min(max, number));
}

function getCurrentGlobalDevice() {
	if (
		typeof window !== 'undefined' &&
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice === 'function'
	) {
		const device = window.UpliftersSiteBuilderBlocksResponsive.getDevice();

		if (['desktop', 'tablet', 'mobile'].includes(device)) {
			return device;
		}
	}

	return 'desktop';
}

/**
 * Individual responsive device tracking hook.
 *
 * This block does not control desktop/tablet/mobile mode itself.
 * It reads the active global device from the floating responsive toolbar/context.
 */
function useGlobalResponsiveDevice() {
	const [device, setDevice] = useState(getCurrentGlobalDevice());

	useEffect(() => {
		function syncDevice(event) {
			const eventDevice = event?.detail?.device;

			if (['desktop', 'tablet', 'mobile'].includes(eventDevice)) {
				setDevice(eventDevice);
				return;
			}

			setDevice(getCurrentGlobalDevice());
		}

		window.addEventListener('uplifters-site-builder-blocks-responsive-device-change', syncDevice);
		window.addEventListener('uplifters-site-builder-blocks-global-responsive-device-change', syncDevice);

		const interval = window.setInterval(() => {
			const nextDevice = getCurrentGlobalDevice();

			setDevice((currentDevice) =>
				currentDevice === nextDevice ? currentDevice : nextDevice
			);
		}, 500);

		return () => {
			window.removeEventListener('uplifters-site-builder-blocks-responsive-device-change', syncDevice);
			window.removeEventListener('uplifters-site-builder-blocks-global-responsive-device-change', syncDevice);
			window.clearInterval(interval);
		};
	}, []);

	return device;
}

function getResponsiveValue(attributes, key, device, fallback = '') {
	const value = attributes[key];

	if (value && typeof value === 'object' && !Array.isArray(value)) {
		return (
			value[device] ??
			value.desktop ??
			value.tablet ??
			value.mobile ??
			fallback
		);
	}

	if (value !== undefined && value !== null && value !== '') {
		return value;
	}

	return fallback;
}

function setResponsiveValue(attributes, setAttributes, key, device, value) {
	const current = attributes[key];
	const currentObject =
		current && typeof current === 'object' && !Array.isArray(current)
			? current
			: {
					desktop: current,
					tablet: current,
					mobile: current
			  };

	setAttributes({
		[key]: {
			...currentObject,
			[device]: value
		}
	});
}

function DeviceBadge({ device }) {
	const label =
		device === 'tablet'
			? __('Tablet variant', 'uplifters-site-builder-blocks')
			: device === 'mobile'
				? __('Mobile variant', 'uplifters-site-builder-blocks')
				: __('Desktop variant', 'uplifters-site-builder-blocks');

	return (
		<div
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: '6px',
				marginBottom: '12px',
				padding: '5px 10px',
				borderRadius: '999px',
				background: '#f0f0f1',
				color: '#1e1e1e',
				fontSize: '12px',
				fontWeight: 600
			}}
		>
			{label}
		</div>
	);
}

function Editor({ attributes, setAttributes }) {
	const device = useGlobalResponsiveDevice();
	const [openPanel, setOpenPanel] = useState(null);

	const togglePanel = (panel) => {
		setOpenPanel((currentPanel) =>
			currentPanel === panel ? null : panel
		);
	};

	const {
		items = ['First list item', 'Second list item', 'Third list item']
	} = attributes;

	const marker = getResponsiveValue(attributes, 'marker', device, 'check');
	const fontFamily = getResponsiveValue(attributes, 'fontFamily', device, 'default');
	const textColor = getResponsiveValue(attributes, 'textColor', device, '#0f172a');
	const markerColor = getResponsiveValue(attributes, 'markerColor', device, '#2563eb');
	const fontSize = clampNumber(
		getResponsiveValue(attributes, 'fontSize', device, 18),
		12,
		48,
		18
	);
	const itemGap = clampNumber(
		getResponsiveValue(attributes, 'itemGap', device, 14),
		0,
		48,
		14
	);
	const padding = clampNumber(
		getResponsiveValue(attributes, 'padding', device, 0),
		0,
		120,
		0
	);

	const markerIcon = getMarkerIcon(marker);
	const normalizedItems = normalizeItems(items);

	const blockProps = useBlockProps({
		className: `uplifters-site-builder-blocks-text-list-icon-editor uplifters-site-builder-blocks-text-list-icon-device-${device}`,
		style: {
			border: '1px dashed #cbd5e1',
			borderRadius: '16px',
			padding: '24px',
			boxSizing: 'border-box',
			fontFamily: getFontFamilyCss(fontFamily)
		}
	});

	const addMoreItem = () => {
		setAttributes({
			items: [...normalizedItems, __('New list item', 'uplifters-site-builder-blocks')]
		});
	};

	const updateItem = (index, value) => {
		setAttributes({
			items: updateItemAt(normalizedItems, index, value)
		});
	};

	const removeItem = (index) => {
		const nextItems = normalizedItems.filter(
			(_, currentIndex) => currentIndex !== index
		);

		setAttributes({
			items: nextItems.length ? nextItems : [__('New list item', 'uplifters-site-builder-blocks')]
		});
	};

	return (
		<>
			<InspectorControls group="settings">
				<div aria-hidden="true" />
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={__('Typography', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openPanel === 'typography'}
					onToggle={() => togglePanel('typography')}
				>
					<DeviceBadge device={device} />

					<FontFamilyControl
						label={__('Font family', 'uplifters-site-builder-blocks')}
						value={fontFamily || 'default'}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'fontFamily',
								device,
								value
							)
						}
					/>

					<RangeControl
						label={__('Font size (px)', 'uplifters-site-builder-blocks')}
						value={fontSize}
						min={12}
						max={48}
						step={1}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'fontSize',
								device,
								Number(value) || 12
							)
						}
					/>
				</PanelBody>

				<PanelBody
					title={__('Layout', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openPanel === 'marker'}
					onToggle={() => togglePanel('marker')}
				>
					<DeviceBadge device={device} />

					<SelectControl
						label={__('Marker', 'uplifters-site-builder-blocks')}
						value={marker}
						options={MARKER_OPTIONS.map((option) => ({
							label: option.label,
							value: option.value
						}))}
						onChange={(value) =>
							setResponsiveValue(attributes, setAttributes, 'marker', device, value)
						}
						help={__(
							'This marker is saved only for the active global responsive device.',
							'uplifters-site-builder-blocks'
						)}
					/>
				</PanelBody>

				<PanelBody
					title={__('Spacing', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openPanel === 'layout'}
					onToggle={() => togglePanel('layout')}
				>
					<DeviceBadge device={device} />

					<RangeControl
						label={__('Item gap (px)', 'uplifters-site-builder-blocks')}
						value={itemGap}
						min={0}
						max={48}
						step={1}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'itemGap',
								device,
								Number(value) || 0
							)
						}
					/>

					<RangeControl
						label={__('Padding (px)', 'uplifters-site-builder-blocks')}
						value={padding}
						min={0}
						max={120}
						step={1}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'padding',
								device,
								Number(value) || 0
							)
						}
					/>
				</PanelBody>

				<PanelBody
					title={__('Colors', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openPanel === 'colors'}
					onToggle={() => togglePanel('colors')}
				>
					<DeviceBadge device={device} />

					<div>
						<div
							style={{
								marginBottom: '8px',
								fontSize: '11px',
								fontWeight: 500,
								lineHeight: 1.4,
								textTransform: 'uppercase'
							}}
						>
							{__('Text Color', 'uplifters-site-builder-blocks')}
						</div>

						<ColorPalette
							value={textColor}
							onChange={(value) =>
								setResponsiveValue(
									attributes,
									setAttributes,
									'textColor',
									device,
									value || '#0f172a'
								)
							}
						 enableAlpha/>
					</div>

					<div style={{ marginTop: '16px' }}>
						<div
							style={{
								marginBottom: '8px',
								fontSize: '11px',
								fontWeight: 500,
								lineHeight: 1.4,
								textTransform: 'uppercase'
							}}
						>
							{__('Icon / Mark Color', 'uplifters-site-builder-blocks')}
						</div>

						<ColorPalette
							value={markerColor}
							onChange={(value) =>
								setResponsiveValue(
									attributes,
									setAttributes,
									'markerColor',
									device,
									value || '#2563eb'
								)
							}
						 enableAlpha/>
					</div>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div
					style={{
						marginBottom: '20px',
						padding: '18px',
						border: '1px solid #dbeafe',
						borderRadius: '16px',
						background: 'linear-gradient(135deg, #f8fbff 0%, #eef6ff 100%)'
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '10px',
							marginBottom: '14px'
						}}
					>
						<span
							aria-hidden="true"
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: '36px',
								height: '36px',
								borderRadius: '999px',
								background: '#ffffff',
								color: markerColor,
								fontSize: `${fontSize}px`,
								lineHeight: 1,
								fontWeight: 700,
								boxShadow: '0 4px 14px rgba(37, 99, 235, 0.08)'
							}}
						>
							{markerIcon}
						</span>

						<div>
							<div
								style={{
									fontSize: '12px',
									fontWeight: 700,
									letterSpacing: '0.08em',
									textTransform: 'uppercase',
									color: '#64748b'
								}}
							>
								{__('Preview', 'uplifters-site-builder-blocks')}
							</div>

							<div
								style={{
									fontSize: '14px',
									color: '#0f172a'
								}}
							>
								{__('List style preview with selected icon.', 'uplifters-site-builder-blocks')}
							</div>
						</div>
					</div>

					<div
						style={{
							display: 'grid',
							gap: `${itemGap}px`,
							padding: `${padding}px`,
							borderRadius: '12px',
							background: padding > 0 ? 'rgba(255, 255, 255, 0.7)' : undefined
						}}
					>
						{normalizedItems.map((item, index) => (
							<div
								key={`preview-item-${index}`}
								style={{
									display: 'flex',
									alignItems: 'flex-start',
									gap: '12px'
								}}
							>
								<span
									aria-hidden="true"
									style={{
										color: markerColor,
										fontSize: `${fontSize}px`,
										lineHeight: 1.4,
										fontWeight: 700,
										minWidth: '1em'
									}}
								>
									{markerIcon}
								</span>

								<RichText
									tagName="span"
									value={item}
									onChange={(value) => updateItem(index, value)}
									placeholder={__('Write list item…', 'uplifters-site-builder-blocks')}
									style={{
										flex: 1,
										color: textColor,
										fontSize: `${fontSize}px`,
										lineHeight: 1.6,
										minWidth: 0
									}}
								/>

								<Button
									isDestructive
									variant="tertiary"
									onClick={() => removeItem(index)}
								>
									{__('Remove', 'uplifters-site-builder-blocks')}
								</Button>
							</div>
						))}
					</div>
				</div>

				<div style={{ marginTop: '16px' }}>
					<Button variant="primary" onClick={addMoreItem}>
						{__('Add More', 'uplifters-site-builder-blocks')}
					</Button>
				</div>
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="text-list-icon" /> : <Editor {...props} />;
}
