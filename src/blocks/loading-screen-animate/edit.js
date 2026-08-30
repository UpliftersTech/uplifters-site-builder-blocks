import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';

import './editor.scss';
import {
	InspectorControls,
	RichText,
	useBlockProps
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	TextControl,
	SelectControl,
	ToggleControl,
	ColorPalette,
} from '@wordpress/components';

import { FontFamilyControl, getFontFamilyCss } from '../../assets-shared/fonts-family/font-family-control';

const FONT_WEIGHT_OPTIONS = [
	{ label: '100 (Thin)', value: '100' },
	{ label: '200 (Extra Light)', value: '200' },
	{ label: '300 (Light)', value: '300' },
	{ label: '400 (Regular)', value: '400' },
	{ label: '500 (Medium)', value: '500' },
	{ label: '600 (Semi Bold)', value: '600' },
	{ label: '700 (Bold)', value: '700' },
	{ label: '800 (Extra Bold)', value: '800' },
	{ label: '900 (Black)', value: '900' }
];

function getCurrentGlobalDevice() {
	if (typeof window === 'undefined') {
		return 'desktop';
	}

	if (
		window.UpliftersSiteBuilderBlocksGlobalResponsiveDevice &&
		typeof window.UpliftersSiteBuilderBlocksGlobalResponsiveDevice.getDevice === 'function'
	) {
		const device = window.UpliftersSiteBuilderBlocksGlobalResponsiveDevice.getDevice();

		if (['desktop', 'tablet', 'mobile'].includes(device)) {
			return device;
		}
	}

	if (
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice === 'function'
	) {
		const device = window.UpliftersSiteBuilderBlocksResponsive.getDevice();

		if (['desktop', 'tablet', 'mobile'].includes(device)) {
			return device;
		}
	}

	if (window.upliftersSiteBuilderBlocksResponsiveDevice) {
		const device = window.upliftersSiteBuilderBlocksResponsiveDevice;

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
			: {};

	setAttributes({
		[key]: {
			...currentObject,
			[device]: value
		}
	});
}

function clampNumber(value, min, max, fallback) {
	const number = Number(value);

	if (!Number.isFinite(number)) {
		return fallback;
	}

	return Math.max(min, Math.min(max, number));
}

function DeviceBadge({ device }) {
	const labels = {
		desktop: __('Desktop variant', 'uplifters-site-builder-blocks'),
		tablet: __('Tablet variant', 'uplifters-site-builder-blocks'),
		mobile: __('Mobile variant', 'uplifters-site-builder-blocks')
	};

	return (
		<div
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				marginBottom: '12px',
				padding: '5px 10px',
				borderRadius: '999px',
				background: '#f0f0f1',
				color: '#1e1e1e',
				fontSize: '12px',
				fontWeight: 600
			}}
		>
			{labels[device] || labels.desktop}
		</div>
	);
}

function Editor({ attributes, setAttributes }) {
	const device = useGlobalResponsiveDevice();
	const [openSettingsPanel, setOpenSettingsPanel] = useState(null);
	const [openStylesPanel, setOpenStylesPanel] = useState(null);

	const toggleSettingsPanel = (panel) => {
		setOpenSettingsPanel((currentPanel) =>
			currentPanel === panel ? null : panel
		);
	};

	const toggleStylesPanel = (panel) => {
		setOpenStylesPanel((currentPanel) =>
			currentPanel === panel ? null : panel
		);
	};

	const {
		message = 'Loading page...',
		enableLoader = true
	} = attributes;

	const overlayColor = getResponsiveValue(attributes, 'overlayColor', device, '#f8fafc');
	const shimmerColor = getResponsiveValue(
		attributes,
		'shimmerColor',
		device,
		'rgba(148, 163, 184, 0.22)'
	);
	const highlightColor = getResponsiveValue(
		attributes,
		'highlightColor',
		device,
		'rgba(255, 255, 255, 0.78)'
	);
	const textColor = getResponsiveValue(attributes, 'textColor', device, '#334155');
	const duration = clampNumber(
		getResponsiveValue(attributes, 'duration', device, 1.8),
		0.8,
		4,
		1.8
	);
	const maxWait = Math.round(
		clampNumber(getResponsiveValue(attributes, 'maxWait', device, 8000), 1000, 30000, 8000)
	);
	const fontFamily = getResponsiveValue(attributes, 'fontFamily', device, 'default');
	const fontSize = clampNumber(
		getResponsiveValue(attributes, 'fontSize', device, 28),
		12,
		72,
		28
	);
	const fontWeight = String(getResponsiveValue(attributes, 'fontWeight', device, '700'));
	const lineHeight = clampNumber(
		getResponsiveValue(attributes, 'lineHeight', device, 1.2),
		0.8,
		3,
		1.2
	);
	const contentWidth = getResponsiveValue(attributes, 'contentWidth', device, '480px');
	const padding = getResponsiveValue(attributes, 'padding', device, '24px');

	const blockProps = useBlockProps({
		className: `uplifters-site-builder-blocks-loading-screen-animate-editor-preview uplifters-site-builder-blocks-loading-screen-animate-device-${device}`,
		style: {
			'--uplifters-site-builder-blocks-loading-screen-animate-overlay': overlayColor,
			'--uplifters-site-builder-blocks-loading-screen-animate-shimmer': shimmerColor,
			'--uplifters-site-builder-blocks-loading-screen-animate-highlight': highlightColor,
			'--uplifters-site-builder-blocks-loading-screen-animate-text': textColor,
			'--uplifters-site-builder-blocks-loading-screen-animate-duration': `${duration}s`,
			'--uplifters-site-builder-blocks-loading-screen-animate-font-family': getFontFamilyCss(fontFamily),
			'--uplifters-site-builder-blocks-loading-screen-animate-font-size': `${fontSize}px`,
			'--uplifters-site-builder-blocks-loading-screen-animate-font-weight': fontWeight,
			'--uplifters-site-builder-blocks-loading-screen-animate-line-height': lineHeight,
			'--uplifters-site-builder-blocks-loading-screen-animate-content-width': contentWidth,
			'--uplifters-site-builder-blocks-loading-screen-animate-padding': padding
		}
	});

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody
					title={__('Behavior', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openSettingsPanel === 'behavior'}
					onToggle={() => toggleSettingsPanel('behavior')}
				>
					<DeviceBadge device={device} />

					<ToggleControl
						label={__('Enable Loader', 'uplifters-site-builder-blocks')}
						checked={!!enableLoader}
						onChange={(value) => setAttributes({ enableLoader: !!value })}
					/>

					<TextControl
						label={__('Maximum wait (ms)', 'uplifters-site-builder-blocks')}
						type="number"
						min={1000}
						step={500}
						value={maxWait}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'maxWait',
								device,
								Math.max(1000, Number(value) || 1000)
							)
						}
					/>

				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={__('Colors', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'colors'}
					onToggle={() => toggleStylesPanel('colors')}
				>
					<DeviceBadge device={device} />

					<div className="components-base-control">
						<div className="components-base-control__label">
							{__('Overlay Background', 'uplifters-site-builder-blocks')}
						</div>
						<ColorPalette
							value={overlayColor}
							onChange={(value) =>
								setResponsiveValue(
									attributes,
									setAttributes,
									'overlayColor',
									device,
									value || '#f8fafc'
								)
							}
						 enableAlpha/>
					</div>

					<div className="components-base-control" style={{ marginTop: '16px' }}>
						<div className="components-base-control__label">
							{__('Shimmer Color', 'uplifters-site-builder-blocks')}
						</div>
						<ColorPalette
							value={shimmerColor}
							onChange={(value) =>
								setResponsiveValue(
									attributes,
									setAttributes,
									'shimmerColor',
									device,
									value || 'rgba(148, 163, 184, 0.22)'
								)
							}
						 enableAlpha/>
					</div>

					<div className="components-base-control" style={{ marginTop: '16px' }}>
						<div className="components-base-control__label">
							{__('Highlight Color', 'uplifters-site-builder-blocks')}
						</div>
						<ColorPalette
							value={highlightColor}
							onChange={(value) =>
								setResponsiveValue(
									attributes,
									setAttributes,
									'highlightColor',
									device,
									value || 'rgba(255, 255, 255, 0.78)'
								)
							}
						 enableAlpha/>
					</div>

					<div className="components-base-control" style={{ marginTop: '16px' }}>
						<div className="components-base-control__label">
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
									value || '#334155'
								)
							}
						 enableAlpha/>
					</div>
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
						onChange={(value) =>
							setResponsiveValue(attributes, setAttributes, 'fontFamily', device, value)
						}
					/>

					<SelectControl
						label={__('Font Weight', 'uplifters-site-builder-blocks')}
						value={fontWeight}
						options={FONT_WEIGHT_OPTIONS}
						onChange={(value) =>
							setResponsiveValue(attributes, setAttributes, 'fontWeight', device, value)
						}
					/>

					<RangeControl
						label={__('Font Size (px)', 'uplifters-site-builder-blocks')}
						value={fontSize}
						min={12}
						max={72}
						step={1}
						onChange={(value) =>
							setResponsiveValue(attributes, setAttributes, 'fontSize', device, value ?? 28)
						}
					/>

					<RangeControl
						label={__('Line Height', 'uplifters-site-builder-blocks')}
						value={lineHeight}
						min={0.8}
						max={3}
						step={0.05}
						onChange={(value) =>
							setResponsiveValue(attributes, setAttributes, 'lineHeight', device, value ?? 1.2)
						}
					/>
				</PanelBody>

				<PanelBody
					title={__('Layout', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'layout'}
					onToggle={() => toggleStylesPanel('layout')}
				>
					<DeviceBadge device={device} />

					<RangeControl
						label={__('Shimmer speed (seconds)', 'uplifters-site-builder-blocks')}
						value={duration}
						min={0.8}
						max={4}
						step={0.1}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'duration',
								device,
								value ?? 1.8
							)
						}
					/>

					<TextControl
						label={__('Content Width', 'uplifters-site-builder-blocks')}
						value={contentWidth}
						placeholder="480px, 90%, 32rem"
						onChange={(value) =>
							setResponsiveValue(attributes, setAttributes, 'contentWidth', device, value)
						}
					/>
				</PanelBody>

				<PanelBody
					title={__('Spacing', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'spacing'}
					onToggle={() => toggleStylesPanel('spacing')}
				>
					<DeviceBadge device={device} />

					<TextControl
						label={__('Overlay Padding', 'uplifters-site-builder-blocks')}
						value={padding}
						placeholder="24px"
						onChange={(value) =>
							setResponsiveValue(attributes, setAttributes, 'padding', device, value)
						}
					/>
				</PanelBody>

			</InspectorControls>

			<div {...blockProps}>
				<div className="uplifters-site-builder-blocks-loading-screen-animate-editor-preview__gloss" aria-hidden="true" />

				<div className="uplifters-site-builder-blocks-loading-screen-animate-editor-preview__shine-wrap" aria-hidden="true">
					<div className="uplifters-site-builder-blocks-loading-screen-animate-editor-preview__shine" />
				</div>

				<div className="uplifters-site-builder-blocks-loading-screen-animate-editor-preview__content">
					<RichText
						tagName="p"
						className="uplifters-site-builder-blocks-loading-screen-animate-editor-preview__message"
						value={message}
						allowedFormats={[]}
						onChange={(value) => setAttributes({ message: value })}
						placeholder={__('Loading page...', 'uplifters-site-builder-blocks')}
					/>

					<div className="uplifters-site-builder-blocks-loading-screen-animate-editor-preview__bar" aria-hidden="true" />
					<div
						className="uplifters-site-builder-blocks-loading-screen-animate-editor-preview__bar uplifters-site-builder-blocks-loading-screen-animate-editor-preview__bar--short"
						aria-hidden="true"
					/>
				</div>
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="loading-screen-animate" /> : <Editor {...props} />;
}
