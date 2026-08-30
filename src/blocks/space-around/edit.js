import './editor.scss';
import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from '@wordpress/i18n';
import {
	useEffect,
	useState,
} from '@wordpress/element';

import {
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
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


function getCurrentGlobalResponsiveDevice() {
	if (typeof window === 'undefined') {
		return 'desktop';
	}

	if (
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice ===
			'function'
	) {
		const currentDevice =
			window.UpliftersSiteBuilderBlocksResponsive.getDevice();

		if (
			RESPONSIVE_DEVICES.includes(
				currentDevice
			)
		) {
			return currentDevice;
		}
	}

	return 'desktop';
}

/**
 * Individual hook for consuming the active device from
 * the global floating responsive toolbar.
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

function normalizeNumber(value) {
	const number = Number(value);

	return Number.isFinite(number)
		? Math.max(0, number)
		: 0;
}

function getEditorWidthValue(width) {
	const normalizedWidth =
		normalizeNumber(width);

	return normalizedWidth > 0
		? `${normalizedWidth}px`
		: '100%';
}

function getEditorMinWidthValue(width) {
	const normalizedWidth =
		normalizeNumber(width);

	return normalizedWidth > 0
		? `${normalizedWidth}px`
		: '0';
}

function DeviceBadge({ device }) {
	return (
		<div className="uplifters-site-builder-blocks-space-around-device-badge">
			{DEVICE_LABELS[device] ||
				DEVICE_LABELS.desktop}
		</div>
	);
}


function Editor({
	attributes,
	setAttributes,
}) {
	const device =
		useGlobalResponsiveDevice();

	const height = normalizeNumber(
		getResponsiveValue(
			attributes.height,
			device,
			0
		)
	);

	const width = normalizeNumber(
		getResponsiveValue(
			attributes.width,
			device,
			0
		)
	);

	const backgroundColor =
		getResponsiveValue(
			attributes.backgroundColor,
			device,
			'transparent'
		);

	const labelColor = getResponsiveValue(
		attributes.labelColor,
		device,
		'#64748b'
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
	const toggleStylesPanel = (key) =>
		setOpenStylesPanel((current) =>
			current === key ? null : key
		);

	const blockProps = useBlockProps({
		className: [
			'uplifters-site-builder-blocks-space-around-editor',
			`uplifters-site-builder-blocks-space-around-device-${device}`,
		]
			.filter(Boolean)
			.join(' '),

		style: {
			'--uplifters-site-builder-blocks-space-around-bg':
				backgroundColor ||
				'transparent',

			'--uplifters-site-builder-blocks-space-around-label-color':
				labelColor || '#64748b',

			'--uplifters-site-builder-blocks-space-around-editor-height':
				`${height}px`,

			'--uplifters-site-builder-blocks-space-around-editor-width':
				getEditorWidthValue(width),

			'--uplifters-site-builder-blocks-space-around-editor-min-width':
				getEditorMinWidthValue(
					width
				),
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
						'Layout',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={openStylesPanel === 'layout'}
					onToggle={() =>
						toggleStylesPanel('layout')
					}
				>
					<DeviceBadge
						device={device}
					/>

					<p className="uplifters-site-builder-blocks-space-around-responsive-help">
						{__(
							'These controls update only the active device selected in the global responsive toolbar.',
							'uplifters-site-builder-blocks'
						)}
					</p>

					<RangeControl
						label={__(
							'Height (px)',
							'uplifters-site-builder-blocks'
						)}
						value={height}
						min={0}
						max={500}
						step={4}
						allowReset
						resetFallbackValue={0}
						withInputField
						onChange={(value) => {
							updateResponsiveAttribute(
								'height',
								normalizeNumber(
									value
								)
							);
						}}
					/>

					<RangeControl
						label={__(
							'Width (px)',
							'uplifters-site-builder-blocks'
						)}
						help={__(
							'Set to 0 to use the full available width.',
							'uplifters-site-builder-blocks'
						)}
						value={width}
						min={0}
						max={500}
						step={4}
						allowReset
						resetFallbackValue={0}
						withInputField
						onChange={(value) => {
							updateResponsiveAttribute(
								'width',
								normalizeNumber(
									value
								)
							);
						}}
					/>
				</PanelBody>

				<PanelBody
					title={__(
						'Colors',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={openStylesPanel === 'colors'}
					onToggle={() =>
						toggleStylesPanel('colors')
					}
				>
					<DeviceBadge
						device={device}
					/>

					<p className="uplifters-site-builder-blocks-space-around-responsive-help">
						{__(
							'Colors are saved separately for the active responsive device.',
							'uplifters-site-builder-blocks'
						)}
					</p>

					<div className="components-base-control">
						<div className="components-base-control__label">
							{__(
								'Background Color',
								'uplifters-site-builder-blocks'
							)}
						</div>

						<ColorPalette
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

					<div
						className="components-base-control"
						style={{
							marginTop:
								'16px',
						}}
					>
						<div className="components-base-control__label">
							{__(
								'Label Color',
								'uplifters-site-builder-blocks'
							)}
						</div>

						<ColorPalette
							value={labelColor}
							onChange={(value) => {
								updateResponsiveAttribute(
									'labelColor',
									value ||
										'#64748b'
								);
							}}
							clearable
						 enableAlpha/>
					</div>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div
					className="uplifters-site-builder-blocks-space-around-editor__overlay"
					aria-hidden="true"
				/>

				<div className="uplifters-site-builder-blocks-space-around-editor__content">
					<div className="uplifters-site-builder-blocks-space-around-editor__label">
						{`${DEVICE_LABELS[device]} — H: ${height}px / W: ${
							width > 0
								? `${width}px`
								: __('Full width', 'uplifters-site-builder-blocks')
						}`}
					</div>
				</div>
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="space-around" /> : <Editor {...props} />;
}
