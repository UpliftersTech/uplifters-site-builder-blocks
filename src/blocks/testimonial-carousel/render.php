<?php
/**
 * Server-side render for the UpliftersSiteBuilderBlocks Testimonial Carousel block.
 *
 * @param array $attributes Block attributes.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_testimonial_carousel_clamp' ) ) {
	function uplifters_site_builder_blocks_testimonial_carousel_clamp( $number, $min, $max ) {
		$number = is_numeric( $number ) ? (float) $number : (float) $min;
		return max( $min, min( $max, $number ) );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_testimonial_carousel_responsive_value' ) ) {
	function uplifters_site_builder_blocks_testimonial_carousel_responsive_value( array $attributes, string $key, string $device, $fallback = '' ) {
		if ( ! isset( $attributes[ $key ] ) ) {
			return $fallback;
		}

		$value = $attributes[ $key ];

		if ( is_array( $value ) ) {
			if ( array_key_exists( $device, $value ) && '' !== $value[ $device ] && null !== $value[ $device ] ) {
				return $value[ $device ];
			}

			foreach ( array( 'desktop', 'tablet', 'mobile' ) as $fallback_device ) {
				if ( array_key_exists( $fallback_device, $value ) && '' !== $value[ $fallback_device ] && null !== $value[ $fallback_device ] ) {
					return $value[ $fallback_device ];
				}
			}
		}

		if ( ! is_array( $value ) && '' !== $value && null !== $value ) {
			return $value;
		}

		return $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_testimonial_carousel_responsive_box_value' ) ) {
	function uplifters_site_builder_blocks_testimonial_carousel_responsive_box_value( array $attributes, string $key, string $device ) {
		$empty = array(
			'top'    => '',
			'right'  => '',
			'bottom' => '',
			'left'   => '',
		);

		if ( empty( $attributes[ $key ] ) || ! is_array( $attributes[ $key ] ) ) {
			return $empty;
		}

		$value  = $attributes[ $key ];
		$branch = null;

		if ( isset( $value[ $device ] ) && is_array( $value[ $device ] ) ) {
			$branch = $value[ $device ];
		} elseif ( isset( $value['desktop'] ) && is_array( $value['desktop'] ) ) {
			$branch = $value['desktop'];
		} elseif ( isset( $value['tablet'] ) && is_array( $value['tablet'] ) ) {
			$branch = $value['tablet'];
		} elseif ( isset( $value['mobile'] ) && is_array( $value['mobile'] ) ) {
			$branch = $value['mobile'];
		} elseif ( isset( $value['top'] ) || isset( $value['right'] ) || isset( $value['bottom'] ) || isset( $value['left'] ) ) {
			$branch = $value;
		}

		return is_array( $branch ) ? array_merge( $empty, $branch ) : $empty;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_testimonial_carousel_box_to_css' ) ) {
	function uplifters_site_builder_blocks_testimonial_carousel_box_to_css( string $prefix, array $box ) {
		$map = array(
			'top'    => 'top',
			'right'  => 'right',
			'bottom' => 'bottom',
			'left'   => 'left',
		);

		$css = '';

		foreach ( $map as $key => $suffix ) {
			$value = isset( $box[ $key ] ) ? trim( (string) $box[ $key ] ) : '';

			if ( '' !== $value ) {
				$css .= $prefix . '-' . $suffix . ':' . esc_attr( wp_strip_all_tags( $value ) ) . ';';
			}
		}

		return $css;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_testimonial_carousel_safe_color' ) ) {
	function uplifters_site_builder_blocks_testimonial_carousel_safe_color( $color ) {
		$color = is_string( $color ) ? trim( $color ) : '';

		if ( '' === $color ) {
			return '';
		}

		$safe = safecss_filter_attr( 'color:' . $color );

		if ( '' === $safe ) {
			return '';
		}

		return trim( (string) preg_replace( '/^color\s*:\s*/i', '', $safe ) );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_testimonial_carousel_font_stack' ) ) {
	/**
	 * Resolves a font key to a CSS stack. A "default" or unknown key yields an
	 * empty string so the caller can cascade to the next fallback instead of
	 * emitting `inherit`, which would break the desktop -> tablet -> mobile chain.
	 *
	 * @param mixed $key Font family key from the block attributes.
	 * @return string CSS font-family stack, or empty string.
	 */
	function uplifters_site_builder_blocks_testimonial_carousel_font_stack( $key ) {
		$key = is_string( $key ) ? trim( $key ) : '';

		if ( '' === $key || 'default' === $key ) {
			return '';
		}

		$stack = \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $key );

		return is_string( $stack ) ? trim( $stack ) : '';
	}
}

$uplifters_site_builder_blocks_items = isset( $attributes['items'] ) && is_array( $attributes['items'] ) ? $attributes['items'] : array();

$uplifters_site_builder_blocks_autoplay       = isset( $attributes['autoplay'] ) ? (bool) $attributes['autoplay'] : true;
$uplifters_site_builder_blocks_pause_on_hover = isset( $attributes['pauseOnHover'] ) ? (bool) $attributes['pauseOnHover'] : true;
$uplifters_site_builder_blocks_interval       = isset( $attributes['interval'] ) ? absint( $attributes['interval'] ) : 3500;
$uplifters_site_builder_blocks_speed          = isset( $attributes['speed'] ) ? absint( $attributes['speed'] ) : 650;
$uplifters_site_builder_blocks_show_arrows    = isset( $attributes['showArrows'] ) ? (bool) $attributes['showArrows'] : true;
$uplifters_site_builder_blocks_show_dots      = isset( $attributes['showDots'] ) ? (bool) $attributes['showDots'] : true;

$uplifters_site_builder_blocks_safe_items = array_values( array_filter( $uplifters_site_builder_blocks_items, 'is_array' ) );

if ( empty( $uplifters_site_builder_blocks_safe_items ) ) {
	$uplifters_site_builder_blocks_safe_items = array(
		array(
			'imageId'     => 0,
			'imageUrl'    => '',
			'imageAlt'    => '',
			'name'        => '',
			'designation' => '',
			'text'        => '',
		),
	);
}

$uplifters_site_builder_blocks_display_count_desktop = (int) uplifters_site_builder_blocks_testimonial_carousel_clamp( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'displayCount', 'desktop', 1 ), 1, max( count( $uplifters_site_builder_blocks_safe_items ), 1 ) );
$uplifters_site_builder_blocks_display_count_tablet  = (int) uplifters_site_builder_blocks_testimonial_carousel_clamp( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'displayCount', 'tablet', $uplifters_site_builder_blocks_display_count_desktop ), 1, max( count( $uplifters_site_builder_blocks_safe_items ), 1 ) );
$uplifters_site_builder_blocks_display_count_mobile  = (int) uplifters_site_builder_blocks_testimonial_carousel_clamp( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'displayCount', 'mobile', $uplifters_site_builder_blocks_display_count_desktop ), 1, max( count( $uplifters_site_builder_blocks_safe_items ), 1 ) );

$uplifters_site_builder_blocks_image_width_desktop = (int) uplifters_site_builder_blocks_testimonial_carousel_clamp( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'imageWidth', 'desktop', 64 ), 24, 240 );
$uplifters_site_builder_blocks_image_width_tablet  = (int) uplifters_site_builder_blocks_testimonial_carousel_clamp( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'imageWidth', 'tablet', $uplifters_site_builder_blocks_image_width_desktop ), 24, 240 );
$uplifters_site_builder_blocks_image_width_mobile  = (int) uplifters_site_builder_blocks_testimonial_carousel_clamp( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'imageWidth', 'mobile', $uplifters_site_builder_blocks_image_width_desktop ), 24, 240 );

$uplifters_site_builder_blocks_image_height_desktop = (int) uplifters_site_builder_blocks_testimonial_carousel_clamp( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'imageHeight', 'desktop', 64 ), 24, 240 );
$uplifters_site_builder_blocks_image_height_tablet  = (int) uplifters_site_builder_blocks_testimonial_carousel_clamp( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'imageHeight', 'tablet', $uplifters_site_builder_blocks_image_height_desktop ), 24, 240 );
$uplifters_site_builder_blocks_image_height_mobile  = (int) uplifters_site_builder_blocks_testimonial_carousel_clamp( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'imageHeight', 'mobile', $uplifters_site_builder_blocks_image_height_desktop ), 24, 240 );

$uplifters_site_builder_blocks_gap_desktop = (int) uplifters_site_builder_blocks_testimonial_carousel_clamp( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'gap', 'desktop', 16 ), 0, 64 );
$uplifters_site_builder_blocks_gap_tablet  = (int) uplifters_site_builder_blocks_testimonial_carousel_clamp( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'gap', 'tablet', $uplifters_site_builder_blocks_gap_desktop ), 0, 64 );
$uplifters_site_builder_blocks_gap_mobile  = (int) uplifters_site_builder_blocks_testimonial_carousel_clamp( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'gap', 'mobile', $uplifters_site_builder_blocks_gap_desktop ), 0, 64 );

$uplifters_site_builder_blocks_per_view_desktop = (int) uplifters_site_builder_blocks_testimonial_carousel_clamp( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'perView', 'desktop', isset( $attributes['perViewDesktop'] ) ? absint( $attributes['perViewDesktop'] ) : 3 ), 1, 6 );
$uplifters_site_builder_blocks_per_view_tablet  = (int) uplifters_site_builder_blocks_testimonial_carousel_clamp( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'perView', 'tablet', isset( $attributes['perViewTablet'] ) ? absint( $attributes['perViewTablet'] ) : 2 ), 1, 4 );
$uplifters_site_builder_blocks_per_view_mobile  = (int) uplifters_site_builder_blocks_testimonial_carousel_clamp( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'perView', 'mobile', isset( $attributes['perViewMobile'] ) ? absint( $attributes['perViewMobile'] ) : 1 ), 1, 2 );

$uplifters_site_builder_blocks_min_card_desktop = (int) uplifters_site_builder_blocks_testimonial_carousel_clamp( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'minCardWidth', 'desktop', 280 ), 180, 520 );
$uplifters_site_builder_blocks_min_card_tablet  = (int) uplifters_site_builder_blocks_testimonial_carousel_clamp( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'minCardWidth', 'tablet', $uplifters_site_builder_blocks_min_card_desktop ), 180, 520 );
$uplifters_site_builder_blocks_min_card_mobile  = (int) uplifters_site_builder_blocks_testimonial_carousel_clamp( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'minCardWidth', 'mobile', $uplifters_site_builder_blocks_min_card_desktop ), 180, 520 );

$uplifters_site_builder_blocks_font_family_key_desktop = uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'fontFamily', 'desktop', 'default' );
$uplifters_site_builder_blocks_font_family_key_tablet  = uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'fontFamily', 'tablet', 'default' );
$uplifters_site_builder_blocks_font_family_key_mobile  = uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'fontFamily', 'mobile', 'default' );

$uplifters_site_builder_blocks_font_family_desktop = uplifters_site_builder_blocks_testimonial_carousel_font_stack( $uplifters_site_builder_blocks_font_family_key_desktop );
$uplifters_site_builder_blocks_font_family_tablet  = uplifters_site_builder_blocks_testimonial_carousel_font_stack( $uplifters_site_builder_blocks_font_family_key_tablet );
$uplifters_site_builder_blocks_font_family_mobile  = uplifters_site_builder_blocks_testimonial_carousel_font_stack( $uplifters_site_builder_blocks_font_family_key_mobile );

$uplifters_site_builder_blocks_font_family_desktop = '' !== $uplifters_site_builder_blocks_font_family_desktop ? $uplifters_site_builder_blocks_font_family_desktop : 'inherit';
$uplifters_site_builder_blocks_font_family_tablet  = '' !== $uplifters_site_builder_blocks_font_family_tablet ? $uplifters_site_builder_blocks_font_family_tablet : $uplifters_site_builder_blocks_font_family_desktop;
$uplifters_site_builder_blocks_font_family_mobile  = '' !== $uplifters_site_builder_blocks_font_family_mobile ? $uplifters_site_builder_blocks_font_family_mobile : $uplifters_site_builder_blocks_font_family_tablet;

$uplifters_site_builder_blocks_name_font_family_key_desktop = uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'nameFontFamily', 'desktop', 'default' );
$uplifters_site_builder_blocks_name_font_family_key_tablet  = uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'nameFontFamily', 'tablet', 'default' );
$uplifters_site_builder_blocks_name_font_family_key_mobile  = uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'nameFontFamily', 'mobile', 'default' );

$uplifters_site_builder_blocks_name_font_family_desktop = uplifters_site_builder_blocks_testimonial_carousel_font_stack( $uplifters_site_builder_blocks_name_font_family_key_desktop );
$uplifters_site_builder_blocks_name_font_family_tablet  = uplifters_site_builder_blocks_testimonial_carousel_font_stack( $uplifters_site_builder_blocks_name_font_family_key_tablet );
$uplifters_site_builder_blocks_name_font_family_mobile  = uplifters_site_builder_blocks_testimonial_carousel_font_stack( $uplifters_site_builder_blocks_name_font_family_key_mobile );

$uplifters_site_builder_blocks_name_font_family_desktop = '' !== $uplifters_site_builder_blocks_name_font_family_desktop ? $uplifters_site_builder_blocks_name_font_family_desktop : $uplifters_site_builder_blocks_font_family_desktop;
$uplifters_site_builder_blocks_name_font_family_tablet  = '' !== $uplifters_site_builder_blocks_name_font_family_tablet ? $uplifters_site_builder_blocks_name_font_family_tablet : $uplifters_site_builder_blocks_font_family_tablet;
$uplifters_site_builder_blocks_name_font_family_mobile  = '' !== $uplifters_site_builder_blocks_name_font_family_mobile ? $uplifters_site_builder_blocks_name_font_family_mobile : $uplifters_site_builder_blocks_font_family_mobile;

$uplifters_site_builder_blocks_designation_font_family_key_desktop = uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'designationFontFamily', 'desktop', 'default' );
$uplifters_site_builder_blocks_designation_font_family_key_tablet  = uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'designationFontFamily', 'tablet', 'default' );
$uplifters_site_builder_blocks_designation_font_family_key_mobile  = uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'designationFontFamily', 'mobile', 'default' );

$uplifters_site_builder_blocks_designation_font_family_desktop = uplifters_site_builder_blocks_testimonial_carousel_font_stack( $uplifters_site_builder_blocks_designation_font_family_key_desktop );
$uplifters_site_builder_blocks_designation_font_family_tablet  = uplifters_site_builder_blocks_testimonial_carousel_font_stack( $uplifters_site_builder_blocks_designation_font_family_key_tablet );
$uplifters_site_builder_blocks_designation_font_family_mobile  = uplifters_site_builder_blocks_testimonial_carousel_font_stack( $uplifters_site_builder_blocks_designation_font_family_key_mobile );

$uplifters_site_builder_blocks_designation_font_family_desktop = '' !== $uplifters_site_builder_blocks_designation_font_family_desktop ? $uplifters_site_builder_blocks_designation_font_family_desktop : $uplifters_site_builder_blocks_font_family_desktop;
$uplifters_site_builder_blocks_designation_font_family_tablet  = '' !== $uplifters_site_builder_blocks_designation_font_family_tablet ? $uplifters_site_builder_blocks_designation_font_family_tablet : $uplifters_site_builder_blocks_font_family_tablet;
$uplifters_site_builder_blocks_designation_font_family_mobile  = '' !== $uplifters_site_builder_blocks_designation_font_family_mobile ? $uplifters_site_builder_blocks_designation_font_family_mobile : $uplifters_site_builder_blocks_font_family_mobile;

$uplifters_site_builder_blocks_text_color_desktop = uplifters_site_builder_blocks_testimonial_carousel_safe_color( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'textColor', 'desktop', '' ) );
$uplifters_site_builder_blocks_text_color_tablet  = uplifters_site_builder_blocks_testimonial_carousel_safe_color( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'textColor', 'tablet', $uplifters_site_builder_blocks_text_color_desktop ) );
$uplifters_site_builder_blocks_text_color_mobile  = uplifters_site_builder_blocks_testimonial_carousel_safe_color( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'textColor', 'mobile', $uplifters_site_builder_blocks_text_color_desktop ) );

$uplifters_site_builder_blocks_background_color_desktop = uplifters_site_builder_blocks_testimonial_carousel_safe_color( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'backgroundColor', 'desktop', '' ) );
$uplifters_site_builder_blocks_background_color_tablet  = uplifters_site_builder_blocks_testimonial_carousel_safe_color( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'backgroundColor', 'tablet', $uplifters_site_builder_blocks_background_color_desktop ) );
$uplifters_site_builder_blocks_background_color_mobile  = uplifters_site_builder_blocks_testimonial_carousel_safe_color( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'backgroundColor', 'mobile', $uplifters_site_builder_blocks_background_color_desktop ) );

$uplifters_site_builder_blocks_font_size_desktop = uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'fontSize', 'desktop', '' );
$uplifters_site_builder_blocks_font_size_tablet  = uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'fontSize', 'tablet', $uplifters_site_builder_blocks_font_size_desktop );
$uplifters_site_builder_blocks_font_size_mobile  = uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'fontSize', 'mobile', $uplifters_site_builder_blocks_font_size_desktop );

$uplifters_site_builder_blocks_line_height_desktop = uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'lineHeight', 'desktop', '' );
$uplifters_site_builder_blocks_line_height_tablet  = uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'lineHeight', 'tablet', $uplifters_site_builder_blocks_line_height_desktop );
$uplifters_site_builder_blocks_line_height_mobile  = uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'lineHeight', 'mobile', $uplifters_site_builder_blocks_line_height_desktop );

$uplifters_site_builder_blocks_is_italic_desktop = (bool) uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'isItalic', 'desktop', false );
$uplifters_site_builder_blocks_is_italic_tablet  = (bool) uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'isItalic', 'tablet', $uplifters_site_builder_blocks_is_italic_desktop );
$uplifters_site_builder_blocks_is_italic_mobile  = (bool) uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'isItalic', 'mobile', $uplifters_site_builder_blocks_is_italic_desktop );

$uplifters_site_builder_blocks_font_weight_desktop = sanitize_text_field( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'fontWeight', 'desktop', '400' ) );
$uplifters_site_builder_blocks_font_weight_tablet  = sanitize_text_field( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'fontWeight', 'tablet', $uplifters_site_builder_blocks_font_weight_desktop ) );
$uplifters_site_builder_blocks_font_weight_mobile  = sanitize_text_field( uplifters_site_builder_blocks_testimonial_carousel_responsive_value( $attributes, 'fontWeight', 'mobile', $uplifters_site_builder_blocks_font_weight_desktop ) );

$uplifters_site_builder_blocks_padding_desktop = uplifters_site_builder_blocks_testimonial_carousel_responsive_box_value( $attributes, 'padding', 'desktop' );
$uplifters_site_builder_blocks_padding_tablet  = uplifters_site_builder_blocks_testimonial_carousel_responsive_box_value( $attributes, 'padding', 'tablet' );
$uplifters_site_builder_blocks_padding_mobile  = uplifters_site_builder_blocks_testimonial_carousel_responsive_box_value( $attributes, 'padding', 'mobile' );

$uplifters_site_builder_blocks_margin_desktop = uplifters_site_builder_blocks_testimonial_carousel_responsive_box_value( $attributes, 'margin', 'desktop' );
$uplifters_site_builder_blocks_margin_tablet  = uplifters_site_builder_blocks_testimonial_carousel_responsive_box_value( $attributes, 'margin', 'tablet' );
$uplifters_site_builder_blocks_margin_mobile  = uplifters_site_builder_blocks_testimonial_carousel_responsive_box_value( $attributes, 'margin', 'mobile' );

$uplifters_site_builder_blocks_safe_interval = (int) uplifters_site_builder_blocks_testimonial_carousel_clamp( $uplifters_site_builder_blocks_interval ? $uplifters_site_builder_blocks_interval : 3500, 1000, 15000 );
$uplifters_site_builder_blocks_safe_speed    = (int) uplifters_site_builder_blocks_testimonial_carousel_clamp( $uplifters_site_builder_blocks_speed ? $uplifters_site_builder_blocks_speed : 650, 150, 2000 );
$uplifters_site_builder_blocks_max_display   = max( $uplifters_site_builder_blocks_display_count_desktop, $uplifters_site_builder_blocks_display_count_tablet, $uplifters_site_builder_blocks_display_count_mobile );
$uplifters_site_builder_blocks_visible_items  = array_slice( $uplifters_site_builder_blocks_safe_items, 0, $uplifters_site_builder_blocks_max_display );
$uplifters_site_builder_blocks_unique_id     = wp_unique_id( 'uplifters-site-builder-blocks-testimonial-carousel-' );

$uplifters_site_builder_blocks_dynamic_css  = '';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'border:1px solid #e5e7eb;';
$uplifters_site_builder_blocks_dynamic_css .= 'border-radius:16px;';
$uplifters_site_builder_blocks_dynamic_css .= 'box-shadow:0 1px 2px rgba(0,0,0,.04);';
$uplifters_site_builder_blocks_dynamic_css .= 'box-sizing:border-box;';
$uplifters_site_builder_blocks_dynamic_css .= 'font-family:' . $uplifters_site_builder_blocks_font_family_desktop . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'font-style:' . ( $uplifters_site_builder_blocks_is_italic_desktop ? 'italic' : 'normal' ) . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'font-weight:' . $uplifters_site_builder_blocks_font_weight_desktop . ';';
$uplifters_site_builder_blocks_dynamic_css .= uplifters_site_builder_blocks_testimonial_carousel_box_to_css( 'padding', $uplifters_site_builder_blocks_padding_desktop );
$uplifters_site_builder_blocks_dynamic_css .= uplifters_site_builder_blocks_testimonial_carousel_box_to_css( 'margin', $uplifters_site_builder_blocks_margin_desktop );

if ( $uplifters_site_builder_blocks_text_color_desktop ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'color:' . $uplifters_site_builder_blocks_text_color_desktop . ';';
}

if ( $uplifters_site_builder_blocks_background_color_desktop ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' . $uplifters_site_builder_blocks_background_color_desktop . ';';
}

if ( is_numeric( $uplifters_site_builder_blocks_font_size_desktop ) ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'font-size:' . (float) $uplifters_site_builder_blocks_font_size_desktop . 'px;';
}

if ( is_numeric( $uplifters_site_builder_blocks_line_height_desktop ) ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'line-height:' . (float) $uplifters_site_builder_blocks_line_height_desktop . ';';
}

$uplifters_site_builder_blocks_dynamic_css .= '}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-testimonial-carousel-slider__track{gap:' . $uplifters_site_builder_blocks_gap_desktop . 'px;}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-testimonial-carousel__avatar{width:' . $uplifters_site_builder_blocks_image_width_desktop . 'px;height:' . $uplifters_site_builder_blocks_image_height_desktop . 'px;}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-testimonial-carousel__name{font-family:' . $uplifters_site_builder_blocks_name_font_family_desktop . ';}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-testimonial-carousel__designation{font-family:' . $uplifters_site_builder_blocks_designation_font_family_desktop . ';}';

$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:1024px){';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'font-family:' . $uplifters_site_builder_blocks_font_family_tablet . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'font-style:' . ( $uplifters_site_builder_blocks_is_italic_tablet ? 'italic' : 'normal' ) . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'font-weight:' . $uplifters_site_builder_blocks_font_weight_tablet . ';';
$uplifters_site_builder_blocks_dynamic_css .= uplifters_site_builder_blocks_testimonial_carousel_box_to_css( 'padding', $uplifters_site_builder_blocks_padding_tablet );
$uplifters_site_builder_blocks_dynamic_css .= uplifters_site_builder_blocks_testimonial_carousel_box_to_css( 'margin', $uplifters_site_builder_blocks_margin_tablet );
if ( $uplifters_site_builder_blocks_text_color_tablet ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'color:' . $uplifters_site_builder_blocks_text_color_tablet . ';';
}
if ( $uplifters_site_builder_blocks_background_color_tablet ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' . $uplifters_site_builder_blocks_background_color_tablet . ';';
}
if ( is_numeric( $uplifters_site_builder_blocks_font_size_tablet ) ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'font-size:' . (float) $uplifters_site_builder_blocks_font_size_tablet . 'px;';
}
if ( is_numeric( $uplifters_site_builder_blocks_line_height_tablet ) ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'line-height:' . (float) $uplifters_site_builder_blocks_line_height_tablet . ';';
}
$uplifters_site_builder_blocks_dynamic_css .= '}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-testimonial-carousel-slider__track{gap:' . $uplifters_site_builder_blocks_gap_tablet . 'px;}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-testimonial-carousel__avatar{width:' . $uplifters_site_builder_blocks_image_width_tablet . 'px;height:' . $uplifters_site_builder_blocks_image_height_tablet . 'px;}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-testimonial-carousel__name{font-family:' . $uplifters_site_builder_blocks_name_font_family_tablet . ';}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-testimonial-carousel__designation{font-family:' . $uplifters_site_builder_blocks_designation_font_family_tablet . ';}';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:640px){';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'font-family:' . $uplifters_site_builder_blocks_font_family_mobile . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'font-style:' . ( $uplifters_site_builder_blocks_is_italic_mobile ? 'italic' : 'normal' ) . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'font-weight:' . $uplifters_site_builder_blocks_font_weight_mobile . ';';
$uplifters_site_builder_blocks_dynamic_css .= uplifters_site_builder_blocks_testimonial_carousel_box_to_css( 'padding', $uplifters_site_builder_blocks_padding_mobile );
$uplifters_site_builder_blocks_dynamic_css .= uplifters_site_builder_blocks_testimonial_carousel_box_to_css( 'margin', $uplifters_site_builder_blocks_margin_mobile );
if ( $uplifters_site_builder_blocks_text_color_mobile ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'color:' . $uplifters_site_builder_blocks_text_color_mobile . ';';
}
if ( $uplifters_site_builder_blocks_background_color_mobile ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' . $uplifters_site_builder_blocks_background_color_mobile . ';';
}
if ( is_numeric( $uplifters_site_builder_blocks_font_size_mobile ) ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'font-size:' . (float) $uplifters_site_builder_blocks_font_size_mobile . 'px;';
}
if ( is_numeric( $uplifters_site_builder_blocks_line_height_mobile ) ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'line-height:' . (float) $uplifters_site_builder_blocks_line_height_mobile . ';';
}
$uplifters_site_builder_blocks_dynamic_css .= '}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-testimonial-carousel-slider__track{gap:' . $uplifters_site_builder_blocks_gap_mobile . 'px;}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-testimonial-carousel__avatar{width:' . $uplifters_site_builder_blocks_image_width_mobile . 'px;height:' . $uplifters_site_builder_blocks_image_height_mobile . 'px;}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-testimonial-carousel__name{font-family:' . $uplifters_site_builder_blocks_name_font_family_mobile . ';}';
$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-testimonial-carousel__designation{font-family:' . $uplifters_site_builder_blocks_designation_font_family_mobile . ';}';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'id'                      => $uplifters_site_builder_blocks_unique_id,
		'class'                   => 'uplifters-site-builder-blocks-testimonial-carousel',
		'data-uplifters-site-builder-blocks-testimonial-carousel-slider'        => 'testimonial-carousel',
		'data-autoplay'           => $uplifters_site_builder_blocks_autoplay ? '1' : '0',
		'data-pause-hover'        => $uplifters_site_builder_blocks_pause_on_hover ? '1' : '0',
		'data-interval'           => $uplifters_site_builder_blocks_safe_interval,
		'data-speed'              => $uplifters_site_builder_blocks_safe_speed,
		'data-gap-desktop'        => $uplifters_site_builder_blocks_gap_desktop,
		'data-gap-tablet'         => $uplifters_site_builder_blocks_gap_tablet,
		'data-gap-mobile'         => $uplifters_site_builder_blocks_gap_mobile,
		'data-show-arrows'        => $uplifters_site_builder_blocks_show_arrows ? '1' : '0',
		'data-show-dots'          => $uplifters_site_builder_blocks_show_dots ? '1' : '0',
		'data-per-desktop'        => $uplifters_site_builder_blocks_per_view_desktop,
		'data-per-tablet'         => $uplifters_site_builder_blocks_per_view_tablet,
		'data-per-mobile'         => $uplifters_site_builder_blocks_per_view_mobile,
		'data-min-card-desktop'   => $uplifters_site_builder_blocks_min_card_desktop,
		'data-min-card-tablet'    => $uplifters_site_builder_blocks_min_card_tablet,
		'data-min-card-mobile'    => $uplifters_site_builder_blocks_min_card_mobile,
	)
);
?>
<?php
$uplifters_site_builder_blocks_css = wp_strip_all_tags( $uplifters_site_builder_blocks_dynamic_css );
\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css );
?>

<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
	<div style="padding:20px;box-sizing:border-box;">
		<div class="uplifters-site-builder-blocks-testimonial-carousel-slider" style="position:relative;box-sizing:border-box;">
			<div class="uplifters-site-builder-blocks-testimonial-carousel-slider__viewport" style="overflow:hidden;width:100%;box-sizing:border-box;">
				<div class="uplifters-site-builder-blocks-testimonial-carousel-slider__track" style="display:flex;flex-direction:row;flex-wrap:nowrap;will-change:transform;box-sizing:border-box;">
					<?php foreach ( $uplifters_site_builder_blocks_visible_items as $uplifters_site_builder_blocks_item ) : ?>
						<?php
						$uplifters_site_builder_blocks_image_url   = isset( $uplifters_site_builder_blocks_item['imageUrl'] ) ? $uplifters_site_builder_blocks_item['imageUrl'] : '';
						$uplifters_site_builder_blocks_image_alt   = isset( $uplifters_site_builder_blocks_item['imageAlt'] ) ? $uplifters_site_builder_blocks_item['imageAlt'] : '';
						$uplifters_site_builder_blocks_name        = isset( $uplifters_site_builder_blocks_item['name'] ) ? sanitize_text_field( $uplifters_site_builder_blocks_item['name'] ) : '';
						$uplifters_site_builder_blocks_designation = isset( $uplifters_site_builder_blocks_item['designation'] ) ? sanitize_text_field( $uplifters_site_builder_blocks_item['designation'] ) : '';
						$uplifters_site_builder_blocks_text        = isset( $uplifters_site_builder_blocks_item['text'] ) ? wp_kses_post( $uplifters_site_builder_blocks_item['text'] ) : '';
						?>
						<article class="uplifters-site-builder-blocks-testimonial-carousel-slider__card" style="flex:0 0 auto;border:1px solid #e5e7eb;border-radius:16px;padding:16px;box-sizing:border-box;background-color:#ffffff;">
							<div style="display:flex;align-items:center;gap:16px;box-sizing:border-box;">
								<div style="flex:0 0 auto;">
									<?php if ( $uplifters_site_builder_blocks_image_url ) : ?>
										<img class="uplifters-site-builder-blocks-testimonial-carousel__avatar" src="<?php echo esc_url( $uplifters_site_builder_blocks_image_url ); ?>" alt="<?php echo esc_attr( $uplifters_site_builder_blocks_image_alt ); ?>" loading="lazy" style="border-radius:9999px;object-fit:cover;display:block;border:1px solid #e5e7eb;box-sizing:border-box;" />
									<?php endif; ?>
								</div>

								<div style="min-width:0;flex:1 1 auto;">
									<div class="uplifters-site-builder-blocks-testimonial-carousel__name" style="font-size:14px;font-weight:600;line-height:1.4;margin:0;box-sizing:border-box;"><?php echo esc_html( $uplifters_site_builder_blocks_name ); ?></div>
									<div class="uplifters-site-builder-blocks-testimonial-carousel__designation" style="font-size:14px;line-height:1.4;opacity:0.8;margin-top:4px;box-sizing:border-box;"><?php echo esc_html( $uplifters_site_builder_blocks_designation ); ?></div>
								</div>
							</div>

							<div style="margin-top:12px;box-sizing:border-box;">
								<p class="uplifters-site-builder-blocks-testimonial-carousel__text" style="margin:0;line-height:1.6;box-sizing:border-box;"><?php echo wp_kses_post( $uplifters_site_builder_blocks_text ); ?></p>
							</div>
						</article>
					<?php endforeach; ?>
				</div>
			</div>

			<div class="uplifters-site-builder-blocks-testimonial-carousel-slider__dots" style="margin-top:12px;display:flex;gap:8px;justify-content:center;align-items:center;box-sizing:border-box;"></div>
		</div>
	</div>
</div>