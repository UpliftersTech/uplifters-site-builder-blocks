<?php
/**
 * Server-side rendering for the UpliftersSiteBuilderBlocks N Shape Divider block.
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
if ( ! function_exists( 'uplifters_site_builder_blocks_n_shape_divider_responsive_value' ) ) {
	function uplifters_site_builder_blocks_n_shape_divider_responsive_value(
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
if ( ! function_exists( 'uplifters_site_builder_blocks_n_shape_divider_number' ) ) {
	function uplifters_site_builder_blocks_n_shape_divider_number(
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
 * Sanitize the active layout mode.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_shape_divider_mode' ) ) {
	function uplifters_site_builder_blocks_n_shape_divider_mode(
		string $value
	): string {
		$allowed_modes = array(
			'shape',
			'line',
		);

		return in_array(
			$value,
			$allowed_modes,
			true
		)
			? $value
			: 'shape';
	}
}

/**
 * Sanitize the shape type.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_shape_divider_shape' ) ) {
	function uplifters_site_builder_blocks_n_shape_divider_shape(
		string $value
	): string {
		$allowed_shapes = array(
			'wave',
			'curve',
			'tilt',
			'triangle',
			'zigzag',
			'cloud',
			'arc',
			'slope',
			'steps',
			'peak',
		);

		return in_array(
			$value,
			$allowed_shapes,
			true
		)
			? $value
			: 'wave';
	}
}

/**
 * Sanitize the divider style.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_shape_divider_style' ) ) {
	function uplifters_site_builder_blocks_n_shape_divider_style(
		string $value
	): string {
		$allowed_styles = array(
			'fill',
			'soft',
			'sharp',
			'outline',
		);

		return in_array(
			$value,
			$allowed_styles,
			true
		)
			? $value
			: 'fill';
	}
}

/**
 * Restrict the line style to supported border values.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_shape_divider_line_style' ) ) {
	function uplifters_site_builder_blocks_n_shape_divider_line_style(
		string $value
	): string {
		$allowed_values = array(
			'solid',
			'dashed',
			'dotted',
			'double',
		);

		return in_array(
			$value,
			$allowed_values,
			true
		)
			? $value
			: 'solid';
	}
}

/**
 * Restrict alignment values.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_shape_divider_alignment' ) ) {
	function uplifters_site_builder_blocks_n_shape_divider_alignment(
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
 * Sanitize supported color values.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_shape_divider_color' ) ) {
	function uplifters_site_builder_blocks_n_shape_divider_color(
		string $value,
		string $fallback = '#0284c7'
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
 * Return the SVG path for a shape.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_shape_divider_path' ) ) {
	function uplifters_site_builder_blocks_n_shape_divider_path(
		string $shape
	): string {
		$paths = array(
			'curve' => (
				'M0,45 C220,150 740,150 960,45 ' .
				'L960,160 L0,160 Z'
			),

			'tilt' => (
				'M0,28 L960,128 L960,160 L0,160 Z'
			),

			'triangle' => (
				'M0,160 L480,24 L960,160 Z'
			),

			'zigzag' => (
				'M0,110 L80,50 L160,110 L240,50 ' .
				'L320,110 L400,50 L480,110 L560,50 ' .
				'L640,110 L720,50 L800,110 L880,50 ' .
				'L960,110 L960,160 L0,160 Z'
			),

			'cloud' => (
				'M0,95 C40,65 85,65 120,95 ' .
				'C150,120 195,120 225,95 ' .
				'C260,65 305,65 340,95 ' .
				'C370,120 415,120 445,95 ' .
				'C480,65 525,65 560,95 ' .
				'C590,120 635,120 665,95 ' .
				'C700,65 745,65 780,95 ' .
				'C810,120 855,120 885,95 ' .
				'C910,75 935,72 960,88 ' .
				'L960,160 L0,160 Z'
			),

			'arc' => (
				'M0,120 C180,20 780,20 960,120 ' .
				'L960,160 L0,160 Z'
			),

			'slope' => (
				'M0,60 L960,130 L960,160 L0,160 Z'
			),

			'steps' => (
				'M0,40 L160,40 L160,65 L320,65 ' .
				'L320,90 L480,90 L480,115 L640,115 ' .
				'L640,140 L800,140 L800,160 L0,160 Z'
			),

			'peak' => (
				'M0,130 L160,90 L320,120 L480,35 ' .
				'L640,120 L800,80 L960,130 ' .
				'L960,160 L0,160 Z'
			),

			'wave' => (
				'M0,72 C80,118 160,118 240,72 ' .
				'C320,26 400,26 480,72 ' .
				'C560,118 640,118 720,72 ' .
				'C800,26 880,26 960,72 ' .
				'L960,160 L0,160 Z'
			),
		);

		return isset( $paths[ $shape ] )
			? $paths[ $shape ]
			: $paths['wave'];
	}
}

/**
 * Build transform value from flip settings.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_n_shape_divider_transform' ) ) {
	function uplifters_site_builder_blocks_n_shape_divider_transform(
		bool $flip_horizontal,
		bool $flip_vertical
	): string {
		$transforms = array();

		if ( $flip_horizontal ) {
			$transforms[] = 'scaleX(-1)';
		}

		if ( $flip_vertical ) {
			$transforms[] = 'scaleY(-1)';
		}

		return implode( ' ', $transforms );
	}
}

/**
 * Desktop settings.
 */
$uplifters_site_builder_blocks_desktop_mode = uplifters_site_builder_blocks_n_shape_divider_mode(
	sanitize_key(
		(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
			$attributes,
			'dividerMode',
			'desktop',
			'shape'
		)
	)
);

$uplifters_site_builder_blocks_desktop_shape = uplifters_site_builder_blocks_n_shape_divider_shape(
	sanitize_key(
		(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
			$attributes,
			'shapeType',
			'desktop',
			'wave'
		)
	)
);

$uplifters_site_builder_blocks_desktop_style = uplifters_site_builder_blocks_n_shape_divider_style(
	sanitize_key(
		(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
			$attributes,
			'dividerStyle',
			'desktop',
			'fill'
		)
	)
);

$uplifters_site_builder_blocks_desktop_color = uplifters_site_builder_blocks_n_shape_divider_color(
	(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'dividerColor',
		'desktop',
		'#0284c7'
	)
);

$uplifters_site_builder_blocks_desktop_opacity = uplifters_site_builder_blocks_n_shape_divider_number(
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'dividerOpacity',
		'desktop',
		1
	),
	0.1,
	1,
	1
);

$uplifters_site_builder_blocks_desktop_height = uplifters_site_builder_blocks_n_shape_divider_number(
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'dividerHeight',
		'desktop',
		120
	),
	40,
	320,
	120
);

$uplifters_site_builder_blocks_desktop_width = uplifters_site_builder_blocks_n_shape_divider_number(
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'dividerWidth',
		'desktop',
		100
	),
	40,
	100,
	100
);

$uplifters_site_builder_blocks_desktop_flip_horizontal = (bool)
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'flipHorizontal',
		'desktop',
		false
	);

$uplifters_site_builder_blocks_desktop_flip_vertical = (bool)
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'flipVertical',
		'desktop',
		false
	);

$uplifters_site_builder_blocks_desktop_line_width = uplifters_site_builder_blocks_n_shape_divider_number(
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'separatorWidth',
		'desktop',
		100
	),
	5,
	100,
	100
);

$uplifters_site_builder_blocks_desktop_line_height = uplifters_site_builder_blocks_n_shape_divider_number(
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'separatorHeight',
		'desktop',
		2
	),
	1,
	20,
	2
);

$uplifters_site_builder_blocks_desktop_line_style = uplifters_site_builder_blocks_n_shape_divider_line_style(
	sanitize_key(
		(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
			$attributes,
			'separatorStyle',
			'desktop',
			'solid'
		)
	)
);

$uplifters_site_builder_blocks_desktop_line_color = uplifters_site_builder_blocks_n_shape_divider_color(
	(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'separatorColor',
		'desktop',
		'#cbd5e1'
	),
	'#cbd5e1'
);

$uplifters_site_builder_blocks_desktop_background = uplifters_site_builder_blocks_n_shape_divider_color(
	(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'backgroundColor',
		'desktop',
		'transparent'
	),
	'transparent'
);

$uplifters_site_builder_blocks_desktop_alignment = uplifters_site_builder_blocks_n_shape_divider_alignment(
	sanitize_key(
		(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
			$attributes,
			'alignment',
			'desktop',
			'center'
		)
	)
);

$uplifters_site_builder_blocks_desktop_spacing = uplifters_site_builder_blocks_n_shape_divider_number(
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'spacing',
		'desktop',
		32
	),
	0,
	200,
	32
);

/**
 * Tablet settings.
 */
$uplifters_site_builder_blocks_tablet_mode = uplifters_site_builder_blocks_n_shape_divider_mode(
	sanitize_key(
		(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
			$attributes,
			'dividerMode',
			'tablet',
			$uplifters_site_builder_blocks_desktop_mode
		)
	)
);

$uplifters_site_builder_blocks_tablet_shape = uplifters_site_builder_blocks_n_shape_divider_shape(
	sanitize_key(
		(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
			$attributes,
			'shapeType',
			'tablet',
			$uplifters_site_builder_blocks_desktop_shape
		)
	)
);

$uplifters_site_builder_blocks_tablet_style = uplifters_site_builder_blocks_n_shape_divider_style(
	sanitize_key(
		(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
			$attributes,
			'dividerStyle',
			'tablet',
			$uplifters_site_builder_blocks_desktop_style
		)
	)
);

$uplifters_site_builder_blocks_tablet_color = uplifters_site_builder_blocks_n_shape_divider_color(
	(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'dividerColor',
		'tablet',
		$uplifters_site_builder_blocks_desktop_color
	),
	$uplifters_site_builder_blocks_desktop_color
);

$uplifters_site_builder_blocks_tablet_opacity = uplifters_site_builder_blocks_n_shape_divider_number(
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'dividerOpacity',
		'tablet',
		$uplifters_site_builder_blocks_desktop_opacity
	),
	0.1,
	1,
	$uplifters_site_builder_blocks_desktop_opacity
);

$uplifters_site_builder_blocks_tablet_height = uplifters_site_builder_blocks_n_shape_divider_number(
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'dividerHeight',
		'tablet',
		100
	),
	40,
	320,
	100
);

$uplifters_site_builder_blocks_tablet_width = uplifters_site_builder_blocks_n_shape_divider_number(
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'dividerWidth',
		'tablet',
		$uplifters_site_builder_blocks_desktop_width
	),
	40,
	100,
	$uplifters_site_builder_blocks_desktop_width
);

$uplifters_site_builder_blocks_tablet_flip_horizontal = (bool)
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'flipHorizontal',
		'tablet',
		$uplifters_site_builder_blocks_desktop_flip_horizontal
	);

$uplifters_site_builder_blocks_tablet_flip_vertical = (bool)
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'flipVertical',
		'tablet',
		$uplifters_site_builder_blocks_desktop_flip_vertical
	);

$uplifters_site_builder_blocks_tablet_line_width = uplifters_site_builder_blocks_n_shape_divider_number(
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'separatorWidth',
		'tablet',
		$uplifters_site_builder_blocks_desktop_line_width
	),
	5,
	100,
	$uplifters_site_builder_blocks_desktop_line_width
);

$uplifters_site_builder_blocks_tablet_line_height = uplifters_site_builder_blocks_n_shape_divider_number(
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'separatorHeight',
		'tablet',
		$uplifters_site_builder_blocks_desktop_line_height
	),
	1,
	20,
	$uplifters_site_builder_blocks_desktop_line_height
);

$uplifters_site_builder_blocks_tablet_line_style = uplifters_site_builder_blocks_n_shape_divider_line_style(
	sanitize_key(
		(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
			$attributes,
			'separatorStyle',
			'tablet',
			$uplifters_site_builder_blocks_desktop_line_style
		)
	)
);

$uplifters_site_builder_blocks_tablet_line_color = uplifters_site_builder_blocks_n_shape_divider_color(
	(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'separatorColor',
		'tablet',
		$uplifters_site_builder_blocks_desktop_line_color
	),
	$uplifters_site_builder_blocks_desktop_line_color
);

$uplifters_site_builder_blocks_tablet_background = uplifters_site_builder_blocks_n_shape_divider_color(
	(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'backgroundColor',
		'tablet',
		$uplifters_site_builder_blocks_desktop_background
	),
	$uplifters_site_builder_blocks_desktop_background
);

$uplifters_site_builder_blocks_tablet_alignment = uplifters_site_builder_blocks_n_shape_divider_alignment(
	sanitize_key(
		(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
			$attributes,
			'alignment',
			'tablet',
			$uplifters_site_builder_blocks_desktop_alignment
		)
	)
);

$uplifters_site_builder_blocks_tablet_spacing = uplifters_site_builder_blocks_n_shape_divider_number(
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'spacing',
		'tablet',
		24
	),
	0,
	200,
	24
);

/**
 * Mobile settings.
 */
$uplifters_site_builder_blocks_mobile_mode = uplifters_site_builder_blocks_n_shape_divider_mode(
	sanitize_key(
		(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
			$attributes,
			'dividerMode',
			'mobile',
			$uplifters_site_builder_blocks_tablet_mode
		)
	)
);

$uplifters_site_builder_blocks_mobile_shape = uplifters_site_builder_blocks_n_shape_divider_shape(
	sanitize_key(
		(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
			$attributes,
			'shapeType',
			'mobile',
			$uplifters_site_builder_blocks_tablet_shape
		)
	)
);

$uplifters_site_builder_blocks_mobile_style = uplifters_site_builder_blocks_n_shape_divider_style(
	sanitize_key(
		(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
			$attributes,
			'dividerStyle',
			'mobile',
			$uplifters_site_builder_blocks_tablet_style
		)
	)
);

$uplifters_site_builder_blocks_mobile_color = uplifters_site_builder_blocks_n_shape_divider_color(
	(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'dividerColor',
		'mobile',
		$uplifters_site_builder_blocks_tablet_color
	),
	$uplifters_site_builder_blocks_tablet_color
);

$uplifters_site_builder_blocks_mobile_opacity = uplifters_site_builder_blocks_n_shape_divider_number(
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'dividerOpacity',
		'mobile',
		$uplifters_site_builder_blocks_tablet_opacity
	),
	0.1,
	1,
	$uplifters_site_builder_blocks_tablet_opacity
);

$uplifters_site_builder_blocks_mobile_height = uplifters_site_builder_blocks_n_shape_divider_number(
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'dividerHeight',
		'mobile',
		80
	),
	40,
	320,
	80
);

$uplifters_site_builder_blocks_mobile_width = uplifters_site_builder_blocks_n_shape_divider_number(
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'dividerWidth',
		'mobile',
		$uplifters_site_builder_blocks_tablet_width
	),
	40,
	100,
	$uplifters_site_builder_blocks_tablet_width
);

$uplifters_site_builder_blocks_mobile_flip_horizontal = (bool)
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'flipHorizontal',
		'mobile',
		$uplifters_site_builder_blocks_tablet_flip_horizontal
	);

$uplifters_site_builder_blocks_mobile_flip_vertical = (bool)
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'flipVertical',
		'mobile',
		$uplifters_site_builder_blocks_tablet_flip_vertical
	);

$uplifters_site_builder_blocks_mobile_line_width = uplifters_site_builder_blocks_n_shape_divider_number(
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'separatorWidth',
		'mobile',
		$uplifters_site_builder_blocks_tablet_line_width
	),
	5,
	100,
	$uplifters_site_builder_blocks_tablet_line_width
);

$uplifters_site_builder_blocks_mobile_line_height = uplifters_site_builder_blocks_n_shape_divider_number(
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'separatorHeight',
		'mobile',
		$uplifters_site_builder_blocks_tablet_line_height
	),
	1,
	20,
	$uplifters_site_builder_blocks_tablet_line_height
);

$uplifters_site_builder_blocks_mobile_line_style = uplifters_site_builder_blocks_n_shape_divider_line_style(
	sanitize_key(
		(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
			$attributes,
			'separatorStyle',
			'mobile',
			$uplifters_site_builder_blocks_tablet_line_style
		)
	)
);

$uplifters_site_builder_blocks_mobile_line_color = uplifters_site_builder_blocks_n_shape_divider_color(
	(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'separatorColor',
		'mobile',
		$uplifters_site_builder_blocks_tablet_line_color
	),
	$uplifters_site_builder_blocks_tablet_line_color
);

$uplifters_site_builder_blocks_mobile_background = uplifters_site_builder_blocks_n_shape_divider_color(
	(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'backgroundColor',
		'mobile',
		$uplifters_site_builder_blocks_tablet_background
	),
	$uplifters_site_builder_blocks_tablet_background
);

$uplifters_site_builder_blocks_mobile_alignment = uplifters_site_builder_blocks_n_shape_divider_alignment(
	sanitize_key(
		(string) uplifters_site_builder_blocks_n_shape_divider_responsive_value(
			$attributes,
			'alignment',
			'mobile',
			$uplifters_site_builder_blocks_tablet_alignment
		)
	)
);

$uplifters_site_builder_blocks_mobile_spacing = uplifters_site_builder_blocks_n_shape_divider_number(
	uplifters_site_builder_blocks_n_shape_divider_responsive_value(
		$attributes,
		'spacing',
		'mobile',
		20
	),
	0,
	200,
	20
);

$uplifters_site_builder_blocks_desktop_transform = uplifters_site_builder_blocks_n_shape_divider_transform(
	$uplifters_site_builder_blocks_desktop_flip_horizontal,
	$uplifters_site_builder_blocks_desktop_flip_vertical
);

$uplifters_site_builder_blocks_tablet_transform = uplifters_site_builder_blocks_n_shape_divider_transform(
	$uplifters_site_builder_blocks_tablet_flip_horizontal,
	$uplifters_site_builder_blocks_tablet_flip_vertical
);

$uplifters_site_builder_blocks_mobile_transform = uplifters_site_builder_blocks_n_shape_divider_transform(
	$uplifters_site_builder_blocks_mobile_flip_horizontal,
	$uplifters_site_builder_blocks_mobile_flip_vertical
);

$uplifters_site_builder_blocks_alignment_map = array(
	'left'   => 'flex-start',
	'center' => 'center',
	'right'  => 'flex-end',
);

$uplifters_site_builder_blocks_desktop_css_alignment =
	$uplifters_site_builder_blocks_alignment_map[ $uplifters_site_builder_blocks_desktop_alignment ];

$uplifters_site_builder_blocks_tablet_css_alignment =
	$uplifters_site_builder_blocks_alignment_map[ $uplifters_site_builder_blocks_tablet_alignment ];

$uplifters_site_builder_blocks_mobile_css_alignment =
	$uplifters_site_builder_blocks_alignment_map[ $uplifters_site_builder_blocks_mobile_alignment ];

$uplifters_site_builder_blocks_desktop_radius =
	'solid' === $uplifters_site_builder_blocks_desktop_line_style
		? '999px'
		: '0';

$uplifters_site_builder_blocks_tablet_radius =
	'solid' === $uplifters_site_builder_blocks_tablet_line_style
		? '999px'
		: '0';

$uplifters_site_builder_blocks_mobile_radius =
	'solid' === $uplifters_site_builder_blocks_mobile_line_style
		? '999px'
		: '0';

$uplifters_site_builder_blocks_unique_id = wp_unique_id(
	'uplifters-site-builder-blocks-shape-divider-'
);

/**
 * Shared CSS and responsive variant visibility.
 */
$uplifters_site_builder_blocks_static_css  = '';
$uplifters_site_builder_blocks_static_css .= '.wp-block-uplifters-site-builder-blocks-shape-divider,.wp-block-uplifters-site-builder-blocks-shape-divider *,.uplifters-site-builder-blocks-shape-divider,.uplifters-site-builder-blocks-shape-divider *{box-sizing:border-box;}';
$uplifters_site_builder_blocks_static_css .= '.wp-block-uplifters-site-builder-blocks-shape-divider,.uplifters-site-builder-blocks-shape-divider{position:relative;width:100%;max-width:100%;line-height:0;overflow:hidden;}';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-shape-divider__variant{display:none;width:100%;max-width:100%;overflow:hidden;}';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-shape-divider__variant--desktop{display:block;}';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-shape-divider__svg{display:block;transform-origin:center center;}';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-shape-divider__variant.is-style-soft .uplifters-site-builder-blocks-shape-divider__svg{filter:drop-shadow(0 10px 20px rgba(14,116,144,.18));}';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-shape-divider__variant.is-style-sharp .uplifters-site-builder-blocks-shape-divider__svg{shape-rendering:geometricPrecision;}';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-shape-divider__variant.is-style-outline .uplifters-site-builder-blocks-shape-divider__path{fill:none;stroke:currentColor;stroke-width:8px;}';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-shape-divider__inner{display:flex;width:100%;max-width:100%;}';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-shape-divider__line{border-top-style:solid;}';

$uplifters_site_builder_blocks_static_css .= '@media (max-width:1024px){';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-shape-divider__variant--desktop{display:none;}';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-shape-divider__variant--tablet{display:block;}';
$uplifters_site_builder_blocks_static_css .= '}';

$uplifters_site_builder_blocks_static_css .= '@media (max-width:767px){';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-shape-divider__variant--desktop,.uplifters-site-builder-blocks-shape-divider__variant--tablet{display:none;}';
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-shape-divider__variant--mobile{display:block;}';
$uplifters_site_builder_blocks_static_css .= '}';

/**
 * Per-block responsive visual values.
 */
$uplifters_site_builder_blocks_dynamic_css  = '';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'background:' . $uplifters_site_builder_blocks_desktop_background . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'padding-top:' . $uplifters_site_builder_blocks_desktop_spacing . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'padding-bottom:' . $uplifters_site_builder_blocks_desktop_spacing . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-shape-divider__variant--desktop{';
$uplifters_site_builder_blocks_dynamic_css .= 'color:' . (
	'line' === $uplifters_site_builder_blocks_desktop_mode
		? $uplifters_site_builder_blocks_desktop_line_color
		: $uplifters_site_builder_blocks_desktop_color
) . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'opacity:' . $uplifters_site_builder_blocks_desktop_opacity . ';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-shape-divider__variant--desktop .uplifters-site-builder-blocks-shape-divider__svg{';
$uplifters_site_builder_blocks_dynamic_css .= 'width:' . $uplifters_site_builder_blocks_desktop_width . '%;';
$uplifters_site_builder_blocks_dynamic_css .= 'height:' . $uplifters_site_builder_blocks_desktop_height . 'px;';

if ( '' !== $uplifters_site_builder_blocks_desktop_transform ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'transform:' . $uplifters_site_builder_blocks_desktop_transform . ';';
}

$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-shape-divider__variant--desktop .uplifters-site-builder-blocks-shape-divider__inner{';
$uplifters_site_builder_blocks_dynamic_css .= 'justify-content:' . $uplifters_site_builder_blocks_desktop_css_alignment . ';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-shape-divider__variant--desktop .uplifters-site-builder-blocks-shape-divider__line{';
$uplifters_site_builder_blocks_dynamic_css .= 'width:' . $uplifters_site_builder_blocks_desktop_line_width . '%;';
$uplifters_site_builder_blocks_dynamic_css .= 'border-top:' .
	$uplifters_site_builder_blocks_desktop_line_height . 'px ' .
	$uplifters_site_builder_blocks_desktop_line_style . ' ' .
	$uplifters_site_builder_blocks_desktop_line_color . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'border-radius:' . $uplifters_site_builder_blocks_desktop_radius . ';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-shape-divider__variant--tablet{';
$uplifters_site_builder_blocks_dynamic_css .= 'color:' . (
	'line' === $uplifters_site_builder_blocks_tablet_mode
		? $uplifters_site_builder_blocks_tablet_line_color
		: $uplifters_site_builder_blocks_tablet_color
) . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'opacity:' . $uplifters_site_builder_blocks_tablet_opacity . ';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-shape-divider__variant--tablet .uplifters-site-builder-blocks-shape-divider__svg{';
$uplifters_site_builder_blocks_dynamic_css .= 'width:' . $uplifters_site_builder_blocks_tablet_width . '%;';
$uplifters_site_builder_blocks_dynamic_css .= 'height:' . $uplifters_site_builder_blocks_tablet_height . 'px;';

if ( '' !== $uplifters_site_builder_blocks_tablet_transform ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'transform:' . $uplifters_site_builder_blocks_tablet_transform . ';';
}

$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-shape-divider__variant--tablet .uplifters-site-builder-blocks-shape-divider__inner{';
$uplifters_site_builder_blocks_dynamic_css .= 'justify-content:' . $uplifters_site_builder_blocks_tablet_css_alignment . ';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-shape-divider__variant--tablet .uplifters-site-builder-blocks-shape-divider__line{';
$uplifters_site_builder_blocks_dynamic_css .= 'width:' . $uplifters_site_builder_blocks_tablet_line_width . '%;';
$uplifters_site_builder_blocks_dynamic_css .= 'border-top:' .
	$uplifters_site_builder_blocks_tablet_line_height . 'px ' .
	$uplifters_site_builder_blocks_tablet_line_style . ' ' .
	$uplifters_site_builder_blocks_tablet_line_color . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'border-radius:' . $uplifters_site_builder_blocks_tablet_radius . ';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-shape-divider__variant--mobile{';
$uplifters_site_builder_blocks_dynamic_css .= 'color:' . (
	'line' === $uplifters_site_builder_blocks_mobile_mode
		? $uplifters_site_builder_blocks_mobile_line_color
		: $uplifters_site_builder_blocks_mobile_color
) . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'opacity:' . $uplifters_site_builder_blocks_mobile_opacity . ';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-shape-divider__variant--mobile .uplifters-site-builder-blocks-shape-divider__svg{';
$uplifters_site_builder_blocks_dynamic_css .= 'width:' . $uplifters_site_builder_blocks_mobile_width . '%;';
$uplifters_site_builder_blocks_dynamic_css .= 'height:' . $uplifters_site_builder_blocks_mobile_height . 'px;';

if ( '' !== $uplifters_site_builder_blocks_mobile_transform ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'transform:' . $uplifters_site_builder_blocks_mobile_transform . ';';
}

$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-shape-divider__variant--mobile .uplifters-site-builder-blocks-shape-divider__inner{';
$uplifters_site_builder_blocks_dynamic_css .= 'justify-content:' . $uplifters_site_builder_blocks_mobile_css_alignment . ';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-shape-divider__variant--mobile .uplifters-site-builder-blocks-shape-divider__line{';
$uplifters_site_builder_blocks_dynamic_css .= 'width:' . $uplifters_site_builder_blocks_mobile_line_width . '%;';
$uplifters_site_builder_blocks_dynamic_css .= 'border-top:' .
	$uplifters_site_builder_blocks_mobile_line_height . 'px ' .
	$uplifters_site_builder_blocks_mobile_line_style . ' ' .
	$uplifters_site_builder_blocks_mobile_line_color . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'border-radius:' . $uplifters_site_builder_blocks_mobile_radius . ';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

/**
 * Responsive wrapper background and vertical spacing.
 */
$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:1024px){';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'background:' . $uplifters_site_builder_blocks_tablet_background . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'padding-top:' . $uplifters_site_builder_blocks_tablet_spacing . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'padding-bottom:' . $uplifters_site_builder_blocks_tablet_spacing . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= '}';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:767px){';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'background:' . $uplifters_site_builder_blocks_mobile_background . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'padding-top:' . $uplifters_site_builder_blocks_mobile_spacing . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= 'padding-bottom:' . $uplifters_site_builder_blocks_mobile_spacing . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= '}';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'id'    => $uplifters_site_builder_blocks_unique_id,
		'class' => 'uplifters-site-builder-blocks-shape-divider',
	)
);

$uplifters_site_builder_blocks_device_variants = array(
	'desktop' => array(
		'mode'  => $uplifters_site_builder_blocks_desktop_mode,
		'style' => 'line' === $uplifters_site_builder_blocks_desktop_mode
			? $uplifters_site_builder_blocks_desktop_line_style
			: $uplifters_site_builder_blocks_desktop_style,
		'shape' => $uplifters_site_builder_blocks_desktop_shape,
	),

	'tablet' => array(
		'mode'  => $uplifters_site_builder_blocks_tablet_mode,
		'style' => 'line' === $uplifters_site_builder_blocks_tablet_mode
			? $uplifters_site_builder_blocks_tablet_line_style
			: $uplifters_site_builder_blocks_tablet_style,
		'shape' => $uplifters_site_builder_blocks_tablet_shape,
	),

	'mobile' => array(
		'mode'  => $uplifters_site_builder_blocks_mobile_mode,
		'style' => 'line' === $uplifters_site_builder_blocks_mobile_mode
			? $uplifters_site_builder_blocks_mobile_line_style
			: $uplifters_site_builder_blocks_mobile_style,
		'shape' => $uplifters_site_builder_blocks_mobile_shape,
	),
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
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() ); ?>>

	<?php foreach ( $uplifters_site_builder_blocks_device_variants as $uplifters_site_builder_blocks_variant_device => $uplifters_site_builder_blocks_variant ) : ?>

	<div
		class="<?php
		echo esc_attr(
			'uplifters-site-builder-blocks-shape-divider__variant ' .
			'uplifters-site-builder-blocks-shape-divider__variant--' . $uplifters_site_builder_blocks_variant_device . ' ' .
			'is-mode-' . $uplifters_site_builder_blocks_variant['mode'] . ' ' .
			'is-style-' . $uplifters_site_builder_blocks_variant['style']
		);
		?>"
		data-device="<?php echo esc_attr( $uplifters_site_builder_blocks_variant_device ); ?>"
		data-mode="<?php echo esc_attr( $uplifters_site_builder_blocks_variant['mode'] ); ?>"
		data-shape-type="<?php echo esc_attr( $uplifters_site_builder_blocks_variant['shape'] ); ?>"
	>
		<?php if ( 'line' === $uplifters_site_builder_blocks_variant['mode'] ) : ?>
		<div class="uplifters-site-builder-blocks-shape-divider__inner">
			<div
				class="uplifters-site-builder-blocks-shape-divider__line"
				aria-hidden="true"
			></div>
		</div>
		<?php else : ?>
		<svg
			class="uplifters-site-builder-blocks-shape-divider__svg"
			viewBox="0 0 960 160"
			preserveAspectRatio="none"
			aria-hidden="true"
			focusable="false"
		>
			<path
				class="uplifters-site-builder-blocks-shape-divider__path"
				d="<?php
				echo esc_attr(
					uplifters_site_builder_blocks_n_shape_divider_path(
						$uplifters_site_builder_blocks_variant['shape']
					)
				);
				?>"
				fill="currentColor"
			></path>
		</svg>
		<?php endif; ?>
	</div>

	<?php endforeach; ?>

</div>
