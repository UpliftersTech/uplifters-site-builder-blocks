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

/**
 * Turn one device's widths array into a grid-template-columns value. Every
 * inner block is one column, so the track count is the saved column count.
 */
if ( ! function_exists( 'uplifters_site_builder_blocks_a_header_layout_grid_template' ) ) {
	function uplifters_site_builder_blocks_a_header_layout_grid_template( $widths, $count ) {
		$count = max( 1, absint( $count ) );

		if ( ! is_array( $widths ) || count( $widths ) !== $count ) {
			$widths = array_fill( 0, $count, 100 / $count );
		}

		$numbers = array_map(
			static fn( $width ) => is_numeric( $width ) ? (float) $width : 0.0,
			$widths
		);
		$total   = array_sum( $numbers );

		if ( $total <= 0 ) {
			$numbers = array_fill( 0, $count, 100 / $count );
			$total   = 100;
		}

		return implode(
			' ',
			array_map(
				static function ( $width ) use ( $total ) {
					$fraction = uplifters_site_builder_blocks_a_header_layout_css_number(
						( $width / $total ) * 100
					);

					return "minmax(1ch,{$fraction}fr)";
				},
				$numbers
			)
		);
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_a_header_layout_alignment' ) ) {
	function uplifters_site_builder_blocks_a_header_layout_alignment( $value ) {
		return in_array( $value, array( 'start', 'center', 'end' ), true ) ? $value : 'center';
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_a_header_layout_device_css' ) ) {
	function uplifters_site_builder_blocks_a_header_layout_device_css( $selector, $device_values ) {
		$padding          = uplifters_site_builder_blocks_a_header_layout_number( $device_values['padding'], 0 );
		$margin           = uplifters_site_builder_blocks_a_header_layout_number( $device_values['margin'], 0 );
		$gap              = uplifters_site_builder_blocks_a_header_layout_number( $device_values['gap'], 16 );
		$height           = uplifters_site_builder_blocks_a_header_layout_number( $device_values['height'], 0 );
		$border_radius    = uplifters_site_builder_blocks_a_header_layout_number( $device_values['borderRadius'], 0 );
		$shadow           = uplifters_site_builder_blocks_a_header_layout_number( $device_values['shadow'], 0 );
		$background_color = uplifters_site_builder_blocks_a_header_layout_safe_color( $device_values['backgroundColor'] );

		$width = $margin > 0
			? 'calc(100% - ' . uplifters_site_builder_blocks_a_header_layout_css_number( $margin * 2 ) . 'px)'
			: '100%';

		$gap_css = uplifters_site_builder_blocks_a_header_layout_css_number( $gap ) . 'px';

		$css  = $selector . '{';
		$css .= 'width:' . $width . ';';
		$css .= 'max-width:' . $width . ';';
		$css .= 'padding:' . uplifters_site_builder_blocks_a_header_layout_css_number( $padding ) . 'px;';
		$css .= 'margin:' . uplifters_site_builder_blocks_a_header_layout_css_number( $margin ) . 'px;';
		$css .= 'border-radius:' . uplifters_site_builder_blocks_a_header_layout_css_number( $border_radius ) . 'px;';
		$css .= 'grid-template-columns:' . $device_values['gridTemplateColumns'] . ';';
		$css .= 'align-items:' . uplifters_site_builder_blocks_a_header_layout_alignment( $device_values['verticalAlignment'] ) . ';';
		$css .= 'gap:' . $gap_css . ';';
		$css .= '--wp--style--block-gap:' . $gap_css . ';';
		$css .= 'min-height:' . ( $height > 0 ? uplifters_site_builder_blocks_a_header_layout_css_number( $height ) . 'px' : 'auto' ) . ';';

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

$uplifters_site_builder_blocks_column_count = max(
	1,
	isset( $attributes['sections'] ) ? absint( $attributes['sections'] ) : 4
);

$uplifters_site_builder_blocks_column_widths = isset( $attributes['columnWidths'] ) && is_array( $attributes['columnWidths'] )
	? $attributes['columnWidths']
	: array();

$uplifters_site_builder_blocks_gap_values = uplifters_site_builder_blocks_a_header_layout_responsive_object(
	$attributes['gap'] ?? null,
	16
);

$uplifters_site_builder_blocks_height_values = uplifters_site_builder_blocks_a_header_layout_responsive_object(
	$attributes['height'] ?? null,
	0
);

$uplifters_site_builder_blocks_alignment_values = uplifters_site_builder_blocks_a_header_layout_responsive_object(
	$attributes['verticalAlignment'] ?? null,
	'center'
);

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

$uplifters_site_builder_blocks_device_values = array();

foreach ( array( 'desktop', 'tablet', 'mobile' ) as $uplifters_site_builder_blocks_device ) {
	$uplifters_site_builder_blocks_device_widths = isset( $uplifters_site_builder_blocks_column_widths[ $uplifters_site_builder_blocks_device ] )
		&& is_array( $uplifters_site_builder_blocks_column_widths[ $uplifters_site_builder_blocks_device ] )
			? $uplifters_site_builder_blocks_column_widths[ $uplifters_site_builder_blocks_device ]
			: array();

	$uplifters_site_builder_blocks_device_values[ $uplifters_site_builder_blocks_device ] = array(
		'padding'             => $uplifters_site_builder_blocks_padding_values[ $uplifters_site_builder_blocks_device ],
		'margin'              => $uplifters_site_builder_blocks_margin_values[ $uplifters_site_builder_blocks_device ],
		'gap'                 => $uplifters_site_builder_blocks_gap_values[ $uplifters_site_builder_blocks_device ],
		'height'              => $uplifters_site_builder_blocks_height_values[ $uplifters_site_builder_blocks_device ],
		'verticalAlignment'   => $uplifters_site_builder_blocks_alignment_values[ $uplifters_site_builder_blocks_device ],
		'backgroundColor'     => $uplifters_site_builder_blocks_background_color_values[ $uplifters_site_builder_blocks_device ],
		'borderRadius'        => $uplifters_site_builder_blocks_border_radius_values[ $uplifters_site_builder_blocks_device ],
		'shadow'              => $uplifters_site_builder_blocks_shadow_values[ $uplifters_site_builder_blocks_device ],
		'gridTemplateColumns' => uplifters_site_builder_blocks_a_header_layout_grid_template(
			$uplifters_site_builder_blocks_device_widths,
			$uplifters_site_builder_blocks_column_count
		),
	);
}

$uplifters_site_builder_blocks_desktop_values = $uplifters_site_builder_blocks_device_values['desktop'];
$uplifters_site_builder_blocks_tablet_values  = $uplifters_site_builder_blocks_device_values['tablet'];
$uplifters_site_builder_blocks_mobile_values  = $uplifters_site_builder_blocks_device_values['mobile'];

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
// Every inner block is one column of the header.
$uplifters_site_builder_blocks_css .= 'display:grid;';
$uplifters_site_builder_blocks_css .= 'justify-content:stretch;';
$uplifters_site_builder_blocks_css .= '}';

/* A column is one grid cell: it must not spill past its track. */
$uplifters_site_builder_blocks_css .= 'body ' . $uplifters_site_builder_blocks_selector . '>*{';
$uplifters_site_builder_blocks_css .= 'box-sizing:border-box;';
$uplifters_site_builder_blocks_css .= 'min-width:0;';
$uplifters_site_builder_blocks_css .= 'max-width:100%;';
$uplifters_site_builder_blocks_css .= 'margin-top:0;';
$uplifters_site_builder_blocks_css .= 'margin-block-start:0;';
$uplifters_site_builder_blocks_css .= 'margin-bottom:0;';
$uplifters_site_builder_blocks_css .= 'margin-block-end:0;';
$uplifters_site_builder_blocks_css .= '}';

/* Per-device column order. Every inner block is one column, so a slot number
   is an nth-child position among the rendered columns. */
$uplifters_site_builder_blocks_order_css = \UpliftersSiteBuilderBlocks\ResponsiveGlobal\ResponsiveOrderCss::device_css(
	$uplifters_site_builder_blocks_selector,
	$attributes['childOrder'] ?? null,
	$uplifters_site_builder_blocks_column_count
);

$uplifters_site_builder_blocks_css .= uplifters_site_builder_blocks_a_header_layout_device_css( $uplifters_site_builder_blocks_selector, $uplifters_site_builder_blocks_desktop_values );
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_order_css['desktop'];
$uplifters_site_builder_blocks_css .= '@media (max-width:1024px){' . uplifters_site_builder_blocks_a_header_layout_device_css( $uplifters_site_builder_blocks_selector, $uplifters_site_builder_blocks_tablet_values ) . $uplifters_site_builder_blocks_order_css['tablet'] . '}';
$uplifters_site_builder_blocks_css .= '@media (max-width:767px){';
$uplifters_site_builder_blocks_css .= uplifters_site_builder_blocks_a_header_layout_device_css( $uplifters_site_builder_blocks_selector, $uplifters_site_builder_blocks_mobile_values );
$uplifters_site_builder_blocks_css .= $uplifters_site_builder_blocks_order_css['mobile'];
/* Mobile top-fixed headers must touch the viewport top with no admin-bar or margin offset. */
$uplifters_site_builder_blocks_css .= 'body :where(header,.wp-block-template-part,.wp-site-blocks>header):has(' . $uplifters_site_builder_blocks_selector . '.is-uplifters-site-builder-blocks-sticky-top){top:0 !important;margin-top:0 !important;}';
$uplifters_site_builder_blocks_css .= 'body ' . $uplifters_site_builder_blocks_selector . '.is-uplifters-site-builder-blocks-sticky-top{top:0 !important;margin-top:0 !important;}';
$uplifters_site_builder_blocks_css .= '}';

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'              => 'uplifters-site-builder-blocks-header-layout ' . $uplifters_site_builder_blocks_sticky_class . ' ' . $uplifters_site_builder_blocks_unique_class,
		'data-sticky-top'    => $uplifters_site_builder_blocks_sticky_top ? 'true' : 'false',
		'data-sticky-bottom' => $uplifters_site_builder_blocks_sticky_bottom ? 'true' : 'false',
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