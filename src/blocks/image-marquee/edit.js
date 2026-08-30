import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import {
	__,
} from '@wordpress/i18n';
import { useEffect,
	useState } from '@wordpress/element';

import {
	useBlockProps,
	MediaUpload,
	InspectorControls,
} from '@wordpress/block-editor';

import {
	Button,
	PanelBody,
	RangeControl,
	ColorPalette,
} from '@wordpress/components';

const RESPONSIVE_DEVICES = ['desktop', 'tablet', 'mobile'];

function normalizeResponsiveDevice(device) {
	return RESPONSIVE_DEVICES.includes(device) ? device : 'desktop';
}

/**
 * Read the currently active device from the plugin's global responsive
 * toolbar/context.
 */
function getCurrentGlobalResponsiveDevice() {
	if (typeof window === 'undefined') {
		return 'desktop';
	}

	if (
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice === 'function'
	) {
		return normalizeResponsiveDevice(
			window.UpliftersSiteBuilderBlocksResponsive.getDevice()
		);
	}

	if (
		typeof window.upliftersSiteBuilderBlocksResponsiveDevice === 'string'
	) {
		return normalizeResponsiveDevice(
			window.upliftersSiteBuilderBlocksResponsiveDevice
		);
	}

	return 'desktop';
}

/**
 * Individual hook for consuming the Global Responsive Device.
 *
 * The block does not provide its own desktop/tablet/mobile selector.
 * It responds only to the floating global responsive toolbar.
 */
function useGlobalResponsiveDevice() {
	const [device, setDevice] = useState(
		getCurrentGlobalResponsiveDevice
	);

	useEffect(() => {
		function updateDevice(event) {
			const eventDevice =
				event?.detail?.device ||
				event?.detail?.deviceType ||
				event?.detail?.previewDeviceType;

			setDevice(
				eventDevice
					? normalizeResponsiveDevice(eventDevice)
					: getCurrentGlobalResponsiveDevice()
			);
		}

		updateDevice();

		if (typeof window === 'undefined') {
			return undefined;
		}

		window.addEventListener(
			'uplifters-site-builder-blocks-responsive-device-change',
			updateDevice
		);

		window.addEventListener(
			'uplifters-site-builder-blocks-global-responsive-device-change',
			updateDevice
		);

		const interval = window.setInterval(() => {
			const nextDevice =
				getCurrentGlobalResponsiveDevice();

			setDevice((currentDevice) =>
				currentDevice !== nextDevice
					? nextDevice
					: currentDevice
			);
		}, 400);

		return () => {
			window.removeEventListener(
				'uplifters-site-builder-blocks-responsive-device-change',
				updateDevice
			);

			window.removeEventListener(
				'uplifters-site-builder-blocks-global-responsive-device-change',
				updateDevice
			);

			window.clearInterval(interval);
		};
	}, []);

	return device;
}

function isResponsiveObject(value) {
	return (
		value &&
		typeof value === 'object' &&
		!Array.isArray(value)
	);
}

function hasResponsiveValue(value) {
	return (
		value !== undefined &&
		value !== null &&
		value !== ''
	);
}

/**
 * Read the active device branch.
 *
 * Desktop is used as the primary fallback so older or partially populated
 * responsive attributes can still render.
 */
function getResponsiveValue(
	value,
	device,
	fallback = ''
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

/**
 * Update only the currently active responsive device branch.
 */
function setResponsiveValue(
	currentValue,
	device,
	nextValue
) {
	const responsiveValue = isResponsiveObject(currentValue)
		? currentValue
		: {};

	return {
		...responsiveValue,
		[device]: nextValue,
	};
}

const styles = {
	editorWrapper: {
		padding: '16px',
		boxSizing: 'border-box',
	},

	marqueeBox: {
		borderRadius: '12px',
		overflow: 'hidden',
		boxSizing: 'border-box',
	},

	emptyState: {
		border: '1px dashed #c3c4c7',
		borderRadius: '12px',
		padding: '24px',
		textAlign: 'center',
		boxSizing: 'border-box',
	},

	emptyTitle: {
		margin: 0,
		fontSize: '16px',
	},

	emptyText: {
		margin: '8px 0 0',
		fontSize: '13px',
		opacity: 0.8,
	},

	buttonRow: {
		marginTop: '16px',
		display: 'flex',
		justifyContent: 'center',
		gap: '12px',
		flexWrap: 'wrap',
	},

	previewScroller: {
		display: 'flex',
		flexWrap: 'nowrap',
		gap: '8px',
		alignItems: 'center',
		overflowX: 'auto',
		padding: '8px',
		boxSizing: 'border-box',
	},

	previewImage: {
		display: 'block',
		flex: '0 0 auto',
		maxWidth: 'none',
		objectFit: 'cover',
		borderRadius: '12px',
		boxShadow: '0 1px 3px rgba(0, 0, 0, 0.18)',
		backgroundColor: '#ffffff',
		boxSizing: 'content-box',
	},

	managerBox: {
		marginTop: '16px',
		border: '1px dashed #c3c4c7',
		borderRadius: '12px',
		padding: '16px',
		boxSizing: 'border-box',
	},

	managerHeader: {
		marginBottom: '12px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: '12px',
		flexWrap: 'wrap',
	},

	managerTitle: {
		margin: 0,
		fontSize: '14px',
		fontWeight: 600,
	},

	managerText: {
		margin: '4px 0 0',
		fontSize: '12px',
		opacity: 0.7,
	},

	imageList: {
		display: 'flex',
		flexWrap: 'nowrap',
		gap: '12px',
		overflowX: 'auto',
		paddingBottom: '8px',
	},

	imageCard: {
		width: '260px',
		flexShrink: 0,
		padding: '12px',
		border: '1px solid #dcdcde',
		borderRadius: '12px',
		backgroundColor: '#ffffff',
		boxSizing: 'border-box',
	},

	cardButtons: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
		flexWrap: 'wrap',
	},

	cardPreview: {
		marginTop: '12px',
		display: 'block',
		width: '100%',
		height: '120px',
		borderRadius: '8px',
		objectFit: 'cover',
	},

	noImageBox: {
		marginTop: '12px',
		display: 'flex',
		height: '120px',
		alignItems: 'center',
		justifyContent: 'center',
		border: '1px dashed #c3c4c7',
		borderRadius: '8px',
		fontSize: '13px',
		opacity: 0.7,
	},

	colorLabel: {
		marginBottom: '8px',
		fontSize: '13px',
		fontWeight: 500,
	},

	colorButtonRow: {
		marginTop: '12px',
		display: 'flex',
		gap: '8px',
	},
};

function Editor({
	attributes,
	setAttributes,
	isSelected,
}) {
	const {
		images = [],
		imagePadding,
		margin,
		duration,
		imageHeight,
		imageWidth,
		backgroundColor,
	} = attributes;

	const device = useGlobalResponsiveDevice();

	const [openedSettingsPanel, setOpenedSettingsPanel] =
		useState(null);

	const [openedStylesPanel, setOpenedStylesPanel] =
		useState(null);

	const currentImagePadding = Number(
		getResponsiveValue(
			imagePadding,
			device,
			0
		)
	);

	const currentMargin = Number(
		getResponsiveValue(
			margin,
			device,
			0
		)
	);

	const currentDuration = Number(
		getResponsiveValue(
			duration,
			device,
			20
		)
	);

	const currentImageHeight = Number(
		getResponsiveValue(
			imageHeight,
			device,
			256
		)
	);

	const currentImageWidth = Number(
		getResponsiveValue(
			imageWidth,
			device,
			256
		)
	);

	const currentBackgroundColor =
		getResponsiveValue(
			backgroundColor,
			device,
			''
		);

	const updateResponsiveAttribute = (
		attributeName,
		nextValue
	) => {
		setAttributes({
			[attributeName]: setResponsiveValue(
				attributes[attributeName],
				device,
				nextValue
			),
		});
	};

	const blockProps = useBlockProps({
		className: `uplifters-site-builder-blocks-image-marquee-editor uplifters-site-builder-blocks-image-marquee-editor-device-${device}`,
		style: styles.editorWrapper,
		'data-responsive-device': device,
	});

	const addImage = () => {
		const newImages = [
			...(Array.isArray(images) ? images : []),
			{
				id: null,
				url: '',
			},
		];

		setAttributes({
			images: newImages,
		});
	};

	const updateImage = (index, image) => {
		const newImages = [
			...(Array.isArray(images) ? images : []),
		];

		newImages[index] = {
			id: image?.id || null,
			url: image?.url || '',
		};

		setAttributes({
			images: newImages,
		});
	};

	const removeImage = (index) => {
		const newImages = (
			Array.isArray(images) ? images : []
		).filter(
			(_, imageIndex) => imageIndex !== index
		);

		setAttributes({
			images: newImages,
		});
	};

	const setFirstImage = (media) => {
		setAttributes({
			images: [
				{
					id: media?.id || null,
					url: media?.url || '',
				},
			],
		});
	};

	const imagesWithUrl = Array.isArray(images)
		? images.filter((image) => image?.url)
		: [];

	const hasAnyImage = imagesWithUrl.length > 0;

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody
					title={__(
						'Playback',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={
						openedSettingsPanel ===
						'image-marquee-settings'
					}
					onToggle={() =>
						setOpenedSettingsPanel(
							(current) =>
								current ===
								'image-marquee-settings'
									? null
									: 'image-marquee-settings'
						)
					}
				>
					<RangeControl
						label={__(
							'Animation Duration (s)',
							'uplifters-site-builder-blocks'
						)}
						value={currentDuration}
						onChange={(value) =>
							updateResponsiveAttribute(
								'duration',
								value ?? 20
							)
						}
						min={1}
						max={60}
						step={1}
						help={__(
							'Changes only the active global responsive device.',
							'uplifters-site-builder-blocks'
						)}
					/>
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
						openedStylesPanel ===
						'layout'
					}
					onToggle={() =>
						setOpenedStylesPanel(
							(current) =>
								current ===
								'layout'
									? null
									: 'layout'
						)
					}
				>
					<RangeControl
						label={__(
							'Image Height (px)',
							'uplifters-site-builder-blocks'
						)}
						value={currentImageHeight}
						onChange={(value) =>
							updateResponsiveAttribute(
								'imageHeight',
								value ?? 256
							)
						}
						min={100}
						max={500}
						step={1}
						help={__(
							'Changes only the active global responsive device.',
							'uplifters-site-builder-blocks'
						)}
					/>

					<RangeControl
						label={__(
							'Image Width (px)',
							'uplifters-site-builder-blocks'
						)}
						value={currentImageWidth}
						onChange={(value) =>
							updateResponsiveAttribute(
								'imageWidth',
								value ?? 256
							)
						}
						min={100}
						max={500}
						step={1}
						help={__(
							'Changes only the active global responsive device.',
							'uplifters-site-builder-blocks'
						)}
					/>
				</PanelBody>

				<PanelBody
					title={__(
						'Spacing',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={
						openedStylesPanel ===
						'spacing'
					}
					onToggle={() =>
						setOpenedStylesPanel(
							(current) =>
								current ===
								'spacing'
									? null
									: 'spacing'
						)
					}
				>
					<RangeControl
						label={__(
							'Image Padding (px)',
							'uplifters-site-builder-blocks'
						)}
						value={currentImagePadding}
						onChange={(value) =>
							updateResponsiveAttribute(
								'imagePadding',
								value ?? 0
							)
						}
						min={0}
						max={50}
						step={1}
						help={__(
							'Changes only the active global responsive device.',
							'uplifters-site-builder-blocks'
						)}
					/>

					<RangeControl
						label={__(
							'Marquee Margin (px)',
							'uplifters-site-builder-blocks'
						)}
						value={currentMargin}
						onChange={(value) =>
							updateResponsiveAttribute(
								'margin',
								value ?? 0
							)
						}
						min={0}
						max={100}
						step={1}
						help={__(
							'Changes only the active global responsive device.',
							'uplifters-site-builder-blocks'
						)}
					/>
				</PanelBody>

				<PanelBody
					title={__(
						'Colors',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={
						openedStylesPanel ===
						'color-settings'
					}
					onToggle={() =>
						setOpenedStylesPanel(
							(current) =>
								current ===
								'color-settings'
									? null
									: 'color-settings'
						)
					}
				>
					<div style={styles.colorLabel}>
						{__(
							'Background Color',
							'uplifters-site-builder-blocks'
						)}
					</div>

					<ColorPalette
						value={currentBackgroundColor}
						onChange={(color) =>
							updateResponsiveAttribute(
								'backgroundColor',
								color || ''
							)
						}
						enableAlpha
					/>

					<div style={styles.colorButtonRow}>
						<Button
							variant="secondary"
							onClick={() =>
								updateResponsiveAttribute(
									'backgroundColor',
									''
								)
							}
						>
							{__('Clear', 'uplifters-site-builder-blocks')}
						</Button>
					</div>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div
					className="uplifters-site-builder-blocks-image-marquee-editor__marquee"
					style={{
						...styles.marqueeBox,
						margin: `${currentMargin}px`,
						backgroundColor:
							currentBackgroundColor ||
							undefined,
					}}
				>
					{!hasAnyImage ? (
						<div
							className="uplifters-site-builder-blocks-image-marquee-editor__empty-state"
							style={styles.emptyState}
						>
							<p style={styles.emptyTitle}>
								{__(
									'No images added yet.',
									'uplifters-site-builder-blocks'
								)}
							</p>

							<p style={styles.emptyText}>
								{__(
									'Upload your first image to start the marquee.',
									'uplifters-site-builder-blocks'
								)}
							</p>

							<div style={styles.buttonRow}>
								<MediaUpload
									onSelect={setFirstImage}
									allowedTypes={[
										'image',
									]}
									render={({ open }) => (
										<Button
											variant="primary"
											onClick={open}
										>
											{__(
												'Upload First Image',
												'uplifters-site-builder-blocks'
											)}
										</Button>
									)}
								/>

								<Button
									variant="secondary"
									onClick={addImage}
								>
									{__(
										'Add Slot',
										'uplifters-site-builder-blocks'
									)}
								</Button>
							</div>
						</div>
					) : (
						<>
							<div
								className="uplifters-site-builder-blocks-image-marquee-editor__preview"
								style={
									styles.previewScroller
								}
								data-animation-duration={
									currentDuration
								}
							>
								{imagesWithUrl.map(
									(image, index) => (
										<img
											key={`${
												image.id ||
												'image'
											}-${index}`}
											src={image.url}
											alt=""
											className="uplifters-site-builder-blocks-image-marquee-editor__preview-image"
											style={{
												...styles.previewImage,
												padding: `${currentImagePadding}px`,
												height: `${currentImageHeight}px`,
												width: `${currentImageWidth}px`,
											}}
											loading="lazy"
											decoding="async"
										/>
									)
								)}
							</div>

							{isSelected && (
								<div
									className="uplifters-site-builder-blocks-image-marquee-editor__manager"
									style={
										styles.managerBox
									}
								>
									<div
										style={
											styles.managerHeader
										}
									>
										<div>
											<h4
												style={
													styles.managerTitle
												}
											>
												{__(
													'Marquee Images',
													'uplifters-site-builder-blocks'
												)}
											</h4>

											<p
												style={
													styles.managerText
												}
											>
												{__(
													'Manage marquee images directly from the block canvas.',
													'uplifters-site-builder-blocks'
												)}
											</p>
										</div>

										<Button
											variant="primary"
											onClick={
												addImage
											}
										>
											{__(
												'Add More',
												'uplifters-site-builder-blocks'
											)}
										</Button>
									</div>

									<div
										className="uplifters-site-builder-blocks-image-marquee-editor__image-list"
										style={
											styles.imageList
										}
									>
										{(
											Array.isArray(
												images
											)
												? images
												: []
										).map(
											(
												image,
												index
											) => (
												<div
													key={`image-marquee-image-${index}`}
													className="uplifters-site-builder-blocks-image-marquee-editor__image-card"
													style={
														styles.imageCard
													}
												>
													<div
														style={
															styles.cardButtons
														}
													>
														<MediaUpload
															onSelect={(
																media
															) =>
																updateImage(
																	index,
																	media
																)
															}
															allowedTypes={[
																'image',
															]}
															value={
																image?.id
															}
															render={({
																open,
															}) => (
																<Button
																	variant="secondary"
																	onClick={
																		open
																	}
																>
																	{image?.url
																		? __(
																				'Change Image',
																				'uplifters-site-builder-blocks'
																			)
																		: __(
																				'Upload Image',
																				'uplifters-site-builder-blocks'
																			)}
																</Button>
															)}
														/>

														<Button
															variant="link"
															isDestructive
															onClick={() =>
																removeImage(
																	index
																)
															}
														>
															{__(
																'Remove',
																'uplifters-site-builder-blocks'
															)}
														</Button>
													</div>

													{image?.url ? (
														<img
															src={
																image.url
															}
															alt=""
															className="uplifters-site-builder-blocks-image-marquee-editor__card-preview"
															style={
																styles.cardPreview
															}
															loading="lazy"
															decoding="async"
														/>
													) : (
														<div
															className="uplifters-site-builder-blocks-image-marquee-editor__no-image"
															style={
																styles.noImageBox
															}
														>
															{__(
																'No image selected',
																'uplifters-site-builder-blocks'
															)}
														</div>
													)}
												</div>
											)
										)}
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="image-marquee" /> : <Editor {...props} />;
}
