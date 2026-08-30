<?php
/**
 * Server-side render for the UPLIFTERS_SITE_BUILDER_BLOCKS Header Layout block.
 *
 * This block saves only InnerBlocks content.
 * The frontend wrapper and responsive CSS are rendered here.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_a_header_layout_responsive_object' ) ) {
	function uplifters_site_builder_blocks_a_header_layout_responsive_object( $value, $fallback ) {
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

if ( ! function_exists( 'uplifters_site_builder_blocks_a_header_layout_number' ) ) {
	function uplifters_site_builder_blocks_a_header_layout_number( $value, $fallback = 0 ) {
		if ( is_numeric( $value ) ) {
			return (float) $value;
		}

		return (float) $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_a_header_layout_css_number' ) ) {
	function uplifters_site_builder_blocks_a_header_layout_css_number( $value ) {
		$value = uplifters_site_builder_blocks_a_header_layout_number( $value, 0 );

		if ( (float) (int) $value === $value ) {
			return (string) (int) $value;
		}

		return rtrim( rtrim( (string) $value, '0' ), '.' );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_a_header_layout_safe_color' ) ) {
	function uplifters_site_builder_blocks_a_header_layout_safe_color( $value ) {
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

if ( ! function_exists( 'uplifters_site_builder_blocks_a_header_layout_device_css' ) ) {
	function uplifters_site_builder_blocks_a_header_layout_device_css( $selector, $device_values ) {
		$padding          = uplifters_site_builder_blocks_a_header_layout_number( $device_values['padding'], 0 );
		$margin           = uplifters_site_builder_blocks_a_header_layout_number( $device_values['margin'], 0 );
		$border_radius    = uplifters_site_builder_blocks_a_header_layout_number( $device_values['borderRadius'], 0 );
		$shadow           = uplifters_site_builder_blocks_a_header_layout_number( $device_values['shadow'], 0 );
		$background_color = uplifters_site_builder_blocks_a_header_layout_safe_color( $device_values['backgroundColor'] );

		$width = $margin > 0
			? 'calc(100% - ' . uplifters_site_builder_blocks_a_header_layout_css_number( $margin * 2 ) . 'px)'
			: '100%';

		$css  = $selector . '{';
		$css .= 'width:' . $width . ';';
		$css .= 'max-width:' . $width . ';';
		$css .= 'padding:' . uplifters_site_builder_blocks_a_header_layout_css_number( $padding ) . 'px;';
		$css .= 'margin:' . uplifters_site_builder_blocks_a_header_layout_css_number( $margin ) . 'px;';
		$css .= 'border-radius:' . uplifters_site_builder_blocks_a_header_layout_css_number( $border_radius ) . 'px;';

		if ( '' !== $background_color ) {
			$css .= 'background-color:' . $background_color . ';';
		} else {
			$css .= 'background-color:initial;';
		}

		if ( $shadow > 0 ) {
			$css .= 'box-shadow:0 ' . uplifters_site_builder_blocks_a_header_layout_css_number( $shadow ) . 'px ' . uplifters_site_builder_blocks_a_header_layout_css_number( $shadow * 3 ) . 'px rgba(0,0,0,0.18);';
		} else {
			$css .= 'box-shadow:none;';
		}

		$css .= '}';

		return $css;
	}
}

$uplifters_site_builder_blocks_header_template = isset( $attributes['headerTemplate'] )
	? sanitize_key( $attributes['headerTemplate'] )
	: '';

$uplifters_site_builder_blocks_padding_values = uplifters_site_builder_blocks_a_header_layout_responsive_object(
	$attributes['padding'] ?? null,
	0
);

$uplifters_site_builder_blocks_margin_values = uplifters_site_builder_blocks_a_header_layout_responsive_object(
	$attributes['margin'] ?? null,
	0
);

$uplifters_site_builder_blocks_background_color_values = uplifters_site_builder_blocks_a_header_layout_responsive_object(
	$attributes['backgroundColor'] ?? null,
	''
);

$uplifters_site_builder_blocks_border_radius_values = uplifters_site_builder_blocks_a_header_layout_responsive_object(
	$attributes['borderRadius'] ?? null,
	0
);

$uplifters_site_builder_blocks_shadow_values = uplifters_site_builder_blocks_a_header_layout_responsive_object(
	$attributes['shadow'] ?? null,
	0
);

$uplifters_site_builder_blocks_sticky_top    = ! empty( $attributes['stickyTop'] );
$uplifters_site_builder_blocks_sticky_bottom = ! empty( $attributes['stickyBottom'] );
$uplifters_site_builder_blocks_is_sticky     = $uplifters_site_builder_blocks_sticky_top || $uplifters_site_builder_blocks_sticky_bottom;

$uplifters_site_builder_blocks_sticky_class = $uplifters_site_builder_blocks_is_sticky
	? ( $uplifters_site_builder_blocks_sticky_top ? 'is-uplifters-site-builder-blocks-sticky-top' : 'is-uplifters-site-builder-blocks-sticky-bottom' )
	: 'is-uplifters-site-builder-blocks-not-sticky';

$uplifters_site_builder_blocks_unique_class = wp_unique_id( 'uplifters-site-builder-blocks-header-layout-' );

$uplifters_site_builder_blocks_selector = '.uplifters-site-builder-blocks-header-layout.' . $uplifters_site_builder_blocks_unique_class;

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

$uplifters_site_builder_blocks_admin_bar_top = 'var(--wp-admin--admin-bar--height,0px)';
$uplifters_site_builder_blocks_css           = '';

$uplifters_site_builder_blocks_css .= 'body :where(header,.wp-block-template-part,.wp-site-blocks>header):has(' . $uplifters_site_builder_blocks_selector . '.is-uplifters-site-builder-blocks-sticky-top){';
$uplifters_site_builder_blocks_css .= 'position:sticky !important;';
$uplifters_site_builder_blocks_css .= 'top:' . $uplifters_site_builder_blocks_admin_bar_top . ' !important;';
$uplifters_site_builder_blocks_css .= 'z-index:9999 !important;';
$uplifters_site_builder_blocks_css .= 'overflow:visible !important;';
$uplifters_site_builder_blocks_css .= 'transform:none !important;';
$uplifters_site_builder_blocks_css .= 'contain:none !important;';
$uplifters_site_builder_blocks_css .= 'isolation:isolate !important;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= 'body :where(header,.wp-block-template-part,.wp-site-blocks>header):has(' . $uplifters_site_builder_blocks_selector . '.is-uplifters-site-builder-blocks-sticky-bottom){';
$uplifters_site_builder_blocks_css .= 'position:sticky !important;';
$uplifters_site_builder_blocks_css .= 'bottom:0 !important;';
$uplifters_site_builder_blocks_css .= 'z-index:9999 !important;';
$uplifters_site_builder_blocks_css .= 'overflow:visible !important;';
$uplifters_site_builder_blocks_css .= 'transform:none !important;';
$uplifters_site_builder_blocks_css .= 'contain:none !important;';
$uplifters_site_builder_blocks_css .= 'isolation:isolate !important;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= 'body ' . $uplifters_site_builder_blocks_selector . '.is-uplifters-site-builder-blocks-sticky-top{';
$uplifters_site_builder_blocks_css .= 'position:sticky;';
$uplifters_site_builder_blocks_css .= 'top:' . $uplifters_site_builder_blocks_admin_bar_top . ';';
$uplifters_site_builder_blocks_css .= 'z-index:9999;';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_css .= 'body ' . $uplifters_site_builder_blocks_selector . '.is-uplifters-site-builder-blocks-sticky-bottom{';
$uplifters_site_builder_blocks_css .= 'position:sticky;';
$uplifters_site_builder_blocks_css .= 'bottom:0;';
$uplifters_site_builder_blocks_css .= 'z-index:9999;';
$uplifters_site_builder_blocks_css .= '}';

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
$uplifters_site_builder_blocks_css .= 'body ' . $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-header-layout__row{width:100%;min-width:0;gap:16px;box-sizing:border-box;}';
$uplifters_site_builder_blocks_css .= 'body ' . $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-header-layout__site-logo{flex:0 0 auto;}';
$uplifters_site_builder_blocks_css .= 'body ' . $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-header-layout__page-nav{flex:1 1 auto;min-width:0;}';
$uplifters_site_builder_blocks_css .= 'body ' . $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-header-layout__search-live{flex:0 1 260px;min-width:160px;}';
$uplifters_site_builder_blocks_css .= 'body ' . $uplifters_site_builder_blocks_selector . ' .uplifters-site-builder-blocks-header-layout__button{flex:0 0 auto;}';

$uplifters_site_builder_blocks_css .= uplifters_site_builder_blocks_a_header_layout_device_css( $uplifters_site_builder_blocks_selector, $uplifters_site_builder_blocks_desktop_values );
$uplifters_site_builder_blocks_css .= '@media (max-width:1024px){' . uplifters_site_builder_blocks_a_header_layout_device_css( $uplifters_site_builder_blocks_selector, $uplifters_site_builder_blocks_tablet_values ) . '}';
$uplifters_site_builder_blocks_css .= '@media (max-width:767px){';
$uplifters_site_builder_blocks_css .= uplifters_site_builder_blocks_a_header_layout_device_css( $uplifters_site_builder_blocks_selector, $uplifters_site_builder_blocks_mobile_values );
/* Mobile top-fixed headers must touch the viewport top with no admin-bar or margin offset. */
$uplifters_site_builder_blocks_css .= 'body :where(header,.wp-block-template-part,.wp-site-blocks>header):has(' . $uplifters_site_builder_blocks_selector . '.is-uplifters-site-builder-blocks-sticky-top){top:0 !important;margin-top:0 !important;}';
$uplifters_site_builder_blocks_css .= 'body ' . $uplifters_site_builder_blocks_selector . '.is-uplifters-site-builder-blocks-sticky-top{top:0 !important;margin-top:0 !important;}';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'                => 'uplifters-site-builder-blocks-header-layout ' . $uplifters_site_builder_blocks_sticky_class . ' ' . $uplifters_site_builder_blocks_unique_class,
		'data-header-template' => $uplifters_site_builder_blocks_header_template,
		'data-sticky-top'      => $uplifters_site_builder_blocks_sticky_top ? 'true' : 'false',
		'data-sticky-bottom'   => $uplifters_site_builder_blocks_sticky_bottom ? 'true' : 'false',
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