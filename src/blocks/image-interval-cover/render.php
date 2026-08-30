<?php
/**
 * Server-side rendering for the responsive Cover Image Interval block.
 *
 * @package UpliftersSiteBuilderBlocks
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Saved block content.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_image_interval_cover_has_responsive_value' ) ) {
	function uplifters_site_builder_blocks_image_interval_cover_has_responsive_value( $value ): bool {
		return null !== $value && '' !== $value;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_image_interval_cover_responsive_value' ) ) {
	function uplifters_site_builder_blocks_image_interval_cover_responsive_value(
		array $attributes,
		string $key,
		string $device,
		$fallback = ''
	) {
		if ( ! array_key_exists( $key, $attributes ) ) {
			return $fallback;
		}

		$value = $attributes[ $key ];

		/*
		 * Support old scalar attributes.
		 */
		if ( ! is_array( $value ) ) {
			return uplifters_site_builder_blocks_image_interval_cover_has_responsive_value( $value )
				? $value
				: $fallback;
		}

		if (
			array_key_exists( $device, $value ) &&
			uplifters_site_builder_blocks_image_interval_cover_has_responsive_value( $value[ $device ] )
		) {
			return $value[ $device ];
		}

		if (
			array_key_exists( 'desktop', $value ) &&
			uplifters_site_builder_blocks_image_interval_cover_has_responsive_value( $value['desktop'] )
		) {
			return $value['desktop'];
		}

		if (
			array_key_exists( 'tablet', $value ) &&
			uplifters_site_builder_blocks_image_interval_cover_has_responsive_value( $value['tablet'] )
		) {
			return $value['tablet'];
		}

		if (
			array_key_exists( 'mobile', $value ) &&
			uplifters_site_builder_blocks_image_interval_cover_has_responsive_value( $value['mobile'] )
		) {
			return $value['mobile'];
		}

		return $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_image_interval_cover_normalize_caption_size' ) ) {
	function uplifters_site_builder_blocks_image_interval_cover_normalize_caption_size( $size ): string {
		$size_map = array(
			'text-sm'   => 'small',
			'text-base' => 'normal',
			'text-lg'   => 'large',
			'text-xl'   => 'xl',
			'small'     => 'small',
			'normal'    => 'normal',
			'large'     => 'large',
			'xl'        => 'xl',
		);

		$size = is_string( $size )
			? $size
			: '';

		return isset( $size_map[ $size ] )
			? $size_map[ $size ]
			: 'large';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_image_interval_cover_normalize_caption_weight' ) ) {
	function uplifters_site_builder_blocks_image_interval_cover_normalize_caption_weight( $weight ): string {
		$weight_map = array(
			'font-normal'   => 'normal',
			'font-medium'   => 'medium',
			'font-semibold' => 'semibold',
			'font-bold'     => 'bold',
			'normal'        => 'normal',
			'medium'        => 'medium',
			'semibold'      => 'semibold',
			'bold'          => 'bold',
		);

		$weight = is_string( $weight )
			? $weight
			: '';

		return isset( $weight_map[ $weight ] )
			? $weight_map[ $weight ]
			: 'normal';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_image_interval_cover_normalize_padding' ) ) {
	function uplifters_site_builder_blocks_image_interval_cover_normalize_padding( $padding ): string {
		$padding_map = array(
			'p-0' => '0',
			'p-1' => '4px',
			'p-2' => '8px',
			'p-3' => '12px',
			'p-4' => '16px',
		);

		$padding = is_string( $padding )
			? trim( $padding )
			: '';

		if ( isset( $padding_map[ $padding ] ) ) {
			return $padding_map[ $padding ];
		}

		if (
			preg_match(
				'/^(0|[0-9]+(?:\.[0-9]+)?(?:px|rem|em|%|vw|vh))$/',
				$padding
			)
		) {
			return $padding;
		}

		return '8px';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_image_interval_cover_caption_font_size' ) ) {
	function uplifters_site_builder_blocks_image_interval_cover_caption_font_size( string $size ): string {
		$size_map = array(
			'small'  => '14px',
			'normal' => '16px',
			'large'  => '18px',
			'xl'     => '20px',
		);

		return isset( $size_map[ $size ] )
			? $size_map[ $size ]
			: '18px';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_image_interval_cover_caption_font_weight' ) ) {
	function uplifters_site_builder_blocks_image_interval_cover_caption_font_weight( string $weight ): int {
		$weight_map = array(
			'normal'   => 400,
			'medium'   => 500,
			'semibold' => 600,
			'bold'     => 700,
		);

		return isset( $weight_map[ $weight ] )
			? $weight_map[ $weight ]
			: 400;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_image_interval_cover_clamp_integer' ) ) {
	function uplifters_site_builder_blocks_image_interval_cover_clamp_integer(
		$value,
		int $minimum,
		int $maximum,
		int $fallback
	): int {
		if ( ! is_numeric( $value ) ) {
			return $fallback;
		}

		$value = (int) round(
			(float) $value
		);

		return max(
			$minimum,
			min( $maximum, $value )
		);
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_image_interval_cover_sanitize_color' ) ) {
	function uplifters_site_builder_blocks_image_interval_cover_sanitize_color( $color ): string {
		if ( ! is_string( $color ) ) {
			return '';
		}

		$color = trim(
			wp_strip_all_tags( $color )
		);

		if ( '' === $color ) {
			return '';
		}

		if (
			preg_match(
				'/^#[a-fA-F0-9]{3,8}$/',
				$color
			)
		) {
			return $color;
		}

		if (
			preg_match(
				'/^rgba?\(\s*[0-9.%\s,\/-]+\)$/i',
				$color
			)
		) {
			return $color;
		}

		if (
			preg_match(
				'/^hsla?\(\s*[0-9.%a-z\s,\/-]+\)$/i',
				$color
			)
		) {
			return $color;
		}

		if (
			preg_match(
				'/^var\(\s*--[a-zA-Z0-9_-]+\s*\)$/',
				$color
			)
		) {
			return $color;
		}

		return '';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_image_interval_cover_hex_to_rgba' ) ) {
	function uplifters_site_builder_blocks_image_interval_cover_hex_to_rgba(
		string $hex,
		float $alpha
	): string {
		$hex = sanitize_hex_color( $hex );

		if ( ! $hex ) {
			return 'rgba(255,255,255,0.45)';
		}

		$hex = ltrim( $hex, '#' );

		if ( 3 === strlen( $hex ) ) {
			$red   = hexdec( $hex[0] . $hex[0] );
			$green = hexdec( $hex[1] . $hex[1] );
			$blue  = hexdec( $hex[2] . $hex[2] );
		} else {
			$red   = hexdec( substr( $hex, 0, 2 ) );
			$green = hexdec( substr( $hex, 2, 2 ) );
			$blue  = hexdec( substr( $hex, 4, 2 ) );
		}

		return sprintf(
			'rgba(%1$d,%2$d,%3$d,%4$s)',
			$red,
			$green,
			$blue,
			(string) $alpha
		);
	}
}

$uplifters_site_builder_blocks_raw_images = (
	isset( $attributes['images'] ) &&
	is_array( $attributes['images'] )
)
	? $attributes['images']
	: array();

$uplifters_site_builder_blocks_images = array();

foreach ( $uplifters_site_builder_blocks_raw_images as $uplifters_site_builder_blocks_raw_image ) {
	if ( ! is_array( $uplifters_site_builder_blocks_raw_image ) ) {
		continue;
	}

	$uplifters_site_builder_blocks_caption_style = (
		isset( $uplifters_site_builder_blocks_raw_image['captionStyle'] ) &&
		is_array( $uplifters_site_builder_blocks_raw_image['captionStyle'] )
	)
		? $uplifters_site_builder_blocks_raw_image['captionStyle']
		: array();

	$uplifters_site_builder_blocks_image_url = (
		isset( $uplifters_site_builder_blocks_raw_image['url'] ) &&
		is_string( $uplifters_site_builder_blocks_raw_image['url'] )
	)
		? esc_url_raw( $uplifters_site_builder_blocks_raw_image['url'] )
		: '';

	$uplifters_site_builder_blocks_image_id = isset( $uplifters_site_builder_blocks_raw_image['id'] )
		? absint( $uplifters_site_builder_blocks_raw_image['id'] )
		: 0;

	$uplifters_site_builder_blocks_caption = (
		isset( $uplifters_site_builder_blocks_raw_image['caption'] ) &&
		is_string( $uplifters_site_builder_blocks_raw_image['caption'] )
	)
		? $uplifters_site_builder_blocks_raw_image['caption']
		: '';

	$uplifters_site_builder_blocks_caption_size =
		uplifters_site_builder_blocks_image_interval_cover_normalize_caption_size(
			isset( $uplifters_site_builder_blocks_caption_style['size'] )
				? $uplifters_site_builder_blocks_caption_style['size']
				: 'large'
		);

	$uplifters_site_builder_blocks_caption_weight =
		uplifters_site_builder_blocks_image_interval_cover_normalize_caption_weight(
			isset( $uplifters_site_builder_blocks_caption_style['weight'] )
				? $uplifters_site_builder_blocks_caption_style['weight']
				: 'normal'
		);

	$uplifters_site_builder_blocks_caption_padding =
		uplifters_site_builder_blocks_image_interval_cover_normalize_padding(
			isset( $uplifters_site_builder_blocks_caption_style['padding'] )
				? $uplifters_site_builder_blocks_caption_style['padding']
				: '8px'
		);

	$uplifters_site_builder_blocks_caption_color = isset( $uplifters_site_builder_blocks_caption_style['color'] )
		? uplifters_site_builder_blocks_image_interval_cover_sanitize_color( $uplifters_site_builder_blocks_caption_style['color'] )
		: '#ffffff';

	if ( ! $uplifters_site_builder_blocks_caption_color ) {
		$uplifters_site_builder_blocks_caption_color = '#ffffff';
	}

	$uplifters_site_builder_blocks_caption_font_family = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack(
		isset( $uplifters_site_builder_blocks_caption_style['fontFamily'] ) ? $uplifters_site_builder_blocks_caption_style['fontFamily'] : 'inherit'
	);

	$uplifters_site_builder_blocks_images[] = array(
		'id'                  => $uplifters_site_builder_blocks_image_id,
		'url'                 => $uplifters_site_builder_blocks_image_url,
		'caption'             => $uplifters_site_builder_blocks_caption,
		'caption_size'        => $uplifters_site_builder_blocks_caption_size,
		'caption_weight'      => $uplifters_site_builder_blocks_caption_weight,
		'caption_padding'     => $uplifters_site_builder_blocks_caption_padding,
		'caption_color'       => $uplifters_site_builder_blocks_caption_color,
		'caption_font_family' => $uplifters_site_builder_blocks_caption_font_family,
	);
}

$uplifters_site_builder_blocks_legacy_desktop_columns = isset( $attributes['colsDesktop'] )
	? $attributes['colsDesktop']
	: 3;

$uplifters_site_builder_blocks_legacy_tablet_columns = isset( $attributes['colsTablet'] )
	? $attributes['colsTablet']
	: 2;

$uplifters_site_builder_blocks_legacy_mobile_columns = isset( $attributes['colsMobile'] )
	? $attributes['colsMobile']
	: 1;

/*
 * Desktop values.
 */
$uplifters_site_builder_blocks_desktop_height = uplifters_site_builder_blocks_image_interval_cover_clamp_integer(
	uplifters_site_builder_blocks_image_interval_cover_responsive_value(
		$attributes,
		'height',
		'desktop',
		500
	),
	200,
	1000,
	500
);

$uplifters_site_builder_blocks_desktop_duration = uplifters_site_builder_blocks_image_interval_cover_clamp_integer(
	uplifters_site_builder_blocks_image_interval_cover_responsive_value(
		$attributes,
		'duration',
		'desktop',
		3000
	),
	1000,
	10000,
	3000
);

$uplifters_site_builder_blocks_desktop_columns = uplifters_site_builder_blocks_image_interval_cover_clamp_integer(
	uplifters_site_builder_blocks_image_interval_cover_responsive_value(
		$attributes,
		'columns',
		'desktop',
		$uplifters_site_builder_blocks_legacy_desktop_columns
	),
	1,
	6,
	3
);

$uplifters_site_builder_blocks_desktop_indicator_color =
	uplifters_site_builder_blocks_image_interval_cover_sanitize_color(
		uplifters_site_builder_blocks_image_interval_cover_responsive_value(
			$attributes,
			'indicatorColor',
			'desktop',
			'#ffffff'
		)
	);

if ( '' === $uplifters_site_builder_blocks_desktop_indicator_color ) {
	$uplifters_site_builder_blocks_desktop_indicator_color = '#ffffff';
}

$uplifters_site_builder_blocks_desktop_background_color =
	uplifters_site_builder_blocks_image_interval_cover_sanitize_color(
		uplifters_site_builder_blocks_image_interval_cover_responsive_value(
			$attributes,
			'backgroundColor',
			'desktop',
			''
		)
	);

/*
 * Tablet values.
 */
$uplifters_site_builder_blocks_tablet_height = uplifters_site_builder_blocks_image_interval_cover_clamp_integer(
	uplifters_site_builder_blocks_image_interval_cover_responsive_value(
		$attributes,
		'height',
		'tablet',
		$uplifters_site_builder_blocks_desktop_height
	),
	200,
	1000,
	$uplifters_site_builder_blocks_desktop_height
);

$uplifters_site_builder_blocks_tablet_duration = uplifters_site_builder_blocks_image_interval_cover_clamp_integer(
	uplifters_site_builder_blocks_image_interval_cover_responsive_value(
		$attributes,
		'duration',
		'tablet',
		$uplifters_site_builder_blocks_desktop_duration
	),
	1000,
	10000,
	$uplifters_site_builder_blocks_desktop_duration
);

$uplifters_site_builder_blocks_tablet_columns = uplifters_site_builder_blocks_image_interval_cover_clamp_integer(
	uplifters_site_builder_blocks_image_interval_cover_responsive_value(
		$attributes,
		'columns',
		'tablet',
		$uplifters_site_builder_blocks_legacy_tablet_columns
	),
	1,
	6,
	2
);

$uplifters_site_builder_blocks_tablet_indicator_color =
	uplifters_site_builder_blocks_image_interval_cover_sanitize_color(
		uplifters_site_builder_blocks_image_interval_cover_responsive_value(
			$attributes,
			'indicatorColor',
			'tablet',
			$uplifters_site_builder_blocks_desktop_indicator_color
		)
	);

if ( '' === $uplifters_site_builder_blocks_tablet_indicator_color ) {
	$uplifters_site_builder_blocks_tablet_indicator_color =
		$uplifters_site_builder_blocks_desktop_indicator_color;
}

$uplifters_site_builder_blocks_tablet_background_color =
	uplifters_site_builder_blocks_image_interval_cover_sanitize_color(
		uplifters_site_builder_blocks_image_interval_cover_responsive_value(
			$attributes,
			'backgroundColor',
			'tablet',
			$uplifters_site_builder_blocks_desktop_background_color
		)
	);

/*
 * Mobile values.
 */
$uplifters_site_builder_blocks_mobile_height = uplifters_site_builder_blocks_image_interval_cover_clamp_integer(
	uplifters_site_builder_blocks_image_interval_cover_responsive_value(
		$attributes,
		'height',
		'mobile',
		$uplifters_site_builder_blocks_desktop_height
	),
	200,
	1000,
	$uplifters_site_builder_blocks_desktop_height
);

$uplifters_site_builder_blocks_mobile_duration = uplifters_site_builder_blocks_image_interval_cover_clamp_integer(
	uplifters_site_builder_blocks_image_interval_cover_responsive_value(
		$attributes,
		'duration',
		'mobile',
		$uplifters_site_builder_blocks_desktop_duration
	),
	1000,
	10000,
	$uplifters_site_builder_blocks_desktop_duration
);

$uplifters_site_builder_blocks_mobile_columns = uplifters_site_builder_blocks_image_interval_cover_clamp_integer(
	uplifters_site_builder_blocks_image_interval_cover_responsive_value(
		$attributes,
		'columns',
		'mobile',
		$uplifters_site_builder_blocks_legacy_mobile_columns
	),
	1,
	6,
	1
);

$uplifters_site_builder_blocks_mobile_indicator_color =
	uplifters_site_builder_blocks_image_interval_cover_sanitize_color(
		uplifters_site_builder_blocks_image_interval_cover_responsive_value(
			$attributes,
			'indicatorColor',
			'mobile',
			$uplifters_site_builder_blocks_desktop_indicator_color
		)
	);

if ( '' === $uplifters_site_builder_blocks_mobile_indicator_color ) {
	$uplifters_site_builder_blocks_mobile_indicator_color =
		$uplifters_site_builder_blocks_desktop_indicator_color;
}

$uplifters_site_builder_blocks_mobile_background_color =
	uplifters_site_builder_blocks_image_interval_cover_sanitize_color(
		uplifters_site_builder_blocks_image_interval_cover_responsive_value(
			$attributes,
			'backgroundColor',
			'mobile',
			$uplifters_site_builder_blocks_desktop_background_color
		)
	);

$uplifters_site_builder_blocks_desktop_inactive_indicator =
	uplifters_site_builder_blocks_image_interval_cover_hex_to_rgba(
		$uplifters_site_builder_blocks_desktop_indicator_color,
		0.45
	);

$uplifters_site_builder_blocks_tablet_inactive_indicator =
	uplifters_site_builder_blocks_image_interval_cover_hex_to_rgba(
		$uplifters_site_builder_blocks_tablet_indicator_color,
		0.45
	);

$uplifters_site_builder_blocks_mobile_inactive_indicator =
	uplifters_site_builder_blocks_image_interval_cover_hex_to_rgba(
		$uplifters_site_builder_blocks_mobile_indicator_color,
		0.45
	);

$uplifters_site_builder_blocks_unique_id = wp_unique_id(
	'uplifters-site-builder-blocks-image-interval-cover-'
);

$uplifters_site_builder_blocks_wrapper_attributes =
	get_block_wrapper_attributes(
		array(
			'id'               => $uplifters_site_builder_blocks_unique_id,
			'class'            => 'uplifters-site-builder-blocks-image-interval-cover',
			'data-slide-count' => (string) count( $uplifters_site_builder_blocks_images ),
		)
	);

$uplifters_site_builder_blocks_selector = '#' . $uplifters_site_builder_blocks_unique_id;

$uplifters_site_builder_blocks_dynamic_css = '';

$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . '{';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-interval-cover-height:' . $uplifters_site_builder_blocks_desktop_height . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-interval-cover-duration:' . $uplifters_site_builder_blocks_desktop_duration . ';';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-interval-cover-columns:' . $uplifters_site_builder_blocks_desktop_columns . ';';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-interval-cover-dot-active:' . $uplifters_site_builder_blocks_desktop_indicator_color . ';';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-interval-cover-dot-inactive:' . $uplifters_site_builder_blocks_desktop_inactive_indicator . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' .
	(
		'' !== $uplifters_site_builder_blocks_desktop_background_color
			? $uplifters_site_builder_blocks_desktop_background_color
			: 'transparent'
	) .
	';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:1024px){';
$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . '{';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-interval-cover-height:' . $uplifters_site_builder_blocks_tablet_height . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-interval-cover-duration:' . $uplifters_site_builder_blocks_tablet_duration . ';';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-interval-cover-columns:' . $uplifters_site_builder_blocks_tablet_columns . ';';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-interval-cover-dot-active:' . $uplifters_site_builder_blocks_tablet_indicator_color . ';';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-interval-cover-dot-inactive:' . $uplifters_site_builder_blocks_tablet_inactive_indicator . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' .
	(
		'' !== $uplifters_site_builder_blocks_tablet_background_color
			? $uplifters_site_builder_blocks_tablet_background_color
			: 'transparent'
	) .
	';';
$uplifters_site_builder_blocks_dynamic_css .= '}';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:767px){';
$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_selector . '{';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-interval-cover-height:' . $uplifters_site_builder_blocks_mobile_height . 'px;';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-interval-cover-duration:' . $uplifters_site_builder_blocks_mobile_duration . ';';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-interval-cover-columns:' . $uplifters_site_builder_blocks_mobile_columns . ';';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-interval-cover-dot-active:' . $uplifters_site_builder_blocks_mobile_indicator_color . ';';
$uplifters_site_builder_blocks_dynamic_css .= '--uplifters-site-builder-blocks-image-interval-cover-dot-inactive:' . $uplifters_site_builder_blocks_mobile_inactive_indicator . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' .
	(
		'' !== $uplifters_site_builder_blocks_mobile_background_color
			? $uplifters_site_builder_blocks_mobile_background_color
			: 'transparent'
	) .
	';';
$uplifters_site_builder_blocks_dynamic_css .= '}';
$uplifters_site_builder_blocks_dynamic_css .= '}';
?>

<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
	<?php ob_start(); ?>
		<?php
		echo wp_kses( wp_strip_all_tags( $uplifters_site_builder_blocks_dynamic_css ), array() );
		?>

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?> {
			position: relative;
			width: 100%;
			height: var(
				--uplifters-site-builder-blocks-image-interval-cover-height,
				500px
			);
			overflow: hidden;
			box-sizing: border-box;
		}

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?> *,
		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?> *::before,
		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?> *::after {
			box-sizing: border-box;
		}

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
		.uplifters-site-builder-blocks-image-interval-cover__empty {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			height: 100%;
			padding: 16px;
			color: rgba(0, 0, 0, 0.6);
			text-align: center;
		}

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
		.uplifters-site-builder-blocks-image-interval-cover__viewport {
			position: relative;
			width: 100%;
			height: 100%;
			overflow: hidden;
		}

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
		.uplifters-site-builder-blocks-image-interval-cover__track {
			display: flex;
			align-items: stretch;
			width: 100%;
			height: 100%;
			will-change: transform;
			transform: translate3d(0, 0, 0);
			transition: transform 0.6s ease;
		}

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
		.uplifters-site-builder-blocks-image-interval-cover__item {
			position: relative;
			flex:
				0 0
				calc(
					100% /
					var(
						--uplifters-site-builder-blocks-image-interval-cover-columns,
						1
					)
				);
			width:
				calc(
					100% /
					var(
						--uplifters-site-builder-blocks-image-interval-cover-columns,
						1
					)
				);
			height: 100%;
			overflow: hidden;
			border-radius: 16px;
		}

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
		.uplifters-site-builder-blocks-image-interval-cover__item--clone {
			pointer-events: none;
		}

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
		.uplifters-site-builder-blocks-image-interval-cover__image {
			display: block;
			width: 100%;
			height: 100%;
			max-width: none;
			object-fit: cover;
		}

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
		.uplifters-site-builder-blocks-image-interval-cover__placeholder {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			height: 100%;
			background: #d1d5db;
			color: #374151;
		}

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
		.uplifters-site-builder-blocks-image-interval-cover__caption-wrap {
			position: absolute;
			left: 50%;
			bottom: 52px;
			z-index: 4;
			width: 92%;
			text-align: center;
			text-shadow:
				0 2px 10px
				rgba(0, 0, 0, 0.35);
			transform: translateX(-50%);
			pointer-events: none;
		}

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
		.uplifters-site-builder-blocks-image-interval-cover__caption {
			margin: 0 auto;
		}

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
		.uplifters-site-builder-blocks-image-interval-cover__arrow {
			position: absolute;
			top: 50%;
			z-index: 10;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 44px;
			height: 44px;
			padding: 0;
			border: 0;
			border-radius: 9999px;
			color: #ffffff;
			background: rgba(0, 0, 0, 0.35);
			cursor: pointer;
			opacity: 0.85;
			transform: translateY(-50%);
			transition:
				background 0.15s ease,
				opacity 0.15s ease,
				transform 0.15s ease;
		}

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
		.uplifters-site-builder-blocks-image-interval-cover__arrow:hover {
			background: rgba(0, 0, 0, 0.55);
			opacity: 1;
		}

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
		.uplifters-site-builder-blocks-image-interval-cover__arrow:active {
			transform:
				translateY(-50%)
				scale(0.98);
		}

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
		.uplifters-site-builder-blocks-image-interval-cover__arrow:focus-visible,
		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
		.uplifters-site-builder-blocks-image-interval-cover__dot:focus-visible {
			outline:
				3px solid
				rgba(59, 130, 246, 0.9);
			outline-offset: 3px;
		}

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
		.uplifters-site-builder-blocks-image-interval-cover__arrow--previous {
			left: 10px;
		}

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
		.uplifters-site-builder-blocks-image-interval-cover__arrow--next {
			right: 10px;
		}

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
		.uplifters-site-builder-blocks-image-interval-cover__dots-wrap {
			position: absolute;
			left: 50%;
			bottom: 12px;
			z-index: 12;
			transform: translateX(-50%);
		}

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
		.uplifters-site-builder-blocks-image-interval-cover__dots {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8px;
		}

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
		.uplifters-site-builder-blocks-image-interval-cover__dot {
			width: 10px;
			height: 10px;
			padding: 0;
			border: 0;
			border-radius: 9999px;
			background:
				var(
					--uplifters-site-builder-blocks-image-interval-cover-dot-inactive,
					rgba(255, 255, 255, 0.45)
				);
			cursor: pointer;
			transition:
				transform 0.15s ease,
				background 0.15s ease;
		}

		#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
		.uplifters-site-builder-blocks-image-interval-cover__dot.is-active {
			background:
				var(
					--uplifters-site-builder-blocks-image-interval-cover-dot-active,
					#ffffff
				);
			transform: scale(1.15);
		}

		@media (prefers-reduced-motion: reduce) {
			#<?php echo esc_html( $uplifters_site_builder_blocks_unique_id ); ?>
			.uplifters-site-builder-blocks-image-interval-cover__track {
				transition: none;
			}
		}
	<?php $uplifters_site_builder_blocks_css = ob_get_clean(); \UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css ); ?>

	<?php if ( empty( $uplifters_site_builder_blocks_images ) ) : ?>
		<div class="uplifters-site-builder-blocks-image-interval-cover__empty">
			<?php esc_html_e( 'No images', 'uplifters-site-builder-blocks' ); ?>
		</div>
	<?php else : ?>
		<div class="uplifters-site-builder-blocks-image-interval-cover__viewport">
			<div class="uplifters-site-builder-blocks-image-interval-cover__track">
				<?php foreach ( $uplifters_site_builder_blocks_images as $uplifters_site_builder_blocks_index => $uplifters_site_builder_blocks_image ) : ?>
					<div
						class="uplifters-site-builder-blocks-image-interval-cover__item"
						data-slide-index="<?php echo esc_attr( $uplifters_site_builder_blocks_index ); ?>"
						aria-hidden="<?php echo esc_attr( 0 === $uplifters_site_builder_blocks_index ? 'false' : 'true' ); ?>"
					>
						<?php if ( $uplifters_site_builder_blocks_image['url'] ) : ?>
							<?php
							$uplifters_site_builder_blocks_image_alt = '';

							if ( $uplifters_site_builder_blocks_image['id'] ) {
								$uplifters_site_builder_blocks_stored_alt = get_post_meta(
									$uplifters_site_builder_blocks_image['id'],
									'_wp_attachment_image_alt',
									true
								);

								if ( is_string( $uplifters_site_builder_blocks_stored_alt ) ) {
									$uplifters_site_builder_blocks_image_alt = $uplifters_site_builder_blocks_stored_alt;
								}
							}

							if (
								! $uplifters_site_builder_blocks_image_alt &&
								$uplifters_site_builder_blocks_image['caption']
							) {
								$uplifters_site_builder_blocks_image_alt =
									wp_strip_all_tags(
										$uplifters_site_builder_blocks_image['caption']
									);
							}
							?>

							<img
								class="uplifters-site-builder-blocks-image-interval-cover__image"
								src="<?php echo esc_url( $uplifters_site_builder_blocks_image['url'] ); ?>"
								alt="<?php echo esc_attr( $uplifters_site_builder_blocks_image_alt ); ?>"
								loading="<?php echo esc_attr( 0 === $uplifters_site_builder_blocks_index ? 'eager' : 'lazy' ); ?>"
								decoding="async"
							/>
						<?php else : ?>
							<div class="uplifters-site-builder-blocks-image-interval-cover__placeholder">
								<?php esc_html_e( 'No Image', 'uplifters-site-builder-blocks' ); ?>
							</div>
						<?php endif; ?>

						<?php if ( $uplifters_site_builder_blocks_image['caption'] ) : ?>
							<?php
							$uplifters_site_builder_blocks_caption_style = sprintf(
								'color:%1$s;padding:%2$s;font-size:%3$s;font-weight:%4$d;font-family:%5$s',
								$uplifters_site_builder_blocks_image['caption_color'],
								$uplifters_site_builder_blocks_image['caption_padding'],
								uplifters_site_builder_blocks_image_interval_cover_caption_font_size(
									$uplifters_site_builder_blocks_image['caption_size']
								),
								uplifters_site_builder_blocks_image_interval_cover_caption_font_weight(
									$uplifters_site_builder_blocks_image['caption_weight']
								),
								$uplifters_site_builder_blocks_image['caption_font_family'] ?: 'inherit'
							);
							?>

							<div class="uplifters-site-builder-blocks-image-interval-cover__caption-wrap">
								<div
									class="uplifters-site-builder-blocks-image-interval-cover__caption"
									style="<?php echo esc_attr( $uplifters_site_builder_blocks_caption_style ); ?>"
								>
									<?php
									echo wp_kses_post(
										nl2br(
											esc_html(
												$uplifters_site_builder_blocks_image['caption']
											)
										)
									);
									?>
								</div>
							</div>
						<?php endif; ?>
					</div>
				<?php endforeach; ?>
			</div>

			<?php if ( count( $uplifters_site_builder_blocks_images ) > 1 ) : ?>
				<button
					type="button"
					class="uplifters-site-builder-blocks-image-interval-cover__arrow uplifters-site-builder-blocks-image-interval-cover__arrow--previous"
					aria-label="<?php esc_attr_e( 'Previous', 'uplifters-site-builder-blocks' ); ?>"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						aria-hidden="true"
						focusable="false"
					>
						<path
							d="M15 19l-7-7 7-7"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>

				<button
					type="button"
					class="uplifters-site-builder-blocks-image-interval-cover__arrow uplifters-site-builder-blocks-image-interval-cover__arrow--next"
					aria-label="<?php esc_attr_e( 'Next', 'uplifters-site-builder-blocks' ); ?>"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						aria-hidden="true"
						focusable="false"
					>
						<path
							d="M9 5l7 7-7 7"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>

				<div class="uplifters-site-builder-blocks-image-interval-cover__dots-wrap">
					<div class="uplifters-site-builder-blocks-image-interval-cover__dots">
						<?php foreach ( $uplifters_site_builder_blocks_images as $uplifters_site_builder_blocks_index => $uplifters_site_builder_blocks_image ) : ?>
							<button
								type="button"
								class="uplifters-site-builder-blocks-image-interval-cover__dot<?php echo esc_attr( 0 === $uplifters_site_builder_blocks_index ? ' is-active' : '' ); ?>"
								data-slide-to="<?php echo esc_attr( $uplifters_site_builder_blocks_index ); ?>"
								aria-label="<?php
								echo esc_attr(
									sprintf(
										/* translators: %d: slide number. */
										__( 'Go to slide %d', 'uplifters-site-builder-blocks' ),
										$uplifters_site_builder_blocks_index + 1
									)
								);
								?>"
								aria-current="<?php echo esc_attr( 0 === $uplifters_site_builder_blocks_index ? 'true' : 'false' ); ?>"
							></button>
						<?php endforeach; ?>
					</div>
				</div>
			<?php endif; ?>
		</div>

	<?php endif; ?>
</div>
