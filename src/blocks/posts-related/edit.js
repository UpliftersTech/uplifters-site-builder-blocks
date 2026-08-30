import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';

import {
	PanelBody,
	ToggleControl,
	RangeControl,
	BaseControl,
	SelectControl,
	TextControl,
	ColorPalette,
} from '@wordpress/components';

import {
	useEffect,
	useMemo,
	useState,
} from '@wordpress/element';

import {
	fetchPostsRelated,
	inferCurrentPostId,
} from '../../api-requests';
import { FontFamilyControl, getFontFamilyCss } from '../../assets-shared/fonts-family/font-family-control';

const RESPONSIVE_DEVICES = [
	'desktop',
	'tablet',
	'mobile',
];

const normalizeDevice = (device) => {
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
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice ===
			'function'
	) {
		return normalizeDevice(
			window.UpliftersSiteBuilderBlocksResponsive.getDevice()
		);
	}

	return 'desktop';
};

/**
 * Read the active device from the global floating responsive toolbar.
 *
 * This block does not render its own device selector.
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
					? normalizeDevice(eventDevice)
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
	 * Backward compatibility for old scalar attributes.
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

const clampInt = (
	value,
	minimum,
	maximum,
	fallback
) => {
	const numericValue = Number(value);

	const safeValue = Number.isFinite(numericValue)
		? Math.trunc(numericValue)
		: fallback;

	return Math.min(
		maximum,
		Math.max(minimum, safeValue)
	);
};

const stripTags = (html = '') =>
	String(html)
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

const trimWords = (
	text = '',
	words = 20
) => {
	const parts = String(text)
		.trim()
		.split(/\s+/)
		.filter(Boolean);

	if (parts.length <= words) {
		return parts.join(' ');
	}

	return `${parts.slice(0, words).join(' ')}…`;
};

const formatDate = (iso) => {
	if (!iso) {
		return '';
	}

	const date = new Date(String(iso));

	if (Number.isNaN(date.getTime())) {
		return String(iso);
	}

	return date.toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
	});
};

const getFeaturedImage = (post) => {
	const featuredMedia =
		post?._embedded?.['wp:featuredmedia']?.[0];

	return (
		featuredMedia?.media_details?.sizes
			?.medium_large?.source_url ||
		featuredMedia?.media_details?.sizes?.large
			?.source_url ||
		featuredMedia?.source_url ||
		''
	);
};

function Editor({
	attributes,
	setAttributes,
}) {
	const device = useGlobalResponsiveDevice();

	const {
		perPage = 6,
		order = 'desc',
		orderBy = 'date',
		relateBy = 'categories',
		fallbackToRecent = true,
		emptyText = 'No related posts found.',
	} = attributes;

	const columns = clampInt(
		getResponsiveValue(
			attributes.columns,
			device,
			device === 'desktop'
				? 3
				: device === 'tablet'
					? 2
					: 1
		),
		1,
		4,
		3
	);

	const gap = clampInt(
		getResponsiveValue(
			attributes.gap,
			device,
			16
		),
		8,
		28,
		16
	);

	const showFeaturedImage = Boolean(
		getResponsiveValue(
			attributes.showFeaturedImage,
			device,
			true
		)
	);

	const imageHeight = clampInt(
		getResponsiveValue(
			attributes.imageHeight,
			device,
			180
		),
		120,
		320,
		180
	);

	const showExcerpt = Boolean(
		getResponsiveValue(
			attributes.showExcerpt,
			device,
			true
		)
	);

	const excerptLength = clampInt(
		getResponsiveValue(
			attributes.excerptLength,
			device,
			20
		),
		8,
		60,
		20
	);

	const showMeta = Boolean(
		getResponsiveValue(
			attributes.showMeta,
			device,
			true
		)
	);

	const showDate = Boolean(
		getResponsiveValue(
			attributes.showDate,
			device,
			true
		)
	);

	const showAuthor = Boolean(
		getResponsiveValue(
			attributes.showAuthor,
			device,
			true
		)
	);

	const titleColor = getResponsiveValue(
		attributes.titleColor,
		device,
		'#111827'
	);

	const titleFontFamily = getResponsiveValue(
		attributes.titleFontFamily,
		device,
		'inherit'
	);

	const metaColor = getResponsiveValue(
		attributes.metaColor,
		device,
		'#6b7280'
	);

	const excerptColor = getResponsiveValue(
		attributes.excerptColor,
		device,
		'#374151'
	);

	const cardBg = getResponsiveValue(
		attributes.cardBg,
		device,
		'#ffffff'
	);

	const cardBorder = getResponsiveValue(
		attributes.cardBorder,
		device,
		'#e5e7eb'
	);

	const [loading, setLoading] =
		useState(true);

	const [posts, setPosts] = useState([]);
	const [postId, setPostId] = useState(0);

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

	useEffect(() => {
		const currentPostId =
			inferCurrentPostId();

		setPostId(currentPostId || 0);
	}, []);

	useEffect(() => {
		let alive = true;

		setLoading(true);

		const currentPostId =
			postId || inferCurrentPostId();

		fetchPostsRelated({
			postId: currentPostId,
			perPage,
			order,
			orderBy,
			relateBy,
			fallbackToRecent,
		})
			.then((data) => {
				if (!alive) {
					return;
				}

				setPosts(
					Array.isArray(data)
						? data
						: []
				);
			})
			.catch((error) => {
				console.warn(
					'UPLIFTERS_SITE_BUILDER_BLOCKS related posts fetch failed in editor',
					error
				);

				if (alive) {
					setPosts([]);
				}
			})
			.finally(() => {
				if (alive) {
					setLoading(false);
				}
			});

		return () => {
			alive = false;
		};
	}, [
		postId,
		perPage,
		order,
		orderBy,
		relateBy,
		fallbackToRecent,
	]);

	const palette = useMemo(
		() => [
			{
				name: 'Gray 900',
				color: '#111827',
			},
			{
				name: 'Gray 700',
				color: '#374151',
			},
			{
				name: 'Gray 500',
				color: '#6b7280',
			},
			{
				name: 'Border',
				color: '#e5e7eb',
			},
			{
				name: 'Blue 600',
				color: '#2563eb',
			},
			{
				name: 'White',
				color: '#ffffff',
			},
		],
		[]
	);

	const styles = {
		wrap: {
			width: '100%',
			boxSizing: 'border-box',
		},
		header: {
			display: 'flex',
			justifyContent: 'space-between',
			gap: '12px',
			alignItems: 'center',
			marginBottom: '12px',
			padding: '8px 0',
			borderBottom: `1px solid ${cardBorder}`,
		},
		title: {
			margin: 0,
			fontSize: '14px',
			fontWeight: 700,
			color: titleColor,
		},
		hint: {
			margin: 0,
			fontSize: '12px',
			color: metaColor,
		},
		autoNotice: {
			margin: '0 0 14px',
			padding: '10px 12px',
			borderRadius: '12px',
			border: `1px solid ${cardBorder}`,
			background: cardBg,
			color: metaColor,
			fontSize: '12px',
			lineHeight: 1.55,
		},
		grid: {
			display: 'grid',
			gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
			gap: `${gap}px`,
			width: '100%',
		},
		card: {
			background: cardBg,
			border: `1px solid ${cardBorder}`,
			borderRadius: '16px',
			overflow: 'hidden',
			boxShadow:
				'0 1px 2px rgba(0, 0, 0, 0.04)',
			display: 'flex',
			flexDirection: 'column',
			minWidth: 0,
			boxSizing: 'border-box',
		},
		imageWrapper: {
			width: '100%',
			height: `${imageHeight}px`,
			background: '#f3f4f6',
			overflow: 'hidden',
		},
		image: {
			width: '100%',
			height: '100%',
			objectFit: 'cover',
			display: 'block',
		},
		body: {
			padding: '12px 12px 14px',
			display: 'flex',
			flexDirection: 'column',
			gap: '8px',
			boxSizing: 'border-box',
		},
		postTitle: {
			margin: 0,
			fontSize: '15px',
			fontWeight: 800,
			color: titleColor,
			WebkitTextFillColor: titleColor,
			fontFamily: getFontFamilyCss(titleFontFamily),
			lineHeight: 1.35,
		},
		meta: {
			display: 'flex',
			flexWrap: 'wrap',
			gap: '8px',
			color: metaColor,
			fontSize: '12px',
		},
		excerpt: {
			margin: 0,
			color: excerptColor,
			WebkitTextFillColor: excerptColor,
			fontSize: '13px',
			lineHeight: 1.65,
		},
		state: {
			textAlign: 'center',
			padding: '22px 0',
			color: metaColor,
		},
	};

	const blockProps = useBlockProps({
		className: [
			'up2-related-posts-block-editor',
			`up2-related-posts-block-editor--${device}`,
		].join(' '),
		style: styles.wrap,
	});

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody
					key={`query-settings-${
						openSettingsPanel ===
						'query'
							? 'open'
							: 'closed'
					}`}
					title="Query"
					initialOpen={false}
					opened={
						openSettingsPanel ===
						'query'
					}
					onToggle={(next) =>
						setOpenSettingsPanel(
							next ? 'query' : null
						)
					}
				>
					<RangeControl
						label="Posts Per Page"
						value={perPage}
						onChange={(value) =>
							setAttributes({
								perPage:
									clampInt(
										value,
										1,
										24,
										6
									),
							})
						}
						min={1}
						max={12}
						step={1}
					/>

					<SelectControl
						label="Relate By"
						value={relateBy}
						options={[
							{
								label:
									'Categories',
								value:
									'categories',
							},
							{
								label: 'Tags',
								value: 'tags',
							},
							{
								label:
									'Both (categories + tags)',
								value: 'both',
							},
						]}
						onChange={(value) =>
							setAttributes({
								relateBy: value,
							})
						}
					/>

					<ToggleControl
						label="Fallback to Recent posts when no related found"
						checked={Boolean(
							fallbackToRecent
						)}
						onChange={(value) =>
							setAttributes({
								fallbackToRecent:
									Boolean(value),
							})
						}
					/>

					<SelectControl
						label="Order By"
						value={orderBy}
						options={[
							{
								label: 'Date',
								value: 'date',
							},
							{
								label: 'Modified',
								value:
									'modified',
							},
							{
								label: 'Title',
								value: 'title',
							},
							{
								label:
									'Menu Order',
								value:
									'menu_order',
							},
							{
								label: 'Random',
								value: 'rand',
							},
						]}
						onChange={(value) =>
							setAttributes({
								orderBy: value,
							})
						}
					/>

					<SelectControl
						label="Order"
						value={order}
						options={[
							{
								label:
									'DESC (newest first)',
								value: 'desc',
							},
							{
								label:
									'ASC (oldest first)',
								value: 'asc',
							},
						]}
						onChange={(value) =>
							setAttributes({
								order:
									value ===
									'asc'
										? 'asc'
										: 'desc',
							})
						}
					/>
				</PanelBody>

				<PanelBody
					key={`layout-settings-${
						openSettingsPanel ===
						'layout'
							? 'open'
							: 'closed'
					}`}
					title="Content"
					initialOpen={false}
					opened={
						openSettingsPanel ===
						'layout'
					}
					onToggle={(next) =>
						setOpenSettingsPanel(
							next ? 'layout' : null
						)
					}
				>
					<ToggleControl
						label="Show Featured Image"
						checked={
							showFeaturedImage
						}
						onChange={(value) =>
							updateResponsiveAttribute(
								'showFeaturedImage',
								Boolean(value)
							)
						}
					/>

					<ToggleControl
						label="Show Meta (date/author)"
						checked={showMeta}
						onChange={(value) =>
							updateResponsiveAttribute(
								'showMeta',
								Boolean(value)
							)
						}
					/>

					<ToggleControl
						label="Show Date"
						checked={showDate}
						onChange={(value) =>
							updateResponsiveAttribute(
								'showDate',
								Boolean(value)
							)
						}
						disabled={!showMeta}
					/>

					<ToggleControl
						label="Show Author"
						checked={showAuthor}
						onChange={(value) =>
							updateResponsiveAttribute(
								'showAuthor',
								Boolean(value)
							)
						}
						disabled={!showMeta}
					/>

					<ToggleControl
						label="Show Excerpt"
						checked={showExcerpt}
						onChange={(value) =>
							updateResponsiveAttribute(
								'showExcerpt',
								Boolean(value)
							)
						}
					/>

					<RangeControl
						label="Excerpt Length (words)"
						value={excerptLength}
						onChange={(value) =>
							updateResponsiveAttribute(
								'excerptLength',
								clampInt(
									value,
									8,
									60,
									20
								)
							)
						}
						min={8}
						max={50}
						step={1}
						disabled={!showExcerpt}
					/>

					<TextControl
						label="Empty Text"
						value={emptyText}
						onChange={(value) =>
							setAttributes({
								emptyText: String(
									value ?? ''
								),
							})
						}
					/>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					key={`layout-styles-${
						openStylesPanel ===
						'layout'
							? 'open'
							: 'closed'
					}`}
					title="Layout"
					initialOpen={false}
					opened={
						openStylesPanel ===
						'layout'
					}
					onToggle={(next) =>
						setOpenStylesPanel(
							next ? 'layout' : null
						)
					}
				>
					<RangeControl
						label="Columns"
						value={columns}
						onChange={(value) =>
							updateResponsiveAttribute(
								'columns',
								clampInt(
									value,
									1,
									4,
									3
								)
							)
						}
						min={1}
						max={4}
						step={1}
					/>

					<RangeControl
						label="Gap (px)"
						value={gap}
						onChange={(value) =>
							updateResponsiveAttribute(
								'gap',
								clampInt(
									value,
									8,
									28,
									16
								)
							)
						}
						min={8}
						max={28}
						step={1}
					/>

					<RangeControl
						label="Image Height (px)"
						value={imageHeight}
						onChange={(value) =>
							updateResponsiveAttribute(
								'imageHeight',
								clampInt(
									value,
									120,
									320,
									180
								)
							)
						}
						min={120}
						max={320}
						step={10}
						disabled={
							!showFeaturedImage
						}
					/>
				</PanelBody>

				<PanelBody
					key={`typography-styles-${
						openStylesPanel ===
						'typography'
							? 'open'
							: 'closed'
					}`}
					title="Typography"
					initialOpen={false}
					opened={
						openStylesPanel ===
						'typography'
					}
					onToggle={(next) =>
						setOpenStylesPanel(
							next ? 'typography' : null
						)
					}
				>
					<FontFamilyControl
						label="Title Font Family"
						value={titleFontFamily}
						onChange={(value) =>
							updateResponsiveAttribute(
								'titleFontFamily',
								value
							)
						}
					/>
				</PanelBody>

				<PanelBody
					key={`colors-styles-${device}-${
						openStylesPanel ===
						'colors'
							? 'open'
							: 'closed'
					}`}
					title="Colors"
					initialOpen={false}
					opened={
						openStylesPanel ===
						'colors'
					}
					onToggle={(next) =>
						setOpenStylesPanel(
							next ? 'colors' : null
						)
					}
				>
					<BaseControl label="Title Color">
						<ColorPalette
							key={`title-color-${device}`}
							colors={palette}
							value={titleColor}
							onChange={(value) =>
								updateResponsiveAttribute(
									'titleColor',
									value ||
										'#111827'
								)
							}
						 enableAlpha/>
					</BaseControl>

					<BaseControl label="Meta Color">
						<ColorPalette
							key={`meta-color-${device}`}
							colors={palette}
							value={metaColor}
							onChange={(value) =>
								updateResponsiveAttribute(
									'metaColor',
									value ||
										'#6b7280'
								)
							}
						 enableAlpha/>
					</BaseControl>

					<BaseControl label="Excerpt Color">
						<ColorPalette
							key={`excerpt-color-${device}`}
							colors={palette}
							value={excerptColor}
							onChange={(value) =>
								updateResponsiveAttribute(
									'excerptColor',
									value ||
										'#374151'
								)
							}
						 enableAlpha/>
					</BaseControl>

					<BaseControl label="Card Background">
						<ColorPalette
							key={`card-background-${device}`}
							colors={palette}
							value={cardBg}
							onChange={(value) =>
								updateResponsiveAttribute(
									'cardBg',
									value ||
										'#ffffff'
								)
							}
						 enableAlpha/>
					</BaseControl>

					<BaseControl label="Card Border">
						<ColorPalette
							key={`card-border-${device}`}
							colors={palette}
							value={cardBorder}
							onChange={(value) =>
								updateResponsiveAttribute(
									'cardBorder',
									value ||
										'#e5e7eb'
								)
							}
						 enableAlpha/>
					</BaseControl>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div style={styles.header}>
					<p style={styles.title}>
						Related Posts Preview
					</p>

					<p style={styles.hint}>
						Post ID:{' '}
						{postId
							? postId
							: 'not detected'}{' '}
						{postId
							? ''
							: '(fallback in frontend)'}
					</p>
				</div>

				<p style={styles.autoNotice}>
					Auto placement is enabled: this block hooks after Post Content and renders on every single post view automatically.
				</p>

				{loading ? (
					<div style={styles.state}>
						Loading related posts…
					</div>
				) : null}

				{!loading &&
				posts.length === 0 ? (
					<div style={styles.state}>
						{emptyText}
					</div>
				) : null}

				{!loading &&
				posts.length > 0 ? (
					<div style={styles.grid}>
						{posts.map((post) => {
							const image =
								getFeaturedImage(
									post
								);

							const title =
								stripTags(
									post?.title
										?.rendered ||
										'Untitled'
								);

							const excerpt =
								stripTags(
									post?.excerpt
										?.rendered ||
										''
								);

							const authorName =
								post?._embedded
									?.author?.[0]
									?.name || '';

							return (
								<div
									key={post.id}
									style={
										styles.card
									}
								>
									{showFeaturedImage ? (
										<div
											style={
												styles.imageWrapper
											}
										>
											{image ? (
												<img
													src={
														image
													}
													alt={
														title
													}
													style={
														styles.image
													}
													loading="lazy"
												/>
											) : null}
										</div>
									) : null}

									<div
										style={
											styles.body
										}
									>
										<p
											style={
												styles.postTitle
											}
										>
											{title}
										</p>

										{showMeta ? (
											<div
												style={
													styles.meta
												}
											>
												{showDate ? (
													<span>
														{formatDate(
															post.date
														)}
													</span>
												) : null}

												{showAuthor &&
												authorName ? (
													<span>
														{showDate
															? '• '
															: ''}
														{
															authorName
														}
													</span>
												) : null}
											</div>
										) : null}

										{showExcerpt ? (
											<p
												style={
													styles.excerpt
												}
											>
												{trimWords(
													excerpt,
													excerptLength
												)}
											</p>
										) : null}
									</div>
								</div>
							);
						})}
					</div>
				) : null}
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="posts-related" /> : <Editor {...props} />;
}
