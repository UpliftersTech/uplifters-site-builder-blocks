import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import {
	useEffect,
	useState,
} from '@wordpress/element';
import {
	useBlockProps,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	RangeControl,
	Button,
	SelectControl,
	ColorPalette,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import './editor.scss';

import {
	FaGoogle,
	FaFacebookF,
	FaInstagram,
	FaLinkedinIn,
	FaYoutube,
	FaPinterestP,
	FaTwitter,
} from 'react-icons/fa';
import { SiGithub, SiWhatsapp, SiTiktok } from 'react-icons/si';

const ICON_MAP = {
	FaGoogle,
	FaFacebookF,
	FaInstagram,
	FaLinkedinIn,
	FaYoutube,
	FaPinterestP,
	FaTwitter,
	SiGithub,
	SiWhatsapp,
	SiTiktok,
};

const ICON_OPTIONS = Object.keys(ICON_MAP).map((name) => ({
	label: name,
	value: name,
}));

const DEFAULT_ICON_NAME = 'FaGoogle';
const RESPONSIVE_DEVICES = ['desktop', 'tablet', 'mobile'];

const POSITION_OPTIONS = [
	{ label: __('Start', 'uplifters-site-builder-blocks'), value: 'start' },
	{ label: __('Center', 'uplifters-site-builder-blocks'), value: 'center' },
	{ label: __('End', 'uplifters-site-builder-blocks'), value: 'end' },
];

const DEFAULT_RESPONSIVE_ICON = {
	name: DEFAULT_ICON_NAME,
	size: {
		desktop: 20,
		tablet: 20,
		mobile: 20,
	},
	color: {
		desktop: '#000000',
		tablet: '#000000',
		mobile: '#000000',
	},
	opacity: {
		desktop: 1,
		tablet: 1,
		mobile: 1,
	},
	borderRadius: {
		desktop: 8,
		tablet: 8,
		mobile: 8,
	},
	backgroundColor: {
		desktop: '#ffffff',
		tablet: '#ffffff',
		mobile: '#ffffff',
	},
	padding: {
		desktop: 8,
		tablet: 8,
		mobile: 6,
	},
	margin: {
		desktop: 8,
		tablet: 6,
		mobile: 4,
	},
	url: '',
};

function getIconComponentByName(iconName) {
	return ICON_MAP[iconName] || ICON_MAP[DEFAULT_ICON_NAME];
}

function getCurrentGlobalResponsiveDevice() {
	if (
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice === 'function'
	) {
		const device = window.UpliftersSiteBuilderBlocksResponsive.getDevice();

		return RESPONSIVE_DEVICES.includes(device) ? device : 'desktop';
	}

	return 'desktop';
}

function useGlobalResponsiveDevice() {
	const [device, setDevice] = useState(getCurrentGlobalResponsiveDevice());

	useEffect(() => {
		function handleDeviceChange(event) {
			const nextDevice =
				event?.detail?.device || getCurrentGlobalResponsiveDevice();

			setDevice(
				RESPONSIVE_DEVICES.includes(nextDevice) ? nextDevice : 'desktop'
			);
		}

		window.addEventListener(
			'uplifters-site-builder-blocks-responsive-device-change',
			handleDeviceChange
		);

		const interval = window.setInterval(() => {
			const nextDevice = getCurrentGlobalResponsiveDevice();

			setDevice((currentDevice) =>
				currentDevice !== nextDevice ? nextDevice : currentDevice
			);
		}, 500);

		return () => {
			window.removeEventListener(
				'uplifters-site-builder-blocks-responsive-device-change',
				handleDeviceChange
			);
			window.clearInterval(interval);
		};
	}, []);

	return device;
}

function getResponsiveValue(value, device, fallback = '') {
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		return (
			value[device] ??
			value.desktop ??
			value.tablet ??
			value.mobile ??
			fallback
		);
	}

	return value ?? fallback;
}

function setResponsiveValue(value, device, nextValue) {
	const currentValue =
		value && typeof value === 'object' && !Array.isArray(value) ? value : {};

	return {
		...currentValue,
		[device]: nextValue,
	};
}

function getPositionJustifyContent(position) {
	if (position === 'center') {
		return 'center';
	}

	if (position === 'end') {
		return 'flex-end';
	}

	return 'flex-start';
}

function DeviceBadge({ device }) {
	let label = __('Desktop variant', 'uplifters-site-builder-blocks');

	if (device === 'tablet') {
		label = __('Tablet variant', 'uplifters-site-builder-blocks');
	}

	if (device === 'mobile') {
		label = __('Mobile variant', 'uplifters-site-builder-blocks');
	}

	return <div className="uplifters-site-builder-blocks-social-icon-device-badge">{label}</div>;
}

function Editor({ attributes, setAttributes }) {
	const { icons = [], canvasBackgroundColor, canvasGap, iconPosition } = attributes;
	const device = useGlobalResponsiveDevice();

	const [openSettingsPanel, setOpenSettingsPanel] = useState(null);
	const [openStylesPanel, setOpenStylesPanel] = useState(null);

	const updateCanvasResponsiveValue = (key, value) => {
		setAttributes({
			[key]: setResponsiveValue(attributes[key], device, value),
		});
	};

	const updateIcon = (index, key, value) => {
		const newIcons = [...icons];

		newIcons[index] = {
			...newIcons[index],
			[key]: key === 'name' ? String(value || '').trim() : value,
		};

		setAttributes({ icons: newIcons });
	};

	const updateIconResponsiveValue = (index, key, value) => {
		const newIcons = [...icons];
		const currentIcon = newIcons[index] || {};

		newIcons[index] = {
			...currentIcon,
			[key]: setResponsiveValue(currentIcon[key], device, value),
		};

		setAttributes({ icons: newIcons });
	};

	const addNewIcon = () => {
		setAttributes({
			icons: [
				...icons,
				JSON.parse(JSON.stringify(DEFAULT_RESPONSIVE_ICON)),
			],
		});
	};

	const removeIcon = (indexToRemove) => {
		const newIcons = icons.filter((_, index) => index !== indexToRemove);
		setAttributes({ icons: newIcons });
	};

	const currentCanvasBackgroundColor = getResponsiveValue(
		canvasBackgroundColor,
		device,
		''
	);

	const currentCanvasGap = getResponsiveValue(canvasGap, device, 16);
	const currentIconPosition = getResponsiveValue(
		iconPosition,
		device,
		'start'
	);
	const gapPx =
		typeof currentCanvasGap === 'number'
			? `${currentCanvasGap}px`
			: undefined;

	const blockProps = useBlockProps({
		className: `uplifters-site-builder-blocks-social-icon-editor-wrapper uplifters-site-builder-blocks-social-icon-device-${device}`,
		style: {
			backgroundColor: currentCanvasBackgroundColor || undefined,
			gap: gapPx,
			columnGap: gapPx,
			rowGap: gapPx,
			justifyContent: getPositionJustifyContent(currentIconPosition),
		},
	});

	return (
		<>

			<InspectorControls group="settings">
				{icons.length === 0 && <div aria-hidden="true" />}

				{icons.map((icon, index) => {
					return (
						<PanelBody
							title={__('Icon', 'uplifters-site-builder-blocks') + ` ${index + 1}`}
							initialOpen={false}
							opened={openSettingsPanel === index}
							onToggle={() =>
								setOpenSettingsPanel((current) =>
									current === index ? null : index
								)
							}
							key={index}
						>
							<DeviceBadge device={device} />

							<SelectControl
								label={__('Icon Name', 'uplifters-site-builder-blocks')}
								value={icon.name || DEFAULT_ICON_NAME}
								options={ICON_OPTIONS}
								onChange={(val) => updateIcon(index, 'name', val)}
							/>

							<TextControl
								label={__('Link URL', 'uplifters-site-builder-blocks')}
								value={icon.url || ''}
								onChange={(val) => updateIcon(index, 'url', val)}
							/>

							<Button
								isDestructive
								variant="secondary"
								onClick={() => removeIcon(index)}
							>
								{__('Remove Icon', 'uplifters-site-builder-blocks')}
							</Button>
						</PanelBody>
					);
				})}
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={__('Layout', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'layout'}
					onToggle={() =>
						setOpenStylesPanel((current) =>
							current === 'layout' ? null : 'layout'
						)
					}
				>
					<DeviceBadge device={device} />

					<SelectControl
						label={__('Position', 'uplifters-site-builder-blocks')}
						value={currentIconPosition}
						options={POSITION_OPTIONS}
						onChange={(val) =>
							updateCanvasResponsiveValue('iconPosition', val)
						}
					/>

					<RangeControl
						label={__('Gap (px)', 'uplifters-site-builder-blocks')}
						value={currentCanvasGap}
						onChange={(val) =>
							updateCanvasResponsiveValue('canvasGap', val)
						}
						min={0}
						max={120}
					/>
				</PanelBody>

				<PanelBody
					title={__('Colors', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'background'}
					onToggle={() =>
						setOpenStylesPanel((current) =>
							current === 'background' ? null : 'background'
						)
					}
				>
					<DeviceBadge device={device} />

					<ColorPalette
						value={currentCanvasBackgroundColor}
						onChange={(val) =>
							updateCanvasResponsiveValue(
								'canvasBackgroundColor',
								val || ''
							)
						}
						label={__('Background Color', 'uplifters-site-builder-blocks')}
					 enableAlpha/>
				</PanelBody>

				{icons.map((icon, index) => {
					const iconSize = getResponsiveValue(icon.size, device, 20);
					const iconOpacity = getResponsiveValue(icon.opacity, device, 1);
					const iconBorderRadius = getResponsiveValue(
						icon.borderRadius,
						device,
						8
					);
					const iconPadding = getResponsiveValue(icon.padding, device, 8);
					const iconMargin = getResponsiveValue(icon.margin, device, 8);
					const iconBackgroundColor = getResponsiveValue(
						icon.backgroundColor,
						device,
						'#ffffff'
					);
					const iconColor = getResponsiveValue(
						icon.color,
						device,
						'#000000'
					);

					return (
						<PanelBody
							title={__('Icon', 'uplifters-site-builder-blocks') + ` ${index + 1} ` + __('Style', 'uplifters-site-builder-blocks')}
							initialOpen={false}
							opened={openStylesPanel === `icon-${index}`}
							onToggle={() =>
								setOpenStylesPanel((current) =>
									current === `icon-${index}` ? null : `icon-${index}`
								)
							}
							key={index}
						>
							<DeviceBadge device={device} />

							<RangeControl
								label={__('Size', 'uplifters-site-builder-blocks')}
								value={iconSize}
								onChange={(val) =>
									updateIconResponsiveValue(index, 'size', val)
								}
								min={10}
								max={150}
							/>

							<RangeControl
								label={__('Opacity', 'uplifters-site-builder-blocks')}
								value={iconOpacity}
								onChange={(val) =>
									updateIconResponsiveValue(index, 'opacity', val)
								}
								min={0.1}
								max={1}
								step={0.1}
							/>

							<RangeControl
								label={__('Border Radius', 'uplifters-site-builder-blocks')}
								value={iconBorderRadius}
								onChange={(val) =>
									updateIconResponsiveValue(index, 'borderRadius', val)
								}
								min={0}
								max={50}
							/>

							<RangeControl
								label={__('Padding', 'uplifters-site-builder-blocks')}
								value={iconPadding}
								onChange={(val) =>
									updateIconResponsiveValue(index, 'padding', val)
								}
								min={0}
								max={50}
							/>

							<RangeControl
								label={__('Margin', 'uplifters-site-builder-blocks')}
								value={iconMargin}
								onChange={(val) =>
									updateIconResponsiveValue(index, 'margin', val)
								}
								min={0}
								max={80}
							/>

							<ColorPalette
								value={iconBackgroundColor}
								onChange={(val) =>
									updateIconResponsiveValue(
										index,
										'backgroundColor',
										val || ''
									)
								}
								label={__('Icon Background Color', 'uplifters-site-builder-blocks')}
							 enableAlpha/>

							<ColorPalette
								value={iconColor}
								onChange={(val) =>
									updateIconResponsiveValue(index, 'color', val || '')
								}
								label={__('Icon Color', 'uplifters-site-builder-blocks')}
							 enableAlpha/>
						</PanelBody>
					);
				})}
			</InspectorControls>

			<div {...blockProps}>
				{icons.map((icon, index) => {
					const IconComponent = getIconComponentByName(icon.name);
					const iconSize = getResponsiveValue(icon.size, device, 20);
					const iconColor = getResponsiveValue(
						icon.color,
						device,
						'#000000'
					);
					const iconOpacity = getResponsiveValue(icon.opacity, device, 1);
					const iconBorderRadius = getResponsiveValue(
						icon.borderRadius,
						device,
						8
					);
					const iconBackgroundColor = getResponsiveValue(
						icon.backgroundColor,
						device,
						'#ffffff'
					);
					const iconPadding = getResponsiveValue(icon.padding, device, 8);
					const iconMargin = getResponsiveValue(icon.margin, device, 8);

					return (
						<a
							key={index}
							href={icon.url || '#'}
							style={{
								fontSize: `${iconSize}px`,
								color: iconColor,
								opacity: iconOpacity,
								borderRadius: `${iconBorderRadius}px`,
								backgroundColor: iconBackgroundColor,
								padding: `${iconPadding}px`,
								margin: `${iconMargin ?? 0}px`,
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
								textDecoration: 'none',
							}}
							className="uplifters-site-builder-blocks-social-icon"
							onClick={(event) => event.preventDefault()}
						>
							<IconComponent />
						</a>
					);
				})}

				<Button icon="plus" variant="primary" onClick={addNewIcon}>
					{__('Add Icon', 'uplifters-site-builder-blocks')}
				</Button>
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="social-icon" /> : <Editor {...props} />;
}