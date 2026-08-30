import './editor.scss';
import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from "@wordpress/i18n";

import {
	useBlockProps,
	MediaUpload,
	InspectorControls,
	BlockControls,
	AlignmentToolbar,
	useSetting,
} from "@wordpress/block-editor";

import {
	PanelBody,
	Button,
	RangeControl,
	SelectControl,
	ToolbarGroup,
	ToolbarButton,
	TextareaControl,
	ColorPalette,
} from "@wordpress/components";

import {
	useEffect,
	useMemo,
	useState,
} from "@wordpress/element";
import { FontFamilyControl, getFontFamilyCss } from "../../assets-shared/fonts-family/font-family-control";

const RESPONSIVE_DEVICES = [
	"desktop",
	"tablet",
	"mobile",
];

const DEFAULT_CAPTION_STYLE = {
	size: "large",
	color: "#ffffff",
	weight: "normal",
	padding: "8px",
	fontFamily: "inherit",
};

function normalizeResponsiveDevice(device) {
	return RESPONSIVE_DEVICES.includes(device)
		? device
		: "desktop";
}

function getGlobalResponsiveDevice() {
	if (typeof window === "undefined") {
		return "desktop";
	}

	if (
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice === "function"
	) {
		return normalizeResponsiveDevice(
			window.UpliftersSiteBuilderBlocksResponsive.getDevice()
		);
	}

	if (
		typeof window.upliftersSiteBuilderBlocksResponsiveDevice === "string"
	) {
		return normalizeResponsiveDevice(
			window.upliftersSiteBuilderBlocksResponsiveDevice
		);
	}

	return "desktop";
}

/**
 * Individual Global Responsive Device hook.
 *
 * The block has no internal desktop/tablet/mobile selector.
 * It follows the floating global responsive toolbar.
 *
 * @return {string} Active responsive device.
 */
function useGlobalResponsiveDevice() {
	const [device, setDevice] = useState(
		getGlobalResponsiveDevice
	);

	useEffect(() => {
		if (typeof window === "undefined") {
			return undefined;
		}

		const handleDeviceChange = (event) => {
			const eventDevice =
				event?.detail?.device ||
				event?.detail?.deviceType ||
				event?.detail?.previewDeviceType;

			if (eventDevice) {
				setDevice(
					normalizeResponsiveDevice(
						eventDevice
					)
				);

				return;
			}

			setDevice(
				getGlobalResponsiveDevice()
			);
		};

		handleDeviceChange();

		window.addEventListener(
			"uplifters-site-builder-blocks-responsive-device-change",
			handleDeviceChange
		);

		window.addEventListener(
			"uplifters-site-builder-blocks-global-responsive-device-change",
			handleDeviceChange
		);

		const intervalId = window.setInterval(
			() => {
				const nextDevice =
					getGlobalResponsiveDevice();

				setDevice((currentDevice) =>
					currentDevice === nextDevice
						? currentDevice
						: nextDevice
				);
			},
			400
		);

		return () => {
			window.removeEventListener(
				"uplifters-site-builder-blocks-responsive-device-change",
				handleDeviceChange
			);

			window.removeEventListener(
				"uplifters-site-builder-blocks-global-responsive-device-change",
				handleDeviceChange
			);

			window.clearInterval(intervalId);
		};
	}, []);

	return device;
}

function isResponsiveObject(value) {
	return (
		value !== null &&
		typeof value === "object" &&
		!Array.isArray(value)
	);
}

function hasResponsiveValue(value) {
	return (
		value !== undefined &&
		value !== null &&
		value !== ""
	);
}

function getResponsiveValue(
	value,
	device,
	fallback = ""
) {
	if (!isResponsiveObject(value)) {
		return hasResponsiveValue(value)
			? value
			: fallback;
	}

	if (hasResponsiveValue(value[device])) {
		return value[device];
	}

	if (hasResponsiveValue(value.desktop)) {
		return value.desktop;
	}

	if (hasResponsiveValue(value.tablet)) {
		return value.tablet;
	}

	if (hasResponsiveValue(value.mobile)) {
		return value.mobile;
	}

	return fallback;
}

function setResponsiveValue(
	currentValue,
	device,
	nextValue
) {
	const existingValue = isResponsiveObject(
		currentValue
	)
		? currentValue
		: {};

	return {
		...existingValue,
		[device]: nextValue,
	};
}

function normalizeCaptionSize(size) {
	const map = {
		"text-sm": "small",
		"text-base": "normal",
		"text-lg": "large",
		"text-xl": "xl",
		small: "small",
		normal: "normal",
		large: "large",
		xl: "xl",
	};

	return map[size] || "large";
}

function normalizeCaptionWeight(weight) {
	const map = {
		"font-normal": "normal",
		"font-medium": "medium",
		"font-semibold": "semibold",
		"font-bold": "bold",
		normal: "normal",
		medium: "medium",
		semibold: "semibold",
		bold: "bold",
	};

	return map[weight] || "normal";
}

function normalizePadding(padding) {
	const map = {
		"p-0": "0",
		"p-1": "4px",
		"p-2": "8px",
		"p-3": "12px",
		"p-4": "16px",
	};

	return map[padding] || padding || "8px";
}

function normalizeImage(image) {
	const captionStyle =
		image?.captionStyle || {};

	return {
		id: image?.id || 0,
		url: image?.url || "",
		caption: image?.caption || "",
		captionStyle: {
			...DEFAULT_CAPTION_STYLE,
			...captionStyle,
			size: normalizeCaptionSize(
				captionStyle.size
			),
			weight: normalizeCaptionWeight(
				captionStyle.weight
			),
			padding: normalizePadding(
				captionStyle.padding
			),
		},
	};
}

function hexToRgba(hex, alpha) {
	if (!hex || typeof hex !== "string") {
		return null;
	}

	const normalizedHex = hex.trim();

	const isShort =
		/^#([0-9a-fA-F]{3})$/.test(
			normalizedHex
		);

	const isLong =
		/^#([0-9a-fA-F]{6})$/.test(
			normalizedHex
		);

	if (!isShort && !isLong) {
		return null;
	}

	let red;
	let green;
	let blue;

	if (isShort) {
		red = parseInt(
			normalizedHex[1] +
				normalizedHex[1],
			16
		);

		green = parseInt(
			normalizedHex[2] +
				normalizedHex[2],
			16
		);

		blue = parseInt(
			normalizedHex[3] +
				normalizedHex[3],
			16
		);
	} else {
		red = parseInt(
			normalizedHex.slice(1, 3),
			16
		);

		green = parseInt(
			normalizedHex.slice(3, 5),
			16
		);

		blue = parseInt(
			normalizedHex.slice(5, 7),
			16
		);
	}

	return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function clampInt(
	number,
	min,
	max,
	fallback
) {
	const parsedNumber = parseInt(
		number,
		10
	);

	if (Number.isNaN(parsedNumber)) {
		return fallback;
	}

	return Math.max(
		min,
		Math.min(max, parsedNumber)
	);
}

function getCaptionFontSize(size) {
	const map = {
		small: "14px",
		normal: "16px",
		large: "18px",
		xl: "20px",
	};

	return (
		map[normalizeCaptionSize(size)] ||
		"18px"
	);
}

function getCaptionFontWeight(weight) {
	const map = {
		normal: 400,
		medium: 500,
		semibold: 600,
		bold: 700,
	};

	return (
		map[normalizeCaptionWeight(weight)] ||
		400
	);
}


function Editor({
	attributes,
	setAttributes,
}) {
	const {
		images = [],
		height,
		duration,
		columns,
		indicatorColor,
		backgroundColor,
	} = attributes;

	const device =
		useGlobalResponsiveDevice();

	const themePalette =
		useSetting("color.palette") ||
		undefined;

	const normalizedImages = useMemo(
		() =>
			Array.isArray(images)
				? images.map(normalizeImage)
				: [],
		[images]
	);

	const [
		selectedImageIndex,
		setSelectedImageIndex,
	] = useState(
		normalizedImages.length ? 0 : null
	);

	const [
		openSettingsPanel,
		setOpenSettingsPanel,
	] = useState(null);

	const [
		openStylesPanel,
		setOpenStylesPanel,
	] = useState(null);

	const legacyColumnsFallback =
		device === "mobile"
			? attributes.colsMobile ?? 1
			: device === "tablet"
				? attributes.colsTablet ?? 2
				: attributes.colsDesktop ?? 3;

	const currentHeight = clampInt(
		getResponsiveValue(
			height,
			device,
			device === "mobile"
				? 340
				: device === "tablet"
					? 420
					: 500
		),
		200,
		1000,
		500
	);

	const currentDuration = clampInt(
		getResponsiveValue(
			duration,
			device,
			3000
		),
		1000,
		10000,
		3000
	);

	const currentColumns = clampInt(
		getResponsiveValue(
			columns,
			device,
			legacyColumnsFallback
		),
		1,
		6,
		1
	);

	const currentIndicatorColor =
		getResponsiveValue(
			indicatorColor,
			device,
			"#ffffff"
		) || "#ffffff";

	const currentBackgroundColor =
		getResponsiveValue(
			backgroundColor,
			device,
			""
		) || "";

	useEffect(() => {
		const normalized = Array.isArray(
			images
		)
			? images.map(normalizeImage)
			: [];

		if (
			JSON.stringify(images) !==
			JSON.stringify(normalized)
		) {
			setAttributes({
				images: normalized,
			});
		}

		// Initial legacy normalization only.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!normalizedImages.length) {
			if (selectedImageIndex !== null) {
				setSelectedImageIndex(null);
			}

			return;
		}

		if (selectedImageIndex === null) {
			return;
		}

		if (
			selectedImageIndex >
			normalizedImages.length - 1
		) {
			setSelectedImageIndex(
				normalizedImages.length - 1
			);
		}
	}, [
		normalizedImages.length,
		selectedImageIndex,
	]);

	const updateResponsiveAttribute = (
		attributeName,
		nextValue
	) => {
		setAttributes({
			[attributeName]:
				setResponsiveValue(
					attributes[attributeName],
					device,
					nextValue
				),
		});
	};

	const blockProps = useBlockProps({
		className:
			`uplifters-site-builder-blocks-image-interval-cover-editor ` +
			`uplifters-site-builder-blocks-image-interval-cover-editor-device-${device}`,

		"data-responsive-device": device,

		style: {
			backgroundColor:
				currentBackgroundColor ||
				undefined,

			"--uplifters-site-builder-blocks-image-interval-cover-editor-columns":
				currentColumns,
		},
	});

	const updateImage = (
		index,
		key,
		value
	) => {
		const newImages = [
			...normalizedImages,
		];

		newImages[index] = {
			...newImages[index],
			[key]: value,
		};

		setAttributes({
			images: newImages,
		});
	};

	const updateImageMedia = (
		index,
		media
	) => {
		const newImages = [
			...normalizedImages,
		];

		newImages[index] = {
			...newImages[index],
			id: media?.id || 0,
			url: media?.url || "",
		};

		setAttributes({
			images: newImages,
		});
	};

	const appendSelectedMedia = (media) => {
		const selectedMedia = Array.isArray(media)
			? media
			: media
				? [media]
				: [];

		if (!selectedMedia.length) {
			return;
		}

		const newImages = [
			...normalizedImages,
			...selectedMedia.map((item) =>
				normalizeImage({
					id: item?.id || 0,
					url: item?.url || "",
					caption:
						item?.caption ||
						item?.title ||
						"",
				})
			),
		];

		setAttributes({
			images: newImages,
		});

		setSelectedImageIndex(
			normalizedImages.length
		);

		setOpenSettingsPanel(
			`image-${normalizedImages.length}`
		);
	};

	const updateCaptionStyle = (
		index,
		patch
	) => {
		const newImages = [
			...normalizedImages,
		];

		newImages[index] = {
			...newImages[index],
			captionStyle: {
				...newImages[index]
					.captionStyle,
				...patch,
			},
		};

		setAttributes({
			images: newImages,
		});
	};

	const addImage = () => {
		const newImages = [
			...normalizedImages,
			{
				id: 0,
				url: "",
				caption: "",
				captionStyle: {
					...DEFAULT_CAPTION_STYLE,
				},
			},
		];

		setAttributes({
			images: newImages,
		});

		setSelectedImageIndex(
			newImages.length - 1
		);

		setOpenSettingsPanel(
			`image-${newImages.length - 1}`
		);
	};

	const removeImage = (index) => {
		const newImages = [
			...normalizedImages,
		];

		newImages.splice(index, 1);

		setAttributes({
			images: newImages,
		});

		if (!newImages.length) {
			setSelectedImageIndex(null);
		} else if (
			selectedImageIndex === index
		) {
			setSelectedImageIndex(null);
		} else if (
			selectedImageIndex !== null &&
			selectedImageIndex > index
		) {
			setSelectedImageIndex(
				selectedImageIndex - 1
			);
		}
	};

	const toggleSettingsPanel = (
		panelKey
	) => {
		setOpenSettingsPanel(
			(current) =>
				current === panelKey
					? null
					: panelKey
		);
	};

	const toggleStylesPanel = (
		panelKey
	) => {
		setOpenStylesPanel(
			(current) =>
				current === panelKey
					? null
					: panelKey
		);
	};

	const DotBar = ({
		activeIndex,
		count,
		onSelect,
	}) => {
		if (!count || count <= 1) {
			return null;
		}

		const active =
			currentIndicatorColor ||
			"#ffffff";

		const inactive =
			hexToRgba(active, 0.45) ||
			"rgba(255, 255, 255, 0.45)";

		return (
			<div className="uplifters-site-builder-blocks-image-interval-cover-editor__dots">
				{Array.from({
					length: count,
				}).map((_, index) => {
					const isActive =
						index === activeIndex;

					return (
						<button
							key={index}
							type="button"
							className={
								`uplifters-site-builder-blocks-image-interval-cover-editor__dot` +
								(isActive
									? " is-active"
									: "")
							}
							onClick={(event) => {
								event.stopPropagation();
								onSelect(index);
							}}
							aria-label={`${__(
								"Go to slide",
								"uplifters-site-builder-blocks"
							)} ${index + 1}`}
							style={{
								background: isActive
									? active
									: inactive,
							}}
						/>
					);
				})}
			</div>
		);
	};

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon="plus"
						label={__(
							"Add Image",
							"uplifters-site-builder-blocks"
						)}
						onClick={addImage}
					/>

					<AlignmentToolbar
						value={attributes.align}
						onChange={(newAlign) =>
							setAttributes({
								align: newAlign,
							})
						}
					/>
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls group="settings">
				<PanelBody
					title={__(
						"Behavior",
						"uplifters-site-builder-blocks"
					)}
					initialOpen={false}
					opened={
						openSettingsPanel ===
						"carousel"
					}
					onToggle={() =>
						toggleSettingsPanel(
							"carousel"
						)
					}
				>
					<RangeControl
						label={__(
							"Slide Duration (ms)",
							"uplifters-site-builder-blocks"
						)}
						value={currentDuration}
						onChange={(value) =>
							updateResponsiveAttribute(
								"duration",
								clampInt(
									value,
									1000,
									10000,
									3000
								)
							)
						}
						min={1000}
						max={10000}
						step={100}
						help={__(
							"Updates only the active global responsive device.",
							"uplifters-site-builder-blocks"
						)}
					/>
				</PanelBody>

				{normalizedImages.map(
					(image, index) => {
						const panelKey = `image-${index}`;
						const isSelected =
							openSettingsPanel ===
							panelKey;

						return (
							<PanelBody
								key={panelKey}
								title={
									`${__(
										"Image",
										"uplifters-site-builder-blocks"
									)} ${index + 1}` +
									(isSelected
										? ` ${__(
												"(Selected)",
												"uplifters-site-builder-blocks"
											)}`
										: "")
								}
								initialOpen={false}
								opened={isSelected}
								onToggle={() =>
									toggleSettingsPanel(
										panelKey
									)
								}
							>
								<MediaUpload
									onSelect={(media) =>
										updateImageMedia(
											index,
											media
										)
									}
									allowedTypes={[
										"image",
									]}
									value={
										image.id ||
										undefined
									}
									render={({
										open,
									}) => (
										<Button
											onClick={
												open
											}
											variant="primary"
											style={{
												width: "100%",
											}}
										>
											{image.url
												? __(
														"Change Image",
														"uplifters-site-builder-blocks"
													)
												: __(
														"Upload Image",
														"uplifters-site-builder-blocks"
													)}
										</Button>
									)}
								/>

								<div
									style={{
										marginTop: 10,
										display: "flex",
										gap: 8,
									}}
								>
									<Button
										onClick={() =>
											removeImage(
												index
											)
										}
										variant="secondary"
										isDestructive
									>
										{__(
											"Remove",
											"uplifters-site-builder-blocks"
										)}
									</Button>

									<Button
										onClick={() =>
											toggleSettingsPanel(
												panelKey
											)
										}
										variant="secondary"
									>
										{isSelected
											? __(
													"Close This Image",
													"uplifters-site-builder-blocks"
												)
											: __(
													"Edit This Image",
													"uplifters-site-builder-blocks"
												)}
									</Button>
								</div>

								<div
									style={{
										marginTop: 14,
									}}
								>
									<TextareaControl
										label={__(
											"Caption",
											"uplifters-site-builder-blocks"
										)}
										placeholder={__(
											"Write caption...",
											"uplifters-site-builder-blocks"
										)}
										value={
											image.caption
										}
										onChange={(
											value
										) =>
											updateImage(
												index,
												"caption",
												value
											)
										}
										rows={5}
									/>
								</div>
							</PanelBody>
						);
					}
				)}

				<div
					style={{
						marginTop: 12,
					}}
				>
					<Button
						variant="primary"
						onClick={addImage}
						style={{
							width: "100%",
						}}
					>
						{__(
							"Add More",
							"uplifters-site-builder-blocks"
						)}
					</Button>
				</div>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={__(
						"Layout",
						"uplifters-site-builder-blocks"
					)}
					initialOpen={false}
					opened={
						openStylesPanel ===
						"layout"
					}
					onToggle={() =>
						toggleStylesPanel(
							"layout"
						)
					}
				>
					<RangeControl
						label={__(
							"Carousel Height",
							"uplifters-site-builder-blocks"
						)}
						value={currentHeight}
						onChange={(value) =>
							updateResponsiveAttribute(
								"height",
								clampInt(
									value,
									200,
									1000,
									500
								)
							)
						}
						min={200}
						max={1000}
						step={1}
						help={__(
							"Updates only the active global responsive device.",
							"uplifters-site-builder-blocks"
						)}
					/>

					<RangeControl
						label={__(
							"Visible Columns",
							"uplifters-site-builder-blocks"
						)}
						value={currentColumns}
						onChange={(value) =>
							updateResponsiveAttribute(
								"columns",
								clampInt(
									value,
									1,
									6,
									1
								)
							)
						}
						min={1}
						max={6}
						step={1}
						help={__(
							"Updates only the active global responsive device.",
							"uplifters-site-builder-blocks"
						)}
					/>
				</PanelBody>

				{normalizedImages.map(
					(image, index) => {
						const panelKey = `image-${index}`;
						const isSelected =
							openStylesPanel ===
							panelKey;

						return (
							<PanelBody
								key={panelKey}
								title={
									`${__(
										"Image",
										"uplifters-site-builder-blocks"
									)} ${index + 1} ${__(
										"Style",
										"uplifters-site-builder-blocks"
									)}`
								}
								initialOpen={false}
								opened={isSelected}
								onToggle={() =>
									toggleStylesPanel(
										panelKey
									)
								}
							>
								<SelectControl
									label={__(
										"Caption Size",
										"uplifters-site-builder-blocks"
									)}
									value={
										image
											.captionStyle
											.size
									}
									options={[
										{
											label: __(
												"Small",
												"uplifters-site-builder-blocks"
											),
											value: "small",
										},
										{
											label: __(
												"Normal",
												"uplifters-site-builder-blocks"
											),
											value: "normal",
										},
										{
											label: __(
												"Large",
												"uplifters-site-builder-blocks"
											),
											value: "large",
										},
										{
											label: __(
												"XL",
												"uplifters-site-builder-blocks"
											),
											value: "xl",
										},
									]}
									onChange={(value) =>
										updateCaptionStyle(
											index,
											{
												size: value,
											}
										)
									}
								/>

								<SelectControl
									label={__(
										"Caption Weight",
										"uplifters-site-builder-blocks"
									)}
									value={
										image
											.captionStyle
											.weight
									}
									options={[
										{
											label: __(
												"Normal",
												"uplifters-site-builder-blocks"
											),
											value: "normal",
										},
										{
											label: __(
												"Medium",
												"uplifters-site-builder-blocks"
											),
											value: "medium",
										},
										{
											label: __(
												"Semibold",
												"uplifters-site-builder-blocks"
											),
											value: "semibold",
										},
										{
											label: __(
												"Bold",
												"uplifters-site-builder-blocks"
											),
											value: "bold",
										},
									]}
									onChange={(value) =>
										updateCaptionStyle(
											index,
											{
												weight:
													value,
											}
										)
									}
								/>

								<FontFamilyControl
									label={__(
										"Caption Font Family",
										"uplifters-site-builder-blocks"
									)}
									value={
										image
											.captionStyle
											.fontFamily
									}
									onChange={(value) =>
										updateCaptionStyle(
											index,
											{
												fontFamily:
													value,
											}
										)
									}
								/>

								<div
									style={{
										marginTop: 12,
									}}
								>
									<div
										style={{
											marginBottom: 6,
											fontSize: 12,
											opacity: 0.8,
										}}
									>
										{__(
											"Caption Color",
											"uplifters-site-builder-blocks"
										)}
									</div>

									<ColorPalette
										colors={
											themePalette
										}
										value={
											image
												.captionStyle
												.color
										}
										onChange={(
											value
										) =>
											updateCaptionStyle(
												index,
												{
													color:
														value ||
														"#ffffff",
												}
											)
										}
									 enableAlpha/>
								</div>
							</PanelBody>
						);
					}
				)}

				<PanelBody
					title={__(
						"Colors",
						"uplifters-site-builder-blocks"
					)}
					initialOpen={false}
					opened={
						openStylesPanel ===
						"colors"
					}
					onToggle={() =>
						toggleStylesPanel(
							"colors"
						)
					}
				>
					<div
						style={{
							marginBottom: 6,
							fontSize: 12,
							opacity: 0.8,
						}}
					>
						{__(
							"Background Color",
							"uplifters-site-builder-blocks"
						)}
					</div>

					<ColorPalette
						colors={themePalette}
						value={
							currentBackgroundColor
						}
						onChange={(value) =>
							updateResponsiveAttribute(
								"backgroundColor",
								value || ""
							)
						}
						enableAlpha
					/>

					<Button
						variant="secondary"
						onClick={() =>
							updateResponsiveAttribute(
								"backgroundColor",
								""
							)
						}
					>
						{__("Clear", "uplifters-site-builder-blocks")}
					</Button>

					<div
						style={{
							marginTop: 16,
							marginBottom: 6,
							fontSize: 12,
							opacity: 0.8,
						}}
					>
						{__(
							"Indicator Dot Color",
							"uplifters-site-builder-blocks"
						)}
					</div>

					<ColorPalette
						colors={themePalette}
						value={
							currentIndicatorColor
						}
						onChange={(value) =>
							updateResponsiveAttribute(
								"indicatorColor",
								value || "#ffffff"
							)
						}
					 enableAlpha/>

					<Button
						variant="secondary"
						onClick={() =>
							updateResponsiveAttribute(
								"indicatorColor",
								"#ffffff"
							)
						}
					>
						{__(
							"Reset Color",
							"uplifters-site-builder-blocks"
						)}
					</Button>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<MediaUpload
					onSelect={appendSelectedMedia}
					allowedTypes={[
						"image",
					]}
					multiple
					gallery
					render={({ open }) => (
						<Button
							className="uplifters-site-builder-blocks-image-interval-cover-editor__add-more"
							variant="primary"
							size="small"
							onClick={(event) => {
								event.stopPropagation();
								open();
							}}
						>
							{__(
								"Add More",
								"uplifters-site-builder-blocks"
							)}
						</Button>
					)}
				/>

				{normalizedImages.length === 0 ? (
					<div className="uplifters-site-builder-blocks-image-interval-cover-editor__empty">
						<p>
							{__(
								"No images added.",
								"uplifters-site-builder-blocks"
							)}
						</p>
						<MediaUpload
							onSelect={
								appendSelectedMedia
							}
							allowedTypes={[
								"image",
							]}
							multiple
							gallery
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
										"Upload Images",
										"uplifters-site-builder-blocks"
									)}
								</Button>
							)}
						/>
					</div>
				) : (
					<>
						<div className="uplifters-site-builder-blocks-image-interval-cover-editor__grid">
							{normalizedImages.map(
								(image, index) => {
									const isSelected =
										selectedImageIndex ===
										index;

									return (
										<div
											key={index}
											className={
												`uplifters-site-builder-blocks-image-interval-cover-editor__card` +
												(isSelected
													? " is-selected"
													: "")
											}
											onClick={() =>
												setSelectedImageIndex(
													index
												)
											}
											role="button"
											tabIndex={0}
											onKeyDown={(
												event
											) => {
												if (
													event.key ===
														"Enter" ||
													event.key ===
														" "
												) {
													event.preventDefault();

													setSelectedImageIndex(
														index
													);
												}
											}}
											aria-label={`${__(
												"Select image",
												"uplifters-site-builder-blocks"
											)} ${index + 1}`}
										>
											<MediaUpload
												onSelect={(
													media
												) =>
													updateImageMedia(
														index,
														media
													)
												}
												allowedTypes={[
													"image",
												]}
												value={
													image.id ||
													undefined
												}
												render={({
													open,
												}) => (
													<Button
														className="uplifters-site-builder-blocks-image-interval-cover-editor__upload"
														variant="primary"
														size="small"
														onClick={(
															event
														) => {
															event.stopPropagation();
															open();
														}}
													>
														{image.url
															? __(
																	"Change",
																	"uplifters-site-builder-blocks"
																)
															: __(
																	"Upload",
																	"uplifters-site-builder-blocks"
																)}
													</Button>
												)}
											/>

											{image.url ? (
												<img
													src={
														image.url
													}
													className="uplifters-site-builder-blocks-image-interval-cover-editor__image"
													style={{
														height: `${currentHeight}px`,
													}}
													alt={
														image.caption ||
														`Slide ${
															index +
															1
														}`
													}
												/>
											) : (
												<div
													className="uplifters-site-builder-blocks-image-interval-cover-editor__placeholder"
													style={{
														height: `${currentHeight}px`,
													}}
												>
													{__(
														"No Image",
														"uplifters-site-builder-blocks"
													)}
												</div>
											)}

											{image.caption && (
												<div
													className="uplifters-site-builder-blocks-image-interval-cover-editor__caption"
													style={{
														color:
															image
																.captionStyle
																.color,

														padding:
															normalizePadding(
																image
																	.captionStyle
																	.padding
															),

														fontSize:
															getCaptionFontSize(
																image
																	.captionStyle
																	.size
															),

														fontWeight:
															getCaptionFontWeight(
																image
																	.captionStyle
																	.weight
															),

														fontFamily:
															getFontFamilyCss(
																image
																	.captionStyle
																	.fontFamily
															),
													}}
												>
													{
														image.caption
													}
												</div>
											)}
										</div>
									);
								}
							)}
						</div>

						<DotBar
							activeIndex={
								selectedImageIndex ??
								0
							}
							count={
								normalizedImages.length
							}
							onSelect={
								setSelectedImageIndex
							}
						/>
					</>
				)}
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="image-interval-cover" /> : <Editor {...props} />;
}
