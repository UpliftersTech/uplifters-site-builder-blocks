import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import {
	__,
	sprintf,
} from '@wordpress/i18n';
import { useEffect,
	useState } from '@wordpress/element';
import {
	useBlockProps,
	InspectorControls,
	RichText,
	BlockControls,
} from '@wordpress/block-editor';
import {
	BaseControl,
	Button,
	PanelBody,
	RangeControl,
	TextControl,
	ToolbarGroup,
	ToolbarButton,
	ColorPalette,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { FontFamilyControl, getFontFamilyCss } from '../../assets-shared/fonts-family/font-family-control';

const DEFAULT_COUNTER = {
	title: '',
	titleFontFamily: {
		desktop: 'default',
		tablet: 'default',
		mobile: 'default',
	},
	titleColor: {
		desktop: '#111827',
		tablet: '#111827',
		mobile: '#111827',
	},
	titleSize: {
		desktop: 16,
		tablet: 15,
		mobile: 14,
	},
	value: 0,
	numberFontFamily: {
		desktop: 'default',
		tablet: 'default',
		mobile: 'default',
	},
	numberSize: {
		desktop: 30,
		tablet: 28,
		mobile: 26,
	},
	color: {
		desktop: '#000000',
		tablet: '#000000',
		mobile: '#000000',
	},
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
 * This block does not create its own desktop/tablet/mobile switcher. It follows
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

function getCounterResponsiveValue(counter, key, device, fallback = '') {
	const value = counter?.[key];

	if (value && typeof value === 'object' && !Array.isArray(value)) {
		return value[device] ?? value.desktop ?? value.tablet ?? value.mobile ?? fallback;
	}

	return value ?? fallback;
}

function setCounterResponsiveValue(counters, setAttributes, index, key, device, value) {
	const nextCounters = counters.map((counter, counterIndex) => {
		if (counterIndex !== index) return counter;

		const current =
			counter[key] && typeof counter[key] === 'object' && !Array.isArray(counter[key])
				? counter[key]
				: { desktop: counter[key] ?? undefined };

		return {
			...counter,
			[key]: {
				...current,
				[device]: value,
			},
		};
	});

	setAttributes({ counters: nextCounters });
}

function DeviceBadge({ device }) {
	let label = __('Desktop variant', 'uplifters-site-builder-blocks');

	if (device === 'tablet') label = __('Tablet variant', 'uplifters-site-builder-blocks');
	if (device === 'mobile') label = __('Mobile variant', 'uplifters-site-builder-blocks');

	return (
		<div
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 6,
				marginBottom: 12,
				padding: '5px 10px',
				borderRadius: 999,
				background: '#f0f0f1',
				color: '#1e1e1e',
				fontSize: 12,
				fontWeight: 600,
			}}
		>
			{label}
		</div>
	);
}

function getDeviceLayoutStyle(device) {
	if (device === 'mobile') {
		return {
			maxWidth: '420px',
			marginLeft: 'auto',
			marginRight: 'auto',
		};
	}

	if (device === 'tablet') {
		return {
			maxWidth: '768px',
			marginLeft: 'auto',
			marginRight: 'auto',
		};
	}

	return {};
}

function Editor({ attributes, setAttributes, isSelected, clientId }) {
	const device = useGlobalResponsiveDevice();

	const { heading, counters = [] } = attributes;
	const { selectBlock } = useDispatch('core/block-editor');
	const [openSettingsPanel, setOpenSettingsPanel] = useState(null);
	const [openStylesPanel, setOpenStylesPanel] = useState(null);

	const headingFontFamily = getResponsiveValue(attributes, 'headingFontFamily', device, 'default');
	const headingColor = getResponsiveValue(attributes, 'headingColor', device, '#000000');
	const headingSize = getResponsiveValue(attributes, 'headingSize', device, 24);
	const backgroundColor = getResponsiveValue(attributes, 'backgroundColor', device, '#ffffff');

	const normalizedCounters = counters.map((counter, index) => ({
		...DEFAULT_COUNTER,
		title: `Counter ${index + 1}`,
		...counter,
	}));

	const wrapperStyle = {
		backgroundColor,
		padding: '24px',
		textAlign: 'center',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		boxSizing: 'border-box',
		...getDeviceLayoutStyle(device),
	};

	const headingStyle = {
		fontFamily: getFontFamilyCss(headingFontFamily),
		color: headingColor,
		fontSize: headingSize ? `${headingSize}px` : undefined,
		lineHeight: 1.2,
		margin: 0,
		textAlign: 'center',
	};

	const countersRowStyle = {
		marginTop: '16px',
		display: 'flex',
		width: '100%',
		justifyContent: 'center',
		alignItems: 'stretch',
		gap: device === 'mobile' ? '16px' : '24px',
		flexWrap: 'wrap',
		boxSizing: 'border-box',
	};

	const counterItemStyle = {
		minWidth: device === 'mobile' ? '100%' : '120px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '8px',
		textAlign: 'center',
		boxSizing: 'border-box',
	};

	const counterNumberStyle = (counter) => {
		const numberFontFamily = getCounterResponsiveValue(counter, 'numberFontFamily', device, 'default');
		const numberSize = getCounterResponsiveValue(counter, 'numberSize', device, 30);
		const color = getCounterResponsiveValue(counter, 'color', device, '#000000');

		return {
			fontFamily: getFontFamilyCss(numberFontFamily),
			color,
			minWidth: '3ch',
			fontSize: numberSize ? `${numberSize}px` : undefined,
			fontWeight: 700,
			lineHeight: 1,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			textAlign: 'center',
		};
	};

	const counterTitleStyle = (counter) => {
		const titleFontFamily = getCounterResponsiveValue(counter, 'titleFontFamily', device, 'default');
		const titleColor = getCounterResponsiveValue(counter, 'titleColor', device, '#111827');
		const titleSize = getCounterResponsiveValue(counter, 'titleSize', device, 16);

		return {
			fontFamily: getFontFamilyCss(titleFontFamily),
			color: titleColor,
			fontSize: titleSize ? `${titleSize}px` : undefined,
			lineHeight: 1.25,
			textAlign: 'center',
		};
	};

	const handleSettingsPanelToggle = (panelName) => (next) => {
		setOpenSettingsPanel(next ? panelName : null);
	};

	const handleStylesPanelToggle = (panelName) => (next) => {
		setOpenStylesPanel(next ? panelName : null);
	};

	const updateCounter = (index, key, value) => {
		const newCounters = normalizedCounters.map((counter, counterIndex) =>
			counterIndex === index ? { ...counter, [key]: value } : counter
		);

		setAttributes({ counters: newCounters });
	};

	const addCounter = () => {
		setAttributes({
			counters: [
				...normalizedCounters,
				{
					...DEFAULT_COUNTER,
					title: `Counter ${normalizedCounters.length + 1}`,
				},
			],
		});

		setOpenSettingsPanel(`counter-${normalizedCounters.length}`);
	};

	const removeCounter = (index) => {
		const newCounters = normalizedCounters.filter((_, counterIndex) => counterIndex !== index);

		setAttributes({ counters: newCounters });
		setOpenSettingsPanel(null);
		setOpenStylesPanel(null);
	};

	const handleBlockClick = (event) => {
		event.stopPropagation();
		selectBlock(clientId);
	};

	const blockProps = useBlockProps({
		className: `uplifters-site-builder-blocks-countup-auto-animate uplifters-site-builder-blocks-countup-auto-animate-device-${device}`,
		style: wrapperStyle,
	});

	return (
		<>
			{isSelected && (
				<BlockControls>
					<ToolbarGroup>
						<ToolbarButton
							label={__('Add Counter', 'uplifters-site-builder-blocks')}
							icon="plus"
							onClick={addCounter}
						/>
						<ToolbarButton
							label={__('Reset Heading', 'uplifters-site-builder-blocks')}
							icon="undo"
							onClick={() => setAttributes({ heading: 'Counters' })}
						/>
					</ToolbarGroup>
				</BlockControls>
			)}

			<InspectorControls group="settings">
				<PanelBody
					title={__('Content', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openSettingsPanel === 'content'}
					onToggle={handleSettingsPanelToggle('content')}
				>
					<TextControl
						label={__('Heading', 'uplifters-site-builder-blocks')}
						value={heading}
						onChange={(value) => setAttributes({ heading: value })}
					/>

					<Button variant="primary" onClick={addCounter}>
						{__('Add More Counter', 'uplifters-site-builder-blocks')}
					</Button>
				</PanelBody>

				{normalizedCounters.map((counter, index) => (
					<PanelBody
						key={index}
						title={sprintf(__('Counter %d', 'uplifters-site-builder-blocks'), index + 1)}
						initialOpen={false}
						opened={openSettingsPanel === `counter-${index}`}
						onToggle={handleSettingsPanelToggle(`counter-${index}`)}
					>
						<TextControl
							label={__('Title', 'uplifters-site-builder-blocks')}
							value={counter.title}
							onChange={(value) => updateCounter(index, 'title', value)}
						/>

						<RangeControl
							label={__('Value', 'uplifters-site-builder-blocks')}
							value={counter.value}
							onChange={(value) => updateCounter(index, 'value', value ?? 0)}
							min={0}
							max={10000}
						/>

						<Button isDestructive onClick={() => removeCounter(index)}>
							{__('Remove Counter', 'uplifters-site-builder-blocks')}
						</Button>
					</PanelBody>
				))}
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={__('Typography', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'typography'}
					onToggle={handleStylesPanelToggle('typography')}
				>
					<DeviceBadge device={device} />

					<FontFamilyControl
						label={__('Heading Font Family', 'uplifters-site-builder-blocks')}
						value={headingFontFamily || 'default'}
												onChange={(value) =>
							setResponsiveValue(attributes, setAttributes, 'headingFontFamily', device, value)
						}
					/>

					<RangeControl
						label={__('Heading Size', 'uplifters-site-builder-blocks')}
						value={headingSize}
						onChange={(value) => setResponsiveValue(attributes, setAttributes, 'headingSize', device, value ?? 24)}
						min={12}
						max={72}
					/>
				</PanelBody>

				<PanelBody
					title={__('Colors', 'uplifters-site-builder-blocks')}
					initialOpen={false}
					opened={openStylesPanel === 'colors'}
					onToggle={handleStylesPanelToggle('colors')}
				>
					<DeviceBadge device={device} />

					<BaseControl label={__('Heading Color', 'uplifters-site-builder-blocks')}>
						<ColorPalette
							value={headingColor}
							onChange={(value) =>
								setResponsiveValue(attributes, setAttributes, 'headingColor', device, value || '#000000')
							}
							enableAlpha
						/>
					</BaseControl>

					<BaseControl label={__('Background Color', 'uplifters-site-builder-blocks')}>
						<ColorPalette
							value={backgroundColor}
							onChange={(value) =>
								setResponsiveValue(attributes, setAttributes, 'backgroundColor', device, value || '#ffffff')
							}
							enableAlpha
						/>
					</BaseControl>
				</PanelBody>

				{normalizedCounters.map((counter, index) => {
					const titleFontFamily = getCounterResponsiveValue(counter, 'titleFontFamily', device, 'default');
					const titleSize = getCounterResponsiveValue(counter, 'titleSize', device, DEFAULT_COUNTER.titleSize.desktop);
					const titleColor = getCounterResponsiveValue(counter, 'titleColor', device, DEFAULT_COUNTER.titleColor.desktop);
					const numberFontFamily = getCounterResponsiveValue(counter, 'numberFontFamily', device, 'default');
					const numberSize = getCounterResponsiveValue(counter, 'numberSize', device, DEFAULT_COUNTER.numberSize.desktop);
					const numberColor = getCounterResponsiveValue(counter, 'color', device, DEFAULT_COUNTER.color.desktop);

					return (
						<PanelBody
							key={index}
							title={sprintf(__('Counter %d Style', 'uplifters-site-builder-blocks'), index + 1)}
							initialOpen={false}
							opened={openStylesPanel === `counter-${index}`}
							onToggle={handleStylesPanelToggle(`counter-${index}`)}
						>
							<DeviceBadge device={device} />

							<FontFamilyControl
								label={__('Title Font Family', 'uplifters-site-builder-blocks')}
								value={titleFontFamily || 'default'}
																onChange={(value) =>
									setCounterResponsiveValue(normalizedCounters, setAttributes, index, 'titleFontFamily', device, value)
								}
							/>

							<RangeControl
								label={__('Title Size', 'uplifters-site-builder-blocks')}
								value={titleSize}
								onChange={(value) =>
									setCounterResponsiveValue(normalizedCounters, setAttributes, index, 'titleSize', device, value ?? DEFAULT_COUNTER.titleSize.desktop)
								}
								min={10}
								max={48}
							/>

							<BaseControl label={__('Title Color', 'uplifters-site-builder-blocks')}>
								<ColorPalette
									value={titleColor}
									onChange={(value) =>
										setCounterResponsiveValue(normalizedCounters, setAttributes, index, 'titleColor', device, value || DEFAULT_COUNTER.titleColor.desktop)
									}
									enableAlpha
								/>
							</BaseControl>

							<FontFamilyControl
								label={__('Number Font Family', 'uplifters-site-builder-blocks')}
								value={numberFontFamily || 'default'}
																onChange={(value) =>
									setCounterResponsiveValue(normalizedCounters, setAttributes, index, 'numberFontFamily', device, value)
								}
							/>

							<RangeControl
								label={__('Number Size', 'uplifters-site-builder-blocks')}
								value={numberSize}
								onChange={(value) =>
									setCounterResponsiveValue(normalizedCounters, setAttributes, index, 'numberSize', device, value ?? DEFAULT_COUNTER.numberSize.desktop)
								}
								min={12}
								max={96}
							/>

							<BaseControl label={__('Number Color', 'uplifters-site-builder-blocks')}>
								<ColorPalette
									value={numberColor}
									onChange={(value) =>
										setCounterResponsiveValue(normalizedCounters, setAttributes, index, 'color', device, value || DEFAULT_COUNTER.color.desktop)
									}
									enableAlpha
								/>
							</BaseControl>
						</PanelBody>
					);
				})}
			</InspectorControls>

			<div {...blockProps} onClick={handleBlockClick}>
				<RichText
					tagName="h2"
					value={heading}
					onChange={(value) => setAttributes({ heading: value })}
					style={headingStyle}
					placeholder={__('Enter heading...', 'uplifters-site-builder-blocks')}
					disableLineBreaks
					onClick={(event) => {
						event.stopPropagation();
						selectBlock(clientId);
					}}
				/>

				<div className="uplifters-site-builder-blocks-countup-auto-animate__items" style={countersRowStyle}>
					{normalizedCounters.map((counter, index) => (
						<div
							key={index}
							className="uplifters-site-builder-blocks-countup-auto-animate__item"
							style={counterItemStyle}
							onClick={(event) => {
								event.stopPropagation();
								selectBlock(clientId);
							}}
						>
							<div
								className="uplifters-site-builder-blocks-countup-auto-animate__number"
								data-count={counter.value}
								style={counterNumberStyle(counter)}
							>
								{counter.value}
							</div>

							<div className="uplifters-site-builder-blocks-countup-auto-animate__title" style={counterTitleStyle(counter)}>
								{counter.title}
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="countup-auto-animate" /> : <Editor {...props} />;
}
