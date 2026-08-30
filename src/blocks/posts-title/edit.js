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
	ColorPalette,
	Notice,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';

import { FontFamilyControl, getFontFamilyCss } from '../../assets-shared/fonts-family/font-family-control';

const META_KEY = 'uplifters_site_builder_blocks_post_title_style';

const safeNum = (v, fallback) => {
	const n = Number(v);
	return Number.isFinite(n) ? n : fallback;
};

/**
 * Post titles are stored raw, so entities such as &amp; must be decoded
 * before they are shown inside the editor canvas preview.
 */
const decodeEntities = (text) => {
	if (typeof text !== 'string' || text === '') return '';
	if (typeof document === 'undefined') return text;

	const el = document.createElement('textarea');
	el.innerHTML = text;
	return el.value;
};

const RESPONSIVE_DEVICES = ['desktop', 'tablet', 'mobile'];

const normalizeDevice = (device) => {
	const normalizedDevice = String(device || '').toLowerCase().trim();
	return RESPONSIVE_DEVICES.includes(normalizedDevice) ? normalizedDevice : 'desktop';
};

const getCurrentGlobalResponsiveDevice = () => {
	if (
		typeof window !== 'undefined' &&
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice === 'function'
	) {
		return normalizeDevice(window.UpliftersSiteBuilderBlocksResponsive.getDevice());
	}

	if (
		typeof window !== 'undefined' &&
		typeof window.upliftersSiteBuilderBlocksResponsiveDevice === 'string'
	) {
		return normalizeDevice(window.upliftersSiteBuilderBlocksResponsiveDevice);
	}

	return 'desktop';
};

function useGlobalResponsiveDevice() {
	const [device, setDevice] = useState(getCurrentGlobalResponsiveDevice);

	useEffect(() => {
		if (typeof window === 'undefined') return undefined;

		const handleDeviceChange = (event) => {
			const eventDevice =
				event?.detail?.device ||
				event?.detail?.deviceType ||
				event?.detail?.previewDeviceType;

			setDevice(eventDevice ? normalizeDevice(eventDevice) : getCurrentGlobalResponsiveDevice());
		};

		handleDeviceChange();

		window.addEventListener('uplifters-site-builder-blocks-responsive-device-change', handleDeviceChange);
		window.addEventListener('uplifters-site-builder-blocks-global-responsive-device-change', handleDeviceChange);

		const intervalId = window.setInterval(() => {
			const nextDevice = getCurrentGlobalResponsiveDevice();
			setDevice((currentDevice) => (currentDevice === nextDevice ? currentDevice : nextDevice));
		}, 500);

		return () => {
			window.removeEventListener('uplifters-site-builder-blocks-responsive-device-change', handleDeviceChange);
			window.removeEventListener('uplifters-site-builder-blocks-global-responsive-device-change', handleDeviceChange);
			window.clearInterval(intervalId);
		};
	}, []);

	return device;
}

const getResponsiveValue = (value, device, fallback = '') => {
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		if (Object.prototype.hasOwnProperty.call(value, device)) return value[device];
		if (Object.prototype.hasOwnProperty.call(value, 'desktop')) return value.desktop;
		if (Object.prototype.hasOwnProperty.call(value, 'tablet')) return value.tablet;
		if (Object.prototype.hasOwnProperty.call(value, 'mobile')) return value.mobile;
	}

	if (value !== undefined && value !== null && typeof value !== 'object') return value;

	return fallback;
};

const setResponsiveValue = (currentValue, device, nextValue) => ({
	...(currentValue && typeof currentValue === 'object' && !Array.isArray(currentValue)
		? currentValue
		: {}),
	[device]: nextValue,
});

const styles = {
	message: {
		textAlign: 'center',
		paddingTop: '40px',
		paddingBottom: '40px',
		color: '#6b7280',
	},
	controlGap: {
		marginTop: '16px',
	},
	card: {
		backgroundColor: '#ffffff',
		borderRadius: '12px',
		boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)',
		padding: '24px',
	},
	title: {
		fontWeight: 700,
		lineHeight: 1.375,
		margin: 0,
	},
	link: {
		textDecoration: 'none',
	},
};

/**
 * Reads the post that is currently open in the editor.
 *
 * In the post editor this resolves to the real post. In the site editor
 * (or any context without a post) it resolves to an empty descriptor and the
 * block renders a short explanation instead of a title.
 */
function useCurrentPost() {
	return useSelect((select) => {
		const editor = select(editorStore);

		if (!editor || typeof editor.getCurrentPostId !== 'function') {
			return { id: 0, type: '', title: '', permalink: '', meta: {} };
		}

		const currentPost = editor.getCurrentPost() || {};
		const postId = editor.getCurrentPostId();
		const postType = editor.getCurrentPostType();

		// Templates and template parts are not real posts for this block.
		const isRealPost =
			!!postId &&
			postType !== 'wp_template' &&
			postType !== 'wp_template_part' &&
			postType !== 'wp_block' &&
			postType !== 'wp_navigation';

		return {
			id: isRealPost ? Number(postId) : 0,
			type: postType || '',
			title: isRealPost ? String(editor.getEditedPostAttribute('title') || '') : '',
			permalink: currentPost?.link || '',
			meta: editor.getEditedPostAttribute('meta') || {},
		};
	}, []);
}

function Editor({ attributes, setAttributes }) {
	const device = useGlobalResponsiveDevice();
	const currentPost = useCurrentPost();
	const { editPost } = useDispatch(editorStore);

	const { linkTitle = false } = attributes;

	const titleColor = getResponsiveValue(attributes.titleColor, device, '#111827');
	const titleFontSize = safeNum(
		getResponsiveValue(
			attributes.titleFontSize,
			device,
			device === 'desktop' ? 18 : device === 'tablet' ? 17 : 16
		),
		18
	);
	const titleFontFamily = getResponsiveValue(attributes.titleFontFamily, device, 'inherit');

	// Only one accordion open at a time per tab.
	const [openSettingsPanel, setOpenSettingsPanel] = useState(null);
	const [openStylesPanel, setOpenStylesPanel] = useState(null);

	const titlePalette = useMemo(
		() => [
			{ name: 'Gray 900', color: '#111827' },
			{ name: 'Blue 600', color: '#2563eb' },
			{ name: 'Red 600', color: '#dc2626' },
			{ name: 'Green 600', color: '#16a34a' },
			{ name: 'Purple 600', color: '#7c3aed' },
			{ name: 'Black', color: '#000000' },
			{ name: 'White', color: '#ffffff' },
		],
		[]
	);

	const updateResponsiveAttribute = (attributeName, value) => {
		setAttributes({
			[attributeName]: setResponsiveValue(attributes[attributeName], device, value),
		});
	};

	/**
	 * Push the style into the meta of the post that is open in the editor.
	 * editPost() keeps the value inside the editor state, so it is written
	 * with the normal post save instead of a separate silent REST write.
	 */
	const lastSyncedRef = useRef('');

	useEffect(() => {
		if (!currentPost.id) return;

		const payload = {
			titleColor: setResponsiveValue(attributes.titleColor, device, titleColor || '#111827'),
			titleFontSize: setResponsiveValue(attributes.titleFontSize, device, safeNum(titleFontSize, 18)),
			titleFontFamily: setResponsiveValue(attributes.titleFontFamily, device, titleFontFamily || 'inherit'),
		};

		const nextSignature = JSON.stringify(payload);
		const savedSignature = JSON.stringify(currentPost.meta?.[META_KEY] ?? null);

		// Nothing changed since the last write, and nothing differs from what
		// is already stored on the post.
		if (lastSyncedRef.current === nextSignature && savedSignature === nextSignature) return;
		if (savedSignature === nextSignature) {
			lastSyncedRef.current = nextSignature;
			return;
		}

		lastSyncedRef.current = nextSignature;
		editPost({ meta: { [META_KEY]: payload } });
	}, [
		currentPost.id,
		currentPost.meta,
		titleColor,
		titleFontSize,
		titleFontFamily,
		attributes.titleColor,
		attributes.titleFontSize,
		attributes.titleFontFamily,
		device,
		editPost,
	]);

	const titleText = decodeEntities(currentPost.title);

	const blockProps = useBlockProps({
		className:
			'uplifters-site-builder-blocks-posts-title-block uplifters-site-builder-blocks-posts-title-editor-preview',
	});

	const renderTitle = () => {
		if (!linkTitle) return titleText;

		return (
			<a href={currentPost.permalink || '#'} style={{ ...styles.link, color: titleColor }}>
				{titleText}
			</a>
		);
	};

	return (
		<>
			{/* Settings tab */}
			<InspectorControls group="settings">
				<PanelBody
					key={`uplifters-site-builder-blocks-posts-title-settings-${openSettingsPanel === 'post-settings' ? 'open' : 'closed'}`}
					title="Content"
					initialOpen={false}
					opened={openSettingsPanel === 'post-settings'}
					onToggle={(next) => setOpenSettingsPanel(next ? 'post-settings' : null)}
				>
					<p style={{ marginTop: 0, color: '#6b7280' }}>
						{currentPost.id
							? __('This block uses the title of the post you are editing.', 'uplifters-site-builder-blocks')
							: __('Open this block inside a post to bind it to that post title.', 'uplifters-site-builder-blocks')}
					</p>

					<div style={styles.controlGap}>
						<ToggleControl
							label="Link Title"
							checked={!!linkTitle}
							onChange={(v) => setAttributes({ linkTitle: !!v })}
						/>
					</div>
				</PanelBody>
			</InspectorControls>

			{/* Styles tab */}
			<InspectorControls group="styles">
				<PanelBody
					key={`uplifters-site-builder-blocks-posts-title-color-${openStylesPanel === 'title-color' ? 'open' : 'closed'}`}
					title="Colors"
					initialOpen={false}
					opened={openStylesPanel === 'title-color'}
					onToggle={(next) => setOpenStylesPanel(next ? 'title-color' : null)}
				>
					<p>Text Color</p>

					<ColorPalette
						colors={titlePalette}
						value={titleColor}
						onChange={(v) => updateResponsiveAttribute('titleColor', v || '#111827')}
						enableAlpha
					/>
				</PanelBody>

				<PanelBody
					key={`uplifters-site-builder-blocks-posts-title-size-${openStylesPanel === 'title-size' ? 'open' : 'closed'}`}
					title="Typography"
					initialOpen={false}
					opened={openStylesPanel === 'title-size'}
					onToggle={(next) => setOpenStylesPanel(next ? 'title-size' : null)}
				>
					<RangeControl
						label="Title Size (px)"
						value={titleFontSize}
						onChange={(v) => updateResponsiveAttribute('titleFontSize', safeNum(v, 18))}
						min={12}
						max={60}
						step={1}
					/>

					<FontFamilyControl
						label="Font Family"
						value={titleFontFamily}
						onChange={(v) => updateResponsiveAttribute('titleFontFamily', v)}
					/>
				</PanelBody>
			</InspectorControls>

			{/* Editor canvas preview only. Frontend output stays blank via render.php. */}
			<div {...blockProps}>
				{!currentPost.id && (
					<Notice status="warning" isDismissible={false}>
						{__(
							'This block styles the title of the post it is placed in. Add it inside a post to see the title.',
							'uplifters-site-builder-blocks'
						)}
					</Notice>
				)}

				{!!currentPost.id && titleText === '' && (
					<div style={styles.message}>
						{__('This post has no title yet. Type a title above.', 'uplifters-site-builder-blocks')}
					</div>
				)}

				{!!currentPost.id && titleText !== '' && (
					<div style={styles.card}>
						<h3
							style={{
								...styles.title,
								color: titleColor,
								fontSize: `${safeNum(titleFontSize, 18)}px`,
								fontFamily: getFontFamilyCss(titleFontFamily),
							}}
						>
							{renderTitle()}
						</h3>
					</div>
				)}
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="posts-title" /> : <Editor {...props} />;
}