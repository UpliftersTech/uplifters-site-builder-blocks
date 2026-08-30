import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState, Fragment } from '@wordpress/element';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';

import {
	PanelBody,
	SelectControl,
	ToggleControl,
	ColorPalette,
	RangeControl,
	Notice,
} from '@wordpress/components';

import './editor.scss';

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

function setResponsiveValue(attributes, setAttributes, key, device, value) {
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

/**
 * Arrow markup. Kept in sync with the SVG builder in render.php so the editor
 * preview matches the frontend exactly.
 *
 * @param {Object} props       Component props.
 * @param {string} props.style Arrow style key.
 * @return {Element} SVG element.
 */
function ArrowIcon({ style }) {
	let path = (
		<path
			d="M12 19.5V6M5.5 12.5 12 6l6.5 6.5"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.4"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	);

	if (style === 'chevron') {
		path = (
			<path
				d="M5 15.5 12 8.5l7 7"
				fill="none"
				stroke="currentColor"
				strokeWidth="2.4"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		);
	}

	if (style === 'chevron-double') {
		path = (
			<path
				d="M5 12.5 12 5.5l7 7M5 19 12 12l7 7"
				fill="none"
				stroke="currentColor"
				strokeWidth="2.2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		);
	}

	if (style === 'triangle') {
		path = <path d="M12 5.5 20 18.5H4z" fill="currentColor" />;
	}

	return (
		<svg
			className="uplifters-scroll-to-top__icon-svg"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			focusable="false"
		>
			{path}
		</svg>
	);
}

function DeviceBadge({ device }) {
	let label = __('Desktop variant', 'uplifters-site-builder-blocks');

	if (device === 'tablet') {
		label = __('Tablet variant', 'uplifters-site-builder-blocks');
	}

	if (device === 'mobile') {
		label = __('Mobile variant', 'uplifters-site-builder-blocks');
	}

	return <div className="uplifters-scroll-to-top__device-badge">{label}</div>;
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

	const size = getResponsiveValue(attributes, 'size', device);
	const outlineWidth = getResponsiveValue(attributes, 'outlineWidth', device);
	const outlineColor = getResponsiveValue(attributes, 'outlineColor', device);
	const backgroundColor = getResponsiveValue(
		attributes,
		'backgroundColor',
		device
	);
	const arrowColor = getResponsiveValue(attributes, 'arrowColor', device);
	const arrowSize = getResponsiveValue(attributes, 'arrowSize', device);
	const offsetX = getResponsiveValue(attributes, 'offsetX', device);
	const offsetY = getResponsiveValue(attributes, 'offsetY', device);
	const hoverBackgroundColor = getResponsiveValue(
		attributes,
		'hoverBackgroundColor',
		device
	);
	const hoverOutlineColor = getResponsiveValue(
		attributes,
		'hoverOutlineColor',
		device
	);
	const hoverArrowColor = getResponsiveValue(
		attributes,
		'hoverArrowColor',
		device
	);

	const blockProps = useBlockProps({
		className: `uplifters-scroll-to-top-editor uplifters-scroll-to-top-editor--device-${device}`,
	});

	const placement = attributes.placement || 'bottom-right';

	const showAfter =
		typeof attributes.showAfter === 'number' ? attributes.showAfter : 300;

	const wrapperStyle = {
		'--uplifters-stt-offset-x': offsetX || '32px',
		'--uplifters-stt-offset-y': offsetY || '32px',
	};

	const buttonStyle = {
		'--uplifters-stt-size': size || '64px',
		'--uplifters-stt-outline-width': outlineWidth || '2px',
		'--uplifters-stt-outline-color': outlineColor || '#111827',
		'--uplifters-stt-background-color': backgroundColor || '#2563eb',
		'--uplifters-stt-arrow-color': arrowColor || '#ffffff',
		'--uplifters-stt-arrow-size': arrowSize || '22px',
		'--uplifters-stt-hover-background-color':
			hoverBackgroundColor || backgroundColor || '#2563eb',
		'--uplifters-stt-hover-outline-color':
			hoverOutlineColor || outlineColor || '#111827',
		'--uplifters-stt-hover-arrow-color':
			hoverArrowColor || arrowColor || '#ffffff',
	};

	return (
		<Fragment>
			<InspectorControls group="settings">
				<PanelBody
					title={__('Settings', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openSettingsPanel === 'settings'}
					onToggle={() => toggleSettingsPanel('settings')}
				>
					<SelectControl
						label={__('Placement', 'uplifters-site-builder-blocks')}
						value={attributes.placement || 'bottom-right'}
						options={[
							{
								label: __(
									'Bottom right',
									'uplifters-site-builder-blocks'
								),
								value: 'bottom-right',
							},
							{
								label: __(
									'Bottom left',
									'uplifters-site-builder-blocks'
								),
								value: 'bottom-left',
							},
							{
								label: __(
									'Top right',
									'uplifters-site-builder-blocks'
								),
								value: 'top-right',
							},
							{
								label: __(
									'Top left',
									'uplifters-site-builder-blocks'
								),
								value: 'top-left',
							},
						]}
						onChange={(value) => setAttributes({ placement: value })}
						help={__(
							'The button floats over the page in this corner.',
							'uplifters-site-builder-blocks'
						)}
					/>

					<ToggleControl
						label={__(
							'Hide before scrolling starts',
							'uplifters-site-builder-blocks'
						)}
						checked={!!attributes.hideAtStart}
						onChange={(value) =>
							setAttributes({ hideAtStart: value })
						}
					/>

					{!!attributes.hideAtStart && (
						<RangeControl
							label={__(
								'Show After Scrolling (px)',
								'uplifters-site-builder-blocks'
							)}
							value={
								typeof attributes.showAfter === 'number'
									? attributes.showAfter
									: 300
							}
							min={0}
							max={2000}
							step={10}
							onChange={(value) =>
								setAttributes({ showAfter: value ?? 0 })
							}
							help={__(
								'The button appears once the visitor has scrolled this far down.',
								'uplifters-site-builder-blocks'
							)}
						/>
					)}
				</PanelBody>

				<PanelBody
					title={__('Arrow Icon', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openSettingsPanel === 'arrow'}
					onToggle={() => toggleSettingsPanel('arrow')}
				>
					<SelectControl
						label={__('Arrow Style', 'uplifters-site-builder-blocks')}
						value={attributes.arrowStyle || 'arrow'}
						options={[
							{
								label: __(
									'Arrow',
									'uplifters-site-builder-blocks'
								),
								value: 'arrow',
							},
							{
								label: __(
									'Chevron',
									'uplifters-site-builder-blocks'
								),
								value: 'chevron',
							},
							{
								label: __(
									'Double chevron',
									'uplifters-site-builder-blocks'
								),
								value: 'chevron-double',
							},
							{
								label: __(
									'Triangle',
									'uplifters-site-builder-blocks'
								),
								value: 'triangle',
							},
						]}
						onChange={(value) =>
							setAttributes({ arrowStyle: value })
						}
					/>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={__('Dimensions', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'dimensions'}
					onToggle={() => toggleStylesPanel('dimensions')}
				>
					<DeviceBadge device={device} />

					<RangeControl
						label={__('Button Size', 'uplifters-site-builder-blocks')}
						value={getPxNumber(size, 64)}
						min={24}
						max={200}
						step={1}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'size',
								device,
								`${value}px`
							)
						}
						help={__(
							'This value is saved for the selected responsive variant.',
							'uplifters-site-builder-blocks'
						)}
					/>

					<RangeControl
						label={__(
							'Outline Thickness',
							'uplifters-site-builder-blocks'
						)}
						value={getPxNumber(outlineWidth, 2)}
						min={0}
						max={20}
						step={1}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'outlineWidth',
								device,
								`${value}px`
							)
						}
					/>

					<RangeControl
						label={__('Arrow Size', 'uplifters-site-builder-blocks')}
						value={getPxNumber(arrowSize, 22)}
						min={8}
						max={96}
						step={1}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'arrowSize',
								device,
								`${value}px`
							)
						}
					/>
				</PanelBody>

				<PanelBody
					title={__('Offset', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'offset'}
					onToggle={() => toggleStylesPanel('offset')}
				>
					<DeviceBadge device={device} />

					<RangeControl
						label={__(
							'Horizontal Offset',
							'uplifters-site-builder-blocks'
						)}
						value={getPxNumber(offsetX, 32)}
						min={0}
						max={200}
						step={1}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'offsetX',
								device,
								`${value}px`
							)
						}
					/>

					<RangeControl
						label={__(
							'Vertical Offset',
							'uplifters-site-builder-blocks'
						)}
						value={getPxNumber(offsetY, 32)}
						min={0}
						max={200}
						step={1}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'offsetY',
								device,
								`${value}px`
							)
						}
					/>
				</PanelBody>

				<PanelBody
					title={__('Colors', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'colors'}
					onToggle={() => toggleStylesPanel('colors')}
				>
					<DeviceBadge device={device} />

					<p className="uplifters-scroll-to-top__control-label">
						{__('Background Color', 'uplifters-site-builder-blocks')}
					</p>

					<ColorPalette
						value={
							backgroundColor === 'transparent'
								? undefined
								: backgroundColor
						}
						onChange={(color) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'backgroundColor',
								device,
								color || 'transparent'
							)
						}
						enableAlpha
					/>

					<hr />

					<p className="uplifters-scroll-to-top__control-label">
						{__('Arrow Color', 'uplifters-site-builder-blocks')}
					</p>

					<ColorPalette
						value={arrowColor}
						onChange={(color) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'arrowColor',
								device,
								color || ''
							)
						}
						enableAlpha
					/>

					<hr />

					<p className="uplifters-scroll-to-top__control-label">
						{__('Outline Color', 'uplifters-site-builder-blocks')}
					</p>

					<ColorPalette
						value={outlineColor}
						onChange={(color) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'outlineColor',
								device,
								color || ''
							)
						}
						enableAlpha
					/>
				</PanelBody>

				<PanelBody
					title={__('Hover Colors', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'hoverColors'}
					onToggle={() => toggleStylesPanel('hoverColors')}
				>
					<DeviceBadge device={device} />

					<p className="uplifters-scroll-to-top__control-label">
						{__(
							'Hover Background Color',
							'uplifters-site-builder-blocks'
						)}
					</p>

					<ColorPalette
						value={
							hoverBackgroundColor === 'transparent'
								? undefined
								: hoverBackgroundColor
						}
						onChange={(color) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'hoverBackgroundColor',
								device,
								color || 'transparent'
							)
						}
						enableAlpha
					/>

					<hr />

					<p className="uplifters-scroll-to-top__control-label">
						{__('Hover Arrow Color', 'uplifters-site-builder-blocks')}
					</p>

					<ColorPalette
						value={hoverArrowColor}
						onChange={(color) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'hoverArrowColor',
								device,
								color || ''
							)
						}
						enableAlpha
					/>

					<hr />

					<p className="uplifters-scroll-to-top__control-label">
						{__('Hover Outline Color', 'uplifters-site-builder-blocks')}
					</p>

					<ColorPalette
						value={hoverOutlineColor}
						onChange={(color) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'hoverOutlineColor',
								device,
								color || ''
							)
						}
						enableAlpha
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="uplifters-scroll-to-top-editor__preview">
					{/*
					 * The stage mimics a viewport: the real wrapper markup and
					 * class names are used so placement, offsets, colors and
					 * the hover state all preview exactly as they render on
					 * the frontend. Only `position: fixed` is swapped for
					 * `absolute` in editor.scss so the button stays inside the
					 * block instead of floating over the whole canvas.
					 */}
					<div className="uplifters-scroll-to-top-editor__stage">
						<div
							className={`uplifters-scroll-to-top-wrapper uplifters-scroll-to-top-wrapper--${placement}`}
							style={wrapperStyle}
						>
							<div
								className="uplifters-scroll-to-top"
								style={buttonStyle}
							>
								<span className="uplifters-scroll-to-top__icon">
									<ArrowIcon
										style={attributes.arrowStyle || 'arrow'}
									/>
								</span>
							</div>
						</div>

						<span className="uplifters-scroll-to-top-editor__stage-label">
							{__(
								'Preview viewport',
								'uplifters-site-builder-blocks'
							)}
						</span>
					</div>

					<Notice status="info" isDismissible={false}>
						{attributes.hideAtStart
							? sprintf(
									/* translators: %d: scroll distance in pixels. */
									__(
										'The button stays hidden until the visitor scrolls %dpx down, then floats in the chosen corner.',
										'uplifters-site-builder-blocks'
									),
									showAfter
							  )
							: __(
									'The button is visible as soon as the page loads and floats in the chosen corner.',
									'uplifters-site-builder-blocks'
							  )}
					</Notice>
				</div>
			</div>
		</Fragment>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="scroll-to-top" /> : <Editor {...props} />;
}
