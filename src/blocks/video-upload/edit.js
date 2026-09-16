import InserterPreview from '../../blocks-inserter-preview/inserter-preview-shared';
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	BlockControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	Button,
	Placeholder,
	Icon,
	ToolbarGroup,
	ToolbarButton,
	BoxControl,
	RangeControl,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';

import './editor.scss';

const EMPTY_BOX = { top: '', right: '', bottom: '', left: '' };

function getCurrentDevice() {
	if (
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice === 'function'
	) {
		return window.UpliftersSiteBuilderBlocksResponsive.getDevice();
	}

	return 'desktop';
}

/**
 * Read a responsive value.
 *
 * Accepts either a { desktop, tablet, mobile } object or a legacy plain
 * value saved before this block became responsive.
 *
 * @param {*}      value    Attribute value.
 * @param {string} device   Current device.
 * @param {*}      fallback Fallback value.
 * @return {*} Resolved value.
 */
function getResponsiveValue(value, device, fallback) {
	if (value === undefined || value === null || value === '') {
		return fallback;
	}

	if (typeof value !== 'object') {
		return value;
	}

	/*
	 * An unset branch must fall through to the next one rather than resolve to
	 * an empty string, so the canvas inherits the desktop value on tablet and
	 * mobile exactly the way render.php does. Nullish coalescing would stop at
	 * the empty string and show 0 here while the front end showed the desktop
	 * value.
	 */
	const branch = [device, 'desktop', 'tablet', 'mobile'].find((key) => {
		const candidate = value[key];

		return (
			candidate !== undefined && candidate !== null && candidate !== ''
		);
	});

	return branch ? value[branch] : fallback;
}

/**
 * Write a responsive value for the current device only.
 *
 * Legacy plain values are migrated to all three devices first, so switching
 * a block to responsive never loses the previously saved value.
 *
 * @param {*}      value  Current attribute value.
 * @param {string} device Current device.
 * @param {*}      next   New value for that device.
 * @return {Object} Updated responsive object.
 */
function setResponsiveValue(value, device, next) {
	let base = {};

	if (value && typeof value === 'object') {
		base = { ...value };
	} else if (value !== undefined && value !== null && value !== '') {
		base = {
			desktop: value,
			tablet: value,
			mobile: value,
		};
	}

	return {
		...base,
		[device]: next,
	};
}

function normalizeBox(box) {
	return {
		...EMPTY_BOX,
		...(box && typeof box === 'object' && !Array.isArray(box) ? box : {}),
	};
}

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

/**
 * True when at least one side of a box carries a value.
 *
 * @param {*} box Box to test.
 * @return {boolean} Whether the box is set.
 */
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
 *
 * @param {*}      value  Attribute value.
 * @param {string} device Current device.
 * @return {Object} Box with every side present.
 */
function getResponsiveBox(value, device) {
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		if ('desktop' in value || 'tablet' in value || 'mobile' in value) {
			const branch = [device, 'desktop', 'tablet', 'mobile'].find((key) =>
				hasBoxValue(value[key])
			);

			return branch ? normalizeBox(value[branch]) : normalizeBox();
		}

		return normalizeBox(value);
	}

	return normalizeBox();
}

/**
 * Write a responsive four-sided box value for the current device only.
 *
 * @param {*}      value  Current attribute value.
 * @param {string} device Current device.
 * @param {Object} next   New box for that device.
 * @return {Object} Updated responsive object.
 */
function setResponsiveBox(value, device, next) {
	const base =
		value &&
		typeof value === 'object' &&
		!Array.isArray(value) &&
		('desktop' in value || 'tablet' in value || 'mobile' in value)
			? value
			: { desktop: normalizeBox(value) };

	return {
		...base,
		[device]: normalizeBox(next),
	};
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
	if (!box) {
		return {};
	}

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
	let label = __('Desktop variant', 'uplifters-site-builder-blocks');

	if (device === 'tablet') {
		label = __('Tablet variant', 'uplifters-site-builder-blocks');
	}

	if (device === 'mobile') {
		label = __('Mobile variant', 'uplifters-site-builder-blocks');
	}

	return <div className="uplifters-video-upload__device-badge">{label}</div>;
}

function Editor({ attributes, setAttributes }) {
	const { url, videos, padding, margin, borderRadius } = attributes;

	const [device, setDevice] = useState(getCurrentDevice());
	const [openStylesPanel, setOpenStylesPanel] = useState(null);

	/**
	 * Legacy migration.
	 *
	 * This block used to hold a grid of videos in a `videos` array. It now
	 * shows a single full-width video, so the first saved item is promoted
	 * into `url` and the old array is emptied. The `videos` attribute is kept
	 * registered purely so already-saved posts still reach this code path.
	 */
	useEffect(() => {
		if (url || !Array.isArray(videos) || videos.length === 0) {
			return;
		}

		setAttributes({
			url: videos[0]?.url || '',
			videos: [],
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		function handleDeviceChange(event) {
			if (event?.detail?.device) {
				setDevice(event.detail.device);
				return;
			}

			setDevice(getCurrentDevice());
		}

		window.addEventListener(
			'uplifters-site-builder-blocks-responsive-device-change',
			handleDeviceChange
		);

		const interval = window.setInterval(() => {
			const nextDevice = getCurrentDevice();

			setDevice((currentDevice) => {
				return currentDevice !== nextDevice ? nextDevice : currentDevice;
			});
		}, 500);

		return () => {
			window.removeEventListener(
				'uplifters-site-builder-blocks-responsive-device-change',
				handleDeviceChange
			);

			window.clearInterval(interval);
		};
	}, []);

	const currentPadding = getResponsiveBox(padding, device);
	const currentMargin = getResponsiveBox(margin, device);
	const currentRadius = getResponsiveValue(borderRadius, device, '');

	/*
	 * The has-* classes gate the editor.scss rules that read the custom
	 * properties below. Without them an unset margin would resolve to 0 and
	 * flatten the theme's own block spacing in the canvas.
	 */
	const blockProps = useBlockProps({
		className: [
			'uplifters-video-upload',
			`uplifters-video-upload--device-${device}`,
			hasBoxValue(currentPadding)
				? 'has-uplifters-video-upload-padding'
				: '',
			hasBoxValue(currentMargin)
				? 'has-uplifters-video-upload-margin'
				: '',
		]
			.filter(Boolean)
			.join(' '),
		style: {
			...boxToStyle(
				'padding',
				currentPadding,
				'--uplifters-video-upload-padding'
			),
			...boxToStyle(
				'margin',
				currentMargin,
				'--uplifters-video-upload-margin'
			),
			'--uplifters-video-upload-radius': currentRadius || '0px',
		},
	});

	const selectVideo = (media) => {
		if (!media || !media.url) {
			return;
		}

		setAttributes({ url: media.url });
	};

	const removeVideo = () => {
		setAttributes({ url: '' });
	};

	return (
		<>
			{url ? (
				<BlockControls group="other">
					<ToolbarGroup>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={selectVideo}
								allowedTypes={['video']}
								render={({ open }) => (
									<ToolbarButton onClick={open}>
										{__(
											'Replace',
											'uplifters-site-builder-blocks'
										)}
									</ToolbarButton>
								)}
							/>
						</MediaUploadCheck>
					</ToolbarGroup>
				</BlockControls>
			) : null}

			<InspectorControls group="settings">
				<PanelBody
					title={__('Video', 'uplifters-site-builder-blocks')}
					initialOpen={true}
				>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={selectVideo}
							allowedTypes={['video']}
							render={({ open }) => (
								<Button onClick={open} variant="primary">
									{url
										? __(
												'Replace video',
												'uplifters-site-builder-blocks'
										  )
										: __(
												'Select video',
												'uplifters-site-builder-blocks'
										  )}
								</Button>
							)}
						/>
					</MediaUploadCheck>

					{url ? (
						<div className="uplifters-video-upload__control-actions">
							<Button
								variant="secondary"
								isDestructive
								onClick={removeVideo}
							>
								{__(
									'Remove video',
									'uplifters-site-builder-blocks'
								)}
							</Button>
						</div>
					) : null}
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={__('Spacing', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'spacing'}
					onToggle={() =>
						setOpenStylesPanel(
							openStylesPanel === 'spacing' ? null : 'spacing'
						)
					}
				>
					<DeviceBadge device={device} />

					<BoxControl
						label={__('Padding', 'uplifters-site-builder-blocks')}
						values={currentPadding}
						onChange={(next) =>
							setAttributes({
								padding: setResponsiveBox(
									padding,
									device,
									next
								),
							})
						}
					/>

					<div className="uplifters-video-upload__control-gap" />

					<BoxControl
						label={__('Margin', 'uplifters-site-builder-blocks')}
						values={currentMargin}
						onChange={(next) =>
							setAttributes({
								margin: setResponsiveBox(margin, device, next),
							})
						}
					/>
				</PanelBody>

				<PanelBody
					title={__('Border', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'border'}
					onToggle={() =>
						setOpenStylesPanel(
							openStylesPanel === 'border' ? null : 'border'
						)
					}
				>
					<DeviceBadge device={device} />

					<RangeControl
						label={__(
							'Border Radius',
							'uplifters-site-builder-blocks'
						)}
						value={lengthToNumber(currentRadius, 0)}
						onChange={(value) =>
							setAttributes({
								borderRadius: setResponsiveValue(
									borderRadius,
									device,
									value && value > 0 ? `${value}px` : ''
								),
							})
						}
						min={0}
						max={300}
						step={1}
						allowReset
						resetFallbackValue={0}
						withInputField
						help={__(
							'This value is saved for the selected responsive variant.',
							'uplifters-site-builder-blocks'
						)}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{url ? (
					<video
						className="uplifters-video-upload__video"
						src={url}
						controls
						preload="metadata"
					/>
				) : (
					<Placeholder
						icon={<Icon icon="video-alt3" />}
						label={__('Video', 'uplifters-site-builder-blocks')}
						instructions={__(
							'Select a video from the media library.',
							'uplifters-site-builder-blocks'
						)}
					>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={selectVideo}
								allowedTypes={['video']}
								render={({ open }) => (
									<Button onClick={open} variant="primary">
										{__(
											'Select video',
											'uplifters-site-builder-blocks'
										)}
									</Button>
								)}
							/>
						</MediaUploadCheck>
					</Placeholder>
				)}
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="video-upload" /> : <Editor {...props} />;
}
