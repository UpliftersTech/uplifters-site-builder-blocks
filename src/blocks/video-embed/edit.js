import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from '@wordpress/i18n';

import './editor.scss';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { FontFamilyControl, getFontFamilyCss } from '../../assets-shared/fonts-family/font-family-control';
import {
	PanelBody,
	TextControl,
	Button,
	Notice,
	Spinner,
	RangeControl,
	SelectControl,
	BaseControl,
	BoxControl,
	ColorPalette,
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';

const EMPTY_BOX = { top: '', right: '', bottom: '', left: '' };

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
		return value[device] ?? value.desktop ?? value.tablet ?? value.mobile ?? fallback;
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

function getResponsiveBox(attributes, key, device) {
	const value = attributes[key];

	if (value && typeof value === 'object' && !Array.isArray(value)) {
		if ('desktop' in value || 'tablet' in value || 'mobile' in value) {
			return normalizeBox(value[device] || value.desktop || value.tablet || value.mobile);
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

function boxToStyle(prefix, box) {
	if (!box) return {};

	const style = {};
	const map = { top: 'Top', right: 'Right', bottom: 'Bottom', left: 'Left' };

	Object.keys(map).forEach((k) => {
		const v = box?.[k];
		if (typeof v === 'string' && v.trim() !== '') {
			style[`${prefix}${map[k]}`] = v;
		}
	});

	return style;
}

function DeviceBadge({ device }) {
	const labels = {
		desktop: __('Desktop variant', 'uplifters-site-builder-blocks'),
		tablet: __('Tablet variant', 'uplifters-site-builder-blocks'),
		mobile: __('Mobile variant', 'uplifters-site-builder-blocks'),
	};

	return <div className="uplifters-site-builder-blocks-video-embed-device-badge">{labels[device] || labels.desktop}</div>;
}

function Editor({ attributes, setAttributes }) {
	const device = useGlobalResponsiveDevice();

	const { items, selectedIndex } = attributes;

	const embedsPerRow = getResponsiveValue(attributes, 'embedsPerRow', device, 2);
	const fontFamily = getResponsiveValue(attributes, 'fontFamily', device, 'default');
	const textColor = getResponsiveValue(attributes, 'textColor', device, '#0f172a');
	const padding = getResponsiveBox(attributes, 'padding', device);
	const margin = getResponsiveBox(attributes, 'margin', device);

	const [fetchingIndex, setFetchingIndex] = useState(-1);
	const [openSettingsPanel, setOpenSettingsPanel] = useState('');
	const [openStylesPanel, setOpenStylesPanel] = useState('');

	const itemsRef = useRef([]);
	const debounceMapRef = useRef(new Map());

	const safeItems = Array.isArray(items) ? items : [];
	itemsRef.current = safeItems;

	useEffect(() => {
		if (!safeItems.length) {
			if (selectedIndex !== 0) setAttributes({ selectedIndex: 0 });
			return;
		}

		const clamped = Math.min(Math.max(selectedIndex || 0, 0), safeItems.length - 1);

		if (clamped !== selectedIndex) {
			setAttributes({ selectedIndex: clamped });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [safeItems.length]);

	const cols = useMemo(() => {
		return Math.max(1, Math.min(Number(embedsPerRow) || 1, 6));
	}, [embedsPerRow]);

	const wrapperProps = useBlockProps({
		className: `wp-block-uplifters-site-builder-blocks-video-embed uplifters-site-builder-blocks-video-embed-device-${device}`,
		style: {
			'--uplifters-site-builder-blocks-video-embed-cols': String(cols),
			fontFamily: getFontFamilyCss(fontFamily),
			color: textColor || undefined,
			...boxToStyle('padding', padding),
			...boxToStyle('margin', margin),
		},
	});

	const setItems = (nextItems, nextSelectedIndex) => {
		const payload = { items: nextItems };

		if (typeof nextSelectedIndex === 'number') {
			payload.selectedIndex = nextSelectedIndex;
		}

		setAttributes(payload);
	};

	const addMore = () => {
		const latest = itemsRef.current || [];

		const next = [
			...latest,
			{
				url: '',
				embedHtml: '',
				providerName: '',
				errorMessage: '',
				thumbnailUrl: '',
				title: '',
				type: '',
				youtubeId: '',
			},
		];

		setItems(next, next.length - 1);
	};

	const removeAt = (idx) => {
		const latest = itemsRef.current || [];
		const next = latest.filter((_, i) => i !== idx);
		const nextIndex = Math.max(0, Math.min(selectedIndex, next.length - 1));

		setItems(next, nextIndex);
	};

	const updateAt = (idx, patch) => {
		const latest = itemsRef.current || [];
		const next = [...latest];

		next[idx] = { ...(next[idx] || {}), ...patch };

		setItems(next);
	};

	const runFetchForIndex = async (idx) => {
		const latest = itemsRef.current || [];
		const current = latest[idx];

		if (!current) return;

		const u = normalizeUrl(current.url);

		if (!u) {
			updateAt(idx, {
				url: current.url || '',
				embedHtml: '',
				providerName: '',
				errorMessage: '',
				thumbnailUrl: '',
				title: '',
				type: '',
				youtubeId: '',
			});
			return;
		}

		setFetchingIndex(idx);
		updateAt(idx, { errorMessage: '' });

		try {
			if (isYouTubeUrl(u)) {
				const id = extractYouTubeId(u);

				if (!id) {
					updateAt(idx, {
						url: u,
						embedHtml: '',
						providerName: 'YouTube',
						errorMessage: __('Invalid YouTube URL (video id not found).', 'uplifters-site-builder-blocks'),
						thumbnailUrl: '',
						title: '',
						type: 'video',
						youtubeId: '',
					});
					return;
				}

				let thumb = '';
				let title = '';

				try {
					const data = await fetchOEmbed(u);
					thumb = data.thumbnailUrl || '';
					title = data.title || '';
				} catch (e) {}

				if (!thumb) {
					thumb = fallbackYouTubeThumb(id);
				}

				updateAt(idx, {
					url: u,
					embedHtml: buildYouTubeEmbedHtml(id),
					providerName: 'YouTube',
					errorMessage: '',
					thumbnailUrl: thumb,
					title,
					type: 'video',
					youtubeId: id,
				});
				return;
			}

			const data = await fetchOEmbed(u);

			if (!data.html) {
				updateAt(idx, {
					url: u,
					embedHtml: '',
					providerName: data.providerName || '',
					errorMessage: __('Embed not available for this URL.', 'uplifters-site-builder-blocks'),
					thumbnailUrl: data.thumbnailUrl || '',
					title: data.title || '',
					type: data.type || '',
					youtubeId: '',
				});
			} else {
				updateAt(idx, {
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
			updateAt(idx, {
				url: u,
				embedHtml: '',
				providerName: '',
				errorMessage: __('Could not fetch embed. Please check the URL.', 'uplifters-site-builder-blocks'),
				thumbnailUrl: '',
				title: '',
				type: '',
				youtubeId: '',
			});
		} finally {
			setFetchingIndex(-1);
		}
	};

	const scheduleFetchForIndex = (idx, urlValue) => {
		updateAt(idx, { url: urlValue });

		const map = debounceMapRef.current;
		const prev = map.get(idx);

		if (prev) clearTimeout(prev);

		const timer = setTimeout(() => runFetchForIndex(idx), 650);
		map.set(idx, timer);
	};

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody
					title={__('Content', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openSettingsPanel === 'embeds-settings'}
					onToggle={() =>
						setOpenSettingsPanel((current) =>
							current === 'embeds-settings' ? '' : 'embeds-settings'
						)
					}
				>
					<div className="uplifters-site-builder-blocks-video-embed-control-row">
						<Button variant="primary" onClick={addMore}>
							{__('Add More', 'uplifters-site-builder-blocks')}
						</Button>
						<p className="uplifters-site-builder-blocks-video-embed-control-help">
							{__('Add multiple embed links (YouTube, Vimeo etc.)', 'uplifters-site-builder-blocks')}
						</p>
					</div>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={__('Layout', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'embeds-in-row'}
					onToggle={() =>
						setOpenStylesPanel((current) =>
							current === 'embeds-in-row' ? '' : 'embeds-in-row'
						)
					}
				>
					<DeviceBadge device={device} />

					<RangeControl
						label={__('Embeds per row', 'uplifters-site-builder-blocks')}
						value={cols}
						onChange={(v) => {
							const n = Math.max(1, Math.min(Number(v) || 1, 6));
							setResponsiveValue(attributes, setAttributes, 'embedsPerRow', device, n);
						}}
						min={1}
						max={6}
						step={1}
						help={__('Only the active global responsive device branch will be updated.', 'uplifters-site-builder-blocks')}
					/>
				</PanelBody>

				<PanelBody
					title={__('Typography', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'typography'}
					onToggle={() =>
						setOpenStylesPanel((current) =>
							current === 'typography' ? '' : 'typography'
						)
					}
				>
					<DeviceBadge device={device} />

					<FontFamilyControl
						label={__('Font Family', 'uplifters-site-builder-blocks')}
						value={fontFamily || 'default'}
						onChange={(value) =>
							setResponsiveValue(attributes, setAttributes, 'fontFamily', device, value)
						}
					/>

					<BaseControl label={__('Text Color', 'uplifters-site-builder-blocks')}>
						<ColorPalette
							value={textColor || undefined}
							onChange={(value) =>
								setResponsiveValue(
									attributes,
									setAttributes,
									'textColor',
									device,
									value || '#0f172a'
								)
							}
							enableAlpha
						/>
					</BaseControl>
				</PanelBody>

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
			</InspectorControls>

			<div {...wrapperProps}>
				<div className="uplifters-site-builder-blocks-video-embed-editor-shell">
					<div className="uplifters-site-builder-blocks-video-embed-editor-header">
						<div>
							<div className="uplifters-site-builder-blocks-video-embed-editor-title">{__('Embeds', 'uplifters-site-builder-blocks')}</div>
							<div className="uplifters-site-builder-blocks-video-embed-editor-subtitle">
								{__('Paste URL(s) and preview will show.', 'uplifters-site-builder-blocks')}
							</div>
						</div>

						<Button variant="primary" onClick={addMore}>
							{__('Add More', 'uplifters-site-builder-blocks')}
						</Button>
					</div>

					{!safeItems.length ? (
						<div className="uplifters-site-builder-blocks-video-embed-empty">
							{__('No embeds added yet. Click “Add More”.', 'uplifters-site-builder-blocks')}
						</div>
					) : (
						<div className="uplifters-site-builder-blocks-video-embed-grid">
							{safeItems.map((it, i) => {
								const url = normalizeUrl(it.url);
								const isFetching = fetchingIndex === i;
								const isYT = url && isYouTubeUrl(url);

								return (
									<div
										key={`embed-${i}`}
										className={`uplifters-site-builder-blocks-video-embed-card ${i === selectedIndex ? 'is-selected' : ''}`}
									>
										<div className="uplifters-site-builder-blocks-video-embed-card-header">
											<div className="uplifters-site-builder-blocks-video-embed-card-title">
												{__('Embed', 'uplifters-site-builder-blocks')} {i + 1}
											</div>

											<div className="uplifters-site-builder-blocks-video-embed-card-actions">
												<Button
													variant="secondary"
													onClick={() => {
														setAttributes({ selectedIndex: i });
														runFetchForIndex(i);
													}}
													disabled={!url || isFetching}
												>
													{__('Embed', 'uplifters-site-builder-blocks')}
												</Button>

												<Button variant="tertiary" isDestructive onClick={() => removeAt(i)}>
													{__('Remove', 'uplifters-site-builder-blocks')}
												</Button>
											</div>
										</div>

										<TextControl
											value={it.url || ''}
											onChange={(v) => {
												setAttributes({ selectedIndex: i });
												scheduleFetchForIndex(i, v);
											}}
											placeholder="https://..."
										/>

										<div className="uplifters-site-builder-blocks-video-embed-card-meta">
											<div className="uplifters-site-builder-blocks-video-embed-provider">
												{it.providerName ? (
													<>
														{__('Provider:', 'uplifters-site-builder-blocks')} <strong>{it.providerName}</strong>
													</>
												) : (
													__('YouTube / Vimeo etc.', 'uplifters-site-builder-blocks')
												)}
											</div>

											{isFetching ? (
												<span className="uplifters-site-builder-blocks-video-embed-fetching">
													<Spinner />
													{__('Fetching…', 'uplifters-site-builder-blocks')}
												</span>
											) : null}
										</div>

										{it.errorMessage ? (
											<div className="uplifters-site-builder-blocks-video-embed-notice-wrap">
												<Notice status="error" isDismissible={false}>
													{it.errorMessage}
												</Notice>
											</div>
										) : null}

										{isYT && it.thumbnailUrl ? (
											<div className="uplifters-site-builder-blocks-video-embed-preview-box">
												<div className="uplifters-site-builder-blocks-video-embed-thumb">
													<img
														src={it.thumbnailUrl}
														alt={it.title || 'YouTube thumbnail'}
														loading="lazy"
													/>
													<div className="uplifters-site-builder-blocks-video-embed-play" aria-hidden="true">
														<div className="uplifters-site-builder-blocks-video-embed-play-button">
															<svg viewBox="0 0 24 24">
																<path d="M8 5v14l11-7z" />
															</svg>
														</div>
													</div>
												</div>
											</div>
										) : null}

										{!isYT && it.embedHtml ? (
											<div className="uplifters-site-builder-blocks-video-embed-preview-box has-inner-padding">
												<div
													className="uplifters-site-builder-blocks-video-embed-frame"
													dangerouslySetInnerHTML={{ __html: it.embedHtml }}
												/>
											</div>
										) : null}

										{url && !it.errorMessage && !it.embedHtml && !(isYT && it.thumbnailUrl) ? (
											<div className="uplifters-site-builder-blocks-video-embed-placeholder">
												{__('No preview yet. Click “Embed” or wait a moment.', 'uplifters-site-builder-blocks')}
											</div>
										) : null}

										{!url ? (
											<div className="uplifters-site-builder-blocks-video-embed-placeholder">
												{__('Paste a URL.', 'uplifters-site-builder-blocks')}
											</div>
										) : null}
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="video-embed" /> : <Editor {...props} />;
}
