<?php
/**
 * Server-side rendering for the UpliftersSiteBuilderBlocks N Countdown block.
 *
 * @package UpliftersSiteBuilderBlocks
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block default content.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Read an individual responsive device branch.
 *
 * Scalar values are supported for compatibility with blocks saved
 * before responsive attribute objects were introduced.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value' ) ) {
	function uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
		array $attributes,
		string $key,
		string $device,
		$fallback = ''
	) {
		if ( ! array_key_exists( $key, $attributes ) ) {
			return $fallback;
		}

		$value = $attributes[ $key ];

		if ( ! is_array( $value ) ) {
			return is_scalar( $value )
				? $value
				: $fallback;
		}

		if (
			array_key_exists( $device, $value ) &&
			null !== $value[ $device ]
		) {
			return $value[ $device ];
		}

		foreach (
			array( 'desktop', 'tablet', 'mobile' )
			as $fallback_device
		) {
			if (
				array_key_exists(
					$fallback_device,
					$value
				) &&
				null !== $value[ $fallback_device ]
			) {
				return $value[ $fallback_device ];
			}
		}

		return $fallback;
	}
}

/**
 * Restrict a numeric value to its allowed range.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_countdown_with_msg_number' ) ) {
	function uplifters_site_builder_blocks_n_countdown_with_msg_number(
		$value,
		float $minimum,
		float $maximum,
		float $fallback
	): float {
		if ( ! is_numeric( $value ) ) {
			return $fallback;
		}

		$value = (float) $value;

		return max(
			$minimum,
			min( $maximum, $value )
		);
	}
}

/**
 * Sanitize the layout mode.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_countdown_with_msg_layout' ) ) {
	function uplifters_site_builder_blocks_n_countdown_with_msg_layout(
		string $value
	): string {
		$allowed_values = array(
			'row',
			'grid',
			'stack',
		);

		return in_array(
			$value,
			$allowed_values,
			true
		)
			? $value
			: 'row';
	}
}

/**
 * Restrict alignment values.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_countdown_with_msg_alignment' ) ) {
	function uplifters_site_builder_blocks_n_countdown_with_msg_alignment(
		string $value
	): string {
		$allowed_values = array(
			'left',
			'center',
			'right',
		);

		return in_array(
			$value,
			$allowed_values,
			true
		)
			? $value
			: 'center';
	}
}

/**
 * Restrict the expiry behaviour.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_countdown_with_msg_behaviour' ) ) {
	function uplifters_site_builder_blocks_n_countdown_with_msg_behaviour(
		string $value
	): string {
		$allowed_values = array(
			'message',
			'zeros',
			'hide',
		);

		return in_array(
			$value,
			$allowed_values,
			true
		)
			? $value
			: 'message';
	}
}

/**
 * Sanitize supported color values.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_countdown_with_msg_color' ) ) {
	function uplifters_site_builder_blocks_n_countdown_with_msg_color(
		string $value,
		string $fallback
	): string {
		$value = trim( $value );

		if ( 'transparent' === $value ) {
			return 'transparent';
		}

		if (
			preg_match(
				'/^#[a-fA-F0-9]{3,8}$/',
				$value
			)
		) {
			return $value;
		}

		if (
			preg_match(
				'/^rgba?\([0-9.,\s%]+\)$/',
				$value
			)
		) {
			return $value;
		}

		if (
			preg_match(
				'/^hsla?\([0-9.,\s%deg]+\)$/i',
				$value
			)
		) {
			return $value;
		}

		if (
			preg_match(
				'/^var\(--[a-zA-Z0-9_-]+\)$/',
				$value
			)
		) {
			return $value;
		}

		return $fallback;
	}
}

/**
 * Map the alignment keyword to a flexbox value.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_countdown_with_msg_css_alignment' ) ) {
	function uplifters_site_builder_blocks_n_countdown_with_msg_css_alignment(
		string $alignment
	): string {
		$alignment_map = array(
			'left'   => 'flex-start',
			'center' => 'center',
			'right'  => 'flex-end',
		);

		return isset( $alignment_map[ $alignment ] )
			? $alignment_map[ $alignment ]
			: 'center';
	}
}

/**
 * Collect every responsive value for one device.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_countdown_with_msg_device_settings' ) ) {
	function uplifters_site_builder_blocks_n_countdown_with_msg_device_settings(
		array $attributes,
		string $device,
		array $fallbacks
	): array {
		$layout = uplifters_site_builder_blocks_n_countdown_with_msg_layout(
			sanitize_key(
				(string) uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
					$attributes,
					'layout',
					$device,
					$fallbacks['layout']
				)
			)
		);

		$alignment = uplifters_site_builder_blocks_n_countdown_with_msg_alignment(
			sanitize_key(
				(string) uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
					$attributes,
					'alignment',
					$device,
					$fallbacks['alignment']
				)
			)
		);

		return array(
			'layout'        => $layout,

			'alignment'     => $alignment,

			'css_alignment' => uplifters_site_builder_blocks_n_countdown_with_msg_css_alignment(
				$alignment
			),

			'gap'           => uplifters_site_builder_blocks_n_countdown_with_msg_number(
				uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
					$attributes,
					'gap',
					$device,
					$fallbacks['gap']
				),
				0,
				80,
				$fallbacks['gap']
			),

			'number_size'   => uplifters_site_builder_blocks_n_countdown_with_msg_number(
				uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
					$attributes,
					'numberFontSize',
					$device,
					$fallbacks['number_size']
				),
				12,
				140,
				$fallbacks['number_size']
			),

			'number_color'  => uplifters_site_builder_blocks_n_countdown_with_msg_color(
				(string) uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
					$attributes,
					'numberColor',
					$device,
					$fallbacks['number_color']
				),
				$fallbacks['number_color']
			),

			'label_size'    => uplifters_site_builder_blocks_n_countdown_with_msg_number(
				uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
					$attributes,
					'labelFontSize',
					$device,
					$fallbacks['label_size']
				),
				8,
				48,
				$fallbacks['label_size']
			),

			'label_color'   => uplifters_site_builder_blocks_n_countdown_with_msg_color(
				(string) uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
					$attributes,
					'labelColor',
					$device,
					$fallbacks['label_color']
				),
				$fallbacks['label_color']
			),

			'box_background' => uplifters_site_builder_blocks_n_countdown_with_msg_color(
				(string) uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
					$attributes,
					'boxBackgroundColor',
					$device,
					$fallbacks['box_background']
				),
				$fallbacks['box_background']
			),

			'box_padding'   => uplifters_site_builder_blocks_n_countdown_with_msg_number(
				uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
					$attributes,
					'boxPadding',
					$device,
					$fallbacks['box_padding']
				),
				0,
				80,
				$fallbacks['box_padding']
			),

			'box_radius'    => uplifters_site_builder_blocks_n_countdown_with_msg_number(
				uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
					$attributes,
					'boxBorderRadius',
					$device,
					$fallbacks['box_radius']
				),
				0,
				80,
				$fallbacks['box_radius']
			),

			'box_min_width' => uplifters_site_builder_blocks_n_countdown_with_msg_number(
				uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
					$attributes,
					'boxMinWidth',
					$device,
					$fallbacks['box_min_width']
				),
				40,
				260,
				$fallbacks['box_min_width']
			),

			'background'    => uplifters_site_builder_blocks_n_countdown_with_msg_color(
				(string) uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
					$attributes,
					'backgroundColor',
					$device,
					$fallbacks['background']
				),
				$fallbacks['background']
			),

			'message_size'  => uplifters_site_builder_blocks_n_countdown_with_msg_number(
				uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
					$attributes,
					'messageFontSize',
					$device,
					$fallbacks['message_size']
				),
				10,
				90,
				$fallbacks['message_size']
			),

			'message_color' => uplifters_site_builder_blocks_n_countdown_with_msg_color(
				(string) uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
					$attributes,
					'messageColor',
					$device,
					$fallbacks['message_color']
				),
				$fallbacks['message_color']
			),

			'message_align' => uplifters_site_builder_blocks_n_countdown_with_msg_alignment(
				sanitize_key(
					(string) uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
						$attributes,
						'messageAlignment',
						$device,
						$fallbacks['message_align']
					)
				)
			),

			'message_gap'   => uplifters_site_builder_blocks_n_countdown_with_msg_number(
				uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
					$attributes,
					'messageSpacing',
					$device,
					$fallbacks['message_gap']
				),
				0,
				120,
				$fallbacks['message_gap']
			),

			'expired_size'  => uplifters_site_builder_blocks_n_countdown_with_msg_number(
				uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
					$attributes,
					'expiredMessageFontSize',
					$device,
					$fallbacks['expired_size']
				),
				10,
				90,
				$fallbacks['expired_size']
			),

			'expired_color' => uplifters_site_builder_blocks_n_countdown_with_msg_color(
				(string) uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
					$attributes,
					'expiredMessageColor',
					$device,
					$fallbacks['expired_color']
				),
				$fallbacks['expired_color']
			),

			'expired_align' => uplifters_site_builder_blocks_n_countdown_with_msg_alignment(
				sanitize_key(
					(string) uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
						$attributes,
						'expiredMessageAlignment',
						$device,
						$fallbacks['expired_align']
					)
				)
			),

			'spacing'       => uplifters_site_builder_blocks_n_countdown_with_msg_number(
				uplifters_site_builder_blocks_n_countdown_with_msg_responsive_value(
					$attributes,
					'spacing',
					$device,
					$fallbacks['spacing']
				),
				0,
				200,
				$fallbacks['spacing']
			),
		);
	}
}

/**
 * Build the CSS declarations for one device.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_countdown_with_msg_device_css' ) ) {
	function uplifters_site_builder_blocks_n_countdown_with_msg_device_css(
		string $unique_id,
		array $settings
	): string {
		$css  = '';

		$css .= '#' . $unique_id . '{';
		$css .= 'background:' . $settings['background'] . ';';
		$css .= 'padding-top:' . $settings['spacing'] . 'px;';
		$css .= 'padding-bottom:' . $settings['spacing'] . 'px;';
		$css .= '}';

		$css .= '#' . $unique_id . ' .uplifters-site-builder-blocks-countdown-with-msg__units{';
		$css .= 'gap:' . $settings['gap'] . 'px;';

		if ( 'grid' === $settings['layout'] ) {
			$css .= 'display:grid;';
			$css .= 'grid-template-columns:repeat(2,minmax(0,1fr));';
			$css .= 'justify-items:' . $settings['css_alignment'] . ';';
		} elseif ( 'stack' === $settings['layout'] ) {
			$css .= 'display:flex;';
			$css .= 'flex-direction:column;';
			$css .= 'align-items:' . $settings['css_alignment'] . ';';
		} else {
			$css .= 'display:flex;';
			$css .= 'flex-direction:row;';
			$css .= 'flex-wrap:wrap;';
			$css .= 'justify-content:' . $settings['css_alignment'] . ';';
		}

		$css .= '}';

		$css .= '#' . $unique_id . ' .uplifters-site-builder-blocks-countdown-with-msg__unit{';
		$css .= 'min-width:' . $settings['box_min_width'] . 'px;';
		$css .= 'padding:' . $settings['box_padding'] . 'px;';
		$css .= 'border-radius:' . $settings['box_radius'] . 'px;';
		$css .= 'background:' . $settings['box_background'] . ';';
		$css .= '}';

		$css .= '#' . $unique_id . ' .uplifters-site-builder-blocks-countdown-with-msg__number{';
		$css .= 'font-size:' . $settings['number_size'] . 'px;';
		$css .= 'color:' . $settings['number_color'] . ';';
		$css .= '}';

		$css .= '#' . $unique_id . ' .uplifters-site-builder-blocks-countdown-with-msg__label{';
		$css .= 'font-size:' . $settings['label_size'] . 'px;';
		$css .= 'color:' . $settings['label_color'] . ';';
		$css .= '}';

		$css .= '#' . $unique_id . ' .uplifters-site-builder-blocks-countdown-with-msg__message{';
		$css .= 'font-size:' . $settings['message_size'] . 'px;';
		$css .= 'color:' . $settings['message_color'] . ';';
		$css .= 'text-align:' . $settings['message_align'] . ';';
		$css .= 'margin-top:' . $settings['message_gap'] . 'px;';
		$css .= '}';

		$css .= '#' . $unique_id . ' .uplifters-site-builder-blocks-countdown-with-msg__expired{';
		$css .= 'font-size:' . $settings['expired_size'] . 'px;';
		$css .= 'color:' . $settings['expired_color'] . ';';
		$css .= 'text-align:' . $settings['expired_align'] . ';';
		$css .= '}';

		return $css;
	}
}

$uplifters_site_builder_blocks_desktop_settings = uplifters_site_builder_blocks_n_countdown_with_msg_device_settings(
	$attributes,
	'desktop',
	array(
		'layout'         => 'row',
		'alignment'      => 'center',
		'gap'            => 16,
		'number_size'    => 48,
		'number_color'   => '#0f172a',
		'label_size'     => 13,
		'label_color'    => '#64748b',
		'box_background' => '#f1f5f9',
		'box_padding'    => 20,
		'box_radius'     => 12,
		'box_min_width'  => 110,
		'message_size'   => 16,
		'message_color'  => '#475569',
		'message_align'  => 'center',
		'message_gap'    => 16,
		'expired_size'   => 20,
		'expired_color'  => '#0f172a',
		'expired_align'  => 'center',
		'background'     => 'transparent',
		'spacing'        => 32,
	)
);

$uplifters_site_builder_blocks_tablet_settings = uplifters_site_builder_blocks_n_countdown_with_msg_device_settings(
	$attributes,
	'tablet',
	array(
		'layout'         => $uplifters_site_builder_blocks_desktop_settings['layout'],
		'alignment'      => $uplifters_site_builder_blocks_desktop_settings['alignment'],
		'gap'            => 12,
		'number_size'    => 40,
		'number_color'   => $uplifters_site_builder_blocks_desktop_settings['number_color'],
		'label_size'     => 12,
		'label_color'    => $uplifters_site_builder_blocks_desktop_settings['label_color'],
		'box_background' => $uplifters_site_builder_blocks_desktop_settings['box_background'],
		'box_padding'    => 16,
		'box_radius'     => $uplifters_site_builder_blocks_desktop_settings['box_radius'],
		'box_min_width'  => 96,
		'message_size'   => 15,
		'message_color'  => $uplifters_site_builder_blocks_desktop_settings['message_color'],
		'message_align'  => $uplifters_site_builder_blocks_desktop_settings['message_align'],
		'message_gap'    => 14,
		'expired_size'   => 18,
		'expired_color'  => $uplifters_site_builder_blocks_desktop_settings['expired_color'],
		'expired_align'  => $uplifters_site_builder_blocks_desktop_settings['expired_align'],
		'background'     => $uplifters_site_builder_blocks_desktop_settings['background'],
		'spacing'        => 24,
	)
);

$uplifters_site_builder_blocks_mobile_settings = uplifters_site_builder_blocks_n_countdown_with_msg_device_settings(
	$attributes,
	'mobile',
	array(
		'layout'         => $uplifters_site_builder_blocks_tablet_settings['layout'],
		'alignment'      => $uplifters_site_builder_blocks_tablet_settings['alignment'],
		'gap'            => 8,
		'number_size'    => 32,
		'number_color'   => $uplifters_site_builder_blocks_tablet_settings['number_color'],
		'label_size'     => 11,
		'label_color'    => $uplifters_site_builder_blocks_tablet_settings['label_color'],
		'box_background' => $uplifters_site_builder_blocks_tablet_settings['box_background'],
		'box_padding'    => 12,
		'box_radius'     => 10,
		'box_min_width'  => 74,
		'message_size'   => 14,
		'message_color'  => $uplifters_site_builder_blocks_tablet_settings['message_color'],
		'message_align'  => $uplifters_site_builder_blocks_tablet_settings['message_align'],
		'message_gap'    => 12,
		'expired_size'   => 16,
		'expired_color'  => $uplifters_site_builder_blocks_tablet_settings['expired_color'],
		'expired_align'  => $uplifters_site_builder_blocks_tablet_settings['expired_align'],
		'background'     => $uplifters_site_builder_blocks_tablet_settings['background'],
		'spacing'        => 20,
	)
);

/**
 * Countdown content settings.
 */
$uplifters_site_builder_blocks_target_date = isset( $attributes['targetDate'] )
	? trim( (string) $attributes['targetDate'] )
	: '';

$uplifters_site_builder_blocks_expired_behaviour = uplifters_site_builder_blocks_n_countdown_with_msg_behaviour(
	sanitize_key(
		isset( $attributes['expiredBehaviour'] )
			? (string) $attributes['expiredBehaviour']
			: 'message'
	)
);

$uplifters_site_builder_blocks_expired_message = isset( $attributes['expiredMessage'] )
	? trim( (string) $attributes['expiredMessage'] )
	: '';

/**
 * An emptied message field must not silence the expiry
 * notice, otherwise the countdown simply vanishes.
 */
if ( '' === $uplifters_site_builder_blocks_expired_message ) {
	$uplifters_site_builder_blocks_expired_message = __(
		'This offer has ended.',
		'uplifters-site-builder-blocks'
	);
}

/**
 * Message shown underneath the countdown while it is running.
 *
 * This is independent from the expiry notice, so an empty field
 * simply hides the paragraph instead of falling back to a default.
 */
$uplifters_site_builder_blocks_show_message = isset( $attributes['showMessage'] )
	? (bool) $attributes['showMessage']
	: true;

$uplifters_site_builder_blocks_message = isset( $attributes['message'] )
	? trim( (string) $attributes['message'] )
	: '';

$uplifters_site_builder_blocks_has_message = $uplifters_site_builder_blocks_show_message && '' !== $uplifters_site_builder_blocks_message;

$uplifters_site_builder_blocks_unit_definitions = array(
	array(
		'key'       => 'days',
		'toggle'    => 'showDays',
		'label_key' => 'daysLabel',
		'default'   => __( 'Days', 'uplifters-site-builder-blocks' ),
	),

	array(
		'key'       => 'hours',
		'toggle'    => 'showHours',
		'label_key' => 'hoursLabel',
		'default'   => __( 'Hours', 'uplifters-site-builder-blocks' ),
	),

	array(
		'key'       => 'minutes',
		'toggle'    => 'showMinutes',
		'label_key' => 'minutesLabel',
		'default'   => __( 'Minutes', 'uplifters-site-builder-blocks' ),
	),

	array(
		'key'       => 'seconds',
		'toggle'    => 'showSeconds',
		'label_key' => 'secondsLabel',
		'default'   => __( 'Seconds', 'uplifters-site-builder-blocks' ),
	),
);

$uplifters_site_builder_blocks_visible_units = array();

foreach ( $uplifters_site_builder_blocks_unit_definitions as $uplifters_site_builder_blocks_unit_definition ) {
	$uplifters_site_builder_blocks_is_visible = isset(
		$attributes[ $uplifters_site_builder_blocks_unit_definition['toggle'] ]
	)
		? (bool) $attributes[ $uplifters_site_builder_blocks_unit_definition['toggle'] ]
		: true;

	if ( ! $uplifters_site_builder_blocks_is_visible ) {
		continue;
	}

	$uplifters_site_builder_blocks_label = isset(
		$attributes[ $uplifters_site_builder_blocks_unit_definition['label_key'] ]
	)
		? (string) $attributes[ $uplifters_site_builder_blocks_unit_definition['label_key'] ]
		: $uplifters_site_builder_blocks_unit_definition['default'];

	$uplifters_site_builder_blocks_visible_units[] = array(
		'key'   => $uplifters_site_builder_blocks_unit_definition['key'],
		'label' => $uplifters_site_builder_blocks_label,
	);
}

/**
 * Server side remaining time, used for the first paint
 * before the front end script takes over.
 *
 * The stored value is a plain wall clock time and is always
 * read on the local clock of whoever looks at it. The server
 * has no way of knowing the visitor clock, so the site
 * timezone is used for this first paint only and the front
 * end script corrects it on the very first tick.
 */
$uplifters_site_builder_blocks_target_timestamp = false;

if ( '' !== $uplifters_site_builder_blocks_target_date ) {
	try {
		$uplifters_site_builder_blocks_target_datetime = new DateTimeImmutable(
			$uplifters_site_builder_blocks_target_date,
			wp_timezone()
		);

		$uplifters_site_builder_blocks_target_timestamp = $uplifters_site_builder_blocks_target_datetime->getTimestamp();
	} catch ( Exception $uplifters_site_builder_blocks_exception ) {
		$uplifters_site_builder_blocks_target_timestamp = false;
	}
}

/**
 * Without a usable target there is nothing to count towards,
 * so the block renders nothing rather than a row of zeroes.
 */
if ( false === $uplifters_site_builder_blocks_target_timestamp ) {
	return;
}

$uplifters_site_builder_blocks_remaining_seconds = max(
	0,
	$uplifters_site_builder_blocks_target_timestamp - time()
);

$uplifters_site_builder_blocks_is_expired = $uplifters_site_builder_blocks_remaining_seconds <= 0;

$uplifters_site_builder_blocks_initial_values = array(
	'days'    => (int) floor( $uplifters_site_builder_blocks_remaining_seconds / 86400 ),
	'hours'   => (int) floor( ( $uplifters_site_builder_blocks_remaining_seconds % 86400 ) / 3600 ),
	'minutes' => (int) floor( ( $uplifters_site_builder_blocks_remaining_seconds % 3600 ) / 60 ),
	'seconds' => (int) ( $uplifters_site_builder_blocks_remaining_seconds % 60 ),
);

if ( $uplifters_site_builder_blocks_is_expired && 'hide' === $uplifters_site_builder_blocks_expired_behaviour ) {
	return;
}

$uplifters_site_builder_blocks_show_expired_message = $uplifters_site_builder_blocks_is_expired &&
	'zeros' !== $uplifters_site_builder_blocks_expired_behaviour;

$uplifters_site_builder_blocks_unique_id = wp_unique_id(
	'uplifters-site-builder-blocks-countdown-with-msg-'
);

/**
 * CSS shared by every Countdown instance.
 */
$uplifters_site_builder_blocks_static_css  = '';
$uplifters_site_builder_blocks_static_css .= '.wp-block-uplifters-site-builder-blocks-countdown-with-msg,.wp-block-uplifters-site-builder-blocks-countdown-with-msg *,.uplifters-site-builder-blocks-countdown-with-msg,.uplifters-site-builder-blocks-countdown-with-msg *{box-sizing:border-box;}';
$uplifters_site_builder_blocks_static_css .= '.wp-block-uplifters-site-builder-blocks-countdown-with-msg,.uplifters-site-builder-blocks-countdown-with-msg{width:100%;max-width:100%;}';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-countdown-with-msg__units{display:flex;flex-wrap:wrap;}';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-countdown-with-msg__unit{display:flex;flex-direction:column;align-items:center;justify-content:center;}';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-countdown-with-msg__number{display:block;font-weight:700;line-height:1.1;font-variant-numeric:tabular-nums;}';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-countdown-with-msg__label{display:block;margin-top:6px;font-weight:500;line-height:1.3;letter-spacing:.04em;text-transform:uppercase;}';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-countdown-with-msg__message{margin:0;font-weight:500;line-height:1.6;}';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-countdown-with-msg__expired{margin:0;font-weight:600;line-height:1.5;}';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-countdown-with-msg [hidden]{display:none !important;}';

/**
 * Per-block responsive values.
 */
$uplifters_site_builder_blocks_dynamic_css = uplifters_site_builder_blocks_n_countdown_with_msg_device_css(
	$uplifters_site_builder_blocks_unique_id,
	$uplifters_site_builder_blocks_desktop_settings
);

$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:1024px){';
$uplifters_site_builder_blocks_dynamic_css .= uplifters_site_builder_blocks_n_countdown_with_msg_device_css(
	$uplifters_site_builder_blocks_unique_id,
	$uplifters_site_builder_blocks_tablet_settings
);
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:767px){';
$uplifters_site_builder_blocks_dynamic_css .= uplifters_site_builder_blocks_n_countdown_with_msg_device_css(
	$uplifters_site_builder_blocks_unique_id,
	$uplifters_site_builder_blocks_mobile_settings
);
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'id'                      => $uplifters_site_builder_blocks_unique_id,
		'class'                   => 'uplifters-site-builder-blocks-countdown-with-msg',
		'data-target'             => $uplifters_site_builder_blocks_target_date,
		'data-expired-behaviour'  => $uplifters_site_builder_blocks_expired_behaviour,
	)
);
?>

<?php
$uplifters_site_builder_blocks_css = wp_strip_all_tags( $uplifters_site_builder_blocks_static_css . $uplifters_site_builder_blocks_dynamic_css );
\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css );
?>

	<div <?php
		// get_block_wrapper_attributes() already escapes every value with
		// esc_attr() before returning. wp_kses() with an empty allowlist
		// leaves that string unchanged and satisfies static analysis.
		echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
	?>>

	<?php if ( ! empty( $uplifters_site_builder_blocks_visible_units ) ) : ?>
	<div
		class="uplifters-site-builder-blocks-countdown-with-msg__units"
		role="timer"
		aria-live="off"
		<?php echo esc_attr( $uplifters_site_builder_blocks_show_expired_message ? 'hidden' : '' ); ?>
	>
		<?php foreach ( $uplifters_site_builder_blocks_visible_units as $uplifters_site_builder_blocks_visible_unit ) : ?>
		<div
			class="uplifters-site-builder-blocks-countdown-with-msg__unit"
			data-countdown-with-msg-unit="<?php echo esc_attr( $uplifters_site_builder_blocks_visible_unit['key'] ); ?>"
		>
			<span class="uplifters-site-builder-blocks-countdown-with-msg__number">
				<?php
				echo esc_html(
					str_pad(
						(string) $uplifters_site_builder_blocks_initial_values[ $uplifters_site_builder_blocks_visible_unit['key'] ],
						2,
						'0',
						STR_PAD_LEFT
					)
				);
				?>
			</span>

			<span class="uplifters-site-builder-blocks-countdown-with-msg__label">
				<?php echo esc_html( $uplifters_site_builder_blocks_visible_unit['label'] ); ?>
			</span>
		</div>
		<?php endforeach; ?>
	</div>
	<?php endif; ?>

	<?php if ( $uplifters_site_builder_blocks_has_message ) : ?>
	<p class="uplifters-site-builder-blocks-countdown-with-msg__message">
		<?php echo esc_html( $uplifters_site_builder_blocks_message ); ?>
	</p>
	<?php endif; ?>

	<?php if ( 'message' === $uplifters_site_builder_blocks_expired_behaviour ) : ?>
	<p
		class="uplifters-site-builder-blocks-countdown-with-msg__expired"
		<?php echo esc_attr( $uplifters_site_builder_blocks_show_expired_message ? '' : 'hidden' ); ?>
	>
		<?php echo esc_html( $uplifters_site_builder_blocks_expired_message ); ?>
	</p>
	<?php endif; ?>

</div>
