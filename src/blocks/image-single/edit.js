import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from '@wordpress/i18n';

import './editor.scss';
import { FontFamilyControl, getFontFamilyCss } from '../../assets-shared/fonts-family/font-family-control';

import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	BlockControls,
	RichText,
	useSetting,
} from '@wordpress/block-editor';

import {
	PanelBody,
	Button,
	SelectControl,
	TextControl,
	ToggleControl,
	ToolbarGroup,
	ToolbarButton,
	Placeholder,
	RangeControl,
	Flex,
	FlexBlock,
	FlexItem,
	ColorPalette,
} from '@wordpress/components';

import {
	useEffect,
	useMemo,
	useState,
} from '@wordpress/element';

import { useSelect } from '@wordpress/data';

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

/**
 * Read the active device selected in the global floating
 * responsive toolbar.
 */
function getCurrentGlobalResponsiveDevice() {
	if (
		typeof window !== 'undefined' &&
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice === 'function'
	) {
		const currentDevice =
			window.UpliftersSiteBuilderBlocksResponsive.getDevice();

		if (RESPONSIVE_DEVICES.includes(currentDevice)) {
			return currentDevice;
		}
	}

	return 'desktop';
}

/**
 * Global Responsive Editing Mode hook.
 *
 * The Image block does not provide its own desktop/tablet/mobile
 * switching interface. It only consumes the active device from
 * the global floating responsive toolbar.
 */
function useGlobalResponsiveDevice() {
	const [device, setDevice] = useState(
		getCurrentGlobalResponsiveDevice
	);

	useEffect(() => {
		function updateDevice(event) {
			const eventDevice = event?.detail?.device;

			if (RESPONSIVE_DEVICES.includes(eventDevice)) {
				setDevice(eventDevice);
				return;
			}

			setDevice(getCurrentGlobalResponsiveDevice());
		}

		updateDevice();

		if (typeof window === 'undefined') {
			return undefined;
		}

		window.addEventListener(
			'uplifters-site-builder-blocks-responsive-device-change',
			updateDevice
		);

		/*
		 * Polling keeps the block synchronized when the global
		 * toolbar changes its value without dispatching the event.
		 */
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
				updateDevice
			);

			window.clearInterval(interval);
		};
	}, []);

	return device;
}

/**
 * Read a responsive attribute value.
 *
 * Scalar support is retained so previously saved blocks that used
 * string values do not immediately lose their existing styles.
 */
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

/**
 * Update only the currently active responsive device branch.
 */
function setResponsiveValue(
	currentValue,
	device,
	nextValue
) {
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
}

function DeviceBadge({ device }) {
	return (
		<div className="uplifters-site-builder-blocks-image-single-device-badge">
			{DEVICE_LABELS[device] ||
				DEVICE_LABELS.desktop}
		</div>
	);
}

function pxToNumber(value, fallback = 0) {
	if (typeof value === 'number') {
		return value;
	}

	if (
		typeof value !== 'string' ||
		!value.trim()
	) {
		return fallback;
	}

	const parsedValue = Number.parseInt(
		value.replace('px', ''),
		10
	);

	return Number.isNaN(parsedValue)
		? fallback
		: parsedValue;
}

const SHADOW_PRESETS = [
	{
		label: __('None', 'uplifters-site-builder-blocks'),
		value: '',
	},
	{
		label: __('Soft', 'uplifters-site-builder-blocks'),
		value: '0 1px 2px rgba(0, 0, 0, 0.08)',
	},
	{
		label: __('Small', 'uplifters-site-builder-blocks'),
		value: '0 2px 6px rgba(0, 0, 0, 0.10)',
	},
	{
		label: __('Medium', 'uplifters-site-builder-blocks'),
		value: '0 8px 18px rgba(0, 0, 0, 0.14)',
	},
	{
		label: __('Large', 'uplifters-site-builder-blocks'),
		value: '0 16px 32px rgba(0, 0, 0, 0.16)',
	},
	{
		label: __('Extra Large', 'uplifters-site-builder-blocks'),
		value: '0 24px 48px rgba(0, 0, 0, 0.20)',
	},
	{
		label: __('Inner', 'uplifters-site-builder-blocks'),
		value: 'inset 0 2px 8px rgba(0, 0, 0, 0.12)',
	},
];

function getShadowPresetIndex(value) {
	const index = SHADOW_PRESETS.findIndex(
		(preset) => preset.value === (value || '')
	);

	return index >= 0 ? index : 0;
}

function buildCustomShadow(blur) {
	if (!blur || blur <= 0) {
		return '';
	}

	const verticalOffset = Math.max(
		1,
		Math.round(blur / 2)
	);

	return `0 ${verticalOffset}px ${blur}px rgba(0, 0, 0, 0.18)`;
}

function Editor({
	attributes,
	setAttributes,
}) {
	const {
		imageId,
		imageUrl,
		alt,
		caption,
		sizeSlug,
		objectFit,
		height,
		linkTo,
		customLink,
		openInNewTab,
		backgroundColor,
		padding,
		margin,
		boxShadow,
		borderRadius,
	} = attributes;

	const device = useGlobalResponsiveDevice();
	const [openSettingsPanel, setOpenSettingsPanel] =
		useState(null);
	const [openStylesPanel, setOpenStylesPanel] =
		useState(null);

	const palette = useSetting('color.palette');

	const currentObjectFit = getResponsiveValue(
		objectFit,
		device,
		'cover'
	);

	const currentHeight = getResponsiveValue(
		height,
		device,
		''
	);

	const currentBackgroundColor =
		getResponsiveValue(
			backgroundColor,
			device,
			''
		);

	const currentPadding = getResponsiveValue(
		padding,
		device,
		''
	);

	const currentMargin = getResponsiveValue(
		margin,
		device,
		''
	);

	const currentBoxShadow = getResponsiveValue(
		boxShadow,
		device,
		''
	);

	const currentBorderRadius =
		getResponsiveValue(
			borderRadius,
			device,
			''
		);

	const currentCaptionFontFamily =
		getResponsiveValue(
			attributes.captionFontFamily,
			device,
			'inherit'
		);

	const updateResponsiveAttribute = (
		attributeName,
		value
	) => {
		setAttributes({
			[attributeName]: setResponsiveValue(
				attributes[attributeName],
				device,
				value
			),
		});
	};

	const media = useSelect(
		(select) =>
			imageId
				? select('core').getMedia(imageId)
				: null,
		[imageId]
	);

	const sizeOptions = useMemo(() => {
		const options = [
			{
				label: __('Full', 'uplifters-site-builder-blocks'),
				value: 'full',
			},
		];

		const sizes =
			media?.media_details?.sizes;

		if (!sizes) {
			return options;
		}

		const preferredSizes = [
			'thumbnail',
			'medium',
			'medium_large',
			'large',
		];

		preferredSizes.forEach((slug) => {
			if (sizes?.[slug]) {
				options.push({
					label: slug,
					value: slug,
				});
			}
		});

		Object.keys(sizes).forEach((slug) => {
			if (slug === 'full') {
				return;
			}

			const optionExists = options.some(
				(option) =>
					option.value === slug
			);

			if (!optionExists) {
				options.push({
					label: slug,
					value: slug,
				});
			}
		});

		return options;
	}, [media]);

	useEffect(() => {
		if (!media) {
			return;
		}

		const sizes =
			media?.media_details?.sizes;

		let nextUrl =
			media?.source_url ||
			imageUrl ||
			'';

		if (
			sizeSlug &&
			sizeSlug !== 'full' &&
			sizes?.[sizeSlug]?.source_url
		) {
			nextUrl =
				sizes[sizeSlug].source_url;
		}

		const updates = {};

		if (nextUrl && nextUrl !== imageUrl) {
			updates.imageUrl = nextUrl;
		}

		if (!alt && media?.alt_text) {
			updates.alt = media.alt_text;
		}

		const rawCaption =
			typeof media?.caption?.raw ===
			'string'
				? media.caption.raw
				: typeof media?.caption ===
					  'string'
					? media.caption
					: '';

		if (!caption && rawCaption) {
			updates.caption = rawCaption;
		}

		if (Object.keys(updates).length) {
			setAttributes(updates);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [media, sizeSlug]);

	const onSelectImage = (selectedMedia) => {
		if (!selectedMedia) {
			return;
		}

		const pickedUrl =
			selectedMedia?.url ||
			selectedMedia?.source_url ||
			'';

		const pickedAlt =
			selectedMedia?.alt ||
			selectedMedia?.alt_text ||
			'';

		const pickedCaption =
			typeof selectedMedia?.caption?.raw ===
			'string'
				? selectedMedia.caption.raw
				: typeof selectedMedia?.caption ===
					  'string'
					? selectedMedia.caption
					: '';

		setAttributes({
			imageId: selectedMedia.id || 0,
			imageUrl: pickedUrl,
			alt: pickedAlt,
			caption: pickedCaption,
			sizeSlug: 'full',
		});
	};

	const onRemoveImage = () => {
		setAttributes({
			imageId: 0,
			imageUrl: '',
			alt: '',
			caption: '',
		});
	};

	const resolvedHref =
		linkTo === 'media'
			? imageUrl
			: linkTo === 'custom'
				? customLink || ''
				: '';

	const blockProps = useBlockProps({
		className: [
			'wp-block-uplifters-site-builder-blocks-image-single',
			`uplifters-site-builder-blocks-image-single-device-${device}`,
		]
			.filter(Boolean)
			.join(' '),

		style: {
			backgroundColor:
				currentBackgroundColor ||
				undefined,

			padding:
				currentPadding || undefined,

			margin:
				currentMargin || undefined,

			boxShadow:
				currentBoxShadow || undefined,

			borderRadius:
				currentBorderRadius ||
				undefined,

			overflow: currentBorderRadius
				? 'hidden'
				: undefined,

			'--uplifters-site-builder-blocks-image-single-object-fit':
				currentObjectFit || 'cover',

			'--uplifters-site-builder-blocks-image-single-height':
				currentHeight || 'auto',
		},
	});

	const currentShadowPresetIndex =
		getShadowPresetIndex(
			currentBoxShadow
		);

	const isCurrentShadowPreset =
		SHADOW_PRESETS.some(
			(preset) =>
				preset.value ===
				(currentBoxShadow || '')
		);

	const customShadowValue =
		isCurrentShadowPreset
			? 0
			: pxToNumber(
					currentBoxShadow,
					0
				);

	return (
		<>

			<InspectorControls group="settings">
				<PanelBody
					title={__(
						'Content',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={openSettingsPanel === 'image'}
					onToggle={() => {
						setOpenSettingsPanel(
							openSettingsPanel === 'image'
								? null
								: 'image'
						);
					}}
				>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={
								onSelectImage
							}
							allowedTypes={[
								'image',
							]}
							value={imageId}
							render={({
								open,
							}) => (
								<Button
									variant="primary"
									onClick={
										open
									}
									style={{
										marginBottom:
											'12px',
									}}
								>
									{imageUrl
										? __(
												'Replace Image',
												'uplifters-site-builder-blocks'
											)
										: __(
												'Select Image',
												'uplifters-site-builder-blocks'
											)}
								</Button>
							)}
						/>
					</MediaUploadCheck>

					{imageUrl ? (
						<Button
							variant="secondary"
							onClick={
								onRemoveImage
							}
							style={{
								marginLeft:
									'8px',
								marginBottom:
									'12px',
							}}
						>
							{__(
								'Remove',
								'uplifters-site-builder-blocks'
							)}
						</Button>
					) : null}

					<TextControl
						label={__(
							'Alt Text',
							'uplifters-site-builder-blocks'
						)}
						value={alt || ''}
						onChange={(value) => {
							setAttributes({
								alt: value,
							});
						}}
					/>

					<SelectControl
						label={__(
							'Image Size',
							'uplifters-site-builder-blocks'
						)}
						value={
							sizeSlug || 'full'
						}
						options={sizeOptions}
						onChange={(value) => {
							setAttributes({
								sizeSlug:
									value,
							});
						}}
						help={__(
							'If the selected size exists, the image URL updates automatically.',
							'uplifters-site-builder-blocks'
						)}
					/>

					<DeviceBadge
						device={device}
					/>

					<RangeControl
						label={__(
							'Image Height (px)',
							'uplifters-site-builder-blocks'
						)}
						value={pxToNumber(
							currentHeight,
							0
						)}
						onChange={(
							value
						) => {
							updateResponsiveAttribute(
								'height',
								value &&
									value >
										0
									? `${value}px`
									: ''
							);
						}}
						min={0}
						max={1000}
						step={1}
						allowReset
						resetFallbackValue={
							0
						}
						withInputField
						help={__(
							'Set to 0 for automatic height based on the image.',
							'uplifters-site-builder-blocks'
						)}
					/>

					<SelectControl
						label={__(
							'Link',
							'uplifters-site-builder-blocks'
						)}
						value={
							linkTo || 'none'
						}
						options={[
							{
								label: __(
									'None',
									'uplifters-site-builder-blocks'
								),
								value: 'none',
							},
							{
								label: __(
									'Media File',
									'uplifters-site-builder-blocks'
								),
								value: 'media',
							},
							{
								label: __(
									'Custom URL',
									'uplifters-site-builder-blocks'
								),
								value: 'custom',
							},
						]}
						onChange={(value) => {
							const updates = {
								linkTo: value,
							};

							if (
								value ===
								'none'
							) {
								updates.customLink =
									'';

								updates.openInNewTab =
									false;
							}

							setAttributes(
								updates
							);
						}}
					/>

					{linkTo === 'custom' ? (
						<TextControl
							label={__(
								'Custom URL',
								'uplifters-site-builder-blocks'
							)}
							value={
								customLink ||
								''
							}
							onChange={(
								value
							) => {
								setAttributes(
									{
										customLink:
											value,
									}
								);
							}}
							placeholder="https://"
						/>
					) : null}

					{linkTo !== 'none' ? (
						<ToggleControl
							label={__(
								'Open in new tab',
								'uplifters-site-builder-blocks'
							)}
							checked={
								!!openInNewTab
							}
							onChange={(
								value
							) => {
								setAttributes(
									{
										openInNewTab:
											!!value,
									}
								);
							}}
						/>
					) : null}
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={__(
						'Layout',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={
						openStylesPanel ===
						'layout'
					}
					onToggle={() => {
						setOpenStylesPanel(
							openStylesPanel ===
								'layout'
								? null
								: 'layout'
						);
					}}
				>
					<DeviceBadge
						device={device}
					/>

					<p className="uplifters-site-builder-blocks-image-single-responsive-help">
						{__(
							'Object fit is saved only for the active device selected in the global responsive toolbar.',
							'uplifters-site-builder-blocks'
						)}
					</p>

					<SelectControl
						label={__(
							'Object Fit',
							'uplifters-site-builder-blocks'
						)}
						value={
							currentObjectFit ||
							'cover'
						}
						options={[
							{
								label: __(
									'Cover',
									'uplifters-site-builder-blocks'
								),
								value: 'cover',
							},
							{
								label: __(
									'Contain',
									'uplifters-site-builder-blocks'
								),
								value: 'contain',
							},
							{
								label: __(
									'Fill',
									'uplifters-site-builder-blocks'
								),
								value: 'fill',
							},
							{
								label: __(
									'None',
									'uplifters-site-builder-blocks'
								),
								value: 'none',
							},
							{
								label: __(
									'Scale Down',
									'uplifters-site-builder-blocks'
								),
								value: 'scale-down',
							},
						]}
						onChange={(value) => {
							updateResponsiveAttribute(
								'objectFit',
								value
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
					opened={
						openStylesPanel ===
						'colors'
					}
					onToggle={() => {
						setOpenStylesPanel(
							openStylesPanel ===
								'colors'
								? null
								: 'colors'
						);
					}}
				>
					<div className="components-base-control">
						<div className="components-base-control__field">
							<div className="components-base-control__label">
								{__(
									'Background Color',
									'uplifters-site-builder-blocks'
								)}
							</div>

							<ColorPalette
								colors={
									palette
								}
								value={
									currentBackgroundColor ||
									undefined
								}
								onChange={(
									color
								) => {
									updateResponsiveAttribute(
										'backgroundColor',
										color ||
											''
									);
								}}
								disableCustomColors={
									false
								}
								clearable
							 enableAlpha/>
						</div>
					</div>
				</PanelBody>

				<PanelBody
					title={__(
						'Spacing',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={
						openStylesPanel ===
						'spacing'
					}
					onToggle={() => {
						setOpenStylesPanel(
							openStylesPanel ===
								'spacing'
								? null
								: 'spacing'
						);
					}}
				>
					<RangeControl
						label={__(
							'Padding',
							'uplifters-site-builder-blocks'
						)}
						value={pxToNumber(
							currentPadding,
							0
						)}
						onChange={(
							value
						) => {
							updateResponsiveAttribute(
								'padding',
								value &&
									value >
										0
									? `${value}px`
									: ''
							);
						}}
						min={0}
						max={200}
						step={1}
						allowReset
						resetFallbackValue={
							0
						}
						withInputField
					/>

					<RangeControl
						label={__(
							'Margin',
							'uplifters-site-builder-blocks'
						)}
						value={pxToNumber(
							currentMargin,
							0
						)}
						onChange={(
							value
						) => {
							updateResponsiveAttribute(
								'margin',
								value &&
									value >
										0
									? `${value}px`
									: ''
							);
						}}
						min={0}
						max={200}
						step={1}
						allowReset
						resetFallbackValue={
							0
						}
						withInputField
					/>
				</PanelBody>

				<PanelBody
					title={__(
						'Border & Shadow',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={
						openStylesPanel ===
						'border-shadow'
					}
					onToggle={() => {
						setOpenStylesPanel(
							openStylesPanel ===
								'border-shadow'
								? null
								: 'border-shadow'
						);
					}}
				>
					<RangeControl
						label={__(
							'Border Radius',
							'uplifters-site-builder-blocks'
						)}
						value={pxToNumber(
							currentBorderRadius,
							0
						)}
						onChange={(
							value
						) => {
							updateResponsiveAttribute(
								'borderRadius',
								value &&
									value >
										0
									? `${value}px`
									: ''
							);
						}}
						min={0}
						max={300}
						step={1}
						allowReset
						resetFallbackValue={
							0
						}
						withInputField
					/>

					<RangeControl
						label={__(
							'Preset',
							'uplifters-site-builder-blocks'
						)}
						value={
							currentShadowPresetIndex
						}
						onChange={(
							value
						) => {
							updateResponsiveAttribute(
								'boxShadow',
								SHADOW_PRESETS[
									value
								]
									?.value ??
									''
							);
						}}
						min={0}
						max={
							SHADOW_PRESETS.length -
							1
						}
						step={1}
						withInputField
					/>

					<Flex
						justify="flex-start"
						align="center"
						style={{
							marginTop:
								'8px',
							marginBottom:
								'16px',
						}}
					>
						<FlexItem>
							<strong>
								{__(
									'Selected:',
									'uplifters-site-builder-blocks'
								)}
							</strong>
						</FlexItem>

						<FlexBlock>
							{
								SHADOW_PRESETS[
									currentShadowPresetIndex
								]?.label
							}
						</FlexBlock>
					</Flex>

					<RangeControl
						label={__(
							'Custom Shadow Blur',
							'uplifters-site-builder-blocks'
						)}
						value={
							customShadowValue
						}
						onChange={(
							value
						) => {
							updateResponsiveAttribute(
								'boxShadow',
								buildCustomShadow(
									value
								)
							);
						}}
						min={0}
						max={100}
						step={1}
						allowReset
						resetFallbackValue={
							0
						}
						withInputField
					/>
				</PanelBody>

				<PanelBody
					title={__(
						'Typography',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={
						openStylesPanel ===
						'typography'
					}
					onToggle={() => {
						setOpenStylesPanel(
							openStylesPanel ===
								'typography'
								? null
								: 'typography'
						);
					}}
				>
					<FontFamilyControl
						label={__(
							'Caption Font Family',
							'uplifters-site-builder-blocks'
						)}
						value={
							currentCaptionFontFamily
						}
						onChange={(value) =>
							updateResponsiveAttribute(
								'captionFontFamily',
								value
							)
						}
					/>
				</PanelBody>
			</InspectorControls>

			{imageUrl ? (
				<BlockControls>
					<ToolbarGroup>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={
									onSelectImage
								}
								allowedTypes={[
									'image',
								]}
								value={
									imageId
								}
								render={({
									open,
								}) => (
									<ToolbarButton
										onClick={
											open
										}
									>
										{__(
											'Replace',
											'uplifters-site-builder-blocks'
										)}
									</ToolbarButton>
								)}
							/>
						</MediaUploadCheck>

						<ToolbarButton
							onClick={
								onRemoveImage
							}
							isDestructive
						>
							{__(
								'Remove',
								'uplifters-site-builder-blocks'
							)}
						</ToolbarButton>
					</ToolbarGroup>
				</BlockControls>
			) : null}

			<figure {...blockProps}>
				{!imageUrl ? (
					<Placeholder
						label={__(
							'Image',
							'uplifters-site-builder-blocks'
						)}
						instructions={__(
							'Select an image to start.',
							'uplifters-site-builder-blocks'
						)}
					>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={
									onSelectImage
								}
								allowedTypes={[
									'image',
								]}
								value={
									imageId
								}
								render={({
									open,
								}) => (
									<Button
										variant="primary"
										onClick={
											open
										}
									>
										{__(
											'Select Image',
											'uplifters-site-builder-blocks'
										)}
									</Button>
								)}
							/>
						</MediaUploadCheck>
					</Placeholder>
				) : (
					<>
						{resolvedHref ? (
							<a
								className="wp-block-uplifters-site-builder-blocks-image-single__link"
								href={
									resolvedHref
								}
								target={
									openInNewTab
										? '_blank'
										: undefined
								}
								rel={
									openInNewTab
										? 'noopener noreferrer'
										: undefined
								}
								onClick={(
									event
								) => {
									event.preventDefault();
								}}
							>
								<img
									className="wp-block-uplifters-site-builder-blocks-image-single__img"
									src={
										imageUrl
									}
									alt={
										alt ||
										''
									}
								/>
							</a>
						) : (
							<img
								className="wp-block-uplifters-site-builder-blocks-image-single__img"
								src={imageUrl}
								alt={
									alt || ''
								}
							/>
						)}

						<RichText
							tagName="figcaption"
							className="wp-block-uplifters-site-builder-blocks-image-single__caption"
							style={{
								fontFamily: getFontFamilyCss(
									currentCaptionFontFamily
								),
							}}
							value={caption}
							onChange={(
								value
							) => {
								setAttributes(
									{
										caption:
											value,
									}
								);
							}}
							placeholder={__(
								'Write caption…',
								'uplifters-site-builder-blocks'
							)}
							allowedFormats={
								[]
							}
						/>
					</>
				)}
			</figure>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="image-single" /> : <Editor {...props} />;
}
