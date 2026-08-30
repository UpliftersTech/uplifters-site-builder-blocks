import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from '@wordpress/i18n';
import { useEffect, useState, Fragment } from '@wordpress/element';
import {
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';

import {
	PanelBody,
	TextControl,
	SelectControl,
	ToggleControl,
	ColorPalette,
	RangeControl,
} from '@wordpress/components';

import './editor.scss';
import { FontFamilyControl, getFontFamilyCss } from '../../assets-shared/fonts-family/font-family-control';

function getCurrentDevice() {
	if (
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice === 'function'
	) {
		return window.UpliftersSiteBuilderBlocksResponsive.getDevice();
	}

	return 'desktop';
}

function getResponsiveValue(attributes, key, device) {
	const value = attributes[key] || {};

	return (
		value[device] ||
		value.desktop ||
		value.tablet ||
		value.mobile ||
		''
	);
}

function setResponsiveValue(
	attributes,
	setAttributes,
	key,
	device,
	value
) {
	setAttributes({
		[key]: {
			...(attributes[key] || {}),
			[device]: value,
		},
	});
}

function getPxNumber(value, fallback) {
	const match = /(-?\d+(?:\.\d+)?)/.exec(value || '');

	if (!match) {
		return fallback;
	}

	const parsed = Number(match[1]);

	return Number.isNaN(parsed) ? fallback : parsed;
}

function DeviceBadge({ device }) {
	let label = __('Desktop variant', 'uplifters-site-builder-blocks');

	if (device === 'tablet') {
		label = __('Tablet variant', 'uplifters-site-builder-blocks');
	}

	if (device === 'mobile') {
		label = __('Mobile variant', 'uplifters-site-builder-blocks');
	}

	return (
		<div className="uplifters-site-builder-blocks-button-single-device-badge">
			{label}
		</div>
	);
}

function Editor({ attributes, setAttributes }) {
	const [device, setDevice] = useState(getCurrentDevice());
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

	useEffect(() => {

		function handleDeviceChange(event) {
			if (event?.detail?.device) {
				setDevice(event.detail.device);
				return;
			}

			setDevice(getCurrentDevice());
		}

		window.addEventListener(
			'uplifters-site-builder-blocks-responsive-device-change',
			handleDeviceChange
		);

		const interval = window.setInterval(() => {
			const nextDevice = getCurrentDevice();

			setDevice((currentDevice) => {
				return currentDevice !== nextDevice
					? nextDevice
					: currentDevice;
			});
		}, 500);

		return () => {
			window.removeEventListener(
				'uplifters-site-builder-blocks-responsive-device-change',
				handleDeviceChange
			);

			window.clearInterval(interval);
		};
	}, []);

	const text = getResponsiveValue(
		attributes,
		'text',
		device
	);

	const alignment = getResponsiveValue(
		attributes,
		'alignment',
		device
	);

	const fontFamily = getResponsiveValue(
		attributes,
		'fontFamily',
		device
	);

	const fontSize = getResponsiveValue(
		attributes,
		'fontSize',
		device
	);

	const padding = getResponsiveValue(
		attributes,
		'padding',
		device
	);

	const borderRadius = getResponsiveValue(
		attributes,
		'borderRadius',
		device
	);

	const backgroundColor = getResponsiveValue(
		attributes,
		'backgroundColor',
		device
	);

	const textColor = getResponsiveValue(
		attributes,
		'textColor',
		device
	);

	const width = getResponsiveValue(
		attributes,
		'width',
		device
	);

	const blockProps = useBlockProps({
		className: `uplifters-site-builder-blocks-button-single-editor-wrapper uplifters-site-builder-blocks-button-single-device-${device}`,
		style: {
			textAlign: alignment || 'left',
		},
	});

	const buttonStyle = {
		fontFamily: getFontFamilyCss(fontFamily),
		fontSize: fontSize || undefined,
		padding: padding || undefined,
		borderRadius: borderRadius || undefined,
		backgroundColor: backgroundColor || undefined,
		color: textColor || undefined,
		width: width || undefined,
	};

	return (
		<Fragment>

			<InspectorControls group="settings">
				<PanelBody
					title={__('Content', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openSettingsPanel === 'content'}
					onToggle={() => toggleSettingsPanel('content')}
				>
					<DeviceBadge device={device} />

					<TextControl
						label={__('Text', 'uplifters-site-builder-blocks')}
						value={text}
						onChange={(value) => {
							setResponsiveValue(
								attributes,
								setAttributes,
								'text',
								device,
								value
							);
						}}
						help={__(
							'This value is saved for the selected responsive variant.',
							'uplifters-site-builder-blocks'
						)}
					/>

					<TextControl
						label={__('URL', 'uplifters-site-builder-blocks')}
						value={attributes.url || ''}
						onChange={(value) => {
							setAttributes({
								url: value,
							});
						}}
					/>

					<ToggleControl
						label={__('Open in new tab', 'uplifters-site-builder-blocks')}
						checked={!!attributes.openInNewTab}
						onChange={(value) => {
							setAttributes({
								openInNewTab: value,
							});
						}}
					/>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={__('Layout', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'layout'}
					onToggle={() => toggleStylesPanel('layout')}
				>
					<DeviceBadge device={device} />

					<SelectControl
						label={__('Alignment', 'uplifters-site-builder-blocks')}
						value={alignment || 'left'}
						options={[
							{
								label: __('Left', 'uplifters-site-builder-blocks'),
								value: 'left',
							},
							{
								label: __('Center', 'uplifters-site-builder-blocks'),
								value: 'center',
							},
							{
								label: __('Right', 'uplifters-site-builder-blocks'),
								value: 'right',
							},
						]}
						onChange={(value) => {
							setResponsiveValue(
								attributes,
								setAttributes,
								'alignment',
								device,
								value
							);
						}}
					/>

					<TextControl
						label={__('Width', 'uplifters-site-builder-blocks')}
						value={width}
						placeholder="auto, 100%, 240px"
						onChange={(value) => {
							setResponsiveValue(
								attributes,
								setAttributes,
								'width',
								device,
								value
							);
						}}
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
						value={fontFamily || 'default'}
						onChange={(value) => {
							setResponsiveValue(
								attributes,
								setAttributes,
								'fontFamily',
								device,
								value
							);
						}}
						help={__(
							'Choose a font family for the selected responsive variant.',
							'uplifters-site-builder-blocks'
						)}
					/>

					<RangeControl
						label={__('Font Size', 'uplifters-site-builder-blocks')}
						value={getPxNumber(fontSize, 16)}
						min={8}
						max={96}
						step={1}
						onChange={(value) => {
							setResponsiveValue(
								attributes,
								setAttributes,
								'fontSize',
								device,
								`${value}px`
							);
						}}
					/>
				</PanelBody>

				<PanelBody
					title={__('Spacing', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'spacing'}
					onToggle={() => toggleStylesPanel('spacing')}
				>
					<DeviceBadge device={device} />

					<RangeControl
						label={__('Padding', 'uplifters-site-builder-blocks')}
						value={getPxNumber(padding, 14)}
						min={0}
						max={80}
						step={1}
						onChange={(value) => {
							setResponsiveValue(
								attributes,
								setAttributes,
								'padding',
								device,
								`${value}px`
							);
						}}
					/>

					<RangeControl
						label={__('Border Radius', 'uplifters-site-builder-blocks')}
						value={getPxNumber(borderRadius, 8)}
						min={0}
						max={100}
						step={1}
						onChange={(value) => {
							setResponsiveValue(
								attributes,
								setAttributes,
								'borderRadius',
								device,
								`${value}px`
							);
						}}
					/>
				</PanelBody>

				<PanelBody
					title={__('Colors', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'colors'}
					onToggle={() => toggleStylesPanel('colors')}
				>
					<DeviceBadge device={device} />

					<p className="uplifters-site-builder-blocks-button-single-control-label">
						{__('Background Color', 'uplifters-site-builder-blocks')}
					</p>

					<ColorPalette
						value={backgroundColor}
						onChange={(color) => {
							setResponsiveValue(
								attributes,
								setAttributes,
								'backgroundColor',
								device,
								color || ''
							);
						}}
						enableAlpha
					/>

					<hr />

					<p className="uplifters-site-builder-blocks-button-single-control-label">
						{__('Text Color', 'uplifters-site-builder-blocks')}
					</p>

					<ColorPalette
						value={textColor}
						onChange={(color) => {
							setResponsiveValue(
								attributes,
								setAttributes,
								'textColor',
								device,
								color || ''
							);
						}}
						enableAlpha
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<a
					className="uplifters-site-builder-blocks-button-single uplifters-site-builder-blocks-button-single-editor-preview"
					href={attributes.url || '#'}
					style={buttonStyle}
					onClick={(event) => {
						event.preventDefault();
					}}
				>
					{text || __('Button', 'uplifters-site-builder-blocks')}
				</a>
			</div>
		</Fragment>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="button-single" /> : <Editor {...props} />;
}
