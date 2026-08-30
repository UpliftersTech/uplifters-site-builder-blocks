import './editor.scss';
import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import {
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';

import {
	PanelBody,
	ToggleControl,
	RangeControl,
	BaseControl,
	Button,
	SelectControl,
	Modal,
	ColorPalette,
} from '@wordpress/components';

import { __ } from '@wordpress/i18n';
import {
	useEffect,
	useMemo,
	useState,
} from '@wordpress/element';

import { fetchPostsList } from '../../api-requests';
import { ResponsiveFontFamilyControl, getFontFamilyCss } from '../../assets-shared/fonts-family/font-family-control';
import variations from './variations';

const RESPONSIVE_DEVICES = ['desktop', 'tablet', 'mobile'];

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
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice === 'function'
	) {
		return normalizeDevice(window.UpliftersSiteBuilderBlocksResponsive.getDevice());
	}

	if (typeof document !== 'undefined') {
		if (
			document.body?.classList.contains('uplifters-site-builder-blocks-device-mobile') ||
			document.documentElement?.classList.contains('uplifters-site-builder-blocks-device-mobile')
		) {
			return 'mobile';
		}

		if (
			document.body?.classList.contains('uplifters-site-builder-blocks-device-tablet') ||
			document.documentElement?.classList.contains('uplifters-site-builder-blocks-device-tablet')
		) {
			return 'tablet';
		}
	}

	return 'desktop';
};

/**
 * Reads the active device exclusively from the global responsive system.
 *
 * This block does not render or control its own responsive-device switcher.
 */
function useGlobalResponsiveDevice() {
	const [device, setDevice] = useState(
		getCurrentGlobalResponsiveDevice
	);

	useEffect(() => {
		const updateDevice = (event) => {
			const eventDevice = event?.detail?.device;

			setDevice(
				eventDevice
					? normalizeDevice(eventDevice)
					: getCurrentGlobalResponsiveDevice()
			);
		};

		window.addEventListener(
			'uplifters-site-builder-blocks-responsive-device-change',
			updateDevice
		);

		const observer = new MutationObserver(() => {
			setDevice(getCurrentGlobalResponsiveDevice());
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class', 'data-device'],
		});

		if (document.body) {
			observer.observe(document.body, {
				attributes: true,
				attributeFilter: ['class', 'data-device'],
			});
		}

		const intervalId = window.setInterval(() => {
			const nextDevice = getCurrentGlobalResponsiveDevice();

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

			observer.disconnect();
			window.clearInterval(intervalId);
		};
	}, []);

	return device;
}

const getResponsiveValue = (
	attributes,
	attributeName,
	device,
	fallback = ''
) => {
	const responsiveValue = attributes?.[attributeName];

	if (
		responsiveValue !== null &&
		typeof responsiveValue === 'object' &&
		!Array.isArray(responsiveValue)
	) {
		if (
			Object.prototype.hasOwnProperty.call(
				responsiveValue,
				device
			)
		) {
			return responsiveValue[device];
		}

		if (
			Object.prototype.hasOwnProperty.call(
				responsiveValue,
				'desktop'
			)
		) {
			return responsiveValue.desktop;
		}

		if (
			Object.prototype.hasOwnProperty.call(
				responsiveValue,
				'tablet'
			)
		) {
			return responsiveValue.tablet;
		}

		if (
			Object.prototype.hasOwnProperty.call(
				responsiveValue,
				'mobile'
			)
		) {
			return responsiveValue.mobile;
		}
	}

	/*
	 * Compatibility for blocks saved before responsive attributes
	 * were introduced.
	 */
	if (
		responsiveValue !== undefined &&
		responsiveValue !== null &&
		typeof responsiveValue !== 'object'
	) {
		return responsiveValue;
	}

	return fallback;
};

const setResponsiveValue = (
	attributes,
	setAttributes,
	attributeName,
	device,
	value
) => {
	const currentValue =
		attributes?.[attributeName] &&
		typeof attributes[attributeName] === 'object' &&
		!Array.isArray(attributes[attributeName])
			? attributes[attributeName]
			: {};

	setAttributes({
		[attributeName]: {
			...currentValue,
			[device]: value,
		},
	});
};

const normalizeRawDate = (raw) => {
	if (!raw) {
		return '';
	}

	if (typeof raw === 'object') {
		if (raw.rendered) {
			return raw.rendered;
		}

		if (raw.date) {
			return raw.date;
		}

		return '';
	}

	if (typeof raw === 'number') {
		const milliseconds =
			raw < 10_000_000_000 ? raw * 1000 : raw;

		return new Date(milliseconds).toISOString();
	}

	return String(raw).trim();
};

const formatDate = (raw) => {
	const dateString = normalizeRawDate(raw);

	if (!dateString) {
		return '';
	}

	const date = new Date(dateString);

	if (Number.isNaN(date.getTime())) {
		return dateString;
	}

	return date.toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
	});
};

const getDateText = (post) => {
	const candidates = [
		post?.date_formatted,
		post?.formatted_date,
		post?.date,
		post?.post_date,
		post?.date_gmt,
		post?.postDate,
		post?.published_at,
		post?.created_at,
		post?.modified,
		post?.post_modified,
		post?.updated_at,
		post?.meta?.date,
		post?.meta?.published_at,
	];

	for (const rawDate of candidates) {
		const output = formatDate(rawDate);

		if (output) {
			return output;
		}
	}

	return '';
};

const getFeatured = (post) => {
	const url =
		post?.featuredImageUrl ||
		post?.featured_image_url ||
		post?.image_url ||
		post?.thumbnail_url ||
		'';

	const alt =
		post?.featuredImageAlt ||
		post?.featured_image_alt ||
		post?.image_alt ||
		post?.title ||
		'';

	return {
		url: String(url || ''),
		alt: String(alt || ''),
	};
};

const trimChars = (text, maximumCharacters = 40) => {
	const maximum = Number(maximumCharacters) || 40;
	const normalizedText = String(text || '').trim();

	if (!normalizedText) {
		return '';
	}

	const characters = Array.from(normalizedText);

	if (characters.length <= maximum) {
		return normalizedText;
	}

	return `${characters.slice(0, maximum).join('')}…`;
};

const getLayoutLabel = (layoutType) => {
	const foundVariation = variations.find(
		(variation) => variation.name === layoutType
	);

	return foundVariation?.title || __('Choose Layout', 'uplifters-site-builder-blocks');
};

const getVariationResponsiveValue = (
	variation,
	attributeName,
	device,
	fallback = ''
) => {
	const variationValue = variation?.attributes?.[attributeName];

	if (
		variationValue &&
		typeof variationValue === 'object' &&
		!Array.isArray(variationValue)
	) {
		return (
			variationValue[device] ??
			variationValue.desktop ??
			variationValue.tablet ??
			variationValue.mobile ??
			fallback
		);
	}

	return variationValue ?? fallback;
};

const samplePosts = [
	{
		id: 1,
		title: 'Build Better WordPress Blocks',
		date: '2026-05-06',
		excerpt:
			'Create flexible Gutenberg blocks with clean layout controls and live previews.',
	},
	{
		id: 2,
		title: 'Design Fast Editorial Layouts',
		date: '2026-05-05',
		excerpt:
			'Display posts in beautiful lists, grids, feeds, and compact content sections.',
	},
	{
		id: 3,
		title: 'Improve Reader Experience',
		date: '2026-05-04',
		excerpt:
			'Use clear typography, images, excerpts, and call to action buttons.',
	},
];

const renderChooserPreview = (variation, device) => {
	const previewLayoutType = getVariationResponsiveValue(
		variation,
		'layoutType',
		device,
		variation.name
	);

	const previewColumns = Number(
		getVariationResponsiveValue(
			variation,
			'columns',
			device,
			3
		)
	);

	const showImage = Boolean(
		getVariationResponsiveValue(
			variation,
			'showImage',
			device,
			true
		)
	);

	const showDate = Boolean(
		getVariationResponsiveValue(
			variation,
			'showDate',
			device,
			true
		)
	);

	const showExcerpt = Boolean(
		getVariationResponsiveValue(
			variation,
			'showExcerpt',
			device,
			true
		)
	);

	const showReadMore = Boolean(
		getVariationResponsiveValue(
			variation,
			'showReadMore',
			device,
			true
		)
	);

	const titleColor = getVariationResponsiveValue(
		variation,
		'titleColor',
		device,
		'#111827'
	);

	const readMoreBackground = getVariationResponsiveValue(
		variation,
		'readMoreBgColor',
		device,
		'#111827'
	);

	const isGrid = previewLayoutType === 'grid-cards';
	const isCompact = previewLayoutType === 'compact-list';
	const isMinimal = previewLayoutType === 'minimal-feed';

	const previewStyles = {
		list: isGrid
			? {
					display: 'grid',
					gridTemplateColumns: `repeat(${Math.max(
						1,
						previewColumns
					)}, minmax(0, 1fr))`,
					gap: '4px',
				}
			: {
					display: 'flex',
					flexDirection: 'column',
					gap: isCompact
						? '3px'
						: isMinimal
							? '0'
							: '4px',
				},
		card: {
			background: '#ffffff',
			border: isMinimal
				? '0'
				: '1px solid #e5e7eb',
			borderBottom: '1px solid #e5e7eb',
			borderRadius: isMinimal ? '0' : '6px',
			overflow: 'hidden',
			boxShadow: isMinimal
				? 'none'
				: '0 3px 7px rgba(15, 23, 42, 0.07)',
		},
		inner: {
			display: 'flex',
			flexDirection:
				isGrid || isMinimal ? 'column' : 'row',
			gap: isCompact ? '4px' : '5px',
			padding: isMinimal
				? '4px 0'
				: isCompact
					? '4px'
					: '5px',
		},
		image: {
			display: showImage ? 'block' : 'none',
			flexShrink: 0,
			width: isGrid
				? '100%'
				: isCompact
					? '32px'
					: '44px',
			height: isGrid
				? '34px'
				: isCompact
					? '26px'
					: '34px',
			borderRadius: '4px',
			background:
				'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 45%, #f5d0fe 100%)',
		},
		content: {
			flex: 1,
			minWidth: 0,
		},
		title: {
			width: '88%',
			height: isCompact ? '5px' : '6px',
			borderRadius: '999px',
			background: titleColor,
			opacity: 0.9,
			marginBottom: '3px',
		},
		date: {
			display: showDate ? 'block' : 'none',
			width: '42%',
			height: '4px',
			borderRadius: '999px',
			background: '#cbd5e1',
			marginBottom: '3px',
		},
		excerptOne: {
			display: showExcerpt ? 'block' : 'none',
			width: '100%',
			height: '4px',
			borderRadius: '999px',
			background: '#e5e7eb',
			marginBottom: '3px',
		},
		excerptTwo: {
			display: showExcerpt ? 'block' : 'none',
			width: '72%',
			height: '4px',
			borderRadius: '999px',
			background: '#e5e7eb',
		},
		button: {
			display: showReadMore ? 'inline-flex' : 'none',
			width: isCompact ? '28px' : '34px',
			height: isCompact ? '10px' : '11px',
			borderRadius: '4px',
			background: readMoreBackground,
			marginTop: '4px',
		},
	};

	return (
		<div style={previewStyles.list}>
			{samplePosts.map((post, index) => (
				<article
					key={`${variation.name}-${device}-${post.id}`}
					style={previewStyles.card}
				>
					<div style={previewStyles.inner}>
						<div style={previewStyles.image} />

						<div style={previewStyles.content}>
							<div
								style={{
									...previewStyles.title,
									width:
										index === 1
											? '72%'
											: previewStyles.title
													.width,
								}}
							/>

							<div style={previewStyles.date} />
							<div style={previewStyles.excerptOne} />

							<div
								style={{
									...previewStyles.excerptTwo,
									width:
										index === 2
											? '54%'
											: previewStyles
													.excerptTwo
													.width,
								}}
							/>

							<div style={previewStyles.button} />
						</div>
					</div>
				</article>
			))}
		</div>
	);
};

function Editor({
	attributes,
	setAttributes,
	isSelected,
}) {
	const device = useGlobalResponsiveDevice();

	const perPage = Number(attributes.perPage) || 6;
	const linkTitle = Boolean(attributes.linkTitle);

	const layoutType = getResponsiveValue(
		attributes,
		'layoutType',
		device,
		''
	);

	const columns = Number(
		getResponsiveValue(
			attributes,
			'columns',
			device,
			device === 'desktop'
				? 3
				: device === 'tablet'
					? 2
					: 1
		)
	);

	const titleColor = getResponsiveValue(
		attributes,
		'titleColor',
		device,
		'#111827'
	);

	const titleFontFamily = getResponsiveValue(
		attributes,
		'titleFontFamily',
		device,
		'inherit'
	);

	const showImage = Boolean(
		getResponsiveValue(
			attributes,
			'showImage',
			device,
			true
		)
	);

	const showDate = Boolean(
		getResponsiveValue(
			attributes,
			'showDate',
			device,
			true
		)
	);

	const showExcerpt = Boolean(
		getResponsiveValue(
			attributes,
			'showExcerpt',
			device,
			true
		)
	);

	const showReadMore = Boolean(
		getResponsiveValue(
			attributes,
			'showReadMore',
			device,
			true
		)
	);

	const dateFontSize = Number(
		getResponsiveValue(
			attributes,
			'dateFontSize',
			device,
			14
		)
	);

	const excerptMaxChars = Number(
		getResponsiveValue(
			attributes,
			'excerptMaxChars',
			device,
			40
		)
	);

	const readMoreBgColor = getResponsiveValue(
		attributes,
		'readMoreBgColor',
		device,
		'#111827'
	);

	const readMoreFontSize = Number(
		getResponsiveValue(
			attributes,
			'readMoreFontSize',
			device,
			14
		)
	);

	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);

	const [
		openSettingsPanel,
		setOpenSettingsPanel,
	] = useState(null);

	const [openStylesPanel, setOpenStylesPanel] =
		useState(null);

	const [
		isLayoutModalOpen,
		setIsLayoutModalOpen,
	] = useState(false);

	const toggleSettingsPanel = (panelName) => {
		setOpenSettingsPanel((currentPanel) =>
			currentPanel === panelName ? null : panelName
		);
	};

	const toggleStylesPanel = (panelName) => {
		setOpenStylesPanel((currentPanel) =>
			currentPanel === panelName ? null : panelName
		);
	};

	const applyVariation = (variation) => {
		const variationAttributes = variation.attributes || {};
		const responsiveAttributeNames = [
			'layoutType',
			'columns',
			'titleColor',
			'showImage',
			'showDate',
			'showExcerpt',
			'showReadMore',
			'dateFontSize',
			'excerptMaxChars',
			'readMoreBgColor',
			'readMoreFontSize',
		];

		const nextAttributes = {};

		responsiveAttributeNames.forEach(
			(attributeName) => {
				const nextValue =
					getVariationResponsiveValue(
						variation,
						attributeName,
						device
					);

				if (nextValue === undefined) {
					return;
				}

				const currentValue =
					attributes?.[attributeName] &&
					typeof attributes[attributeName] ===
						'object' &&
					!Array.isArray(
						attributes[attributeName]
					)
						? attributes[attributeName]
						: {};

				nextAttributes[attributeName] = {
					...currentValue,
					[device]: nextValue,
				};
			}
		);

		if (
			Object.prototype.hasOwnProperty.call(
				variationAttributes,
				'perPage'
			)
		) {
			nextAttributes.perPage =
				variationAttributes.perPage;
		}

		if (
			Object.prototype.hasOwnProperty.call(
				variationAttributes,
				'linkTitle'
			)
		) {
			nextAttributes.linkTitle =
				variationAttributes.linkTitle;
		}

		setAttributes(nextAttributes);
		setIsLayoutModalOpen(false);
	};

	useEffect(() => {
		if (!layoutType && isSelected) {
			setIsLayoutModalOpen(true);
		}
	}, [layoutType, isSelected, device]);

	useEffect(() => {
		if (!layoutType) {
			return undefined;
		}

		let alive = true;

		setLoading(true);

		fetchPostsList({ perPage })
			.then((data) => {
				if (!alive) {
					return;
				}

				setPosts(Array.isArray(data) ? data : []);
			})
			.catch((error) => {
				console.warn(
					'UPLIFTERS_SITE_BUILDER_BLOCKS editor posts fetch failed',
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
	}, [layoutType, perPage]);

	const palette = useMemo(
		() => [
			{
				name: __('Gray 900', 'uplifters-site-builder-blocks'),
				color: '#111827',
			},
			{
				name: __('Blue 600', 'uplifters-site-builder-blocks'),
				color: '#2563eb',
			},
			{
				name: __('Red 600', 'uplifters-site-builder-blocks'),
				color: '#dc2626',
			},
			{
				name: __('Green 600', 'uplifters-site-builder-blocks'),
				color: '#16a34a',
			},
			{
				name: __('Purple 600', 'uplifters-site-builder-blocks'),
				color: '#7c3aed',
			},
		],
		[]
	);

	const blockProps = useBlockProps({
		className: [
			'e2pu-post-custom-block-editor',
			`e2pu-post-custom-block-editor--${
				layoutType || 'choose'
			}`,
			`e2pu-post-custom-block-editor--device-${device}`,
		].join(' '),
	});

	const isGrid = layoutType === 'grid-cards';
	const isCompact = layoutType === 'compact-list';
	const isMinimal = layoutType === 'minimal-feed';

	const layoutStyles = {
		loading: {
			textAlign: 'center',
			padding: '40px 0',
			color: '#6b7280',
		},
		chooser: {
			border: '1px dashed #cbd5e1',
			borderRadius: '16px',
			padding: '28px',
			background: '#ffffff',
			textAlign: 'center',
		},
		chooserTitle: {
			margin: '0 0 8px',
			fontSize: '20px',
			fontWeight: 700,
			color: '#111827',
		},
		chooserText: {
			margin: '0 0 20px',
			color: '#6b7280',
		},
		chooserButton: {
			height: '44px',
			paddingInline: '22px',
			borderRadius: '10px',
		},
		modalIntro: {
			margin: '0 0 12px',
			color: '#64748b',
			fontSize: '12px',
			lineHeight: 1.45,
		},
		modalGrid: {
			display: 'grid',
			gridTemplateColumns:
				'repeat(auto-fit, minmax(180px, 1fr))',
			gap: '10px',
			alignItems: 'stretch',
		},
		modalCard: {
			display: 'flex',
			flexDirection: 'column',
			gap: '7px',
			height: '100%',
			padding: '9px',
			border: '1px solid #dbe3ee',
			borderRadius: '11px',
			background: '#ffffff',
			boxShadow:
				'0 6px 14px rgba(15, 23, 42, 0.10), 0 2px 5px rgba(15, 23, 42, 0.07)',
			cursor: 'pointer',
			position: 'relative',
			overflow: 'hidden',
			outline: 'none',
		},
		modalCardHead: {
			display: 'flex',
			justifyContent: 'space-between',
			gap: '8px',
			alignItems: 'flex-start',
		},
		modalCardTitle: {
			margin: 0,
			fontSize: '13px',
			fontWeight: 700,
			lineHeight: 1.3,
			color: '#0f172a',
		},
		modalCardDesc: {
			margin: '3px 0 0',
			color: '#64748b',
			fontSize: '11px',
			lineHeight: 1.35,
		},
		modalPreview: {
			padding: '6px',
			borderRadius: '9px',
			background: '#f8fafc',
			border: '1px solid #e5e7eb',
			minHeight: '0',
			pointerEvents: 'none',
		},
		list: isGrid
			? {
					display: 'grid',
					gridTemplateColumns: `repeat(${Math.max(
						1,
						columns
					)}, minmax(0, 1fr))`,
					gap: '24px',
					width: '100%',
				}
			: {
					display: 'flex',
					flexDirection: 'column',
					gap: isCompact
						? '14px'
						: isMinimal
							? '0'
							: '24px',
					width: '100%',
				},
		card: {
			background: '#ffffff',
			borderRadius: isMinimal ? '0' : '16px',
			overflow: 'hidden',
			borderBottom: isMinimal
				? '1px solid #e5e7eb'
				: '0',
			boxShadow: isMinimal
				? 'none'
				: '0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)',
		},
		inner: {
			padding: isMinimal
				? '14px 0'
				: isCompact
					? '12px'
					: '16px',
			display: 'flex',
			flexDirection:
				isGrid || isMinimal ? 'column' : 'row',
			gap: isCompact ? '12px' : '16px',
			alignItems: 'stretch',
		},
		left: {
			width: isGrid
				? '100%'
				: isCompact
					? '120px'
					: '176px',
			flexShrink: 0,
		},
		imageBox: {
			height: isGrid
				? device === 'mobile'
					? '220px'
					: '190px'
				: isCompact
					? '96px'
					: '144px',
			borderRadius: isCompact ? '10px' : '12px',
			overflow: 'hidden',
			boxShadow:
				'0 10px 15px -3px rgba(0,0,0,0.12), 0 4px 6px -4px rgba(0,0,0,0.12)',
			background: '#f3f4f6',
		},
		img: {
			width: '100%',
			height: '100%',
			objectFit: 'cover',
			display: 'block',
		},
		placeholder: {
			width: '100%',
			height: '100%',
		},
		right: {
			flex: 1,
			minWidth: 0,
			display: 'flex',
			flexDirection: 'column',
		},
		title: {
			fontSize: isCompact
				? '16px'
				: isMinimal
					? '17px'
					: '18px',
			fontWeight: 700,
			lineHeight: 1.3,
			margin: 0,
			color: titleColor,
			fontFamily: getFontFamilyCss(titleFontFamily),
			wordBreak: 'break-word',
		},
		titleLink: {
			color: titleColor,
			textDecoration: 'none',
		},
		date: {
			marginTop: '6px',
			color: '#6b7280',
			fontSize: `${dateFontSize}px`,
		},
		excerpt: {
			marginTop: isCompact ? '6px' : '10px',
			color: '#4b5563',
			fontSize: isCompact ? '13px' : '14px',
			lineHeight: 1.6,
			marginBottom: 0,
		},
		buttonLine: {
			marginTop: isCompact ? '8px' : '12px',
		},
		button: {
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: readMoreBgColor,
			color: '#ffffff',
			fontWeight: 600,
			fontSize: `${readMoreFontSize}px`,
			padding: isCompact
				? '6px 12px'
				: '8px 16px',
			borderRadius: '10px',
			textDecoration: 'none',
		},
	};


	const Title = ({ post }) => {
		const titleText = post?.title || '';

		if (!linkTitle) {
			return titleText;
		}

		return (
			<a
				href={post.permalink || '#'}
				target="_blank"
				rel="noreferrer"
				style={layoutStyles.titleLink}
				onClick={(event) => event.preventDefault()}
			>
				{titleText}
			</a>
		);
	};

	const LayoutPreviewModal = () => {
		if (!isLayoutModalOpen) {
			return null;
		}

		return (
			<Modal
				title={__('Choose Posts Layout', 'uplifters-site-builder-blocks')}
				onRequestClose={() =>
					setIsLayoutModalOpen(false)
				}
				className="e2pu-layout-preview-modal"
				shouldCloseOnClickOutside
			>
				<p style={layoutStyles.modalIntro}>
					{__(
						'Click a card to select the layout for the currently active responsive device.',
						'uplifters-site-builder-blocks'
					)}
				</p>

				<div
					className="e2pu-layout-preview-grid"
					style={layoutStyles.modalGrid}
				>
					{variations.map((variation) => {
						const isCurrent =
							variation.name === layoutType;

						const selectLayout = () => {
							applyVariation(variation);
						};

						return (
							<div
								key={variation.name}
								className={[
									'e2pu-layout-choice-card',
									isCurrent
										? 'is-current'
										: '',
								]
									.filter(Boolean)
									.join(' ')}
								style={layoutStyles.modalCard}
								role="button"
								tabIndex={0}
								aria-current={
									isCurrent
										? 'true'
										: undefined
								}
								aria-label={`${__(
									'Select layout',
									'uplifters-site-builder-blocks'
								)}: ${variation.title}`}
								onClick={selectLayout}
								onKeyDown={(event) => {
									if (
										event.key ===
											'Enter' ||
										event.key === ' '
									) {
										event.preventDefault();
										selectLayout();
									}
								}}
							>
								<div
									style={
										layoutStyles.modalCardHead
									}
								>
									<div>
										<h3
											style={
												layoutStyles.modalCardTitle
											}
										>
											{variation.title}
										</h3>

										<p
											style={
												layoutStyles.modalCardDesc
											}
										>
											{
												variation.description
											}
										</p>
									</div>

									{isCurrent && (
										<span className="e2pu-layout-current-badge">
											{__(
												'Current',
												'uplifters-site-builder-blocks'
											)}
										</span>
									)}
								</div>

								<div
									style={
										layoutStyles.modalPreview
									}
								>
									{renderChooserPreview(
										variation,
										device
									)}
								</div>
							</div>
						);
					})}
				</div>
			</Modal>
		);
	};

	if (!layoutType) {
		return (
			<>
				<LayoutPreviewModal />

				<InspectorControls group="settings">
					<div aria-hidden="true" />
				</InspectorControls>

				<InspectorControls group="styles">
					<div aria-hidden="true" />
				</InspectorControls>

				<div {...blockProps}>
					<div style={layoutStyles.chooser}>
						<h3
							style={layoutStyles.chooserTitle}
						>
							{__(
								'Choose Posts Layout',
								'uplifters-site-builder-blocks'
							)}
						</h3>

						<p
							style={layoutStyles.chooserText}
						>
							{__(
								'Choose a layout for the active responsive device.',
								'uplifters-site-builder-blocks'
							)}
						</p>

						<Button
							variant="primary"
							onClick={() =>
								setIsLayoutModalOpen(true)
							}
							style={
								layoutStyles.chooserButton
							}
						>
							{__(
								'Open Layout Preview',
								'uplifters-site-builder-blocks'
							)}
						</Button>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<LayoutPreviewModal />

			<InspectorControls group="settings">
				<PanelBody
					title={__('Structure', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={
						openSettingsPanel === 'layout'
					}
					onToggle={() =>
						toggleSettingsPanel('layout')
					}
				>
					<SelectControl
						label={__('Layout Type', 'uplifters-site-builder-blocks')}
						value={layoutType}
						options={variations.map(
							(variation) => ({
								label: variation.title,
								value: variation.name,
							})
						)}
						onChange={(value) => {
							const variation =
								variations.find(
									(item) =>
										item.name === value
								);

							if (variation) {
								applyVariation(variation);
							}
						}}
					/>

					<Button
						variant="secondary"
						onClick={() =>
							setIsLayoutModalOpen(true)
						}
					>
						{__('Open Layout Preview', 'uplifters-site-builder-blocks')}
					</Button>

					<Button
						variant="secondary"
						onClick={() => {
							setResponsiveValue(
								attributes,
								setAttributes,
								'layoutType',
								device,
								''
							);

							setIsLayoutModalOpen(true);
						}}
						style={{ marginTop: '8px' }}
					>
						{__('Choose Layout Again', 'uplifters-site-builder-blocks')}
					</Button>
				</PanelBody>

				<PanelBody
					title={__('Query', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={
						openSettingsPanel ===
						'query'
					}
					onToggle={() =>
						toggleSettingsPanel(
							'query'
						)
					}
				>
					<RangeControl
						label={__(
							'Posts Per Page',
							'uplifters-site-builder-blocks'
						)}
						value={perPage}
						onChange={(value) =>
							setAttributes({
								perPage:
									Number(value) || 6,
							})
						}
						min={1}
						max={20}
						step={1}
					/>
				</PanelBody>

				<PanelBody
					title={__('Content', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={
						openSettingsPanel ===
						'postSettings'
					}
					onToggle={() =>
						toggleSettingsPanel(
							'postSettings'
						)
					}
				>
					<ToggleControl
						label={__('Link Title', 'uplifters-site-builder-blocks')}
						checked={linkTitle}
						onChange={(value) =>
							setAttributes({
								linkTitle: Boolean(value),
							})
						}
					/>

					<ToggleControl
						label={__('Show Image', 'uplifters-site-builder-blocks')}
						checked={showImage}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'showImage',
								device,
								Boolean(value)
							)
						}
					/>

					<ToggleControl
						label={__('Show Date', 'uplifters-site-builder-blocks')}
						checked={showDate}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'showDate',
								device,
								Boolean(value)
							)
						}
					/>

					<ToggleControl
						label={__(
							'Show Excerpt',
							'uplifters-site-builder-blocks'
						)}
						checked={showExcerpt}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'showExcerpt',
								device,
								Boolean(value)
							)
						}
					/>

					<ToggleControl
						label={__(
							'Show Read More',
							'uplifters-site-builder-blocks'
						)}
						checked={showReadMore}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'showReadMore',
								device,
								Boolean(value)
							)
						}
					/>

					{showExcerpt && (
						<RangeControl
							label={__(
								'Excerpt Max Characters',
								'uplifters-site-builder-blocks'
							)}
							value={excerptMaxChars}
							onChange={(value) =>
								setResponsiveValue(
									attributes,
									setAttributes,
									'excerptMaxChars',
									device,
									Number(value) || 40
								)
							}
							min={10}
							max={200}
							step={1}
						/>
					)}

				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={__('Layout', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={
						openStylesPanel === 'layout'
					}
					onToggle={() =>
						toggleStylesPanel('layout')
					}
				>
					{isGrid && (
						<RangeControl
							label={__(
								'Columns',
								'uplifters-site-builder-blocks'
							)}
							value={columns}
							onChange={(value) =>
								setResponsiveValue(
									attributes,
									setAttributes,
									'columns',
									device,
									Number(value) || 1
								)
							}
							min={1}
							max={4}
							step={1}
						/>
					)}
				</PanelBody>

				<PanelBody
					title={__('Typography', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={
						openStylesPanel === 'typography'
					}
					onToggle={() =>
						toggleStylesPanel('typography')
					}
				>
					<ResponsiveFontFamilyControl
						label={__('Title Font Family', 'uplifters-site-builder-blocks')}
						device={device}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeName="titleFontFamily"
						getResponsiveValue={getResponsiveValue}
						setResponsiveValue={setResponsiveValue}
					/>

					{showDate && (
						<RangeControl
							label={__(
								'Date Font Size (px)',
								'uplifters-site-builder-blocks'
							)}
							value={dateFontSize}
							onChange={(value) =>
								setResponsiveValue(
									attributes,
									setAttributes,
									'dateFontSize',
									device,
									Number(value) || 14
								)
							}
							min={10}
							max={22}
							step={1}
						/>
					)}

					{showReadMore && (
						<RangeControl
							label={__(
								'Read More Text Size (px)',
								'uplifters-site-builder-blocks'
							)}
							value={readMoreFontSize}
							onChange={(value) =>
								setResponsiveValue(
									attributes,
									setAttributes,
									'readMoreFontSize',
									device,
									Number(value) || 14
								)
							}
							min={10}
							max={22}
							step={1}
						/>
					)}
				</PanelBody>

				<PanelBody
					title={__('Colors', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={
						openStylesPanel === 'colors'
					}
					onToggle={() =>
						toggleStylesPanel('colors')
					}
				>
					<BaseControl
						label={__('Title Color', 'uplifters-site-builder-blocks')}
					>
						<ColorPalette
							colors={palette}
							value={titleColor}
							onChange={(value) =>
								setResponsiveValue(
									attributes,
									setAttributes,
									'titleColor',
									device,
									value || '#111827'
								)
							}
						 enableAlpha/>
					</BaseControl>

					{showReadMore && (
						<BaseControl
							label={__(
								'Read More Button Background',
								'uplifters-site-builder-blocks'
							)}
						>
							<ColorPalette
								colors={palette}
								value={
									readMoreBgColor
								}
								onChange={(value) =>
									setResponsiveValue(
										attributes,
										setAttributes,
										'readMoreBgColor',
										device,
										value ||
											'#111827'
									)
								}
							 enableAlpha/>
						</BaseControl>
					)}
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div
					style={{
						marginBottom: '12px',
						color: '#6b7280',
						fontSize: '12px',
					}}
				>
					{__('Selected layout:', 'uplifters-site-builder-blocks')}{' '}
					{getLayoutLabel(layoutType)}
				</div>

				{loading && (
					<div style={layoutStyles.loading}>
						{__('Loading posts…', 'uplifters-site-builder-blocks')}
					</div>
				)}

				{!loading && posts.length === 0 && (
					<div style={layoutStyles.loading}>
						{__('No posts found.', 'uplifters-site-builder-blocks')}
					</div>
				)}

				{!loading && posts.length > 0 && (
					<div
						className="e2pu-editor-posts-list"
						style={layoutStyles.list}
					>
						{posts.map((post) => {
							const featured =
								getFeatured(post);

							const dateText =
								getDateText(post);

							const excerpt = trimChars(
								post.excerpt,
								excerptMaxChars
							);

							return (
								<article
									key={post.id}
									style={
										layoutStyles.card
									}
								>
									<div
										className="e2pu-card-inner"
										style={
											layoutStyles.inner
										}
									>
										{showImage && (
											<div
												className="e2pu-card-left"
												style={
													layoutStyles.left
												}
											>
												<div
													className="e2pu-image-box"
													style={
														layoutStyles.imageBox
													}
												>
													{featured.url ? (
														<img
															src={
																featured.url
															}
															alt={
																featured.alt ||
																post.title ||
																''
															}
															style={
																layoutStyles.img
															}
															loading="lazy"
														/>
													) : (
														<div
															style={
																layoutStyles.placeholder
															}
														/>
													)}
												</div>
											</div>
										)}

										<div
											style={
												layoutStyles.right
											}
										>
											<h3
												style={
													layoutStyles.title
												}
											>
												<Title
													post={post}
												/>
											</h3>

											{showDate &&
												dateText && (
													<div
														style={
															layoutStyles.date
														}
													>
														{
															dateText
														}
													</div>
												)}

											{showExcerpt &&
												excerpt && (
													<p
														style={
															layoutStyles.excerpt
														}
													>
														{
															excerpt
														}
													</p>
												)}

											{showReadMore && (
												<div
													style={
														layoutStyles.buttonLine
													}
												>
													<a
														href={
															post.permalink ||
															'#'
														}
														target="_blank"
														rel="noreferrer"
														style={
															layoutStyles.button
														}
														onClick={(
															event
														) =>
															event.preventDefault()
														}
													>
														{__(
															'Read More',
															'uplifters-site-builder-blocks'
														)}
													</a>
												</div>
											)}
										</div>
									</div>
								</article>
							);
						})}
					</div>
				)}
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="posts-list" /> : <Editor {...props} />;
}