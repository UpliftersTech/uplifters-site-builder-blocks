import InserterPreview from '../../blocks-inserter-preview/inserter-preview-shared';
import { __ } from '@wordpress/i18n';

import './editor.scss';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	Button,
	Notice,
	Spinner,
	BoxControl,
	RangeControl,
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useRef, useState } from '@wordpress/element';

const EMPTY_BOX = { top: '', right: '', bottom: '', left: '' };

const EMPTY_EMBED = {
	embedHtml: '',
	providerName: '',
	errorMessage: '',
	thumbnailUrl: '',
	title: '',
	type: '',
	youtubeId: '',
};

function normalizeDevice(device) {
	return ['desktop', 'tablet', 'mobile'].includes(device) ? device : 'desktop';
}

function getGlobalResponsiveDevice() {
	if (
		typeof window !== 'undefined' &&
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice === 'function'
	) {
		return normalizeDevice(window.UpliftersSiteBuilderBlocksResponsive.getDevice());
	}

	return 'desktop';
}

/**
 * Global Responsive Device Tracking hook.
 *
 * This block does not render its own desktop/tablet/mobile switcher. It follows
 * the global floating responsive toolbar/device context and updates only the
 * active device branch.
 */
function useGlobalResponsiveDevice() {
	const [device, setDevice] = useState(getGlobalResponsiveDevice());

	useEffect(() => {
		function handleDeviceChange(event) {
			if (event?.detail?.device) {
				setDevice(normalizeDevice(event.detail.device));
				return;
			}

			setDevice(getGlobalResponsiveDevice());
		}

		window.addEventListener('uplifters-site-builder-blocks-responsive-device-change', handleDeviceChange);

		const interval = window.setInterval(() => {
			const nextDevice = getGlobalResponsiveDevice();

			setDevice((currentDevice) =>
				currentDevice !== nextDevice ? nextDevice : currentDevice
			);
		}, 500);

		return () => {
			window.removeEventListener('uplifters-site-builder-blocks-responsive-device-change', handleDeviceChange);
			window.clearInterval(interval);
		};
	}, []);

	return device;
}

function getResponsiveValue(attributes, key, device, fallback = '') {
	const value = attributes[key];

	if (value && typeof value === 'object' && !Array.isArray(value)) {
		/*
		 * An unset branch must fall through to the next one rather than resolve
		 * to an empty string, so the canvas inherits the desktop value on
		 * tablet and mobile exactly the way render.php does.
		 */
		const branch = ['desktop', 'tablet', 'mobile'].find((name) => {
			const candidate = value[name];

			return candidate !== undefined && candidate !== null && candidate !== '';
		});

		const own = value[device];

		if (own !== undefined && own !== null && own !== '') {
			return own;
		}

		return branch ? value[branch] : fallback;
	}

	return value ?? fallback;
}

function setResponsiveValue(attributes, setAttributes, key, device, value) {
	const current =
		attributes[key] && typeof attributes[key] === 'object' && !Array.isArray(attributes[key])
			? attributes[key]
			: { desktop: attributes[key] ?? undefined };

	setAttributes({
		[key]: {
			...current,
			[device]: value,
		},
	});
}

function normalizeBox(box) {
	return {
		...EMPTY_BOX,
		...(box && typeof box === 'object' && !Array.isArray(box) ? box : {}),
	};
}

/**
 * True when at least one side of a box carries a value.
 *
 * @param {*} box Box to test.
 * @return {boolean} Whether the box is set.
 */
/**
 * Normalise one side of a box into a CSS length.
 *
 * BoxControl normally hands back strings such as "12px", but a bare number can
 * reach the attribute too. render.php casts with (string), which accepts those,
 * so anything stricter here would drop values the front end still renders and
 * leave the canvas out of sync with the published page.
 *
 * @param {*} value Raw side value.
 * @return {string} CSS length, or an empty string when unset.
 */
function toCssLength(value) {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? `${value}px` : '';
	}

	if (typeof value !== 'string') {
		return '';
	}

	const trimmed = value.trim();

	if (trimmed === '') {
		return '';
	}

	return /^-?\d*\.?\d+$/.test(trimmed) ? `${trimmed}px` : trimmed;
}

function hasBoxValue(box) {
	if (!box || typeof box !== 'object') {
		return false;
	}

	return ['top', 'right', 'bottom', 'left'].some(
		(side) => toCssLength(box[side]) !== ''
	);
}

/**
 * Read a responsive four-sided box value for the current device.
 *
 * An all-empty branch falls through to the next one, so the canvas inherits
 * the desktop box on tablet and mobile the same way render.php does.
 */
function getResponsiveBox(attributes, key, device) {
	const value = attributes[key];

	if (value && typeof value === 'object' && !Array.isArray(value)) {
		if ('desktop' in value || 'tablet' in value || 'mobile' in value) {
			const branch = [device, 'desktop', 'tablet', 'mobile'].find((name) =>
				hasBoxValue(value[name])
			);

			return branch ? normalizeBox(value[branch]) : normalizeBox();
		}

		return normalizeBox(value);
	}

	return normalizeBox();
}

function setResponsiveBox(attributes, setAttributes, key, device, value) {
	const current =
		attributes[key] &&
		typeof attributes[key] === 'object' &&
		!Array.isArray(attributes[key]) &&
		('desktop' in attributes[key] || 'tablet' in attributes[key] || 'mobile' in attributes[key])
			? attributes[key]
			: { desktop: normalizeBox(attributes[key]) };

	setAttributes({
		[key]: {
			...current,
			[device]: normalizeBox(value),
		},
	});
}

/**
 * Turn a box into wrapper styles.
 *
 * Each side is emitted twice: once as an inline longhand, and once as a custom
 * property that editor.scss reads back. The longhand alone is enough on the
 * front end, but in the canvas the custom property is the path that reliably
 * survives — it is how the border radius already reaches the element — so both
 * are written and whichever applies wins with the same value.
 *
 * @param {string} prefix    Inline style prefix ( padding or margin ).
 * @param {Object} box       Box values.
 * @param {string} varPrefix Custom property prefix.
 * @return {Object} React style object.
 */
function boxToStyle(prefix, box, varPrefix) {
	if (!box) return {};

	const style = {};
	const map = { top: 'Top', right: 'Right', bottom: 'Bottom', left: 'Left' };

	Object.keys(map).forEach((side) => {
		const value = toCssLength(box[side]);

		if (value === '') {
			return;
		}

		style[`${prefix}${map[side]}`] = value;
		style[`${varPrefix}-${side}`] = value;
	});

	return style;
}

/**
 * Turn a stored CSS length such as "12px" into the plain number a
 * RangeControl works with.
 *
 * @param {*}      value    Stored value.
 * @param {number} fallback Fallback number.
 * @return {number} Parsed number.
 */
function lengthToNumber(value, fallback = 0) {
	const parsed = parseFloat(value);

	return Number.isFinite(parsed) ? parsed : fallback;
}

function DeviceBadge({ device }) {
	const labels = {
		desktop: __('Desktop variant', 'uplifters-site-builder-blocks'),
		tablet: __('Tablet variant', 'uplifters-site-builder-blocks'),
		mobile: __('Mobile variant', 'uplifters-site-builder-blocks'),
	};

	return <div className="uplifters-site-builder-blocks-video-embed-device-badge">{labels[device] || labels.desktop}</div>;
}

function normalizeUrl(value) {
	const v = (value || '').trim();
	if (!v) return '';
	if (!/^https?:\/\//i.test(v) && /^[\w.-]+\.[a-z]{2,}/i.test(v)) {
		return `https://${v}`;
	}
	return v;
}

function isYouTubeUrl(url) {
	const u = (url || '').toLowerCase();
	return (
		u.includes('youtube.com') ||
		u.includes('youtu.be') ||
		u.includes('youtube-nocookie.com') ||
		u.includes('m.youtube.com')
	);
}

function extractYouTubeId(url) {
	try {
		const u = new URL(url);

		if (u.hostname.includes('youtu.be')) {
			const id = u.pathname.replace('/', '').trim();
			return id || '';
		}

		const v = u.searchParams.get('v');
		if (v) return v;

		const m1 = u.pathname.match(/\/embed\/([^/?#]+)/i);
		if (m1?.[1]) return m1[1];

		const m2 = u.pathname.match(/\/shorts\/([^/?#]+)/i);
		if (m2?.[1]) return m2[1];

		return '';
	} catch (e) {
		return '';
	}
}

function buildYouTubeEmbedHtml(videoId) {
	if (!videoId) return '';

	const base = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;
	const params = new URLSearchParams();

	params.set('rel', '0');
	params.set('playsinline', '1');
	params.set('enablejsapi', '1');

	return `
<iframe
  src="${base}?${params.toString()}"
  title="YouTube video player"
  frameborder="0"
  referrerpolicy="strict-origin-when-cross-origin"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowfullscreen
></iframe>
`.trim();
}

function fallbackYouTubeThumb(videoId) {
	return videoId ? `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg` : '';
}

async function fetchOEmbed(url) {
	const path = `/oembed/1.0/proxy?url=${encodeURIComponent(url)}`;
	const res = await apiFetch({ path });

	return {
		html: typeof res?.html === 'string' ? res.html : '',
		providerName: typeof res?.provider_name === 'string' ? res.provider_name : '',
		thumbnailUrl: typeof res?.thumbnail_url === 'string' ? res.thumbnail_url : '',
		title: typeof res?.title === 'string' ? res.title : '',
		type: typeof res?.type === 'string' ? res.type : '',
	};
}

function patchAnyIframeBasics(html) {
	if (!html || typeof html !== 'string') return html;

	let next = html;

	next = next.replace(/src="http:\/\//gi, 'src="https://');

	if (!/referrerpolicy=/i.test(next)) {
		next = next.replace(
			/<iframe\b/i,
			'<iframe referrerpolicy="strict-origin-when-cross-origin"'
		);
	}

	if (!/\ballow="/i.test(next)) {
		next = next.replace(
			/<iframe\b([^>]*)>/i,
			'<iframe$1 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share">'
		);
	}

	if (!/\ballowfullscreen\b/i.test(next)) {
		next = next.replace(/<iframe\b([^>]*)>/i, '<iframe$1 allowfullscreen>');
	}

	return next;
}

function Editor({ attributes, setAttributes }) {
	const { url, embedHtml, providerName, errorMessage, thumbnailUrl, title, items } = attributes;

	const device = useGlobalResponsiveDevice();

	const [isFetching, setIsFetching] = useState(false);
	const [openStylesPanel, setOpenStylesPanel] = useState('');

	const urlRef = useRef(url);
	const debounceRef = useRef(null);

	urlRef.current = url;

	/**
	 * Legacy migration.
	 *
	 * This block used to hold a grid of embeds in an `items` array. It now
	 * shows a single full-width embed, so the first saved item is promoted
	 * into the flat attributes and the old array is emptied. The `items`
	 * attribute is kept registered purely so already-saved posts still reach
	 * this code path.
	 */
	useEffect(() => {
		if (url || !Array.isArray(items) || items.length === 0) {
			return;
		}

		const first = items[0] || {};

		setAttributes({
			url: first.url || '',
			embedHtml: first.embedHtml || '',
			providerName: first.providerName || '',
			errorMessage: first.errorMessage || '',
			thumbnailUrl: first.thumbnailUrl || '',
			title: first.title || '',
			type: first.type || '',
			youtubeId: first.youtubeId || '',
			items: [],
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, []);

	const padding = getResponsiveBox(attributes, 'padding', device);
	const margin = getResponsiveBox(attributes, 'margin', device);
	const borderRadius = getResponsiveValue(attributes, 'borderRadius', device, '');

	/*
	 * The has-* classes gate the editor.scss rules that read the custom
	 * properties below. Without them an unset margin would resolve to 0 and
	 * flatten the theme's own block spacing in the canvas.
	 */
	const wrapperProps = useBlockProps({
		className: [
			'wp-block-uplifters-site-builder-blocks-video-embed',
			`uplifters-site-builder-blocks-video-embed-device-${device}`,
			hasBoxValue(padding)
				? 'has-uplifters-site-builder-blocks-video-embed-padding'
				: '',
			hasBoxValue(margin)
				? 'has-uplifters-site-builder-blocks-video-embed-margin'
				: '',
		]
			.filter(Boolean)
			.join(' '),
		style: {
			...boxToStyle(
				'padding',
				padding,
				'--uplifters-site-builder-blocks-video-embed-padding'
			),
			...boxToStyle(
				'margin',
				margin,
				'--uplifters-site-builder-blocks-video-embed-margin'
			),
			'--uplifters-site-builder-blocks-video-embed-radius': borderRadius || '0px',
		},
	});

	const runFetch = async () => {
		const u = normalizeUrl(urlRef.current);

		if (!u) {
			setAttributes({ ...EMPTY_EMBED });
			return;
		}

		setIsFetching(true);
		setAttributes({ errorMessage: '' });

		try {
			if (isYouTubeUrl(u)) {
				const id = extractYouTubeId(u);

				if (!id) {
					setAttributes({
						...EMPTY_EMBED,
						url: u,
						providerName: 'YouTube',
						errorMessage: __('Invalid YouTube URL (video id not found).', 'uplifters-site-builder-blocks'),
						type: 'video',
					});
					return;
				}

				let thumb = '';
				let fetchedTitle = '';

				try {
					const data = await fetchOEmbed(u);
					thumb = data.thumbnailUrl || '';
					fetchedTitle = data.title || '';
				} catch (e) {}

				if (!thumb) {
					thumb = fallbackYouTubeThumb(id);
				}

				setAttributes({
					url: u,
					embedHtml: buildYouTubeEmbedHtml(id),
					providerName: 'YouTube',
					errorMessage: '',
					thumbnailUrl: thumb,
					title: fetchedTitle,
					type: 'video',
					youtubeId: id,
				});
				return;
			}

			const data = await fetchOEmbed(u);

			if (!data.html) {
				setAttributes({
					...EMPTY_EMBED,
					url: u,
					providerName: data.providerName || '',
					errorMessage: __('Embed not available for this URL.', 'uplifters-site-builder-blocks'),
					thumbnailUrl: data.thumbnailUrl || '',
					title: data.title || '',
					type: data.type || '',
				});
			} else {
				setAttributes({
					url: u,
					embedHtml: patchAnyIframeBasics(data.html),
					providerName: data.providerName || '',
					errorMessage: '',
					thumbnailUrl: data.thumbnailUrl || '',
					title: data.title || '',
					type: data.type || '',
					youtubeId: '',
				});
			}
		} catch (e) {
			setAttributes({
				...EMPTY_EMBED,
				url: u,
				errorMessage: __('Could not fetch embed. Please check the URL.', 'uplifters-site-builder-blocks'),
			});
		} finally {
			setIsFetching(false);
		}
	};

	const scheduleFetch = (urlValue) => {
		setAttributes({ url: urlValue });
		urlRef.current = urlValue;

		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		debounceRef.current = setTimeout(runFetch, 650);
	};

	const urlField = (
		<TextControl
			label={__('Video URL', 'uplifters-site-builder-blocks')}
			value={url || ''}
			onChange={scheduleFetch}
			placeholder="https://..."
			help={__('Paste a YouTube, Vimeo or other oEmbed video link.', 'uplifters-site-builder-blocks')}
		/>
	);

	const normalizedUrl = normalizeUrl(url);
	const isYT = normalizedUrl && isYouTubeUrl(normalizedUrl);

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody title={__('Content', 'uplifters-site-builder-blocks')} initialOpen={true}>
					{urlField}

					<Button variant="secondary" onClick={runFetch} disabled={!normalizedUrl || isFetching}>
						{__('Embed', 'uplifters-site-builder-blocks')}
					</Button>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={__('Spacing', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'spacing'}
					onToggle={() =>
						setOpenStylesPanel((current) => (current === 'spacing' ? '' : 'spacing'))
					}
				>
					<DeviceBadge device={device} />

					<BoxControl
						label={__('Padding', 'uplifters-site-builder-blocks')}
						values={padding}
						onChange={(next) =>
							setResponsiveBox(attributes, setAttributes, 'padding', device, next)
						}
					/>

					<div style={{ height: 12 }} />

					<BoxControl
						label={__('Margin', 'uplifters-site-builder-blocks')}
						values={margin}
						onChange={(next) =>
							setResponsiveBox(attributes, setAttributes, 'margin', device, next)
						}
					/>
				</PanelBody>

				<PanelBody
					title={__('Border', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'border'}
					onToggle={() =>
						setOpenStylesPanel((current) => (current === 'border' ? '' : 'border'))
					}
				>
					<DeviceBadge device={device} />

					<RangeControl
						label={__('Border Radius', 'uplifters-site-builder-blocks')}
						value={lengthToNumber(borderRadius, 0)}
						onChange={(value) =>
							setResponsiveValue(
								attributes,
								setAttributes,
								'borderRadius',
								device,
								value && value > 0 ? `${value}px` : ''
							)
						}
						min={0}
						max={300}
						step={1}
						allowReset
						resetFallbackValue={0}
						withInputField
						help={__('Only the active global responsive device branch will be updated.', 'uplifters-site-builder-blocks')}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...wrapperProps}>
				{!normalizedUrl ? (
					<div className="uplifters-site-builder-blocks-video-embed-setup">
						{urlField}

						<p className="uplifters-site-builder-blocks-video-embed-control-help">
							{__('Paste a video link and the preview will show here.', 'uplifters-site-builder-blocks')}
						</p>
					</div>
				) : null}

				{normalizedUrl ? (
					<div className="uplifters-site-builder-blocks-video-embed-meta">
						<span className="uplifters-site-builder-blocks-video-embed-provider">
							{providerName ? (
								<>
									{__('Provider:', 'uplifters-site-builder-blocks')} <strong>{providerName}</strong>
								</>
							) : (
								__('YouTube / Vimeo etc.', 'uplifters-site-builder-blocks')
							)}
						</span>

						{isFetching ? (
							<span className="uplifters-site-builder-blocks-video-embed-fetching">
								<Spinner />
								{__('Fetching…', 'uplifters-site-builder-blocks')}
							</span>
						) : null}
					</div>
				) : null}

				{errorMessage ? (
					<div className="uplifters-site-builder-blocks-video-embed-notice-wrap">
						<Notice status="error" isDismissible={false}>
							{errorMessage}
						</Notice>
					</div>
				) : null}

				{isYT && thumbnailUrl ? (
					<div className="uplifters-site-builder-blocks-video-embed-thumb">
						<img src={thumbnailUrl} alt={title || 'YouTube thumbnail'} loading="lazy" />
						<div className="uplifters-site-builder-blocks-video-embed-play" aria-hidden="true">
							<div className="uplifters-site-builder-blocks-video-embed-play-button">
								<svg viewBox="0 0 24 24">
									<path d="M8 5v14l11-7z" />
								</svg>
							</div>
						</div>
					</div>
				) : null}

				{!isYT && embedHtml ? (
					<div
						className="uplifters-site-builder-blocks-video-embed-frame"
						dangerouslySetInnerHTML={{ __html: embedHtml }}
					/>
				) : null}

				{normalizedUrl && !errorMessage && !embedHtml && !(isYT && thumbnailUrl) ? (
					<div className="uplifters-site-builder-blocks-video-embed-placeholder">
						{__('No preview yet. Click “Embed” or wait a moment.', 'uplifters-site-builder-blocks')}
					</div>
				) : null}
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="video-embed" /> : <Editor {...props} />;
}
