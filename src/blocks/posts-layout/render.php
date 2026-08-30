<?php
/**
 * Server-side render for the UPLIFTERS_SITE_BUILDER_BLOCKS Posts Layout block.
 *
 * This block saves only InnerBlocks content (a single Posts Section child).
 * The frontend wrapper and responsive CSS are rendered here.
 *
 * @package uplifters-site-builder-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * View guard: Posts Layout is a single-post template block. On anything
 * other than a real single post view (blog index, category/tag/author/date
 * archives, search results, front page) it must render nothing at all, so
 * the theme's own default post listing output is left completely untouched.
 *
 * is_singular('post') specifically (not in_the_loop(), which is only about
 * query-loop iteration state and can be true on archive/Query Loop pages
 * too; not is_single(), which also matches attachment pages).
 */
if ( ! is_singular( 'post' ) ) {
	return '';
}

if ( ! function_exists( 'uplifters_site_builder_blocks_b_posts_layout_responsive_object' ) ) {
	function uplifters_site_builder_blocks_b_posts_layout_responsive_object( $value, $fallback ) {
		if ( is_array( $value ) ) {
			return array(
				'desktop' => array_key_exists( 'desktop', $value ) ? $value['desktop'] : $fallback,
				'tablet'  => array_key_exists( 'tablet', $value ) ? $value['tablet'] : $fallback,
				'mobile'  => array_key_exists( 'mobile', $value ) ? $value['mobile'] : $fallback,
			);
		}

		if ( null !== $value ) {
			return array(
				'desktop' => $value,
				'tablet'  => $fallback,
				'mobile'  => $fallback,
			);
		}

		return array(
			'desktop' => $fallback,
			'tablet'  => $fallback,
			'mobile'  => $fallback,
		);
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_b_posts_layout_number' ) ) {
	function uplifters_site_builder_blocks_b_posts_layout_number( $value, $fallback = 0 ) {
		if ( is_numeric( $value ) ) {
			return (float) $value;
		}

		return (float) $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_b_posts_layout_css_number' ) ) {
	function uplifters_site_builder_blocks_b_posts_layout_css_number( $value ) {
		$value = uplifters_site_builder_blocks_b_posts_layout_number( $value, 0 );

		if ( (float) (int) $value === $value ) {
			return (string) (int) $value;
		}

		return rtrim( rtrim( (string) $value, '0' ), '.' );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_b_posts_layout_safe_color' ) ) {
	function uplifters_site_builder_blocks_b_posts_layout_safe_color( $value ) {
		$value = trim( (string) $value );

		if ( '' === $value ) {
			return '';
		}

		if ( preg_match( '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^(rgb|rgba|hsl|hsla)\([0-9\s.,%\/+-]+\)$/', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^var\(--[a-zA-Z0-9_-]+\)$/', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^[a-zA-Z]+$/', $value ) ) {
			return $value;
		}

		return '';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_b_posts_layout_device_css' ) ) {
	function uplifters_site_builder_blocks_b_posts_layout_device_css( $selector, $device_values ) {
		$padding          = uplifters_site_builder_blocks_b_posts_layout_number( $device_values['padding'], 0 );
		$margin           = uplifters_site_builder_blocks_b_posts_layout_number( $device_values['margin'], 0 );
		$border_radius    = uplifters_site_builder_blocks_b_posts_layout_number( $device_values['borderRadius'], 0 );
		$shadow           = uplifters_site_builder_blocks_b_posts_layout_number( $device_values['shadow'], 0 );
		$background_color = uplifters_site_builder_blocks_b_posts_layout_safe_color( $device_values['backgroundColor'] );

		$width = $margin > 0
			? 'calc(100% - ' . uplifters_site_builder_blocks_b_posts_layout_css_number( $margin * 2 ) . 'px)'
			: '100%';

		$css  = $selector . '{';
		$css .= 'width:' . $width . ';';
		$css .= 'max-width:' . $width . ';';
		$css .= 'padding:' . uplifters_site_builder_blocks_b_posts_layout_css_number( $padding ) . 'px;';
		$css .= 'margin:' . uplifters_site_builder_blocks_b_posts_layout_css_number( $margin ) . 'px;';
		$css .= 'border-radius:' . uplifters_site_builder_blocks_b_posts_layout_css_number( $border_radius ) . 'px;';

		if ( '' !== $background_color ) {
			$css .= 'background-color:' . $background_color . ';';
		} else {
			$css .= 'background-color:initial;';
		}

		if ( $shadow > 0 ) {
			$css .= 'box-shadow:0 ' . uplifters_site_builder_blocks_b_posts_layout_css_number( $shadow ) . 'px ' . uplifters_site_builder_blocks_b_posts_layout_css_number( $shadow * 3 ) . 'px rgba(0,0,0,0.18);';
		} else {
			$css .= 'box-shadow:none;';
		}

		$css .= '}';

		return $css;
	}
}

$uplifters_site_builder_blocks_posts_template = isset( $attributes['postsTemplate'] )
	? sanitize_key( $attributes['postsTemplate'] )
	: '';

$uplifters_site_builder_blocks_padding_values = uplifters_site_builder_blocks_b_posts_layout_responsive_object(
	$attributes['padding'] ?? null,
	0
);

$uplifters_site_builder_blocks_margin_values = uplifters_site_builder_blocks_b_posts_layout_responsive_object(
	$attributes['margin'] ?? null,
	0
);

$uplifters_site_builder_blocks_background_color_values = uplifters_site_builder_blocks_b_posts_layout_responsive_object(
	$attributes['backgroundColor'] ?? null,
	''
);

$uplifters_site_builder_blocks_border_radius_values = uplifters_site_builder_blocks_b_posts_layout_responsive_object(
	$attributes['borderRadius'] ?? null,
	0
);

$uplifters_site_builder_blocks_shadow_values = uplifters_site_builder_blocks_b_posts_layout_responsive_object(
	$attributes['shadow'] ?? null,
	0
);

$uplifters_site_builder_blocks_unique_class = wp_unique_id( 'uplifters-site-builder-blocks-posts-layout-' );

$uplifters_site_builder_blocks_selector = '.uplifters-site-builder-blocks-posts-layout.' . $uplifters_site_builder_blocks_unique_class;

$uplifters_site_builder_blocks_desktop_values = array(
	'padding'         => $uplifters_site_builder_blocks_padding_values['desktop'],
	'margin'          => $uplifters_site_builder_blocks_margin_values['desktop'],
	'backgroundColor' => $uplifters_site_builder_blocks_background_color_values['desktop'],
	'borderRadius'    => $uplifters_site_builder_blocks_border_radius_values['desktop'],
	'shadow'          => $uplifters_site_builder_blocks_shadow_values['desktop'],
);

$uplifters_site_builder_blocks_tablet_values = array(
	'padding'         => $uplifters_site_builder_blocks_padding_values['tablet'],
	'margin'          => $uplifters_site_builder_blocks_margin_values['tablet'],
	'backgroundColor' => $uplifters_site_builder_blocks_background_color_values['tablet'],
	'borderRadius'    => $uplifters_site_builder_blocks_border_radius_values['tablet'],
	'shadow'          => $uplifters_site_builder_blocks_shadow_values['tablet'],
);

$uplifters_site_builder_blocks_mobile_values = array(
	'padding'         => $uplifters_site_builder_blocks_padding_values['mobile'],
	'margin'          => $uplifters_site_builder_blocks_margin_values['mobile'],
	'backgroundColor' => $uplifters_site_builder_blocks_background_color_values['mobile'],
	'borderRadius'    => $uplifters_site_builder_blocks_border_radius_values['mobile'],
	'shadow'          => $uplifters_site_builder_blocks_shadow_values['mobile'],
);

$uplifters_site_builder_blocks_css = '';

$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_selector . '{';
$uplifters_site_builder_blocks_css .= 'box-sizing:border-box;';
$uplifters_site_builder_blocks_css .= 'min-width:0;';
$uplifters_site_builder_blocks_css .= 'overflow:visible;';
$uplifters_site_builder_blocks_css .= 'position:relative;';
$uplifters_site_builder_blocks_css .= 'display:flex;';
$uplifters_site_builder_blocks_css .= 'align-items:center;';
$uplifters_site_builder_blocks_css .= 'justify-content:flex-start;';
$uplifters_site_builder_blocks_css .= '--wp--style--block-gap:0px;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= 'body ' . $uplifters_site_builder_blocks_selector . '>*{box-sizing:border-box;}';

$uplifters_site_builder_blocks_css .= uplifters_site_builder_blocks_b_posts_layout_device_css( $uplifters_site_builder_blocks_selector, $uplifters_site_builder_blocks_desktop_values );
$uplifters_site_builder_blocks_css .= '@media (max-width:1024px){' . uplifters_site_builder_blocks_b_posts_layout_device_css( $uplifters_site_builder_blocks_selector, $uplifters_site_builder_blocks_tablet_values ) . '}';
$uplifters_site_builder_blocks_css .= '@media (max-width:767px){' . uplifters_site_builder_blocks_b_posts_layout_device_css( $uplifters_site_builder_blocks_selector, $uplifters_site_builder_blocks_mobile_values ) . '}';

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'                => 'uplifters-site-builder-blocks-posts-layout ' . $uplifters_site_builder_blocks_unique_class,
		'data-posts-template'  => $uplifters_site_builder_blocks_posts_template,
	)
);
?>

<?php
$uplifters_site_builder_blocks_dynamic_style_css = wp_strip_all_tags( $uplifters_site_builder_blocks_css );
\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_dynamic_style_css );
?>

<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
	<?php echo wp_kses( $content, \UpliftersSiteBuilderBlocks\SecurityLayer\SecuritySanitizer::rendered_block_allowed_html() ); ?>
</div>
