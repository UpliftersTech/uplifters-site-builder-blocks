import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from '@wordpress/i18n';

import './editor.scss';

import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	BlockControls,
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
	BoxControl,
	ColorPalette,
} from '@wordpress/components';

import {
	useEffect,
	useState,
} from '@wordpress/element';

import { useSelect } from '@wordpress/data';

/**
 * Supported global responsive devices.
 */
const RESPONSIVE_DEVICES = [
	'desktop',
	'tablet',
	'mobile',
];

/**
 * Normalize a responsive device value.
 *
 * @param {string} device Device value.
 * @return {string} Normalized device.
 */
const normalizeResponsiveDevice = (device) =>
	RESPONSIVE_DEVICES.includes(device)
		? device
		: 'desktop';

/**
 * Read the current device from the global responsive API.
 *
 * The floating responsive toolbar is expected to expose:
 *
 * window.UpliftersSiteBuilderBlocksResponsive.getDevice()
 *
 * @return {string} Current responsive device.
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
 * Individual hook for the global responsive device context.
 *
 * The block does not render its own device switcher. It listens to the
 * floating global responsive toolbar and returns the currently active
 * desktop, tablet or mobile branch.
 *
 * Supported global integrations:
 *
 * 1. window.UpliftersSiteBuilderBlocksResponsive.getDevice()
 * 2. window.UpliftersSiteBuilderBlocksResponsive.subscribe(callback)
 * 3. "uplifters-site-builder-blocks-responsive-device-change" browser event
 *
 * @return {string} Active global responsive device.
 */
const useGlobalResponsiveDevice = () => {
	const [device, setDevice] = useState(
		getGlobalResponsiveDevice
	);

	useEffect(() => {
		const updateDevice = (nextDevice) => {
			const eventDevice =
				typeof nextDevice === 'string'
					? nextDevice
					: nextDevice?.detail?.device;

			setDevice(
				normalizeResponsiveDevice(
					eventDevice ||
						getGlobalResponsiveDevice()
				)
			);
		};

		window.addEventListener(
			'uplifters-site-builder-blocks-responsive-device-change',
			updateDevice
		);

		let unsubscribe = null;

		if (
			window.UpliftersSiteBuilderBlocksResponsive &&
			typeof window.UpliftersSiteBuilderBlocksResponsive.subscribe ===
				'function'
		) {
			const subscription =
				window.UpliftersSiteBuilderBlocksResponsive.subscribe(
					updateDevice
				);

			if (typeof subscription === 'function') {
				unsubscribe = subscription;
			}
		}

		updateDevice();

		return () => {
			window.removeEventListener(
				'uplifters-site-builder-blocks-responsive-device-change',
				updateDevice
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
 * active device -> desktop -> tablet -> mobile -> supplied fallback.
 *
 * Boolean false and numeric zero are valid values, so this helper does
 * not use truthiness checks.
 *
 * @param {Object} attributes Block attributes.
 * @param {string} key Attribute name.
 * @param {string} device Active device.
 * @param {*} fallback Fallback value.
 * @return {*} Responsive value.
 */
const getResponsiveValue = (
	attributes,
	key,
	device,
	fallback = ''
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
 * Update only the active responsive device branch.
 *
 * Other desktop, tablet and mobile values remain unchanged.
 *
 * @param {Object} attributes Block attributes.
 * @param {Function} setAttributes Gutenberg attribute setter.
 * @param {string} key Attribute name.
 * @param {string} device Active global device.
 * @param {*} value New branch value.
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
 * Convert a responsive spacing object to React CSS properties.
 *
 * @param {string} prefix CSS property prefix.
 * @param {Object} box Spacing object.
 * @return {Object} React inline styles.
 */
const boxStyle = (prefix, box = {}) =>
	Object.fromEntries(
		Object.entries({
			top: `${prefix}Top`,
			right: `${prefix}Right`,
			bottom: `${prefix}Bottom`,
			left: `${prefix}Left`,
		}).flatMap(([side, cssProperty]) =>
			box?.[side]
				? [[cssProperty, box[side]]]
				: []
		)
	);

/**
 * Normalize selected WordPress media.
 *
 * @param {Object|Array} media Selected media.
 * @return {Array} Normalized images.
 */
const normalizeImages = (media) =>
	(Array.isArray(media) ? media : media ? [media] : [])
		.map((item) => ({
			id: item?.id || 0,

			url:
				item?.sizes?.large?.url ||
				item?.sizes?.medium_large?.url ||
				item?.sizes?.medium?.url ||
				item?.source_url ||
				item?.url ||
				'',

			fullUrl:
				item?.source_url ||
				item?.url ||
				'',

			alt:
				item?.alt ||
				item?.alt_text ||
				'',

			caption:
				typeof item?.caption?.raw === 'string'
					? item.caption.raw
					: typeof item?.caption === 'string'
						? item.caption
						: '',

			sizeSlug: 'full',
		}))
		.filter((image) => image.url);

/**
 * Convert an image-height CSS value to a number for RangeControl.
 *
 * @param {string|number} imageHeight Stored height.
 * @return {number} Numeric pixel height.
 */
const getImageHeightValue = (imageHeight) => {
	if (
		typeof imageHeight === 'number' &&
		Number.isFinite(imageHeight)
	) {
		return imageHeight;
	}

	if (typeof imageHeight === 'string') {
		const match = imageHeight
			.trim()
			.match(/^(\d+(?:\.\d+)?)px$/i);

		if (match) {
			return Math.round(Number(match[1]));
		}
	}

	return 320;
};

function Editor({
	attributes,
	setAttributes,
}) {
	const {
		images = [],
		selectedIndex = 0,
		linkTo = 'none',
		openInNewTab = false,
	} = attributes;

	/**
	 * Current responsive branch comes only from the global toolbar.
	 */
	const device = useGlobalResponsiveDevice();

	const objectFit = getResponsiveValue(
		attributes,
		'objectFit',
		device,
		'cover'
	);

	const imagesPerRow = getResponsiveValue(
		attributes,
		'imagesPerRow',
		device,
		device === 'mobile'
			? 1
			: device === 'tablet'
				? 2
				: 3
	);

	const imageHeight = getResponsiveValue(
		attributes,
		'imageHeight',
		device,
		device === 'mobile'
			? '240px'
			: device === 'tablet'
				? '280px'
				: '320px'
	);

	const imageShadow = getResponsiveValue(
		attributes,
		'imageShadow',
		device,
		true
	);

	const backgroundColor = getResponsiveValue(
		attributes,
		'backgroundColor',
		device,
		''
	);

	const padding = getResponsiveValue(
		attributes,
		'padding',
		device,
		{}
	);

	const margin = getResponsiveValue(
		attributes,
		'margin',
		device,
		{}
	);

	const palette = useSetting('color.palette');

	const current = images[selectedIndex];
	const currentId = current?.id || 0;

	const imageHeightValue =
		getImageHeightValue(imageHeight);

	const [
		openSettingsPanel,
		setOpenSettingsPanel,
	] = useState(null);

	const [
		openStylesPanel,
		setOpenStylesPanel,
	] = useState(null);

	const media = useSelect(
		(select) =>
			currentId
				? select('core').getMedia(currentId)
				: null,
		[currentId]
	);

	/**
	 * Keep selected image index valid.
	 */
	useEffect(() => {
		if (
			!images.length &&
			selectedIndex !== 0
		) {
			setAttributes({
				selectedIndex: 0,
			});

			return;
		}

		if (images.length) {
			const nextIndex = Math.min(
				selectedIndex,
				images.length - 1
			);

			if (nextIndex !== selectedIndex) {
				setAttributes({
					selectedIndex: nextIndex,
				});
			}
		}
	}, [
		images.length,
		selectedIndex,
		setAttributes,
	]);

	/**
	 * Update the selected image URL when its WordPress size changes.
	 */
	useEffect(() => {
		if (!current || !media) {
			return;
		}

		const sizes =
			media?.media_details?.sizes || {};

		const sizeSlug =
			current.sizeSlug || 'full';

		const url =
			sizeSlug !== 'full' &&
			sizes[sizeSlug]?.source_url
				? sizes[sizeSlug].source_url
				: media?.source_url ||
					current.url;

		const nextImages = [...images];

		nextImages[selectedIndex] = {
			...current,

			url,

			fullUrl:
				media?.source_url ||
				current.fullUrl ||
				current.url,

			alt:
				current.alt ||
				media?.alt_text ||
				'',

			caption:
				current.caption ||
				(typeof media?.caption?.raw ===
				'string'
					? media.caption.raw
					: typeof media?.caption ===
						  'string'
						? media.caption
						: ''),
		};

		setAttributes({
			images: nextImages,
		});
	}, [
		media,
		current?.sizeSlug,
	]);

	const updateImage = (patch) => {
		if (!images[selectedIndex]) {
			return;
		}

		const nextImages = [...images];

		nextImages[selectedIndex] = {
			...nextImages[selectedIndex],
			...patch,
		};

		setAttributes({
			images: nextImages,
		});
	};

	const addImages = (picked) => {
		const normalizedImages =
			normalizeImages(picked);

		if (!normalizedImages.length) {
			return;
		}

		const nextImages = [
			...images,
			...normalizedImages,
		];

		setAttributes({
			images: nextImages,
			selectedIndex:
				nextImages.length - 1,
		});
	};

	const replaceImage = (picked) => {
		const image =
			normalizeImages(picked)[0];

		if (
			!image ||
			!images[selectedIndex]
		) {
			return;
		}

		const nextImages = [...images];

		nextImages[selectedIndex] = image;

		setAttributes({
			images: nextImages,
		});
	};

	const removeImage = (index) => {
		const nextImages = images.filter(
			(_, imageIndex) =>
				imageIndex !== index
		);

		setAttributes({
			images: nextImages,

			selectedIndex: Math.max(
				0,
				Math.min(
					selectedIndex,
					nextImages.length - 1
				)
			),
		});
	};

	const sizeOptions = [
		{
			label: __('Full', 'uplifters-site-builder-blocks'),
			value: 'full',
		},

		...(media?.media_details?.sizes
			? Object.keys(
					media.media_details.sizes
				).map((slug) => ({
					label: slug,
					value: slug,
				}))
			: []),
	].filter(
		(option, index, options) =>
			options.findIndex(
				(item) =>
					item.value ===
					option.value
			) === index
	);

	const blockProps = useBlockProps({
		className:
			`wp-block-uplifters-site-builder-blocks-image-gallery ` +
			`wp-block-uplifters-site-builder-blocks-image-gallery--${device}`,

		'data-responsive-device': device,

		style: {
			backgroundColor:
				backgroundColor || undefined,

			'--uplifters-site-builder-blocks-image-gallery-object-fit':
				objectFit || 'cover',

			'--uplifters-site-builder-blocks-image-gallery-columns':
				Math.max(
					1,
					Number(imagesPerRow) || 1
				),

			'--uplifters-site-builder-blocks-image-gallery-image-height':
				imageHeight || '320px',

			...boxStyle(
				'padding',
				padding
			),

			...boxStyle(
				'margin',
				margin
			),
		},
	});

	const imageClassName =
		`wp-block-uplifters-site-builder-blocks-image-gallery__img${
			imageShadow !== false
				? ' wp-block-uplifters-site-builder-blocks-image-gallery__img--shadow'
				: ''
		}`;

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody
					title={__(
						'Gallery Settings',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={
						openSettingsPanel ===
						'gallery-settings'
					}
					onToggle={() =>
						setOpenSettingsPanel(
							(currentPanel) =>
								currentPanel ===
								'gallery-settings'
									? null
									: 'gallery-settings'
						)
					}
				>
					<SelectControl
						label={__('Link', 'uplifters-site-builder-blocks')}
						value={linkTo}
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
						]}
						onChange={(value) =>
							setAttributes({
								linkTo: value,
							})
						}
					/>

					{linkTo !== 'none' && (
						<ToggleControl
							label={__(
								'Open in new tab',
								'uplifters-site-builder-blocks'
							)}
							checked={
								!!openInNewTab
							}
							onChange={(value) =>
								setAttributes({
									openInNewTab:
										!!value,
								})
							}
						/>
					)}
				</PanelBody>

				{!!images.length &&
					current && (
						<PanelBody
							title={__(
								'Selected Image',
								'uplifters-site-builder-blocks'
							)}
							initialOpen={false}
							opened={
								openSettingsPanel ===
								'selected-image'
							}
							onToggle={() =>
								setOpenSettingsPanel(
									(
										currentPanel
									) =>
										currentPanel ===
										'selected-image'
											? null
											: 'selected-image'
								)
							}
						>
							<div
								style={{
									display:
										'flex',
									gap: 8,
									flexWrap:
										'wrap',
									marginBottom: 12,
								}}
							>
								{images.map(
									(
										image,
										index
									) => (
										<button
											key={`${
												image.id ||
												image.url
											}-${index}`}
											type="button"
											onClick={() =>
												setAttributes(
													{
														selectedIndex:
															index,
													}
												)
											}
											style={{
												border:
													index ===
													selectedIndex
														? '2px solid #2271b1'
														: '1px solid #dddddd',
												borderRadius: 6,
												padding: 2,
												background:
													'#ffffff',
												cursor:
													'pointer',
											}}
										>
											<img
												src={
													image.url
												}
												alt=""
												style={{
													display:
														'block',
													width: 48,
													height: 48,
													objectFit:
														'cover',
													borderRadius: 4,
												}}
											/>
										</button>
									)
								)}
							</div>

							<MediaUploadCheck>
								<MediaUpload
									onSelect={
										replaceImage
									}
									allowedTypes={[
										'image',
									]}
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
												'Replace Selected',
												'uplifters-site-builder-blocks'
											)}
										</Button>
									)}
								/>
							</MediaUploadCheck>

							<Button
								variant="secondary"
								isDestructive
								onClick={() =>
									removeImage(
										selectedIndex
									)
								}
								style={{
									marginLeft: 8,
								}}
							>
								{__(
									'Remove Selected',
									'uplifters-site-builder-blocks'
								)}
							</Button>

							<TextControl
								label={__(
									'Alt Text',
									'uplifters-site-builder-blocks'
								)}
								value={
									current.alt ||
									''
								}
								onChange={(
									value
								) =>
									updateImage({
										alt: value,
									})
								}
							/>

							<TextControl
								label={__(
									'Caption',
									'uplifters-site-builder-blocks'
								)}
								value={
									current.caption ||
									''
								}
								onChange={(
									value
								) =>
									updateImage({
										caption:
											value,
									})
								}
							/>

							<SelectControl
								label={__(
									'Image Size',
									'uplifters-site-builder-blocks'
								)}
								value={
									current.sizeSlug ||
									'full'
								}
								options={
									sizeOptions
								}
								onChange={(
									value
								) =>
									updateImage({
										sizeSlug:
											value,
									})
								}
							/>
						</PanelBody>
					)}
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={__('Layout', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={
						openStylesPanel ===
						'layout'
					}
					onToggle={() =>
						setOpenStylesPanel(
							(currentPanel) =>
								currentPanel ===
								'layout'
									? null
									: 'layout'
						)
					}
				>
					<SelectControl
						label={__(
							'Object Fit',
							'uplifters-site-builder-blocks'
						)}
						value={objectFit}
						options={[
							{
								label: 'cover',
								value: 'cover',
							},
							{
								label: 'contain',
								value: 'contain',
							},
							{
								label: 'fill',
								value: 'fill',
							},
							{
								label: 'none',
								value: 'none',
							},
							{
								label: 'scale-down',
								value: 'scale-down',
							},
						]}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'objectFit',
								device,
								value
							)
						}
					/>

					<RangeControl
						label={__(
							'Images per row',
							'uplifters-site-builder-blocks'
						)}
						value={
							Number(
								imagesPerRow
							) || 1
						}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'imagesPerRow',
								device,
								value || 1
							)
						}
						min={1}
						max={8}
						step={1}
						withInputField={true}
					/>

					<RangeControl
						label={__(
							'Image Height',
							'uplifters-site-builder-blocks'
						)}
						value={imageHeightValue}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'imageHeight',
								device,
								`${value || 320}px`
							)
						}
						min={120}
						max={900}
						step={10}
						withInputField={true}
						help={__(
							'Adjust the image height for the active global responsive device.',
							'uplifters-site-builder-blocks'
						)}
					/>

					<ToggleControl
						label={__(
							'Image Shadow',
							'uplifters-site-builder-blocks'
						)}
						checked={
							imageShadow !== false
						}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'imageShadow',
								device,
								!!value
							)
						}
					/>
				</PanelBody>

				<PanelBody
					title={__('Colors', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={
						openStylesPanel ===
						'color'
					}
					onToggle={() =>
						setOpenStylesPanel(
							(currentPanel) =>
								currentPanel ===
								'color'
									? null
									: 'color'
						)
					}
				>
					<div className="components-base-control">
						<div className="components-base-control__label">
							{__(
								'Background Color',
								'uplifters-site-builder-blocks'
							)}
						</div>

						<ColorPalette
							colors={palette}
							value={
								backgroundColor ||
								undefined
							}
							onChange={(color) =>
								setResponsiveValue(
									attributes,
									setAttributes,
									'backgroundColor',
									device,
									color || ''
								)
							}
						 enableAlpha/>
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
					onToggle={() =>
						setOpenStylesPanel(
							(currentPanel) =>
								currentPanel ===
								'spacing'
									? null
									: 'spacing'
						)
					}
				>
					<BoxControl
						label={__(
							'Padding',
							'uplifters-site-builder-blocks'
						)}
						values={padding || {}}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'padding',
								device,
								value || {}
							)
						}
					/>

					<BoxControl
						label={__(
							'Margin',
							'uplifters-site-builder-blocks'
						)}
						values={margin || {}}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'margin',
								device,
								value || {}
							)
						}
					/>
				</PanelBody>
			</InspectorControls>

			{!!images.length && (
				<BlockControls>
					<ToolbarGroup>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={
									addImages
								}
								allowedTypes={[
									'image',
								]}
								multiple={true}
								render={({
									open,
								}) => (
									<ToolbarButton
										onClick={
											open
										}
									>
										{__(
											'Add More',
											'uplifters-site-builder-blocks'
										)}
									</ToolbarButton>
								)}
							/>
						</MediaUploadCheck>

						<ToolbarButton
							isDestructive
							onClick={() =>
								removeImage(
									selectedIndex
								)
							}
						>
							{__(
								'Remove Selected',
								'uplifters-site-builder-blocks'
							)}
						</ToolbarButton>
					</ToolbarGroup>
				</BlockControls>
			)}

			<div {...blockProps}>
				{!images.length ? (
					<Placeholder
						label={__(
							'Gallery',
							'uplifters-site-builder-blocks'
						)}
						instructions={__(
							'Add images to start.',
							'uplifters-site-builder-blocks'
						)}
					>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={
									addImages
								}
								allowedTypes={[
									'image',
								]}
								multiple={true}
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
											'Select Images',
											'uplifters-site-builder-blocks'
										)}
									</Button>
								)}
							/>
						</MediaUploadCheck>
					</Placeholder>
				) : (
					<>
						<div
							style={{
								marginBottom: 12,
							}}
						>
							<MediaUploadCheck>
								<MediaUpload
									onSelect={
										addImages
									}
									allowedTypes={[
										'image',
									]}
									multiple={true}
									render={({
										open,
									}) => (
										<Button
											variant="secondary"
											onClick={
												open
											}
										>
											{__(
												'Add More',
												'uplifters-site-builder-blocks'
											)}
										</Button>
									)}
								/>
							</MediaUploadCheck>
						</div>

						<div className="wp-block-uplifters-site-builder-blocks-image-gallery__grid">
							{images.map(
								(
									image,
									index
								) => {
									const fullUrl =
										image.fullUrl ||
										image.url ||
										'';

									const href =
										linkTo ===
										'media'
											? fullUrl
											: '';

									return (
										<figure
											className="wp-block-uplifters-site-builder-blocks-image-gallery__item"
											key={`${
												image.id ||
												image.url
											}-${index}`}
										>
											<div className="wp-block-uplifters-site-builder-blocks-image-gallery__media">
												<button
													type="button"
													className="wp-block-uplifters-site-builder-blocks-image-gallery__preview"
													onClick={() =>
														setAttributes(
															{
																selectedIndex:
																	index,
															}
														)
													}
													aria-label={__(
														'Select image',
														'uplifters-site-builder-blocks'
													)}
												>
													<svg
														viewBox="0 0 24 24"
														width="18"
														height="18"
														fill="none"
														aria-hidden="true"
														focusable="false"
													>
														<path
															d="M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14Z"
															stroke="currentColor"
															strokeWidth="2"
														/>
														<path
															d="m20 20-3.5-3.5"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
														/>
														<path
															d="M11 8v6M8 11h6"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
														/>
													</svg>
												</button>

												{href ? (
													<a
														className="wp-block-uplifters-site-builder-blocks-image-gallery__link"
														href={
															href
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
														) =>
															event.preventDefault()
														}
													>
														<img
															className={
																imageClassName
															}
															src={
																image.url
															}
															alt={
																image.alt ||
																''
															}
														/>
													</a>
												) : (
													<img
														className={
															imageClassName
														}
														src={
															image.url
														}
														alt={
															image.alt ||
															''
														}
													/>
												)}
											</div>

											{image.caption ? (
												<figcaption className="wp-block-uplifters-site-builder-blocks-image-gallery__caption">
													{
														image.caption
													}
												</figcaption>
											) : null}
										</figure>
									);
								}
							)}
						</div>
					</>
				)}
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="image-gallery" /> : <Editor {...props} />;
}
