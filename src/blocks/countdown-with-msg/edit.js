import './editor.scss';
import InserterPreview from '../../blocks-inserter-preview/inserter-preview';
import { __ } from '@wordpress/i18n';
import {
	useEffect,
	useMemo,
	useState,
} from '@wordpress/element';
import {
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';

import {
	PanelBody,
	SelectControl,
	RangeControl,
	ToggleControl,
	TextControl,
	TextareaControl,
	ColorPalette,
	BaseControl,
	Button,
	Dropdown,
	DatePicker,
	ButtonGroup,
} from '@wordpress/components';

const RESPONSIVE_DEVICES = [
	'desktop',
	'tablet',
	'mobile',
];

const DEVICE_LABELS = {
	desktop: __('Desktop variant', 'uplifters-site-builder-blocks'),
	tablet: __('Tablet variant', 'uplifters-site-builder-blocks'),
	mobile: __('Mobile variant', 'uplifters-site-builder-blocks'),
};

const LAYOUT_OPTIONS = [
	{
		label: __('Row', 'uplifters-site-builder-blocks'),
		value: 'row',
	},
	{
		label: __('Grid', 'uplifters-site-builder-blocks'),
		value: 'grid',
	},
	{
		label: __('Stack', 'uplifters-site-builder-blocks'),
		value: 'stack',
	},
];

const ALIGNMENT_OPTIONS = [
	{
		label: __('Left', 'uplifters-site-builder-blocks'),
		value: 'left',
	},
	{
		label: __('Center', 'uplifters-site-builder-blocks'),
		value: 'center',
	},
	{
		label: __('Right', 'uplifters-site-builder-blocks'),
		value: 'right',
	},
];

const EXPIRED_OPTIONS = [
	{
		label: __('Show a message', 'uplifters-site-builder-blocks'),
		value: 'message',
	},
	{
		label: __('Keep showing zeros', 'uplifters-site-builder-blocks'),
		value: 'zeros',
	},
	{
		label: __('Hide the block', 'uplifters-site-builder-blocks'),
		value: 'hide',
	},
];

const COLOR_PALETTE = [
	{
		name: __('Sky', 'uplifters-site-builder-blocks'),
		color: '#0284c7',
	},
	{
		name: __('Blue', 'uplifters-site-builder-blocks'),
		color: '#2563eb',
	},
	{
		name: __('Indigo', 'uplifters-site-builder-blocks'),
		color: '#4f46e5',
	},
	{
		name: __('Violet', 'uplifters-site-builder-blocks'),
		color: '#7c3aed',
	},
	{
		name: __('Emerald', 'uplifters-site-builder-blocks'),
		color: '#059669',
	},
	{
		name: __('Rose', 'uplifters-site-builder-blocks'),
		color: '#e11d48',
	},
	{
		name: __('Slate', 'uplifters-site-builder-blocks'),
		color: '#475569',
	},
	{
		name: __('Black', 'uplifters-site-builder-blocks'),
		color: '#0f172a',
	},
];


/**
 * Split a stored, timezone free value such as
 * 2026-08-13T21:00:00 into its numeric pieces.
 */
function parseNaiveDate(value) {
	const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(
		String(value || '').trim()
	);

	if (!match) {
		return null;
	}

	return {
		year: Number(match[1]),
		month: Number(match[2]),
		day: Number(match[3]),
		hour: Number(match[4]),
		minute: Number(match[5]),
		second: Number(match[6] || 0),
	};
}

function padTwo(value) {
	return String(value).padStart(2, '0');
}

function formatNaiveParts(year, month, day, hour, minute, second) {
	return (
		`${year}-${padTwo(month)}-${padTwo(day)}` +
		`T${padTwo(hour)}:${padTwo(minute)}:${padTwo(second)}`
	);
}

function fromDateObject(dateObject) {
	return Number.isNaN(dateObject.getTime())
		? ''
		: formatNaiveParts(
				dateObject.getFullYear(),
				dateObject.getMonth() + 1,
				dateObject.getDate(),
				dateObject.getHours(),
				dateObject.getMinutes(),
				dateObject.getSeconds()
		  );
}

/**
 * Whatever the picker hands back becomes one canonical,
 * timezone free string.
 *
 * The control can return a plain string, an ISO string
 * carrying a Z or a numeric offset, or a Date instance,
 * depending on the WordPress version. Storing the raw value
 * shifts the clock by the UTC offset or breaks parsing
 * outright, which is why every value passes through here.
 */
function toNaiveDateString(value) {
	if (!value) {
		return '';
	}

	if (value instanceof Date) {
		return fromDateObject(value);
	}

	const raw = String(value).trim();

	// An explicit zone must be converted, never truncated.
	if (/(?:Z|[+-]\d{2}:?\d{2})$/.test(raw)) {
		return fromDateObject(new Date(raw));
	}

	const parts = parseNaiveDate(raw);

	if (parts) {
		return formatNaiveParts(
			parts.year,
			parts.month,
			parts.day,
			parts.hour,
			parts.minute,
			parts.second
		);
	}

	return fromDateObject(new Date(raw));
}

/**
 * The calendar changes the day only, the chosen clock
 * time is carried over untouched.
 */
function mergeDatePart(previousValue, nextValue) {
	const next = parseNaiveDate(toNaiveDateString(nextValue));

	if (!next) {
		return previousValue || '';
	}

	const previous = parseNaiveDate(previousValue);

	return formatNaiveParts(
		next.year,
		next.month,
		next.day,
		previous ? previous.hour : next.hour,
		previous ? previous.minute : next.minute,
		0
	);
}

const HOUR_OPTIONS = Array.from(
	{ length: 12 },
	(ignored, index) => ({
		label: String(index + 1),
		value: String(index + 1),
	})
);

const MINUTE_OPTIONS = Array.from(
	{ length: 60 },
	(ignored, index) => ({
		label: padTwo(index),
		value: String(index),
	})
);

/**
 * Resolve the stored value into a real timestamp.
 *
 * The stored value is a timezone free wall clock string and
 * is always read on the local clock, so the editor canvas,
 * the saved markup and every visitor use the same rule.
 */
function resolveTargetTimestamp(value) {
	const parts = parseNaiveDate(value);

	if (!parts) {
		return NaN;
	}

	return new Date(
		parts.year,
		parts.month - 1,
		parts.day,
		parts.hour,
		parts.minute,
		parts.second
	).getTime();
}

/**
 * Human readable rendering of a resolved timestamp.
 */
function formatTimestamp(timestamp) {
	if (!Number.isFinite(timestamp)) {
		return '';
	}

	try {
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short',
		}).format(new Date(timestamp));
	} catch (error) {
		return new Date(timestamp).toLocaleString();
	}
}

function getCurrentGlobalResponsiveDevice() {
	if (typeof window === 'undefined') {
		return 'desktop';
	}

	if (
		window.UpliftersSiteBuilderBlocksResponsive &&
		typeof window.UpliftersSiteBuilderBlocksResponsive.getDevice ===
			'function'
	) {
		const device =
			window.UpliftersSiteBuilderBlocksResponsive.getDevice();

		return RESPONSIVE_DEVICES.includes(device)
			? device
			: 'desktop';
	}

	return 'desktop';
}

/**
 * Individual hook for reading the global responsive device.
 */
function useGlobalResponsiveDevice() {
	const [device, setDevice] = useState(
		getCurrentGlobalResponsiveDevice
	);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return undefined;
		}

		function handleDeviceChange(event) {
			const eventDevice =
				event?.detail?.device;

			if (
				RESPONSIVE_DEVICES.includes(
					eventDevice
				)
			) {
				setDevice(eventDevice);
				return;
			}

			setDevice(
				getCurrentGlobalResponsiveDevice()
			);
		}

		handleDeviceChange();

		window.addEventListener(
			'uplifters-site-builder-blocks-responsive-device-change',
			handleDeviceChange
		);

		const interval = window.setInterval(() => {
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

			window.clearInterval(interval);
		};
	}, []);

	return device;
}

function getResponsiveValue(
	value,
	device,
	fallback = ''
) {
	if (
		value &&
		typeof value === 'object' &&
		!Array.isArray(value)
	) {
		if (
			value[device] !== undefined &&
			value[device] !== null
		) {
			return value[device];
		}

		if (
			value.desktop !== undefined &&
			value.desktop !== null
		) {
			return value.desktop;
		}

		if (
			value.tablet !== undefined &&
			value.tablet !== null
		) {
			return value.tablet;
		}

		if (
			value.mobile !== undefined &&
			value.mobile !== null
		) {
			return value.mobile;
		}

		return fallback;
	}

	return value ?? fallback;
}

function setResponsiveValue(
	currentValue,
	device,
	nextValue
) {
	const responsiveObject =
		currentValue &&
		typeof currentValue === 'object' &&
		!Array.isArray(currentValue)
			? currentValue
			: {};

	return {
		...responsiveObject,
		[device]: nextValue,
	};
}

function DeviceBadge({ device }) {
	return (
		<div className="uplifters-site-builder-blocks-countdown-with-msg-device-badge">
			{DEVICE_LABELS[device] ||
				DEVICE_LABELS.desktop}
		</div>
	);
}

/**
 * Remaining time between now and the target timestamp.
 *
 * When no usable target is set the editor still needs
 * something to draw, so a rolling seven day preview is
 * used and flagged so the canvas can say so.
 */
const PREVIEW_OFFSET = 7 * 24 * 60 * 60 * 1000;

function splitDifference(difference) {
	const totalSeconds = Math.max(
		0,
		Math.floor(difference / 1000)
	);

	return {
		days: Math.floor(totalSeconds / 86400),
		hours: Math.floor(
			(totalSeconds % 86400) / 3600
		),
		minutes: Math.floor(
			(totalSeconds % 3600) / 60
		),
		seconds: totalSeconds % 60,
	};
}

function getRemainingParts(targetTimestamp) {
	const target = Number.isFinite(targetTimestamp)
		? targetTimestamp
		: NaN;

	if (Number.isNaN(target)) {
		return {
			...splitDifference(PREVIEW_OFFSET),
			valid: false,
			expired: false,
		};
	}

	const difference = target - Date.now();

	return {
		...splitDifference(difference),
		valid: true,
		expired: difference <= 0,
	};
}

function useRemainingTime(targetTimestamp) {
	const [remaining, setRemaining] = useState(() =>
		getRemainingParts(targetTimestamp)
	);

	useEffect(() => {
		setRemaining(
			getRemainingParts(targetTimestamp)
		);

		if (typeof window === 'undefined') {
			return undefined;
		}

		const interval = window.setInterval(() => {
			setRemaining(
				getRemainingParts(targetTimestamp)
			);
		}, 1000);

		return () => {
			window.clearInterval(interval);
		};
	}, [targetTimestamp]);

	return remaining;
}

function padValue(value) {
	return String(value).padStart(2, '0');
}

function CountdownUnit({ value, label }) {
	return (
		<div className="uplifters-site-builder-blocks-countdown-with-msg-editor__unit">
			<span className="uplifters-site-builder-blocks-countdown-with-msg-editor__number">
				{padValue(value)}
			</span>

			<span className="uplifters-site-builder-blocks-countdown-with-msg-editor__label">
				{label}
			</span>
		</div>
	);
}

/**
 * Hour, minute and meridiem as three plain controls.
 *
 * The stock time picker asks people to type into a narrow
 * 24 hour field, which is where most wrong countdowns start.
 */
function TimeOfDayControl({ value, onChange }) {
	const now = new Date();

	const base = parseNaiveDate(value) || {
		year: now.getFullYear(),
		month: now.getMonth() + 1,
		day: now.getDate(),
		hour: 12,
		minute: 0,
		second: 0,
	};

	const meridiem = base.hour >= 12 ? 'pm' : 'am';

	const hour12 =
		base.hour % 12 === 0 ? 12 : base.hour % 12;

	const push = (nextHour, nextMinute, nextMeridiem) => {
		const normalized = nextHour % 12;

		onChange(
			formatNaiveParts(
				base.year,
				base.month,
				base.day,
				'pm' === nextMeridiem
					? normalized + 12
					: normalized,
				nextMinute,
				0
			)
		);
	};

	return (
		<div className="uplifters-site-builder-blocks-countdown-with-msg-timefield">
			<SelectControl
				__nextHasNoMarginBottom
				label={__('Hour', 'uplifters-site-builder-blocks')}
				value={String(hour12)}
				options={HOUR_OPTIONS}
				onChange={(next) =>
					push(
						Number(next),
						base.minute,
						meridiem
					)
				}
			/>

			<SelectControl
				__nextHasNoMarginBottom
				label={__('Minute', 'uplifters-site-builder-blocks')}
				value={String(base.minute)}
				options={MINUTE_OPTIONS}
				onChange={(next) =>
					push(
						hour12,
						Number(next),
						meridiem
					)
				}
			/>

			<BaseControl
				__nextHasNoMarginBottom
				id="uplifters-site-builder-blocks-countdown-with-msg-meridiem"
				label={__('AM / PM', 'uplifters-site-builder-blocks')}
			>
				<ButtonGroup className="uplifters-site-builder-blocks-countdown-with-msg-timefield__meridiem">
					<Button
						size="compact"
						variant={
							'am' === meridiem
								? 'primary'
								: 'secondary'
						}
						onClick={() =>
							push(hour12, base.minute, 'am')
						}
					>
						{__('AM', 'uplifters-site-builder-blocks')}
					</Button>

					<Button
						size="compact"
						variant={
							'pm' === meridiem
								? 'primary'
								: 'secondary'
						}
						onClick={() =>
							push(hour12, base.minute, 'pm')
						}
					>
						{__('PM', 'uplifters-site-builder-blocks')}
					</Button>
				</ButtonGroup>
			</BaseControl>
		</div>
	);
}

function Editor({
	attributes,
	setAttributes,
}) {
	const device =
		useGlobalResponsiveDevice();

	const {
		targetDate,
		showDays,
		showHours,
		showMinutes,
		showSeconds,
		daysLabel,
		hoursLabel,
		minutesLabel,
		secondsLabel,
		expiredBehaviour,
		expiredMessage,
		showMessage,
		message,
	} = attributes;

	/**
	 * The moment the countdown runs towards.
	 * Everything on the canvas is derived from this value.
	 *
	 * The stored wall clock time is always read on the local
	 * clock, so no timezone choice is needed anywhere.
	 */
	const resolvedTimestamp = useMemo(
		() => resolveTargetTimestamp(targetDate),
		[targetDate]
	);

	const remaining = useRemainingTime(
		resolvedTimestamp
	);

	const targetLabel = formatTimestamp(resolvedTimestamp);

	const layout = getResponsiveValue(
		attributes.layout,
		device,
		'row'
	);

	const alignment = getResponsiveValue(
		attributes.alignment,
		device,
		'center'
	);

	const gap = Number(
		getResponsiveValue(
			attributes.gap,
			device,
			16
		)
	);

	const numberFontSize = Number(
		getResponsiveValue(
			attributes.numberFontSize,
			device,
			48
		)
	);

	const numberColor = getResponsiveValue(
		attributes.numberColor,
		device,
		'#0f172a'
	);

	const labelFontSize = Number(
		getResponsiveValue(
			attributes.labelFontSize,
			device,
			13
		)
	);

	const labelColor = getResponsiveValue(
		attributes.labelColor,
		device,
		'#64748b'
	);

	const boxBackgroundColor = getResponsiveValue(
		attributes.boxBackgroundColor,
		device,
		'#f1f5f9'
	);

	const boxPadding = Number(
		getResponsiveValue(
			attributes.boxPadding,
			device,
			20
		)
	);

	const boxBorderRadius = Number(
		getResponsiveValue(
			attributes.boxBorderRadius,
			device,
			12
		)
	);

	const boxMinWidth = Number(
		getResponsiveValue(
			attributes.boxMinWidth,
			device,
			110
		)
	);

	const messageFontSize = Number(
		getResponsiveValue(
			attributes.messageFontSize,
			device,
			16
		)
	);

	const messageColor = getResponsiveValue(
		attributes.messageColor,
		device,
		'#475569'
	);

	const messageAlignment = getResponsiveValue(
		attributes.messageAlignment,
		device,
		'center'
	);

	const messageSpacing = Number(
		getResponsiveValue(
			attributes.messageSpacing,
			device,
			16
		)
	);

	const expiredMessageFontSize = Number(
		getResponsiveValue(
			attributes.expiredMessageFontSize,
			device,
			20
		)
	);

	const expiredMessageColor = getResponsiveValue(
		attributes.expiredMessageColor,
		device,
		'#0f172a'
	);

	const expiredMessageAlignment = getResponsiveValue(
		attributes.expiredMessageAlignment,
		device,
		'center'
	);

	const backgroundColor = getResponsiveValue(
		attributes.backgroundColor,
		device,
		'transparent'
	);

	const spacing = Number(
		getResponsiveValue(
			attributes.spacing,
			device,
			32
		)
	);

	const updateResponsiveAttribute = (
		attributeName,
		value
	) => {
		setAttributes({
			[attributeName]:
				setResponsiveValue(
					attributes[
						attributeName
					],
					device,
					value
				),
		});
	};

	/**
	 * Editor only. The expired state is otherwise impossible
	 * to see or style until the target date actually passes.
	 */
	const [previewExpired, setPreviewExpired] =
		useState(false);

	const [openStylesPanel, setOpenStylesPanel] =
		useState(null);
	const toggleStylesPanel = (key) =>
		setOpenStylesPanel((current) =>
			current === key ? null : key
		);

	const justifyContentMap = {
		left: 'flex-start',
		center: 'center',
		right: 'flex-end',
	};

	const cssAlignment =
		justifyContentMap[alignment] ||
		'center';

	const visibleUnits = [
		showDays
			? {
					key: 'days',
					value: remaining.days,
					label: daysLabel,
			  }
			: null,
		showHours
			? {
					key: 'hours',
					value: remaining.hours,
					label: hoursLabel,
			  }
			: null,
		showMinutes
			? {
					key: 'minutes',
					value: remaining.minutes,
					label: minutesLabel,
			  }
			: null,
		showSeconds
			? {
					key: 'seconds',
					value: remaining.seconds,
					label: secondsLabel,
			  }
			: null,
	].filter(Boolean);

	const isExpired =
		remaining.valid && remaining.expired;

	const showExpiredMessage =
		(isExpired || previewExpired) &&
		'zeros' !== expiredBehaviour;

	const resolvedExpiredMessage =
		expiredMessage && expiredMessage.trim()
			? expiredMessage
			: __(
					'This offer has ended.',
					'uplifters-site-builder-blocks'
			  );

	const hasMessage =
		false !== showMessage &&
		!! ( message && message.trim() );

	const classNames = [
		'uplifters-site-builder-blocks-countdown-with-msg-editor',
		`uplifters-site-builder-blocks-countdown-with-msg-device-${device}`,
		`uplifters-site-builder-blocks-countdown-with-msg-layout-${layout}`,
		isExpired ? 'is-expired' : '',
	]
		.filter(Boolean)
		.join(' ');

	const blockProps = useBlockProps({
		className: classNames,

		style: {
			'--uplifters-site-builder-blocks-countdown-with-msg-gap':
				`${gap}px`,

			'--uplifters-site-builder-blocks-countdown-with-msg-alignment':
				cssAlignment,

			'--uplifters-site-builder-blocks-countdown-with-msg-number-size':
				`${numberFontSize}px`,

			'--uplifters-site-builder-blocks-countdown-with-msg-number-color':
				numberColor || '#0f172a',

			'--uplifters-site-builder-blocks-countdown-with-msg-label-size':
				`${labelFontSize}px`,

			'--uplifters-site-builder-blocks-countdown-with-msg-label-color':
				labelColor || '#64748b',

			'--uplifters-site-builder-blocks-countdown-with-msg-box-background':
				boxBackgroundColor ||
				'transparent',

			'--uplifters-site-builder-blocks-countdown-with-msg-box-padding':
				`${boxPadding}px`,

			'--uplifters-site-builder-blocks-countdown-with-msg-box-radius':
				`${boxBorderRadius}px`,

			'--uplifters-site-builder-blocks-countdown-with-msg-box-min-width':
				`${boxMinWidth}px`,

			'--uplifters-site-builder-blocks-countdown-with-msg-message-size':
				`${messageFontSize}px`,

			'--uplifters-site-builder-blocks-countdown-with-msg-message-color':
				messageColor || '#475569',

			'--uplifters-site-builder-blocks-countdown-with-msg-message-align':
				messageAlignment,

			'--uplifters-site-builder-blocks-countdown-with-msg-message-gap':
				`${messageSpacing}px`,

			'--uplifters-site-builder-blocks-countdown-with-msg-expired-size':
				`${expiredMessageFontSize}px`,

			'--uplifters-site-builder-blocks-countdown-with-msg-expired-color':
				expiredMessageColor || '#0f172a',

			'--uplifters-site-builder-blocks-countdown-with-msg-expired-align':
				expiredMessageAlignment,

			'--uplifters-site-builder-blocks-countdown-with-msg-background-color':
				backgroundColor || 'transparent',

			'--uplifters-site-builder-blocks-countdown-with-msg-spacing':
				`${spacing}px`,
		},
	});

	return (
		<>

			<InspectorControls group="settings">
				<PanelBody
					title={__(
						'Countdown',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={true}
				>
					<BaseControl
						id="uplifters-site-builder-blocks-countdown-with-msg-target"
						label={__(
							'Target Date and Time',
							'uplifters-site-builder-blocks'
						)}
						help={__(
							'The countdown runs until this moment.',
							'uplifters-site-builder-blocks'
						)}
					>
						<div className="uplifters-site-builder-blocks-countdown-with-msg-datefield">
							<Dropdown
								className="uplifters-site-builder-blocks-countdown-with-msg-datefield__dropdown"
								contentClassName="uplifters-site-builder-blocks-countdown-with-msg-datepicker"
								popoverProps={{
									placement:
										'bottom-start',
								}}
								renderToggle={({
									isOpen,
									onToggle,
								}) => (
									<Button
										variant="secondary"
										onClick={
											onToggle
										}
										aria-expanded={
											isOpen
										}
										className="uplifters-site-builder-blocks-countdown-with-msg-datefield__toggle"
									>
										{targetLabel ||
											__(
												'Select a date and time',
												'uplifters-site-builder-blocks'
											)}
									</Button>
								)}
								renderContent={() => (
									<DatePicker
										currentDate={
											targetDate ||
											null
										}
										onChange={(
											value
										) => {
											setAttributes(
												{
													targetDate:
														mergeDatePart(
															targetDate,
															value
														),
												}
											);
										}}
									/>
								)}
							/>

							<TimeOfDayControl
								value={targetDate}
								onChange={(value) => {
									setAttributes({
										targetDate:
											toNaiveDateString(
												value
											),
									});
								}}
							/>

							{!!targetDate && (
								<Button
									variant="tertiary"
									isDestructive
									onClick={() => {
										setAttributes(
											{
												targetDate:
													'',
											}
										);
									}}
								>
									{__(
										'Clear',
										'uplifters-site-builder-blocks'
									)}
								</Button>
							)}
						</div>
					</BaseControl>

					<SelectControl
						label={__(
							'When the countdown ends',
							'uplifters-site-builder-blocks'
						)}
						value={expiredBehaviour}
						options={EXPIRED_OPTIONS}
						onChange={(value) => {
							setAttributes({
								expiredBehaviour:
									value,
							});
						}}
					/>

					{'message' === expiredBehaviour && (
						<TextareaControl
							label={__(
								'Expired Message',
								'uplifters-site-builder-blocks'
							)}
							value={
								expiredMessage
							}
							onChange={(value) => {
								setAttributes({
									expiredMessage:
										value,
								});
							}}
						/>
					)}

					{'zeros' !== expiredBehaviour && (
						<ToggleControl
							label={__(
								'Preview expired state',
								'uplifters-site-builder-blocks'
							)}
							checked={
								previewExpired
							}
							onChange={(value) => {
								setPreviewExpired(
									Boolean(
										value
									)
								);
							}}
							help={__(
								'Editor only. Shows the expired message on the canvas so it can be styled before the date passes.',
								'uplifters-site-builder-blocks'
							)}
						/>
					)}
				</PanelBody>

				<PanelBody
					title={__(
						'Message',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
				>
					<ToggleControl
						label={__(
							'Show Message',
							'uplifters-site-builder-blocks'
						)}
						checked={
							false !== showMessage
						}
						onChange={(value) => {
							setAttributes({
								showMessage:
									Boolean(
										value
									),
							});
						}}
						help={__(
							'Displays a message directly underneath the countdown.',
							'uplifters-site-builder-blocks'
						)}
					/>

					{false !== showMessage && (
						<TextareaControl
							label={__(
								'Message',
								'uplifters-site-builder-blocks'
							)}
							value={message || ''}
							onChange={(value) => {
								setAttributes({
									message:
										value,
								});
							}}
							help={__(
								'Leave empty to hide the message. Style it from the Message panel in the Styles tab.',
								'uplifters-site-builder-blocks'
							)}
						/>
					)}
				</PanelBody>

				<PanelBody
					title={__(
						'Units',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
				>
					<ToggleControl
						label={__(
							'Show Days',
							'uplifters-site-builder-blocks'
						)}
						checked={showDays}
						onChange={(value) => {
							setAttributes({
								showDays:
									Boolean(
										value
									),
							});
						}}
					/>

					{showDays && (
						<TextControl
							label={__(
								'Days Label',
								'uplifters-site-builder-blocks'
							)}
							value={daysLabel}
							onChange={(value) => {
								setAttributes({
									daysLabel:
										value,
								});
							}}
						/>
					)}

					<ToggleControl
						label={__(
							'Show Hours',
							'uplifters-site-builder-blocks'
						)}
						checked={showHours}
						onChange={(value) => {
							setAttributes({
								showHours:
									Boolean(
										value
									),
							});
						}}
					/>

					{showHours && (
						<TextControl
							label={__(
								'Hours Label',
								'uplifters-site-builder-blocks'
							)}
							value={hoursLabel}
							onChange={(value) => {
								setAttributes({
									hoursLabel:
										value,
								});
							}}
						/>
					)}

					<ToggleControl
						label={__(
							'Show Minutes',
							'uplifters-site-builder-blocks'
						)}
						checked={showMinutes}
						onChange={(value) => {
							setAttributes({
								showMinutes:
									Boolean(
										value
									),
							});
						}}
					/>

					{showMinutes && (
						<TextControl
							label={__(
								'Minutes Label',
								'uplifters-site-builder-blocks'
							)}
							value={
								minutesLabel
							}
							onChange={(value) => {
								setAttributes({
									minutesLabel:
										value,
								});
							}}
						/>
					)}

					<ToggleControl
						label={__(
							'Show Seconds',
							'uplifters-site-builder-blocks'
						)}
						checked={showSeconds}
						onChange={(value) => {
							setAttributes({
								showSeconds:
									Boolean(
										value
									),
							});
						}}
					/>

					{showSeconds && (
						<TextControl
							label={__(
								'Seconds Label',
								'uplifters-site-builder-blocks'
							)}
							value={
								secondsLabel
							}
							onChange={(value) => {
								setAttributes({
									secondsLabel:
										value,
								});
							}}
						/>
					)}
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={__(
						'Layout',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={openStylesPanel === 'layout'}
					onToggle={() =>
						toggleStylesPanel('layout')
					}
				>
					<DeviceBadge
						device={device}
					/>

					<p className="uplifters-site-builder-blocks-countdown-with-msg-responsive-help">
						{__(
							'These controls update only the active device selected in the global responsive toolbar.',
							'uplifters-site-builder-blocks'
						)}
					</p>

					<SelectControl
						label={__(
							'Layout',
							'uplifters-site-builder-blocks'
						)}
						value={layout}
						options={LAYOUT_OPTIONS}
						onChange={(value) => {
							updateResponsiveAttribute(
								'layout',
								value
							);
						}}
					/>

					<SelectControl
						label={__(
							'Alignment',
							'uplifters-site-builder-blocks'
						)}
						value={alignment}
						options={ALIGNMENT_OPTIONS}
						onChange={(value) => {
							updateResponsiveAttribute(
								'alignment',
								value
							);
						}}
					/>

					<RangeControl
						label={__(
							'Unit Min Width (px)',
							'uplifters-site-builder-blocks'
						)}
						value={boxMinWidth}
						min={40}
						max={260}
						step={2}
						withInputField
						onChange={(value) => {
							updateResponsiveAttribute(
								'boxMinWidth',
								Number(value) ||
									40
							);
						}}
					/>
				</PanelBody>

				<PanelBody
					title={__(
						'Typography',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={openStylesPanel === 'typography'}
					onToggle={() =>
						toggleStylesPanel('typography')
					}
				>
					<DeviceBadge
						device={device}
					/>

					<RangeControl
						label={__(
							'Number Size (px)',
							'uplifters-site-builder-blocks'
						)}
						value={numberFontSize}
						min={12}
						max={140}
						step={1}
						withInputField
						onChange={(value) => {
							updateResponsiveAttribute(
								'numberFontSize',
								Number(value) ||
									12
							);
						}}
					/>

					<RangeControl
						label={__(
							'Label Size (px)',
							'uplifters-site-builder-blocks'
						)}
						value={labelFontSize}
						min={8}
						max={48}
						step={1}
						withInputField
						onChange={(value) => {
							updateResponsiveAttribute(
								'labelFontSize',
								Number(value) ||
									8
							);
						}}
					/>
				</PanelBody>

				<PanelBody
					title={__(
						'Colors',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={openStylesPanel === 'colors'}
					onToggle={() =>
						toggleStylesPanel('colors')
					}
				>
					<DeviceBadge
						device={device}
					/>

					<p className="uplifters-site-builder-blocks-countdown-with-msg-responsive-help">
						{__(
							'Colors are saved separately for the active responsive device.',
							'uplifters-site-builder-blocks'
						)}
					</p>

					<div className="components-base-control">
						<div className="components-base-control__label">
							{__(
								'Number Color',
								'uplifters-site-builder-blocks'
							)}
						</div>

						<ColorPalette
							colors={COLOR_PALETTE}
							value={numberColor}
							onChange={(value) => {
								updateResponsiveAttribute(
									'numberColor',
									value ||
										'#0f172a'
								);
							}}
							clearable={false}
						 enableAlpha/>
					</div>

					<div
						className="components-base-control"
						style={{
							marginTop:
								'16px',
						}}
					>
						<div className="components-base-control__label">
							{__(
								'Label Color',
								'uplifters-site-builder-blocks'
							)}
						</div>

						<ColorPalette
							colors={COLOR_PALETTE}
							value={labelColor}
							onChange={(value) => {
								updateResponsiveAttribute(
									'labelColor',
									value ||
										'#64748b'
								);
							}}
							clearable={false}
						 enableAlpha/>
					</div>

					<div
						className="components-base-control"
						style={{
							marginTop:
								'16px',
						}}
					>
						<div className="components-base-control__label">
							{__(
								'Unit Background',
								'uplifters-site-builder-blocks'
							)}
						</div>

						<ColorPalette
							colors={COLOR_PALETTE}
							value={
								boxBackgroundColor ===
								'transparent'
									? undefined
									: boxBackgroundColor
							}
							onChange={(value) => {
								updateResponsiveAttribute(
									'boxBackgroundColor',
									value ||
										'transparent'
								);
							}}
							clearable
						 enableAlpha/>
					</div>

					<div
						className="components-base-control"
						style={{
							marginTop:
								'16px',
						}}
					>
						<div className="components-base-control__label">
							{__(
								'Background Color',
								'uplifters-site-builder-blocks'
							)}
						</div>

						<ColorPalette
							colors={COLOR_PALETTE}
							value={
								backgroundColor ===
								'transparent'
									? undefined
									: backgroundColor
							}
							onChange={(value) => {
								updateResponsiveAttribute(
									'backgroundColor',
									value ||
										'transparent'
								);
							}}
							clearable
						 enableAlpha/>
					</div>
				</PanelBody>

				<PanelBody
					title={__(
						'Border',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={openStylesPanel === 'border'}
					onToggle={() =>
						toggleStylesPanel('border')
					}
				>
					<DeviceBadge
						device={device}
					/>

					<RangeControl
						label={__(
							'Unit Corner Radius (px)',
							'uplifters-site-builder-blocks'
						)}
						value={boxBorderRadius}
						min={0}
						max={80}
						step={1}
						allowReset
						resetFallbackValue={0}
						withInputField
						onChange={(value) => {
							updateResponsiveAttribute(
								'boxBorderRadius',
								Number(value) ||
									0
							);
						}}
					/>
				</PanelBody>

				<PanelBody
					title={__(
						'Message',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={openStylesPanel === 'message'}
					onToggle={() =>
						toggleStylesPanel('message')
					}
				>
					<DeviceBadge
						device={device}
					/>

					<p className="uplifters-site-builder-blocks-countdown-with-msg-responsive-help">
						{__(
							'Styles the message shown underneath the countdown. Add the text in the Settings tab.',
							'uplifters-site-builder-blocks'
						)}
					</p>

					<RangeControl
						label={__(
							'Message Size (px)',
							'uplifters-site-builder-blocks'
						)}
						value={messageFontSize}
						min={10}
						max={90}
						step={1}
						withInputField
						onChange={(value) => {
							updateResponsiveAttribute(
								'messageFontSize',
								Number(value) ||
									10
							);
						}}
					/>

					<SelectControl
						label={__(
							'Message Alignment',
							'uplifters-site-builder-blocks'
						)}
						value={messageAlignment}
						options={ALIGNMENT_OPTIONS}
						onChange={(value) => {
							updateResponsiveAttribute(
								'messageAlignment',
								value
							);
						}}
					/>

					<RangeControl
						label={__(
							'Space Above Message (px)',
							'uplifters-site-builder-blocks'
						)}
						value={messageSpacing}
						min={0}
						max={120}
						step={2}
						allowReset
						resetFallbackValue={0}
						withInputField
						onChange={(value) => {
							updateResponsiveAttribute(
								'messageSpacing',
								Number(value) ||
									0
							);
						}}
					/>

					<div className="components-base-control">
						<div className="components-base-control__label">
							{__(
								'Message Color',
								'uplifters-site-builder-blocks'
							)}
						</div>

						<ColorPalette
							colors={COLOR_PALETTE}
							value={messageColor}
							onChange={(value) => {
								updateResponsiveAttribute(
									'messageColor',
									value ||
										'#475569'
								);
							}}
							clearable={false}
						 enableAlpha/>
					</div>
				</PanelBody>

				<PanelBody
					title={__(
						'Expired Message',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={openStylesPanel === 'expired'}
					onToggle={() =>
						toggleStylesPanel('expired')
					}
				>
					<DeviceBadge
						device={device}
					/>

					<p className="uplifters-site-builder-blocks-countdown-with-msg-responsive-help">
						{__(
							'Turn on Preview expired state in the Settings tab to see these changes on the canvas.',
							'uplifters-site-builder-blocks'
						)}
					</p>

					<RangeControl
						label={__(
							'Message Size (px)',
							'uplifters-site-builder-blocks'
						)}
						value={
							expiredMessageFontSize
						}
						min={10}
						max={90}
						step={1}
						withInputField
						onChange={(value) => {
							updateResponsiveAttribute(
								'expiredMessageFontSize',
								Number(value) ||
									10
							);
						}}
					/>

					<SelectControl
						label={__(
							'Message Alignment',
							'uplifters-site-builder-blocks'
						)}
						value={
							expiredMessageAlignment
						}
						options={ALIGNMENT_OPTIONS}
						onChange={(value) => {
							updateResponsiveAttribute(
								'expiredMessageAlignment',
								value
							);
						}}
					/>

					<div className="components-base-control">
						<div className="components-base-control__label">
							{__(
								'Message Color',
								'uplifters-site-builder-blocks'
							)}
						</div>

						<ColorPalette
							colors={COLOR_PALETTE}
							value={
								expiredMessageColor
							}
							onChange={(value) => {
								updateResponsiveAttribute(
									'expiredMessageColor',
									value ||
										'#0f172a'
								);
							}}
							clearable={false}
						 enableAlpha/>
					</div>
				</PanelBody>

				<PanelBody
					title={__(
						'Spacing',
						'uplifters-site-builder-blocks'
					)}
					initialOpen={false}
					opened={openStylesPanel === 'spacing'}
					onToggle={() =>
						toggleStylesPanel('spacing')
					}
				>
					<DeviceBadge
						device={device}
					/>

					<RangeControl
						label={__(
							'Unit Gap (px)',
							'uplifters-site-builder-blocks'
						)}
						value={gap}
						min={0}
						max={80}
						step={2}
						allowReset
						resetFallbackValue={0}
						withInputField
						onChange={(value) => {
							updateResponsiveAttribute(
								'gap',
								Number(value) ||
									0
							);
						}}
					/>

					<RangeControl
						label={__(
							'Unit Padding (px)',
							'uplifters-site-builder-blocks'
						)}
						value={boxPadding}
						min={0}
						max={80}
						step={2}
						allowReset
						resetFallbackValue={0}
						withInputField
						onChange={(value) => {
							updateResponsiveAttribute(
								'boxPadding',
								Number(value) ||
									0
							);
						}}
					/>

					<RangeControl
						label={__(
							'Vertical Spacing (px)',
							'uplifters-site-builder-blocks'
						)}
						value={spacing}
						min={0}
						max={200}
						step={4}
						allowReset
						resetFallbackValue={0}
						withInputField
						onChange={(value) => {
							updateResponsiveAttribute(
								'spacing',
								Number(value) ||
									0
							);
						}}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="uplifters-site-builder-blocks-countdown-with-msg-editor__preview">

					{!remaining.valid && (
						<p className="uplifters-site-builder-blocks-countdown-with-msg-editor__notice">
							{__(
								'Preview only. Set a target date and time in the Settings tab, otherwise nothing is rendered on the front end.',
								'uplifters-site-builder-blocks'
							)}
						</p>
					)}

					{showExpiredMessage && (
						<p className="uplifters-site-builder-blocks-countdown-with-msg-editor__expired">
							{'hide' === expiredBehaviour
								? __(
										'The countdown has ended. This block is hidden on the front end.',
										'uplifters-site-builder-blocks'
								  )
								: resolvedExpiredMessage}
						</p>
					)}

					{!showExpiredMessage &&
						visibleUnits.length === 0 && (
							<p className="uplifters-site-builder-blocks-countdown-with-msg-editor__notice">
								{__(
									'Enable at least one unit in the Settings tab.',
									'uplifters-site-builder-blocks'
								)}
							</p>
						)}

					{!showExpiredMessage &&
						visibleUnits.length > 0 && (
							<div className="uplifters-site-builder-blocks-countdown-with-msg-editor__units">
								{visibleUnits.map(
									(unit) => (
										<CountdownUnit
											key={
												unit.key
											}
											value={
												unit.value
											}
											label={
												unit.label
											}
										/>
									)
								)}
							</div>
						)}

					{hasMessage && (
						<p className="uplifters-site-builder-blocks-countdown-with-msg-editor__message">
							{message}
						</p>
					)}
				</div>
			</div>
		</>
	);
}

export default function Edit(props) {
	return props.attributes.preview ? <InserterPreview type="countdown-with-msg" /> : <Editor {...props} />;
}