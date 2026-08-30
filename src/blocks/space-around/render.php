<?php
/**
 * Server-side rendering for the UpliftersSiteBuilderBlocks N Spacer block.
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
 * Read one responsive device branch.
 *
 * Scalar values are supported for compatibility with previously
 * saved blocks.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_space_around_responsive_value' ) ) {
	function uplifters_site_builder_blocks_n_space_around_responsive_value(
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
 * Return a numeric value restricted to the supported range.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_space_around_number' ) ) {
	function uplifters_site_builder_blocks_n_space_around_number(
		$value,
		float $fallback = 0
	): float {
		if ( ! is_numeric( $value ) ) {
			return $fallback;
		}

		return max(
			0,
			min( 500, (float) $value )
		);
	}
}

/**
 * Convert width to a CSS value.
 *
 * A zero width means full available width.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_space_around_width_css' ) ) {
	function uplifters_site_builder_blocks_n_space_around_width_css(
		float $width
	): string {
		return $width > 0
			? $width . 'px'
			: '100%';
	}
}

/**
 * Convert width to its minimum-width value.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_space_around_min_width_css' ) ) {
	function uplifters_site_builder_blocks_n_space_around_min_width_css(
		float $width
	): string {
		return $width > 0
			? $width . 'px'
			: '0';
	}
}

/**
 * Sanitize a supported CSS color.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_space_around_color' ) ) {
	function uplifters_site_builder_blocks_n_space_around_color(
		string $value,
		string $fallback = 'transparent'
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
 * Retain compatibility with the previous separate responsive
 * height and width attributes.
 */
$uplifters_site_builder_blocks_legacy_desktop_height = isset(
	$attributes['desktopHeight']
)
	? $attributes['desktopHeight']
	: 0;

$uplifters_site_builder_blocks_legacy_tablet_height = isset(
	$attributes['tabletHeight']
)
	? $attributes['tabletHeight']
	: 0;

$uplifters_site_builder_blocks_legacy_mobile_height = isset(
	$attributes['mobileHeight']
)
	? $attributes['mobileHeight']
	: 0;

$uplifters_site_builder_blocks_legacy_desktop_width = isset(
	$attributes['desktopWidth']
)
	? $attributes['desktopWidth']
	: 0;

$uplifters_site_builder_blocks_legacy_tablet_width = isset(
	$attributes['tabletWidth']
)
	? $attributes['tabletWidth']
	: 0;

$uplifters_site_builder_blocks_legacy_mobile_width = isset(
	$attributes['mobileWidth']
)
	? $attributes['mobileWidth']
	: 0;

/**
 * Responsive heights.
 */
$uplifters_site_builder_blocks_desktop_height = uplifters_site_builder_blocks_n_space_around_number(
	uplifters_site_builder_blocks_n_space_around_responsive_value(
		$attributes,
		'height',
		'desktop',
		$uplifters_site_builder_blocks_legacy_desktop_height
	)
);

$uplifters_site_builder_blocks_tablet_height = uplifters_site_builder_blocks_n_space_around_number(
	uplifters_site_builder_blocks_n_space_around_responsive_value(
		$attributes,
		'height',
		'tablet',
		$uplifters_site_builder_blocks_legacy_tablet_height
	)
);

$uplifters_site_builder_blocks_mobile_height = uplifters_site_builder_blocks_n_space_around_number(
	uplifters_site_builder_blocks_n_space_around_responsive_value(
		$attributes,
		'height',
		'mobile',
		$uplifters_site_builder_blocks_legacy_mobile_height
	)
);

/**
 * Responsive widths.
 */
$uplifters_site_builder_blocks_desktop_width = uplifters_site_builder_blocks_n_space_around_number(
	uplifters_site_builder_blocks_n_space_around_responsive_value(
		$attributes,
		'width',
		'desktop',
		$uplifters_site_builder_blocks_legacy_desktop_width
	)
);

$uplifters_site_builder_blocks_tablet_width = uplifters_site_builder_blocks_n_space_around_number(
	uplifters_site_builder_blocks_n_space_around_responsive_value(
		$attributes,
		'width',
		'tablet',
		$uplifters_site_builder_blocks_legacy_tablet_width
	)
);

$uplifters_site_builder_blocks_mobile_width = uplifters_site_builder_blocks_n_space_around_number(
	uplifters_site_builder_blocks_n_space_around_responsive_value(
		$attributes,
		'width',
		'mobile',
		$uplifters_site_builder_blocks_legacy_mobile_width
	)
);

/**
 * Responsive background colors.
 */
$uplifters_site_builder_blocks_desktop_background = uplifters_site_builder_blocks_n_space_around_color(
	(string) uplifters_site_builder_blocks_n_space_around_responsive_value(
		$attributes,
		'backgroundColor',
		'desktop',
		'transparent'
	),
	'transparent'
);

$uplifters_site_builder_blocks_tablet_background = uplifters_site_builder_blocks_n_space_around_color(
	(string) uplifters_site_builder_blocks_n_space_around_responsive_value(
		$attributes,
		'backgroundColor',
		'tablet',
		$uplifters_site_builder_blocks_desktop_background
	),
	$uplifters_site_builder_blocks_desktop_background
);

$uplifters_site_builder_blocks_mobile_background = uplifters_site_builder_blocks_n_space_around_color(
	(string) uplifters_site_builder_blocks_n_space_around_responsive_value(
		$attributes,
		'backgroundColor',
		'mobile',
		$uplifters_site_builder_blocks_tablet_background
	),
	$uplifters_site_builder_blocks_tablet_background
);

$uplifters_site_builder_blocks_spacing_direction = isset(
	$attributes['spacingDirection']
)
	? sanitize_key(
		$attributes['spacingDirection']
	)
	: 'vertical';

if (
	! in_array(
		$uplifters_site_builder_blocks_spacing_direction,
		array( 'vertical', 'horizontal' ),
		true
	)
) {
	$uplifters_site_builder_blocks_spacing_direction = 'vertical';
}

$uplifters_site_builder_blocks_unique_id = wp_unique_id(
	'uplifters-site-builder-blocks-space-around-'
);

/**
 * Shared styles.
 */
$uplifters_site_builder_blocks_static_css  = '';
$uplifters_site_builder_blocks_static_css .= '.wp-block-uplifters-site-builder-blocks-space-around,.wp-block-uplifters-site-builder-blocks-space-around *,.uplifters-site-builder-blocks-space-around,.uplifters-site-builder-blocks-space-around *{box-sizing:border-box;}';
$uplifters_site_builder_blocks_static_css .= '.wp-block-uplifters-site-builder-blocks-space-around,.uplifters-site-builder-blocks-space-around{display:block;max-width:100%;min-height:0;flex-shrink:0;}';

/**
 * Desktop values.
 */
$uplifters_site_builder_blocks_dynamic_css  = '';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'width:' .
	uplifters_site_builder_blocks_n_space_around_width_css(
		$uplifters_site_builder_blocks_desktop_width
	) . ';';

$uplifters_site_builder_blocks_dynamic_css .= 'min-width:' .
	uplifters_site_builder_blocks_n_space_around_min_width_css(
		$uplifters_site_builder_blocks_desktop_width
	) . ';';

$uplifters_site_builder_blocks_dynamic_css .= 'height:' .
	$uplifters_site_builder_blocks_desktop_height . 'px;';

$uplifters_site_builder_blocks_dynamic_css .= 'background:' .
	$uplifters_site_builder_blocks_desktop_background . ';';

$uplifters_site_builder_blocks_dynamic_css .= '}';

/**
 * Tablet values.
 */
$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:1024px){';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'width:' .
	uplifters_site_builder_blocks_n_space_around_width_css(
		$uplifters_site_builder_blocks_tablet_width
	) . ';';

$uplifters_site_builder_blocks_dynamic_css .= 'min-width:' .
	uplifters_site_builder_blocks_n_space_around_min_width_css(
		$uplifters_site_builder_blocks_tablet_width
	) . ';';

$uplifters_site_builder_blocks_dynamic_css .= 'height:' .
	$uplifters_site_builder_blocks_tablet_height . 'px;';

$uplifters_site_builder_blocks_dynamic_css .= 'background:' .
	$uplifters_site_builder_blocks_tablet_background . ';';

$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '}';

/**
 * Mobile values.
 */
$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:767px){';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'width:' .
	uplifters_site_builder_blocks_n_space_around_width_css(
		$uplifters_site_builder_blocks_mobile_width
	) . ';';

$uplifters_site_builder_blocks_dynamic_css .= 'min-width:' .
	uplifters_site_builder_blocks_n_space_around_min_width_css(
		$uplifters_site_builder_blocks_mobile_width
	) . ';';

$uplifters_site_builder_blocks_dynamic_css .= 'height:' .
	$uplifters_site_builder_blocks_mobile_height . 'px;';

$uplifters_site_builder_blocks_dynamic_css .= 'background:' .
	$uplifters_site_builder_blocks_mobile_background . ';';

$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_wrapper_attributes =
	get_block_wrapper_attributes(
		array(
			'id'                     => $uplifters_site_builder_blocks_unique_id,
			'class'                  => 'uplifters-site-builder-blocks-space-around',
			'data-spacing-direction' => $uplifters_site_builder_blocks_spacing_direction,
			'data-desktop-height'    => (string) $uplifters_site_builder_blocks_desktop_height,
			'data-tablet-height'     => (string) $uplifters_site_builder_blocks_tablet_height,
			'data-mobile-height'     => (string) $uplifters_site_builder_blocks_mobile_height,
			'data-desktop-width'     => (string) $uplifters_site_builder_blocks_desktop_width,
			'data-tablet-width'      => (string) $uplifters_site_builder_blocks_tablet_width,
			'data-mobile-width'      => (string) $uplifters_site_builder_blocks_mobile_width,
			'aria-hidden'            => 'true',
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
	?>></div>
