import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from '@wordpress/i18n';

import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
	useSetting,
} from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	ToggleControl,
	ColorPalette,
} from '@wordpress/components';

import {
	useEffect,
	useState,
} from '@wordpress/element';

/**
 * Supported responsive device branches.
 */
const RESPONSIVE_DEVICES = [
	'desktop',
	'tablet',
	'mobile',
];

/**
 * Normalize a responsive-device value.
 *
 * @param {string} device Device value.
 * @return {string} Normalized device.
 */
const normalizeResponsiveDevice = (device) =>
	RESPONSIVE_DEVICES.includes(device)
		? device
		: 'desktop';

/**
 * Read the active device from the global responsive toolbar.
 *
 * @return {string} Current device.
 */
const getGlobalResponsiveDevice = () => {
	if (
		typeof window !== 'undefined' &&
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice === 'function'
	) {
		return normalizeResponsiveDevice(
			window.UpliftersSiteBuilderBlocksResponsive.getDevice()
		);
	}

	return 'desktop';
};

/**
 * Individual hook for the Global Responsive Device.
 *
 * The Popup Scroll Modal block does not provide its own Desktop, Tablet or Mobile
 * controls. It follows the device selected in the global floating
 * responsive toolbar.
 *
 * Supported integrations:
 *
 * window.UpliftersSiteBuilderBlocksResponsive.getDevice()
 * window.UpliftersSiteBuilderBlocksResponsive.subscribe()
 * uplifters-site-builder-blocks-responsive-device-change browser event
 *
 * @return {string} Active global device.
 */
const useGlobalResponsiveDevice = () => {
	const [device, setDevice] = useState(
		getGlobalResponsiveDevice
	);

	useEffect(() => {
		const handleDeviceChange = (eventOrDevice) => {
			const nextDevice =
				typeof eventOrDevice === 'string'
					? eventOrDevice
					: eventOrDevice?.detail?.device;

			setDevice(
				normalizeResponsiveDevice(
					nextDevice ||
						getGlobalResponsiveDevice()
				)
			);
		};

		window.addEventListener(
			'uplifters-site-builder-blocks-responsive-device-change',
			handleDeviceChange
		);

		let unsubscribe = null;

		if (
			window.UpliftersSiteBuilderBlocksResponsive &&
			typeof window.UpliftersSiteBuilderBlocksResponsive.subscribe ===
				'function'
		) {
			const subscription =
				window.UpliftersSiteBuilderBlocksResponsive.subscribe(
					handleDeviceChange
				);

			if (typeof subscription === 'function') {
				unsubscribe = subscription;
			}
		}

		handleDeviceChange();

		return () => {
			window.removeEventListener(
				'uplifters-site-builder-blocks-responsive-device-change',
				handleDeviceChange
			);

			if (unsubscribe) {
				unsubscribe();
			}
		};
	}, []);

	return device;
};

/**
 * Read one responsive attribute branch.
 *
 * Fallback order:
 * active device -> desktop -> tablet -> mobile -> fallback.
 *
 * Numeric zero and boolean false are treated as valid values.
 *
 * @param {Object} attributes Block attributes.
 * @param {string} key Attribute key.
 * @param {string} device Active responsive device.
 * @param {*} fallback Fallback value.
 * @return {*} Responsive value.
 */
const getResponsiveValue = (
	attributes,
	key,
	device,
	fallback
) => {
	const responsiveAttribute = attributes?.[key];

	if (
		responsiveAttribute &&
		typeof responsiveAttribute === 'object' &&
		!Array.isArray(responsiveAttribute)
	) {
		const branchOrder = [
			device,
			'desktop',
			'tablet',
			'mobile',
		];

		for (const branch of branchOrder) {
			if (
				Object.prototype.hasOwnProperty.call(
					responsiveAttribute,
					branch
				) &&
				responsiveAttribute[branch] !== undefined &&
				responsiveAttribute[branch] !== null
			) {
				return responsiveAttribute[branch];
			}
		}
	}

	return fallback;
};

/**
 * Update only the currently active responsive branch.
 *
 * @param {Object} attributes Block attributes.
 * @param {Function} setAttributes Gutenberg setter.
 * @param {string} key Attribute key.
 * @param {string} device Active responsive device.
 * @param {*} value New value.
 */
const setResponsiveValue = (
	attributes,
	setAttributes,
	key,
	device,
	value
) => {
	setAttributes({
		[key]: {
			...(attributes?.[key] || {}),
			[device]: value,
		},
	});
};

/**
 * Convert a hexadecimal color into rgba().
 *
 * @param {string} hex Hex color.
 * @param {number} opacityPercent Opacity from 0 to 100.
 * @return {string} RGBA color.
 */
const hexToRgba = (
	hex,
	opacityPercent
) => {
	let normalizedHex =
		typeof hex === 'string'
			? hex.trim().replace('#', '')
			: '000000';

	if (normalizedHex.length === 3) {
		normalizedHex = normalizedHex
			.split('')
			.map((character) => character + character)
			.join('');
	}

	if (
		!/^[a-fA-F0-9]{6}$/.test(normalizedHex)
	) {
		normalizedHex = '000000';
	}

	const red = Number.parseInt(
		normalizedHex.slice(0, 2),
		16
	);

	const green = Number.parseInt(
		normalizedHex.slice(2, 4),
		16
	);

	const blue = Number.parseInt(
		normalizedHex.slice(4, 6),
		16
	);

	const safeOpacity = Math.max(
		0,
		Math.min(
			100,
			Number(opacityPercent) || 0
		)
	);

	return `rgba(${red}, ${green}, ${blue}, ${
		safeOpacity / 100
	})`;
};

function Editor({
	attributes,
	setAttributes,
}) {
	const {
		oncePerPage = true,
	} = attributes;

	/**
	 * Use the Global Responsive Device hook.
	 */
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

	const scrollOffset = getResponsiveValue(
		attributes,
		'scrollOffset',
		device,
		device === 'mobile'
			? 200
			: device === 'tablet'
				? 250
				: 300
	);

	const overlayColor = getResponsiveValue(
		attributes,
		'overlayColor',
		device,
		'#000000'
	);

	const overlayOpacity = getResponsiveValue(
		attributes,
		'overlayOpacity',
		device,
		60
	);

	const palette = useSetting('color.palette');

	const blockProps = useBlockProps({
		className:
			`uplifters-site-builder-blocks-popup-scroll-modal-editor ` +
			`uplifters-site-builder-blocks-popup-scroll-modal-editor--${device}`,

		'data-responsive-device': device,

		style: {
			boxSizing: 'border-box',
		},
	});

	const previewWrapStyle = {
		position: 'relative',
		minHeight:
			device === 'mobile'
				? '360px'
				: device === 'tablet'
					? '390px'
					: '420px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding:
			device === 'mobile'
				? '12px'
				: device === 'tablet'
					? '18px'
					: '24px',
		borderRadius: '16px',
		overflow: 'hidden',
		background: '#f9fafb',
		border: '1px dashed #d1d5db',
		boxSizing: 'border-box',
	};

	const previewOverlayStyle = {
		position: 'absolute',
		inset: 0,
		backgroundColor: hexToRgba(
			overlayColor || '#000000',
			overlayOpacity ?? 60
		),
		borderRadius: '16px',
		pointerEvents: 'none',
	};

	const previewDialogStyle = {
		position: 'relative',
		zIndex: 2,
		width: '100%',
		maxWidth:
			device === 'mobile'
				? '100%'
				: device === 'tablet'
					? '620px'
					: '720px',
		background: '#ffffff',
		borderRadius:
			device === 'mobile'
				? '12px'
				: '16px',
		padding:
			device === 'mobile'
				? '18px'
				: '24px',
		boxShadow:
			'0 25px 50px -12px rgba(0, 0, 0, 0.25)',
		boxSizing: 'border-box',
	};

	const closeButtonStyle = {
		position: 'absolute',
		top:
			device === 'mobile'
				? '8px'
				: '12px',
		right:
			device === 'mobile'
				? '8px'
				: '12px',
		width:
			device === 'mobile'
				? '36px'
				: '40px',
		height:
			device === 'mobile'
				? '36px'
				: '40px',
		border: 0,
		borderRadius: '9999px',
		background: '#f3f4f6',
		color: '#111827',
		fontSize: '20px',
		lineHeight: 1,
		cursor: 'default',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 0,
	};

	const previewLabelStyle = {
		marginBottom: '12px',
		paddingRight: '48px',
		color: '#6b7280',
		fontSize: '14px',
		lineHeight: 1.4,
	};

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody
					title={__(
						'Behavior',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={openSettingsPanel === 'behavior'}
					onToggle={() => toggleSettingsPanel('behavior')}
				>
					<RangeControl
						label={__(
							'Show after scroll (px)',
							'uplifters-site-builder-blocks'
						)}
						value={
							Number(scrollOffset) || 0
						}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'scrollOffset',
								device,
								value ?? 300
							)
						}
						min={0}
						max={3000}
						step={10}
						withInputField={true}
						help={__(
							'This value is saved only for the active global responsive device.',
							'uplifters-site-builder-blocks'
						)}
					/>

					<ToggleControl
						label={__(
							'Show only once per page load',
							'uplifters-site-builder-blocks'
						)}
						checked={!!oncePerPage}
						onChange={(value) =>
							setAttributes({
								oncePerPage: !!value,
							})
						}
						help={__(
							'This setting applies to all devices.',
							'uplifters-site-builder-blocks'
						)}
					/>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={__(
						'Colors',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={openStylesPanel === 'overlay'}
					onToggle={() => toggleStylesPanel('overlay')}
				>
					<div
						style={{
							marginBottom: '16px',
						}}
					>
						<p
							style={{
								margin: '0 0 8px',
							}}
						>
							{__(
								'Overlay color',
								'uplifters-site-builder-blocks'
							)}
						</p>

						<ColorPalette
							colors={palette}
							value={
								overlayColor ||
								'#000000'
							}
							onChange={(value) =>
								setResponsiveValue(
									attributes,
									setAttributes,
									'overlayColor',
									device,
									value ||
										'#000000'
								)
							}
						 enableAlpha/>
					</div>

					<RangeControl
						label={__(
							'Overlay opacity (%)',
							'uplifters-site-builder-blocks'
						)}
						value={
							Number(
								overlayOpacity
							) || 0
						}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'overlayOpacity',
								device,
								value ?? 60
							)
						}
						min={0}
						max={100}
						step={1}
						withInputField={true}
						help={__(
							'This value is saved only for the active global responsive device.',
							'uplifters-site-builder-blocks'
						)}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div
					className="uplifters-site-builder-blocks-popup-scroll-modal-editor__preview"
					style={previewWrapStyle}
				>
					<div
						className="uplifters-site-builder-blocks-popup-scroll-modal-editor__overlay"
						style={previewOverlayStyle}
						aria-hidden="true"
					/>

					<div
						className="uplifters-site-builder-blocks-popup-scroll-modal-editor__dialog"
						style={previewDialogStyle}
					>
						<button
							type="button"
							disabled
							className="uplifters-site-builder-blocks-popup-scroll-modal-editor__close"
							style={closeButtonStyle}
							aria-label={__(
								'Close popup preview',
								'uplifters-site-builder-blocks'
							)}
						>
							×
						</button>

						<div
							className="uplifters-site-builder-blocks-popup-scroll-modal-editor__label"
							style={previewLabelStyle}
						>
							{__(
								'Centered modal preview',
								'uplifters-site-builder-blocks'
							)}
						</div>

						<div className="uplifters-site-builder-blocks-popup-scroll-modal-editor__content">
							<InnerBlocks
								template={[]}
								templateLock={false}
								renderAppender={
									InnerBlocks.ButtonBlockAppender
								}
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="popup-scroll-modal" /> : <Editor {...props} />;
}
