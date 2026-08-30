import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from '@wordpress/i18n';
import { useEffect, useState, Fragment } from '@wordpress/element';
import {
	useBlockProps,
	MediaUpload,
	MediaUploadCheck,
	InspectorControls,
	useSetting,
} from '@wordpress/block-editor';
import {
	Button,
	RangeControl,
	ToggleControl,
	PanelBody,
	SelectControl,
	ColorPalette,
} from '@wordpress/components';

function getCurrentDevice() {
	if (
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice === 'function'
	) {
		return window.UpliftersSiteBuilderBlocksResponsive.getDevice();
	}

	return 'desktop';
}

function getResponsiveValue(attributes, key, device, fallback = '') {
	const value = attributes[key];

	if (
		value &&
		typeof value === 'object' &&
		!Array.isArray(value)
	) {
		if (value[device] !== undefined && value[device] !== null && value[device] !== '') {
			return value[device];
		}

		if (value.desktop !== undefined && value.desktop !== null && value.desktop !== '') {
			return value.desktop;
		}

		if (value.tablet !== undefined && value.tablet !== null && value.tablet !== '') {
			return value.tablet;
		}

		if (value.mobile !== undefined && value.mobile !== null && value.mobile !== '') {
			return value.mobile;
		}

		return fallback;
	}

	if (value !== undefined && value !== null && value !== '') {
		return value;
	}

	return fallback;
}

function setResponsiveValue(attributes, setAttributes, key, device, value) {
	const currentValue = attributes[key];
	const currentResponsiveValue =
		currentValue &&
		typeof currentValue === 'object' &&
		!Array.isArray(currentValue)
			? currentValue
			: {
					desktop: currentValue,
			  };

	setAttributes({
		[key]: {
			...currentResponsiveValue,
			[device]: value,
		},
	});
}

function DeviceBadge({ device }) {
	let label = __('Desktop variant', 'uplifters-site-builder-blocks');

	if (device === 'tablet') {
		label = __('Tablet variant', 'uplifters-site-builder-blocks');
	}

	if (device === 'mobile') {
		label = __('Mobile variant', 'uplifters-site-builder-blocks');
	}

	return (
		<div
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: '6px',
				marginBottom: '12px',
				padding: '5px 10px',
				borderRadius: '999px',
				background: '#f0f0f1',
				color: '#1e1e1e',
				fontSize: '12px',
				fontWeight: 600,
			}}
		>
			{label}
		</div>
	);
}

/**
 * Returns WP home path like:
 *   "/" or "/subfolder/"
 * No PHP needed in editor preview.
 */
function normalizePath(pathname) {
	let p = pathname || '/';

	if (!p.startsWith('/')) {
		p = '/' + p;
	}

	if (!p.endsWith('/')) {
		p = p + '/';
	}

	return p;
}

function detectWpHomePath() {
	if (typeof window === 'undefined' || typeof document === 'undefined') {
		return '/';
	}

	const relHome = document.querySelector('link[rel="home"][href]');

	if (relHome?.href) {
		try {
			const u = new URL(relHome.href, window.location.href);
			return normalizePath(u.pathname);
		} catch (e) {}
	}

	const markers = ['/wp-includes/', '/wp-content/'];
	const nodes = document.querySelectorAll('script[src], link[href]');

	for (const el of nodes) {
		const raw = el.getAttribute('src') || el.getAttribute('href');

		if (!raw) {
			continue;
		}

		let url;

		try {
			url = new URL(raw, window.location.href);
		} catch (e) {
			continue;
		}

		for (const marker of markers) {
			const idx = url.pathname.indexOf(marker);

			if (idx !== -1) {
				const base = url.pathname.slice(0, idx);
				return normalizePath(base || '/');
			}
		}
	}

	const adminIdx = window.location.pathname.indexOf('/wp-admin/');

	if (adminIdx !== -1) {
		const base = window.location.pathname.slice(0, adminIdx);
		return normalizePath(base || '/');
	}

	return '/';
}

function getJustifyContent(position) {
	if (position === 'start' || position === 'left') {
		return 'flex-start';
	}

	if (position === 'end' || position === 'right') {
		return 'flex-end';
	}

	return 'center';
}

function UploadSvgIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			focusable="false"
			style={{
				display: 'inline-block',
				flexShrink: 0,
			}}
		>
			<path
				d="M12 3L12 15"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<path
				d="M7 8L12 3L17 8"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M5 15V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V15"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function Editor({ attributes, setAttributes }) {
	const [device, setDevice] = useState(getCurrentDevice());
	const [openSettingsPanel, setOpenSettingsPanel] = useState(null);
	const [openStylesPanel, setOpenStylesPanel] = useState(null);

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

	const {
		logoUrl,
		isLinked,
	} = attributes;

	const logoWidth = getResponsiveValue(attributes, 'logoWidth', device, 80);
	const logoHeight = getResponsiveValue(attributes, 'logoHeight', device, 80);
	const padding = getResponsiveValue(attributes, 'padding', device, 0);
	const margin = getResponsiveValue(attributes, 'margin', device, 0);
	const borderRadius = getResponsiveValue(attributes, 'borderRadius', device, 0);
	const backgroundColor = getResponsiveValue(
		attributes,
		'backgroundColor',
		device,
		''
	);
	const position = getResponsiveValue(attributes, 'position', device, 'center');

	const blockProps = useBlockProps();

	const themeColors = useSetting('color.palette') || [];

	const toggleSettingsPanel = (panelName) => {
		setOpenSettingsPanel((current) => (current === panelName ? null : panelName));
	};

	const toggleStylesPanel = (panelName) => {
		setOpenStylesPanel((current) => (current === panelName ? null : panelName));
	};

	const onChangeLogo = (media) => {
		setAttributes({ logoUrl: media?.url || '' });
	};

	const outerStyle = {
		display: 'flex',
		justifyContent: getJustifyContent(position),
		width: '100%',
	};

	const wrapperStyle = {
		width: logoWidth ? `${logoWidth}px` : undefined,
		height: logoHeight ? `${logoHeight}px` : undefined,
		padding: typeof logoWidth === 'number' || typeof padding === 'number' ? `${padding}px` : undefined,
		margin: typeof margin === 'number' ? `${margin}px` : undefined,
		borderRadius:
			typeof borderRadius === 'number' ? `${borderRadius}px` : undefined,
		backgroundColor: backgroundColor || undefined,
		overflow: borderRadius ? 'hidden' : undefined,
		display: 'inline-block',
		boxSizing: 'border-box',
	};

	const linkStyle = {
		display: 'block',
		width: '100%',
		height: '100%',
	};

	const imageStyle = {
		width: '100%',
		height: '100%',
		objectFit: 'contain',
		display: 'block',
	};

	const colorSettingsWrapStyle = {
		display: 'flex',
		flexDirection: 'column',
		gap: '8px',
	};

	const colorLabelStyle = {
		fontSize: '13px',
		fontWeight: 500,
		lineHeight: 1.4,
	};

	const buttonContentStyle = {
		display: 'inline-flex',
		alignItems: 'center',
		gap: '8px',
		lineHeight: 1,
	};

	const homePath = detectWpHomePath();

	return (
		<Fragment>
			<div {...blockProps}>
				<InspectorControls group="settings">
					<PanelBody
						title={__('Behavior', 'uplifters-site-builder-blocks')}
						initialOpen={false}
						opened={openSettingsPanel === 'logo-settings'}
						onToggle={() => toggleSettingsPanel('logo-settings')}
					>
						<ToggleControl
							label={__('Home page link', 'uplifters-site-builder-blocks')}
							checked={!!isLinked}
							onChange={(value) => setAttributes({ isLinked: value })}
						/>
					</PanelBody>
				</InspectorControls>

				<InspectorControls group="styles">
					<PanelBody
						title={__('Layout', 'uplifters-site-builder-blocks')}
						initialOpen={false}
						opened={openStylesPanel === 'layout-settings'}
						onToggle={() => toggleStylesPanel('layout-settings')}
					>
						<DeviceBadge device={device} />

						<RangeControl
							label={__('Logo Width (px)', 'uplifters-site-builder-blocks')}
							value={logoWidth}
							onChange={(value) =>
								setResponsiveValue(
									attributes,
									setAttributes,
									'logoWidth',
									device,
									value
								)
							}
							min={20}
							max={600}
						/>

						<RangeControl
							label={__('Logo Height (px)', 'uplifters-site-builder-blocks')}
							value={logoHeight}
							onChange={(value) =>
								setResponsiveValue(
									attributes,
									setAttributes,
									'logoHeight',
									device,
									value
								)
							}
							min={20}
							max={600}
						/>

						<SelectControl
							label={__('Logo Position', 'uplifters-site-builder-blocks')}
							value={position || 'center'}
							options={[
								{
									label: __('Start', 'uplifters-site-builder-blocks'),
									value: 'start',
								},
								{
									label: __('Center', 'uplifters-site-builder-blocks'),
									value: 'center',
								},
								{
									label: __('End', 'uplifters-site-builder-blocks'),
									value: 'end',
								},
							]}
							onChange={(value) =>
								setResponsiveValue(
									attributes,
									setAttributes,
									'position',
									device,
									value
								)
							}
						/>
					</PanelBody>

					<PanelBody
						title={__('Spacing', 'uplifters-site-builder-blocks')}
						initialOpen={false}
						opened={openStylesPanel === 'spacing-settings'}
						onToggle={() => toggleStylesPanel('spacing-settings')}
					>
						<DeviceBadge device={device} />

						<RangeControl
							label={__('Padding (px)', 'uplifters-site-builder-blocks')}
							value={padding}
							onChange={(value) =>
								setResponsiveValue(
									attributes,
									setAttributes,
									'padding',
									device,
									value
								)
							}
							min={0}
							max={80}
						/>

						<RangeControl
							label={__('Margin (px)', 'uplifters-site-builder-blocks')}
							value={margin}
							onChange={(value) =>
								setResponsiveValue(
									attributes,
									setAttributes,
									'margin',
									device,
									value
								)
							}
							min={0}
							max={80}
						/>

						<RangeControl
							label={__('Border Radius (px)', 'uplifters-site-builder-blocks')}
							value={borderRadius}
							onChange={(value) =>
								setResponsiveValue(
									attributes,
									setAttributes,
									'borderRadius',
									device,
									value
								)
							}
							min={0}
							max={200}
						/>
					</PanelBody>

					<PanelBody
						title={__('Colors', 'uplifters-site-builder-blocks')}
						initialOpen={false}
						opened={openStylesPanel === 'color-settings'}
						onToggle={() => toggleStylesPanel('color-settings')}
					>
						<DeviceBadge device={device} />

						<div style={colorSettingsWrapStyle}>
							<div style={colorLabelStyle}>
								{__('Background Color', 'uplifters-site-builder-blocks')}
							</div>

							<ColorPalette
								colors={themeColors}
								value={backgroundColor}
								onChange={(value) =>
									setResponsiveValue(
										attributes,
										setAttributes,
										'backgroundColor',
										device,
										value || ''
									)
								}
								enableAlpha={true}
							/>

							{backgroundColor ? (
								<Button
									variant="secondary"
									onClick={() =>
										setResponsiveValue(
											attributes,
											setAttributes,
											'backgroundColor',
											device,
											''
										)
									}
								>
									{__('Clear Background', 'uplifters-site-builder-blocks')}
								</Button>
							) : null}
						</div>
					</PanelBody>
				</InspectorControls>

				<MediaUploadCheck>
					<MediaUpload
						onSelect={onChangeLogo}
						allowedTypes={['image']}
						value={logoUrl}
						render={({ open }) => (
							<Button variant="primary" onClick={open}>
								<span style={buttonContentStyle}>
									<UploadSvgIcon />
									<span>
										{!logoUrl
											? __('Upload Logo', 'uplifters-site-builder-blocks')
											: __('Replace Logo', 'uplifters-site-builder-blocks')}
									</span>
								</span>
							</Button>
						)}
					/>
				</MediaUploadCheck>

				{logoUrl ? (
					<div style={outerStyle}>
						<div style={wrapperStyle}>
							{isLinked ? (
								<a
									href={homePath}
									onClick={(e) => e.preventDefault()}
									style={linkStyle}
								>
									<img
										src={logoUrl}
										alt={__('Website Logo', 'uplifters-site-builder-blocks')}
										style={imageStyle}
									/>
								</a>
							) : (
								<img
									src={logoUrl}
									alt={__('Website Logo', 'uplifters-site-builder-blocks')}
									style={imageStyle}
								/>
							)}
						</div>
					</div>
				) : null}
			</div>
		</Fragment>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="site-logo" /> : <Editor {...props} />;
}
