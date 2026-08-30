import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';

import {
	PanelBody,
	ToggleControl,
	TextControl,
	Notice,
	RangeControl,
	ColorPalette,
} from '@wordpress/components';

import {
	useEffect,
	useState,
} from '@wordpress/element';

import './editor.scss';
import { FontFamilyControl, getFontFamilyCss } from '../../assets-shared/fonts-family/font-family-control';

const RESPONSIVE_DEVICES = [
	'desktop',
	'tablet',
	'mobile',
];

const normalizeResponsiveDevice = (device) => {
	const normalizedDevice = String(device || '')
		.toLowerCase()
		.trim();

	return RESPONSIVE_DEVICES.includes(normalizedDevice)
		? normalizedDevice
		: 'desktop';
};

const getCurrentGlobalResponsiveDevice = () => {
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
 * Reads the active device from the global responsive toolbar.
 *
 * This block does not render or control its own device selector.
 */
function useGlobalResponsiveDevice() {
	const [device, setDevice] = useState(
		getCurrentGlobalResponsiveDevice
	);

	useEffect(() => {
		const handleDeviceChange = (event) => {
			const eventDevice =
				event?.detail?.device;

			setDevice(
				eventDevice
					? normalizeResponsiveDevice(
							eventDevice
						)
					: getCurrentGlobalResponsiveDevice()
			);
		};

		window.addEventListener(
			'uplifters-site-builder-blocks-responsive-device-change',
			handleDeviceChange
		);

		const intervalId = window.setInterval(() => {
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

			window.clearInterval(intervalId);
		};
	}, []);

	return device;
}

const getResponsiveValue = (
	value,
	device,
	fallback = ''
) => {
	if (
		value &&
		typeof value === 'object' &&
		!Array.isArray(value)
	) {
		if (
			Object.prototype.hasOwnProperty.call(
				value,
				device
			)
		) {
			return value[device];
		}

		if (
			Object.prototype.hasOwnProperty.call(
				value,
				'desktop'
			)
		) {
			return value.desktop;
		}

		if (
			Object.prototype.hasOwnProperty.call(
				value,
				'tablet'
			)
		) {
			return value.tablet;
		}

		if (
			Object.prototype.hasOwnProperty.call(
				value,
				'mobile'
			)
		) {
			return value.mobile;
		}
	}

	/*
	 * Backward compatibility with old scalar attributes.
	 */
	if (
		value !== undefined &&
		value !== null &&
		typeof value !== 'object'
	) {
		return value;
	}

	return fallback;
};

const createResponsiveUpdate = (
	currentValue,
	device,
	nextValue
) => {
	const responsiveValue =
		currentValue &&
		typeof currentValue === 'object' &&
		!Array.isArray(currentValue)
			? currentValue
			: {};

	return {
		...responsiveValue,
		[device]: nextValue,
	};
};

const clampNumber = (
	value,
	minimum,
	maximum,
	fallback
) => {
	const number = Number(value);

	if (!Number.isFinite(number)) {
		return fallback;
	}

	return Math.min(
		maximum,
		Math.max(minimum, number)
	);
};


function Editor({
	attributes,
	setAttributes,
}) {
	const device = useGlobalResponsiveDevice();

	const {
		titleText = 'Leave a comment',
		buttonText = 'Send Comment',
		placeholder = 'Write your comment…',
		nameLabel = 'Name',
		emailLabel = 'Email',
		commentLabel = 'Comment',
		successText =
			'Thanks! Your comment has been submitted.',
		errorText =
			'Could not submit comment. Please try again.',
		requireNameEmail = true,
	} = attributes;

	const showNameEmail = Boolean(
		getResponsiveValue(
			attributes.showNameEmail,
			device,
			true
		)
	);

	const buttonBgColor = getResponsiveValue(
		attributes.buttonBgColor,
		device,
		'#111827'
	);

	const buttonHoverBgColor =
		getResponsiveValue(
			attributes.buttonHoverBgColor,
			device,
			'#0b1220'
		);

	const buttonTextColor = getResponsiveValue(
		attributes.buttonTextColor,
		device,
		'#ffffff'
	);

	const buttonRadius = clampNumber(
		getResponsiveValue(
			attributes.buttonRadius,
			device,
			12
		),
		0,
		40,
		12
	);

	const buttonPaddingX = clampNumber(
		getResponsiveValue(
			attributes.buttonPaddingX,
			device,
			16
		),
		0,
		40,
		16
	);

	const buttonPaddingY = clampNumber(
		getResponsiveValue(
			attributes.buttonPaddingY,
			device,
			10
		),
		0,
		30,
		10
	);

	const buttonMarginTop = clampNumber(
		getResponsiveValue(
			attributes.buttonMarginTop,
			device,
			0
		),
		0,
		40,
		0
	);

	const fontFamily = getResponsiveValue(
		attributes.fontFamily,
		device,
		'inherit'
	);

	const [
		openSettingsPanel,
		setOpenSettingsPanel,
	] = useState(null);

	const [
		openStylesPanel,
		setOpenStylesPanel,
	] = useState(null);

	const updateResponsiveAttribute = (
		attributeName,
		value
	) => {
		setAttributes({
			[attributeName]:
				createResponsiveUpdate(
					attributes[attributeName],
					device,
					value
				),
		});
	};

	const blockProps = useBlockProps({
		className: [
			'up2-posts-comment-form-block',
			`up2-posts-comment-form-block--device-${device}`,
		].join(' '),
	});

	const buttonStyle = {
		backgroundColor:
			buttonBgColor || '#111827',
		color:
			buttonTextColor || '#ffffff',
		borderRadius: `${buttonRadius}px`,
		paddingLeft: `${buttonPaddingX}px`,
		paddingRight: `${buttonPaddingX}px`,
		paddingTop: `${buttonPaddingY}px`,
		paddingBottom: `${buttonPaddingY}px`,
		marginTop: `${buttonMarginTop}px`,
	};

	return (
		<>

			<InspectorControls group="settings">
				<PanelBody
					title="Content"
					initialOpen={false}
					opened={
						openSettingsPanel ===
						'form-settings'
					}
					onToggle={() =>
						setOpenSettingsPanel(
							(current) =>
								current ===
								'form-settings'
									? null
									: 'form-settings'
						)
					}
				>
					<TextControl
						label="Title"
						value={titleText}
						onChange={(value) =>
							setAttributes({
								titleText: String(
									value ?? ''
								),
							})
						}
					/>

					<TextControl
						label="Button Text"
						value={buttonText}
						onChange={(value) =>
							setAttributes({
								buttonText: String(
									value ?? ''
								),
							})
						}
					/>

					<TextControl
						label="Textarea Placeholder"
						value={placeholder}
						onChange={(value) =>
							setAttributes({
								placeholder: String(
									value ?? ''
								),
							})
						}
					/>

					<ToggleControl
						label="Show Name + Email fields"
						checked={showNameEmail}
						onChange={(value) =>
							updateResponsiveAttribute(
								'showNameEmail',
								Boolean(value)
							)
						}
					/>

					<ToggleControl
						label="Require Name + Email (for guests)"
						checked={Boolean(
							requireNameEmail
						)}
						onChange={(value) =>
							setAttributes({
								requireNameEmail:
									Boolean(value),
							})
						}
						disabled={!showNameEmail}
					/>

					<TextControl
						label="Name Label"
						value={nameLabel}
						onChange={(value) =>
							setAttributes({
								nameLabel: String(
									value ?? ''
								),
							})
						}
						disabled={!showNameEmail}
					/>

					<TextControl
						label="Email Label"
						value={emailLabel}
						onChange={(value) =>
							setAttributes({
								emailLabel: String(
									value ?? ''
								),
							})
						}
						disabled={!showNameEmail}
					/>

					<TextControl
						label="Comment Label"
						value={commentLabel}
						onChange={(value) =>
							setAttributes({
								commentLabel: String(
									value ?? ''
								),
							})
						}
					/>

					<TextControl
						label="Success Text"
						value={successText}
						onChange={(value) =>
							setAttributes({
								successText: String(
									value ?? ''
								),
							})
						}
					/>

					<TextControl
						label="Error Text"
						value={errorText}
						onChange={(value) =>
							setAttributes({
								errorText: String(
									value ?? ''
								),
							})
						}
					/>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title="Button Style"
					initialOpen={false}
					opened={
						openStylesPanel ===
						'button-style'
					}
					onToggle={() =>
						setOpenStylesPanel(
							(current) =>
								current ===
								'button-style'
									? null
									: 'button-style'
						)
					}
				>
					<div className="up2-inspector-stack">
						<div className="up2-inspector-field">
							<div className="up2-inspector-label">
								Button Background
							</div>

							<ColorPalette
								value={buttonBgColor}
								onChange={(value) =>
									updateResponsiveAttribute(
										'buttonBgColor',
										value || ''
									)
								}
								clearable
							 enableAlpha/>
						</div>

						<div className="up2-inspector-field">
							<div className="up2-inspector-label">
								Button Hover Background
							</div>

							<ColorPalette
								value={
									buttonHoverBgColor
								}
								onChange={(value) =>
									updateResponsiveAttribute(
										'buttonHoverBgColor',
										value || ''
									)
								}
								clearable
							 enableAlpha/>
						</div>

						<div className="up2-inspector-field">
							<div className="up2-inspector-label">
								Button Text Color
							</div>

							<ColorPalette
								value={
									buttonTextColor
								}
								onChange={(value) =>
									updateResponsiveAttribute(
										'buttonTextColor',
										value || ''
									)
								}
								clearable
							 enableAlpha/>
						</div>

						<RangeControl
							label="Border Radius (px)"
							value={buttonRadius}
							onChange={(value) =>
								updateResponsiveAttribute(
									'buttonRadius',
									clampNumber(
										value,
										0,
										40,
										12
									)
								)
							}
							min={0}
							max={40}
						/>

						<RangeControl
							label="Padding X (px)"
							value={buttonPaddingX}
							onChange={(value) =>
								updateResponsiveAttribute(
									'buttonPaddingX',
									clampNumber(
										value,
										0,
										40,
										16
									)
								)
							}
							min={0}
							max={40}
						/>

						<RangeControl
							label="Padding Y (px)"
							value={buttonPaddingY}
							onChange={(value) =>
								updateResponsiveAttribute(
									'buttonPaddingY',
									clampNumber(
										value,
										0,
										30,
										10
									)
								)
							}
							min={0}
							max={30}
						/>

						<RangeControl
							label="Margin Top (px)"
							value={buttonMarginTop}
							onChange={(value) =>
								updateResponsiveAttribute(
									'buttonMarginTop',
									clampNumber(
										value,
										0,
										40,
										0
									)
								)
							}
							min={0}
							max={40}
						/>

						<FontFamilyControl
							label="Font Family"
							value={fontFamily}
							onChange={(value) =>
								updateResponsiveAttribute(
									'fontFamily',
									value
								)
							}
						/>
					</div>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div
					className="up2-editor-card"
					style={{
						fontFamily:
							getFontFamilyCss(
								fontFamily
							),
					}}
				>
					<div className="up2-editor-header">
						<h3 className="up2-editor-title">
							{titleText}
						</h3>
					</div>

					<Notice
						status="info"
						isDismissible={false}
					>
						Auto placement enabled. Add
						this block once; it will
						render automatically after
						post content on every
						single post view.
					</Notice>

					<Notice
						status="info"
						isDismissible={false}
					>
						Editor preview only. Real submit
						works on frontend using
						wp/v2/comments.
					</Notice>

					<div className="up2-editor-grid">
						{showNameEmail ? (
							<div className="up2-editor-row-two">
								<label className="up2-editor-label">
									<span className="up2-editor-label-text">
										{nameLabel}
									</span>

									<input
										className="up2-editor-input"
										type="text"
										disabled
										placeholder="John Doe"
									/>
								</label>

								<label className="up2-editor-label">
									<span className="up2-editor-label-text">
										{emailLabel}
									</span>

									<input
										className="up2-editor-input"
										type="email"
										disabled
										placeholder="you@example.com"
									/>
								</label>
							</div>
						) : null}

						<div
							className={
								showNameEmail
									? 'up2-editor-comment-wrap has-top-space'
									: 'up2-editor-comment-wrap'
							}
						>
							<label className="up2-editor-label">
								<span className="up2-editor-label-text">
									{commentLabel}
								</span>

								<textarea
									className="up2-editor-textarea"
									disabled
									placeholder={
										placeholder
									}
								/>
							</label>

							<div className="up2-editor-actions">
								<button
									type="button"
									className="up2-editor-button"
									style={
										buttonStyle
									}
									disabled
								>
									{buttonText}
								</button>

								<span className="up2-editor-help">
									Frontend-e
									single post ID auto
									detect kore submit
									korbe.
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="posts-comment-form" /> : <Editor {...props} />;
}