import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	ColorPalette,
	Notice,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { store as coreStore } from '@wordpress/core-data';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';

const META_KEY = 'uplifters_site_builder_blocks_post_featured_image_style';

const clamp = (value, min, max, fallback) => {
	const n = Number(value);

	if (!Number.isFinite(n)) return fallback;
	if (n < min) return min;
	if (n > max) return max;

	return n;
};

const styles = {
	message: {
		textAlign: 'center',
		paddingTop: '40px',
		paddingBottom: '40px',
		color: '#6b7280',
	},
	card: {
		backgroundColor: '#ffffff',
		borderRadius: '12px',
		boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)',
		padding: '24px',
	},
	previewWrap: {
		width: '100%',
	},
	previewImage: {
		display: 'block',
		width: '100%',
		height: 'auto',
	},
	previewFallback: {
		textAlign: 'center',
		paddingTop: '40px',
		paddingBottom: '40px',
		color: '#6b7280',
		borderWidth: '1px',
		borderStyle: 'dashed',
		borderColor: '#d1d5db',
	},
};

/**
 * Reads the post that is currently open in the editor, together with the
 * featured image that is set in the sidebar's Featured Image box.
 *
 * getEditedPostAttribute('featured_media') is used rather than the saved post
 * object, so a newly chosen image appears here before the post is saved.
 */
function useCurrentPostFeaturedImage() {
	return useSelect((select) => {
		const editor = select(editorStore);

		const empty = {
			id: 0,
			type: '',
			meta: {},
			featuredMediaId: 0,
			imageUrl: '',
			imageAlt: '',
			isResolvingImage: false,
		};

		if (!editor || typeof editor.getCurrentPostId !== 'function') {
			return empty;
		}

		const postId = editor.getCurrentPostId();
		const postType = editor.getCurrentPostType();

		// Templates and reusable blocks are not real posts for this block.
		const isRealPost =
			!!postId &&
			postType !== 'wp_template' &&
			postType !== 'wp_template_part' &&
			postType !== 'wp_block' &&
			postType !== 'wp_navigation';

		if (!isRealPost) return empty;

		const featuredMediaId =
			Number(editor.getEditedPostAttribute('featured_media')) || 0;

		let imageUrl = '';
		let imageAlt = '';
		let isResolvingImage = false;

		if (featuredMediaId) {
			const media = select(coreStore).getMedia(featuredMediaId);

			if (media) {
				imageUrl =
					media?.media_details?.sizes?.large?.source_url ||
					media?.media_details?.sizes?.full?.source_url ||
					media?.source_url ||
					'';
				imageAlt = media?.alt_text || '';
			} else {
				isResolvingImage = !select(coreStore).hasFinishedResolution(
					'getMedia',
					[featuredMediaId]
				);
			}
		}

		return {
			id: Number(postId),
			type: postType || '',
			meta: editor.getEditedPostAttribute('meta') || {},
			featuredMediaId,
			imageUrl,
			imageAlt,
			isResolvingImage,
		};
	}, []);
}

function Editor({ attributes, setAttributes }) {
	const {
		imageBackgroundColor = '#ffffff',
		imageBorderRadius = 12,
		imageShadowX = 0,
		imageShadowY = 10,
		imageShadowBlur = 30,
		imageShadowSpread = 0,
		imageShadowOpacity = 0.18,
	} = attributes;

	const currentPost = useCurrentPostFeaturedImage();
	const { editPost } = useDispatch(editorStore);

	// Only one accordion open at a time per tab.
	const [openStylesPanel, setOpenStylesPanel] = useState(null);

	const backgroundPalette = useMemo(
		() => [
			{ name: 'White', color: '#ffffff' },
			{ name: 'Gray 50', color: '#f9fafb' },
			{ name: 'Gray 100', color: '#f3f4f6' },
			{ name: 'Gray 200', color: '#e5e7eb' },
			{ name: 'Blue 50', color: '#eff6ff' },
			{ name: 'Black', color: '#000000' },
		],
		[]
	);

	const radius = clamp(imageBorderRadius, 0, 200, 12);

	const shadowCss = `${clamp(imageShadowX, -100, 100, 0)}px ${clamp(
		imageShadowY,
		-100,
		100,
		10
	)}px ${clamp(imageShadowBlur, 0, 200, 30)}px ${clamp(
		imageShadowSpread,
		-100,
		100,
		0
	)}px rgba(0, 0, 0, ${clamp(imageShadowOpacity, 0, 1, 0.18)})`;

	/**
	 * Push the style into the meta of the post that is open in the editor.
	 * editPost() keeps the value inside the editor state, so it is written
	 * with the normal post save instead of a separate silent REST write.
	 */
	const lastSyncedRef = useRef('');

	useEffect(() => {
		if (!currentPost.id) return;

		const payload = {
			imageBackgroundColor: imageBackgroundColor || '#ffffff',
			imageBorderRadius: clamp(imageBorderRadius, 0, 200, 12),
			imageShadowX: clamp(imageShadowX, -100, 100, 0),
			imageShadowY: clamp(imageShadowY, -100, 100, 10),
			imageShadowBlur: clamp(imageShadowBlur, 0, 200, 30),
			imageShadowSpread: clamp(imageShadowSpread, -100, 100, 0),
			imageShadowOpacity: clamp(imageShadowOpacity, 0, 1, 0.18),
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
		imageBackgroundColor,
		imageBorderRadius,
		imageShadowX,
		imageShadowY,
		imageShadowBlur,
		imageShadowSpread,
		imageShadowOpacity,
		editPost,
	]);

	const blockProps = useBlockProps({
		className:
			'uplifters-site-builder-blocks-posts-featured-image-block uplifters-site-builder-blocks-posts-featured-image-editor-preview',
	});

	return (
		<>
			{/* Settings tab */}
			<InspectorControls group="settings">
				<PanelBody title="Content" initialOpen={false}>
					<p style={{ marginTop: 0, color: '#6b7280' }}>
						{currentPost.id
							? __(
									'This block uses the Featured Image of the post you are editing. Change it from the Featured Image box in the post sidebar.',
									'uplifters-site-builder-blocks'
							  )
							: __(
									'Open this block inside a post to bind it to that post’s featured image.',
									'uplifters-site-builder-blocks'
							  )}
					</p>
				</PanelBody>
			</InspectorControls>

			{/* Styles tab */}
			<InspectorControls group="styles">
				<PanelBody
					key={`uplifters-site-builder-blocks-posts-featured-image-bg-${
						openStylesPanel === 'image-background' ? 'open' : 'closed'
					}`}
					title="Colors"
					initialOpen={false}
					opened={openStylesPanel === 'image-background'}
					onToggle={(next) => setOpenStylesPanel(next ? 'image-background' : null)}
				>
					<p>Background Color</p>

					<ColorPalette
						colors={backgroundPalette}
						value={imageBackgroundColor}
						onChange={(value) =>
							setAttributes({ imageBackgroundColor: value || '#ffffff' })
						}
						enableAlpha
					/>
				</PanelBody>

				<PanelBody
					key={`uplifters-site-builder-blocks-posts-featured-image-radius-${
						openStylesPanel === 'image-radius' ? 'open' : 'closed'
					}`}
					title="Border"
					initialOpen={false}
					opened={openStylesPanel === 'image-radius'}
					onToggle={(next) => setOpenStylesPanel(next ? 'image-radius' : null)}
				>
					<RangeControl
						label="Border Radius (px)"
						value={imageBorderRadius}
						onChange={(value) =>
							setAttributes({ imageBorderRadius: clamp(value, 0, 200, 12) })
						}
						min={0}
						max={100}
						step={1}
					/>
				</PanelBody>

				<PanelBody
					key={`uplifters-site-builder-blocks-posts-featured-image-shadow-${
						openStylesPanel === 'image-shadow' ? 'open' : 'closed'
					}`}
					title="Shadow"
					initialOpen={false}
					opened={openStylesPanel === 'image-shadow'}
					onToggle={(next) => setOpenStylesPanel(next ? 'image-shadow' : null)}
				>
					<RangeControl
						label="Shadow X (px)"
						value={imageShadowX}
						onChange={(value) => setAttributes({ imageShadowX: clamp(value, -100, 100, 0) })}
						min={-50}
						max={50}
						step={1}
					/>

					<RangeControl
						label="Shadow Y (px)"
						value={imageShadowY}
						onChange={(value) => setAttributes({ imageShadowY: clamp(value, -100, 100, 10) })}
						min={-50}
						max={80}
						step={1}
					/>

					<RangeControl
						label="Shadow Blur (px)"
						value={imageShadowBlur}
						onChange={(value) => setAttributes({ imageShadowBlur: clamp(value, 0, 200, 30) })}
						min={0}
						max={120}
						step={1}
					/>

					<RangeControl
						label="Shadow Spread (px)"
						value={imageShadowSpread}
						onChange={(value) =>
							setAttributes({ imageShadowSpread: clamp(value, -100, 100, 0) })
						}
						min={-20}
						max={60}
						step={1}
					/>

					<RangeControl
						label="Shadow Opacity"
						value={imageShadowOpacity}
						onChange={(value) =>
							setAttributes({ imageShadowOpacity: clamp(value, 0, 1, 0.18) })
						}
						min={0}
						max={1}
						step={0.05}
					/>
				</PanelBody>
			</InspectorControls>

			{/* Editor canvas preview only. Frontend output stays blank via render.php. */}
			<div {...blockProps}>
				{!currentPost.id && (
					<Notice status="warning" isDismissible={false}>
						{__(
							'This block styles the featured image of the post it is placed in. Add it inside a post to see the image.',
							'uplifters-site-builder-blocks'
						)}
					</Notice>
				)}

				{!!currentPost.id && currentPost.isResolvingImage && (
					<div style={styles.message}>
						{__('Loading featured image…', 'uplifters-site-builder-blocks')}
					</div>
				)}

				{!!currentPost.id && !currentPost.isResolvingImage && (
					<div style={styles.card}>
						{currentPost.imageUrl ? (
							<div
								style={{
									...styles.previewWrap,
									backgroundColor: imageBackgroundColor || '#ffffff',
									borderRadius: `${radius}px`,
									boxShadow: shadowCss,
									overflow: 'hidden',
								}}
							>
								<img
									src={currentPost.imageUrl}
									alt={currentPost.imageAlt}
									style={{
										...styles.previewImage,
										borderRadius: `${radius}px`,
									}}
								/>
							</div>
						) : (
							<div
								style={{
									...styles.previewFallback,
									backgroundColor: imageBackgroundColor || '#ffffff',
									borderRadius: `${radius}px`,
									boxShadow: shadowCss,
								}}
							>
								{__(
									'No featured image set yet. Add one from the Featured Image box in the post sidebar.',
									'uplifters-site-builder-blocks'
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="posts-featured-image" /> : <Editor {...props} />;
}