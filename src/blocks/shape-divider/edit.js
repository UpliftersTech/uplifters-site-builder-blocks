import './editor.scss';
import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';

import {
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';

import {
	PanelBody,
	SelectControl,
	RangeControl,
	ToggleControl,
	ColorPalette,
} from '@wordpress/components';

const RESPONSIVE_DEVICES = [
	'desktop',
	'tablet',
	'mobile',
];

const DEVICE_LABELS = {
	desktop: __('Desktop variant', 'uplifters-site-builder-blocks'),
	tablet: __('Tablet variant', 'uplifters-site-builder-blocks'),
	mobile: __('Mobile variant', 'uplifters-site-builder-blocks'),
};

const SHAPE_OPTIONS = [
	{
		label: __('Wave', 'uplifters-site-builder-blocks'),
		value: 'wave',
	},
	{
		label: __('Curve', 'uplifters-site-builder-blocks'),
		value: 'curve',
	},
	{
		label: __('Tilt', 'uplifters-site-builder-blocks'),
		value: 'tilt',
	},
	{
		label: __('Triangle', 'uplifters-site-builder-blocks'),
		value: 'triangle',
	},
	{
		label: __('Zigzag', 'uplifters-site-builder-blocks'),
		value: 'zigzag',
	},
	{
		label: __('Cloud', 'uplifters-site-builder-blocks'),
		value: 'cloud',
	},
	{
		label: __('Arc', 'uplifters-site-builder-blocks'),
		value: 'arc',
	},
	{
		label: __('Slope', 'uplifters-site-builder-blocks'),
		value: 'slope',
	},
	{
		label: __('Steps', 'uplifters-site-builder-blocks'),
		value: 'steps',
	},
	{
		label: __('Peak', 'uplifters-site-builder-blocks'),
		value: 'peak',
	},
];

const STYLE_OPTIONS = [
	{
		label: __('Fill', 'uplifters-site-builder-blocks'),
		value: 'fill',
	},
	{
		label: __('Soft', 'uplifters-site-builder-blocks'),
		value: 'soft',
	},
	{
		label: __('Sharp', 'uplifters-site-builder-blocks'),
		value: 'sharp',
	},
	{
		label: __('Outline', 'uplifters-site-builder-blocks'),
		value: 'outline',
	},
];

const LINE_STYLE_OPTIONS = [
	{
		label: __('Solid', 'uplifters-site-builder-blocks'),
		value: 'solid',
	},
	{
		label: __('Dashed', 'uplifters-site-builder-blocks'),
		value: 'dashed',
	},
	{
		label: __('Dotted', 'uplifters-site-builder-blocks'),
		value: 'dotted',
	},
	{
		label: __('Double', 'uplifters-site-builder-blocks'),
		value: 'double',
	},
];

const ALIGNMENT_OPTIONS = [
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
];

const COLOR_PALETTE = [
	{
		name: __('Sky', 'uplifters-site-builder-blocks'),
		color: '#0284c7',
	},
	{
		name: __('Blue', 'uplifters-site-builder-blocks'),
		color: '#2563eb',
	},
	{
		name: __('Indigo', 'uplifters-site-builder-blocks'),
		color: '#4f46e5',
	},
	{
		name: __('Violet', 'uplifters-site-builder-blocks'),
		color: '#7c3aed',
	},
	{
		name: __('Emerald', 'uplifters-site-builder-blocks'),
		color: '#059669',
	},
	{
		name: __('Rose', 'uplifters-site-builder-blocks'),
		color: '#e11d48',
	},
	{
		name: __('Slate', 'uplifters-site-builder-blocks'),
		color: '#475569',
	},
	{
		name: __('Black', 'uplifters-site-builder-blocks'),
		color: '#0f172a',
	},
];


function getCurrentGlobalResponsiveDevice() {
	if (typeof window === 'undefined') {
		return 'desktop';
	}

	if (
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice ===
			'function'
	) {
		const device =
			window.UpliftersSiteBuilderBlocksResponsive.getDevice();

		return RESPONSIVE_DEVICES.includes(device)
			? device
			: 'desktop';
	}

	return 'desktop';
}

/**
 * Individual hook for reading the global responsive device.
 */
function useGlobalResponsiveDevice() {
	const [device, setDevice] = useState(
		getCurrentGlobalResponsiveDevice
	);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return undefined;
		}

		function handleDeviceChange(event) {
			const eventDevice =
				event?.detail?.device;

			if (
				RESPONSIVE_DEVICES.includes(
					eventDevice
				)
			) {
				setDevice(eventDevice);
				return;
			}

			setDevice(
				getCurrentGlobalResponsiveDevice()
			);
		}

		handleDeviceChange();

		window.addEventListener(
			'uplifters-site-builder-blocks-responsive-device-change',
			handleDeviceChange
		);

		const interval = window.setInterval(() => {
			const nextDevice =
				getCurrentGlobalResponsiveDevice();

			setDevice((currentDevice) =>
				currentDevice === nextDevice
					? currentDevice
					: nextDevice
			);
		}, 500);

		return () => {
			window.removeEventListener(
				'uplifters-site-builder-blocks-responsive-device-change',
				handleDeviceChange
			);

			window.clearInterval(interval);
		};
	}, []);

	return device;
}

function getResponsiveValue(
	value,
	device,
	fallback = ''
) {
	if (
		value &&
		typeof value === 'object' &&
		!Array.isArray(value)
	) {
		if (
			value[device] !== undefined &&
			value[device] !== null
		) {
			return value[device];
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

	return value ?? fallback;
}

function setResponsiveValue(
	currentValue,
	device,
	nextValue
) {
	const responsiveObject =
		currentValue &&
		typeof currentValue === 'object' &&
		!Array.isArray(currentValue)
			? currentValue
			: {};

	return {
		...responsiveObject,
		[device]: nextValue,
	};
}

function DeviceBadge({ device }) {
	return (
		<div className="uplifters-site-builder-blocks-shape-divider-device-badge">
			{DEVICE_LABELS[device] ||
				DEVICE_LABELS.desktop}
		</div>
	);
}


function getShapePath(shapeType) {
	switch (shapeType) {
		case 'curve':
			return 'M0,45 C220,150 740,150 960,45 L960,160 L0,160 Z';

		case 'tilt':
			return 'M0,28 L960,128 L960,160 L0,160 Z';

		case 'triangle':
			return 'M0,160 L480,24 L960,160 Z';

		case 'zigzag':
			return 'M0,110 L80,50 L160,110 L240,50 L320,110 L400,50 L480,110 L560,50 L640,110 L720,50 L800,110 L880,50 L960,110 L960,160 L0,160 Z';

		case 'cloud':
			return 'M0,95 C40,65 85,65 120,95 C150,120 195,120 225,95 C260,65 305,65 340,95 C370,120 415,120 445,95 C480,65 525,65 560,95 C590,120 635,120 665,95 C700,65 745,65 780,95 C810,120 855,120 885,95 C910,75 935,72 960,88 L960,160 L0,160 Z';

		case 'arc':
			return 'M0,120 C180,20 780,20 960,120 L960,160 L0,160 Z';

		case 'slope':
			return 'M0,60 L960,130 L960,160 L0,160 Z';

		case 'steps':
			return 'M0,40 L160,40 L160,65 L320,65 L320,90 L480,90 L480,115 L640,115 L640,140 L800,140 L800,160 L0,160 Z';

		case 'peak':
			return 'M0,130 L160,90 L320,120 L480,35 L640,120 L800,80 L960,130 L960,160 L0,160 Z';

		case 'wave':
		default:
			return 'M0,72 C80,118 160,118 240,72 C320,26 400,26 480,72 C560,118 640,118 720,72 C800,26 880,26 960,72 L960,160 L0,160 Z';
	}
}

function DividerPreview({ mode, shapeType }) {
	if ('line' === mode) {
		return (
			<div className="uplifters-site-builder-blocks-shape-divider-editor__preview">
				<div className="uplifters-site-builder-blocks-shape-divider-editor__inner">
					<div
						className="uplifters-site-builder-blocks-shape-divider-editor__line"
						aria-hidden="true"
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="uplifters-site-builder-blocks-shape-divider-editor__preview">
			<svg
				className="uplifters-site-builder-blocks-shape-divider-editor__svg"
				viewBox="0 0 960 160"
				preserveAspectRatio="none"
				aria-hidden="true"
				focusable="false"
			>
				<path
					className="uplifters-site-builder-blocks-shape-divider-editor__path"
					d={getShapePath(shapeType)}
					fill="currentColor"
				/>
			</svg>
		</div>
	);
}

function Editor({
	attributes,
	setAttributes,
}) {
	const device =
		useGlobalResponsiveDevice();

	const dividerMode = getResponsiveValue(
		attributes.dividerMode,
		device,
		'shape'
	);

	const isLineMode = 'line' === dividerMode;

	const shapeType = getResponsiveValue(
		attributes.shapeType,
		device,
		'wave'
	);

	const dividerStyle = getResponsiveValue(
		attributes.dividerStyle,
		device,
		'fill'
	);

	const dividerColor = getResponsiveValue(
		attributes.dividerColor,
		device,
		'#0284c7'
	);

	const dividerOpacity = Number(
		getResponsiveValue(
			attributes.dividerOpacity,
			device,
			1
		)
	);

	const dividerHeight = Number(
		getResponsiveValue(
			attributes.dividerHeight,
			device,
			device === 'desktop'
				? 120
				: device === 'tablet'
					? 100
					: 80
		)
	);

	const dividerWidth = Number(
		getResponsiveValue(
			attributes.dividerWidth,
			device,
			100
		)
	);

	const flipHorizontal = Boolean(
		getResponsiveValue(
			attributes.flipHorizontal,
			device,
			false
		)
	);

	const flipVertical = Boolean(
		getResponsiveValue(
			attributes.flipVertical,
			device,
			false
		)
	);

	const separatorWidth = Number(
		getResponsiveValue(
			attributes.separatorWidth,
			device,
			100
		)
	);

	const separatorHeight = Number(
		getResponsiveValue(
			attributes.separatorHeight,
			device,
			2
		)
	);

	const separatorStyle = getResponsiveValue(
		attributes.separatorStyle,
		device,
		'solid'
	);

	const separatorColor = getResponsiveValue(
		attributes.separatorColor,
		device,
		'#cbd5e1'
	);

	const backgroundColor = getResponsiveValue(
		attributes.backgroundColor,
		device,
		'transparent'
	);

	const alignment = getResponsiveValue(
		attributes.alignment,
		device,
		'center'
	);

	const spacing = Number(
		getResponsiveValue(
			attributes.spacing,
			device,
			device === 'desktop'
				? 32
				: device === 'tablet'
					? 24
					: 20
		)
	);

	const updateResponsiveAttribute = (
		attributeName,
		value
	) => {
		setAttributes({
			[attributeName]:
				setResponsiveValue(
					attributes[
						attributeName
					],
					device,
					value
				),
		});
	};

	const [openStylesPanel, setOpenStylesPanel] =
		useState(null);

	const toggleStylesPanel = (key) => {
		setOpenStylesPanel((current) =>
			current === key ? null : key
		);

		if ('divider-type' === key) {
			updateResponsiveAttribute(
				'dividerMode',
				'shape'
			);
		}

		if ('line-style' === key) {
			updateResponsiveAttribute(
				'dividerMode',
				'line'
			);
		}
	};

	const justifyContentMap = {
		left: 'flex-start',
		center: 'center',
		right: 'flex-end',
	};

	const cssAlignment =
		justifyContentMap[alignment] ||
		'center';

	const separatorRadius =
		separatorStyle === 'solid'
			? '999px'
			: '0';

	const classNames = [
		'uplifters-site-builder-blocks-shape-divider-editor',
		`uplifters-site-builder-blocks-shape-divider-device-${device}`,
		`uplifters-site-builder-blocks-shape-divider-mode-${
			isLineMode ? 'line' : 'shape'
		}`,
		`is-style-${dividerStyle}`,
		flipHorizontal ? 'is-flip-x' : '',
		flipVertical ? 'is-flip-y' : '',
	]
		.filter(Boolean)
		.join(' ');

	const blockProps = useBlockProps({
		className: classNames,

		style: {
			'--uplifters-site-builder-blocks-shape-divider-color':
				dividerColor || '#0284c7',

			'--uplifters-site-builder-blocks-shape-divider-opacity':
				dividerOpacity,

			'--uplifters-site-builder-blocks-shape-divider-height':
				`${dividerHeight}px`,

			'--uplifters-site-builder-blocks-shape-divider-width':
				`${dividerWidth}%`,

			'--uplifters-site-builder-blocks-shape-divider-line-width':
				`${separatorWidth}%`,

			'--uplifters-site-builder-blocks-shape-divider-line-height':
				`${separatorHeight}px`,

			'--uplifters-site-builder-blocks-shape-divider-line-style':
				separatorStyle,

			'--uplifters-site-builder-blocks-shape-divider-line-color':
				separatorColor || '#cbd5e1',

			'--uplifters-site-builder-blocks-shape-divider-background-color':
				backgroundColor || 'transparent',

			'--uplifters-site-builder-blocks-shape-divider-alignment':
				cssAlignment,

			'--uplifters-site-builder-blocks-shape-divider-spacing':
				`${spacing}px`,

			'--uplifters-site-builder-blocks-shape-divider-radius':
				separatorRadius,
		},
	});

	return (
		<>

			<InspectorControls group="settings">
				<div aria-hidden="true" />
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={__(
						'Divider Type',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={openStylesPanel === 'divider-type'}
					onToggle={() =>
						toggleStylesPanel('divider-type')
					}
				>
					<DeviceBadge
						device={device}
					/>

					<p className="uplifters-site-builder-blocks-shape-divider-responsive-help">
						{__(
							'These controls update only the active device selected in the global responsive toolbar.',
							'uplifters-site-builder-blocks'
						)}
					</p>

					<SelectControl
						label={__(
							'Divider Type',
							'uplifters-site-builder-blocks'
						)}
						value={shapeType}
						options={SHAPE_OPTIONS}
						onChange={(value) => {
							updateResponsiveAttribute(
								'shapeType',
								value
							);
						}}
					/>

					<SelectControl
						label={__(
							'Divider Style',
							'uplifters-site-builder-blocks'
						)}
						value={dividerStyle}
						options={STYLE_OPTIONS}
						onChange={(value) => {
							updateResponsiveAttribute(
								'dividerStyle',
								value
							);
						}}
					/>

					<RangeControl
						label={__(
							'Height (px)',
							'uplifters-site-builder-blocks'
						)}
						value={dividerHeight}
						onChange={(value) => {
							updateResponsiveAttribute(
								'dividerHeight',
								Number(value) ||
									40
							);
						}}
						min={40}
						max={320}
						step={2}
						withInputField
					/>

					<RangeControl
						label={__(
							'Width (%)',
							'uplifters-site-builder-blocks'
						)}
						value={dividerWidth}
						onChange={(value) => {
							updateResponsiveAttribute(
								'dividerWidth',
								Number(value) ||
									40
							);
						}}
						min={40}
						max={100}
						step={1}
						withInputField
					/>

					<ToggleControl
						label={__(
							'Flip Horizontal',
							'uplifters-site-builder-blocks'
						)}
						checked={
							flipHorizontal
						}
						onChange={(value) => {
							updateResponsiveAttribute(
								'flipHorizontal',
								Boolean(value)
							);
						}}
					/>

					<ToggleControl
						label={__(
							'Flip Vertical',
							'uplifters-site-builder-blocks'
						)}
						checked={flipVertical}
						onChange={(value) => {
							updateResponsiveAttribute(
								'flipVertical',
								Boolean(value)
							);
						}}
					/>
				</PanelBody>

				<PanelBody
					title={__(
						'Line Style',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={openStylesPanel === 'line-style'}
					onToggle={() =>
						toggleStylesPanel('line-style')
					}
				>
					<DeviceBadge
						device={device}
					/>

					<p className="uplifters-site-builder-blocks-shape-divider-responsive-help">
						{__(
							'These controls update only the active device selected in the global responsive toolbar.',
							'uplifters-site-builder-blocks'
						)}
					</p>

					<SelectControl
						label={__(
							'Line Style',
							'uplifters-site-builder-blocks'
						)}
						value={separatorStyle}
						options={LINE_STYLE_OPTIONS}
						onChange={(value) => {
							updateResponsiveAttribute(
								'separatorStyle',
								value
							);
						}}
					/>

					<RangeControl
						label={__(
							'Thickness (px)',
							'uplifters-site-builder-blocks'
						)}
						value={separatorHeight}
						min={1}
						max={20}
						step={1}
						withInputField
						onChange={(value) => {
							updateResponsiveAttribute(
								'separatorHeight',
								Number(value) ||
									1
							);
						}}
					/>

					<RangeControl
						label={__(
							'Width (%)',
							'uplifters-site-builder-blocks'
						)}
						value={separatorWidth}
						min={5}
						max={100}
						step={1}
						withInputField
						onChange={(value) => {
							updateResponsiveAttribute(
								'separatorWidth',
								Number(value) ||
									5
							);
						}}
					/>

					<SelectControl
						label={__(
							'Alignment',
							'uplifters-site-builder-blocks'
						)}
						value={alignment}
						options={ALIGNMENT_OPTIONS}
						onChange={(value) => {
							updateResponsiveAttribute(
								'alignment',
								value
							);
						}}
					/>
				</PanelBody>

				<PanelBody
					title={__('Colors', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'colors'}
					onToggle={() =>
						toggleStylesPanel('colors')
					}
				>
					<DeviceBadge
						device={device}
					/>

					<p className="uplifters-site-builder-blocks-shape-divider-responsive-help">
						{__(
							'Colors are saved separately for the active responsive device and apply to the active layout.',
							'uplifters-site-builder-blocks'
						)}
					</p>

					<div className="components-base-control">
						<div className="components-base-control__label">
							{__(
								'Color',
								'uplifters-site-builder-blocks'
							)}
						</div>

						<ColorPalette
							colors={COLOR_PALETTE}
							value={
								isLineMode
									? separatorColor
									: dividerColor
							}
							onChange={(value) => {
								if (isLineMode) {
									updateResponsiveAttribute(
										'separatorColor',
										value ||
											'#cbd5e1'
									);

									return;
								}

								updateResponsiveAttribute(
									'dividerColor',
									value ||
										'#0284c7'
								);
							}}
							clearable={false}
						 enableAlpha/>
					</div>

					<div
						className="components-base-control"
						style={{
							marginTop:
								'16px',
						}}
					>
						<div className="components-base-control__label">
							{__(
								'Background Color',
								'uplifters-site-builder-blocks'
							)}
						</div>

						<ColorPalette
							colors={COLOR_PALETTE}
							value={
								backgroundColor ===
								'transparent'
									? undefined
									: backgroundColor
							}
							onChange={(value) => {
								updateResponsiveAttribute(
									'backgroundColor',
									value ||
										'transparent'
								);
							}}
							clearable
						 enableAlpha/>
					</div>

					<RangeControl
						label={__(
							'Opacity',
							'uplifters-site-builder-blocks'
						)}
						value={dividerOpacity}
						onChange={(value) => {
							updateResponsiveAttribute(
								'dividerOpacity',
								value ?? 1
							);
						}}
						min={0.1}
						max={1}
						step={0.05}
					/>
				</PanelBody>

				<PanelBody
					title={__(
						'Spacing',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={openStylesPanel === 'spacing'}
					onToggle={() =>
						toggleStylesPanel('spacing')
					}
				>
					<DeviceBadge
						device={device}
					/>

					<RangeControl
						label={__(
							'Vertical Spacing (px)',
							'uplifters-site-builder-blocks'
						)}
						value={spacing}
						min={0}
						max={200}
						step={4}
						allowReset
						resetFallbackValue={0}
						withInputField
						onChange={(value) => {
							updateResponsiveAttribute(
								'spacing',
								Number(value) ||
									0
							);
						}}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="uplifters-site-builder-blocks-shape-divider-editor__frame">
					<div className="uplifters-site-builder-blocks-shape-divider-editor__header">
						<div>
							<p className="uplifters-site-builder-blocks-shape-divider-editor__title">
								{__(
									'Shape Divider',
									'uplifters-site-builder-blocks'
								)}
							</p>

							<p className="uplifters-site-builder-blocks-shape-divider-editor__meta">
								{__(
									'Canvas preview is showing the active global responsive device.',
									'uplifters-site-builder-blocks'
								)}
							</p>
						</div>

						<DeviceBadge
							device={device}
						/>
					</div>

					<DividerPreview
						mode={dividerMode}
						shapeType={
							shapeType
						}
					/>

					<div className="uplifters-site-builder-blocks-shape-divider-editor__footer">
						<span className="uplifters-site-builder-blocks-shape-divider-editor__badge">
							{__(
								'Device:',
								'uplifters-site-builder-blocks'
							)}{' '}
							{device}
						</span>

						<span className="uplifters-site-builder-blocks-shape-divider-editor__badge">
							{__(
								'Layout:',
								'uplifters-site-builder-blocks'
							)}{' '}
							{isLineMode
								? __(
										'Line Style',
										'uplifters-site-builder-blocks'
								  )
								: __(
										'Divider Type',
										'uplifters-site-builder-blocks'
								  )}
						</span>

						{!isLineMode && (
							<span className="uplifters-site-builder-blocks-shape-divider-editor__badge">
								{__(
									'Type:',
									'uplifters-site-builder-blocks'
								)}{' '}
								{shapeType}
							</span>
						)}

						<span className="uplifters-site-builder-blocks-shape-divider-editor__badge">
							{__(
								'Style:',
								'uplifters-site-builder-blocks'
							)}{' '}
							{isLineMode
								? separatorStyle
								: dividerStyle}
						</span>

						<span className="uplifters-site-builder-blocks-shape-divider-editor__badge">
							{__(
								'Height:',
								'uplifters-site-builder-blocks'
							)}{' '}
							{isLineMode
								? separatorHeight
								: dividerHeight}
							px
						</span>

						<span className="uplifters-site-builder-blocks-shape-divider-editor__badge">
							{__(
								'Width:',
								'uplifters-site-builder-blocks'
							)}{' '}
							{isLineMode
								? separatorWidth
								: dividerWidth}
							%
						</span>

						{isLineMode && (
							<span className="uplifters-site-builder-blocks-shape-divider-editor__badge">
								{__(
									'Align:',
									'uplifters-site-builder-blocks'
								)}{' '}
								{alignment}
							</span>
						)}

						<span className="uplifters-site-builder-blocks-shape-divider-editor__badge">
							{__(
								'Spacing:',
								'uplifters-site-builder-blocks'
							)}{' '}
							{spacing}px
						</span>

						<span className="uplifters-site-builder-blocks-shape-divider-editor__badge">
							{__(
								'Opacity:',
								'uplifters-site-builder-blocks'
							)}{' '}
							{Math.round(
								dividerOpacity *
									100
							)}
							%
						</span>

						{!isLineMode && flipHorizontal ? (
							<span className="uplifters-site-builder-blocks-shape-divider-editor__badge">
								{__(
									'Flip X',
									'uplifters-site-builder-blocks'
								)}
							</span>
						) : null}

						{!isLineMode && flipVertical ? (
							<span className="uplifters-site-builder-blocks-shape-divider-editor__badge">
								{__(
									'Flip Y',
									'uplifters-site-builder-blocks'
								)}
							</span>
						) : null}
					</div>
				</div>
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="shape-divider" /> : <Editor {...props} />;
}
