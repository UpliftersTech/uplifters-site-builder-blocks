<?php
/**
 * Server render for UPLIFTERS_SITE_BUILDER_BLOCKS Row Layout block.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block default content (rendered inner blocks).
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_row_layout_responsive_value' ) ) {
	function uplifters_site_builder_blocks_row_layout_responsive_value(
		array $attributes,
		string $key,
		string $device,
		string $fallback = ''
	): string {
		if (
			empty( $attributes[ $key ] ) ||
			! is_array( $attributes[ $key ] )
		) {
			return $fallback;
		}

		$value = $attributes[ $key ];

		if (
			isset( $value[ $device ] ) &&
			'' !== $value[ $device ]
		) {
			return (string) $value[ $device ];
		}

		if (
			isset( $value['desktop'] ) &&
			'' !== $value['desktop']
		) {
			return (string) $value['desktop'];
		}

		if (
			isset( $value['tablet'] ) &&
			'' !== $value['tablet']
		) {
			return (string) $value['tablet'];
		}

		if (
			isset( $value['mobile'] ) &&
			'' !== $value['mobile']
		) {
			return (string) $value['mobile'];
		}

		return $fallback;
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_row_layout_sanitize_css_value' ) ) {
	function uplifters_site_builder_blocks_row_layout_sanitize_css_value(
		string $value
	): string {
		$value = wp_strip_all_tags( $value );

		$value = str_replace(
			array( '<', '>', '{', '}', ';' ),
			'',
			$value
		);

		return trim( $value );
	}
}

if ( ! function_exists( 'uplifters_site_builder_blocks_row_layout_sanitize_color' ) ) {
	function uplifters_site_builder_blocks_row_layout_sanitize_color(
		string $value
	): string {
		$value = trim( $value );

		if ( '' === $value ) {
			return '';
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
				'/^rgb[a]?\([0-9.,\s%]+\)$/',
				$value
			)
		) {
			return $value;
		}

		return '';
	}
}

$uplifters_site_builder_blocks_unique_id = wp_unique_id( 'uplifters-site-builder-blocks-row-layout-' );

$uplifters_site_builder_blocks_desktop_padding = uplifters_site_builder_blocks_row_layout_sanitize_css_value(
	uplifters_site_builder_blocks_row_layout_responsive_value(
		$attributes,
		'padding',
		'desktop',
		'24px'
	)
);

$uplifters_site_builder_blocks_tablet_padding = uplifters_site_builder_blocks_row_layout_sanitize_css_value(
	uplifters_site_builder_blocks_row_layout_responsive_value(
		$attributes,
		'padding',
		'tablet',
		$uplifters_site_builder_blocks_desktop_padding
	)
);

$uplifters_site_builder_blocks_mobile_padding = uplifters_site_builder_blocks_row_layout_sanitize_css_value(
	uplifters_site_builder_blocks_row_layout_responsive_value(
		$attributes,
		'padding',
		'mobile',
		$uplifters_site_builder_blocks_desktop_padding
	)
);

$uplifters_site_builder_blocks_desktop_margin = uplifters_site_builder_blocks_row_layout_sanitize_css_value(
	uplifters_site_builder_blocks_row_layout_responsive_value(
		$attributes,
		'margin',
		'desktop',
		'0px'
	)
);

$uplifters_site_builder_blocks_tablet_margin = uplifters_site_builder_blocks_row_layout_sanitize_css_value(
	uplifters_site_builder_blocks_row_layout_responsive_value(
		$attributes,
		'margin',
		'tablet',
		$uplifters_site_builder_blocks_desktop_margin
	)
);

$uplifters_site_builder_blocks_mobile_margin = uplifters_site_builder_blocks_row_layout_sanitize_css_value(
	uplifters_site_builder_blocks_row_layout_responsive_value(
		$attributes,
		'margin',
		'mobile',
		$uplifters_site_builder_blocks_desktop_margin
	)
);

$uplifters_site_builder_blocks_desktop_radius = uplifters_site_builder_blocks_row_layout_sanitize_css_value(
	uplifters_site_builder_blocks_row_layout_responsive_value(
		$attributes,
		'borderRadius',
		'desktop',
		'0px'
	)
);

$uplifters_site_builder_blocks_tablet_radius = uplifters_site_builder_blocks_row_layout_sanitize_css_value(
	uplifters_site_builder_blocks_row_layout_responsive_value(
		$attributes,
		'borderRadius',
		'tablet',
		$uplifters_site_builder_blocks_desktop_radius
	)
);

$uplifters_site_builder_blocks_mobile_radius = uplifters_site_builder_blocks_row_layout_sanitize_css_value(
	uplifters_site_builder_blocks_row_layout_responsive_value(
		$attributes,
		'borderRadius',
		'mobile',
		$uplifters_site_builder_blocks_desktop_radius
	)
);

$uplifters_site_builder_blocks_desktop_bg = uplifters_site_builder_blocks_row_layout_sanitize_color(
	uplifters_site_builder_blocks_row_layout_responsive_value(
		$attributes,
		'backgroundColor',
		'desktop',
		''
	)
);

$uplifters_site_builder_blocks_tablet_bg = uplifters_site_builder_blocks_row_layout_sanitize_color(
	uplifters_site_builder_blocks_row_layout_responsive_value(
		$attributes,
		'backgroundColor',
		'tablet',
		$uplifters_site_builder_blocks_desktop_bg
	)
);

$uplifters_site_builder_blocks_mobile_bg = uplifters_site_builder_blocks_row_layout_sanitize_color(
	uplifters_site_builder_blocks_row_layout_responsive_value(
		$attributes,
		'backgroundColor',
		'mobile',
		$uplifters_site_builder_blocks_desktop_bg
	)
);

$uplifters_site_builder_blocks_desktop_gap = uplifters_site_builder_blocks_row_layout_sanitize_css_value(
	uplifters_site_builder_blocks_row_layout_responsive_value(
		$attributes,
		'dividerGap',
		'desktop',
		'0px'
	)
);

$uplifters_site_builder_blocks_tablet_gap = uplifters_site_builder_blocks_row_layout_sanitize_css_value(
	uplifters_site_builder_blocks_row_layout_responsive_value(
		$attributes,
		'dividerGap',
		'tablet',
		$uplifters_site_builder_blocks_desktop_gap
	)
);

$uplifters_site_builder_blocks_mobile_gap = uplifters_site_builder_blocks_row_layout_sanitize_css_value(
	uplifters_site_builder_blocks_row_layout_responsive_value(
		$attributes,
		'dividerGap',
		'mobile',
		$uplifters_site_builder_blocks_desktop_gap
	)
);

$uplifters_site_builder_blocks_static_css  = '';

$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-row-layout-wrapper{';
$uplifters_site_builder_blocks_static_css .= 'box-sizing:border-box;';
$uplifters_site_builder_blocks_static_css .= '}';

$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-row-layout{';
$uplifters_site_builder_blocks_static_css .= 'display:flex;';
$uplifters_site_builder_blocks_static_css .= 'flex-direction:column;';
$uplifters_site_builder_blocks_static_css .= '}';

/* Each inner block is a row. Dropping its own leading/trailing margins keeps
   the visible space between rows equal to the Divider Gap only. */
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-row-layout>*{';
$uplifters_site_builder_blocks_static_css .= 'width:100%;';
$uplifters_site_builder_blocks_static_css .= 'min-width:0;';
$uplifters_site_builder_blocks_static_css .= 'box-sizing:border-box;';
$uplifters_site_builder_blocks_static_css .= 'margin-top:0;';
$uplifters_site_builder_blocks_static_css .= 'margin-block-start:0;';
$uplifters_site_builder_blocks_static_css .= 'margin-bottom:0;';
$uplifters_site_builder_blocks_static_css .= 'margin-block-end:0;';
$uplifters_site_builder_blocks_static_css .= '}';

/* An image block used as a row should not keep the figure's default side gap. */
$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-row-layout>figure{';
$uplifters_site_builder_blocks_static_css .= 'margin-left:0;';
$uplifters_site_builder_blocks_static_css .= 'margin-right:0;';
$uplifters_site_builder_blocks_static_css .= '}';

$uplifters_site_builder_blocks_static_css .= '.uplifters-site-builder-blocks-row-layout>figure>img{';
$uplifters_site_builder_blocks_static_css .= 'display:block;';
$uplifters_site_builder_blocks_static_css .= '}';

$uplifters_site_builder_blocks_dynamic_css  = '';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'padding:' . $uplifters_site_builder_blocks_desktop_padding . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'margin:' . $uplifters_site_builder_blocks_desktop_margin . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'border-radius:' . $uplifters_site_builder_blocks_desktop_radius . ';';

if ( $uplifters_site_builder_blocks_desktop_bg ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' . $uplifters_site_builder_blocks_desktop_bg . ';';
}

$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-row-layout{';
$uplifters_site_builder_blocks_dynamic_css .= 'gap:' . $uplifters_site_builder_blocks_desktop_gap . ';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

/* Per-device row order. save.js wraps the rows in their own flex container, so
   that container — not the outer wrapper — is what the order rules target. */
$uplifters_site_builder_blocks_order_css = \UpliftersSiteBuilderBlocks\ResponsiveGlobal\ResponsiveOrderCss::device_css(
	'#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-row-layout',
	$attributes['childOrder'] ?? null,
	\UpliftersSiteBuilderBlocks\ResponsiveGlobal\ResponsiveOrderCss::count_inner_blocks( $block )
);

$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_order_css['desktop'];

$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:1024px){';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'padding:' . $uplifters_site_builder_blocks_tablet_padding . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'margin:' . $uplifters_site_builder_blocks_tablet_margin . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'border-radius:' . $uplifters_site_builder_blocks_tablet_radius . ';';

if ( $uplifters_site_builder_blocks_tablet_bg ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' . $uplifters_site_builder_blocks_tablet_bg . ';';
}

$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-row-layout{';
$uplifters_site_builder_blocks_dynamic_css .= 'gap:' . $uplifters_site_builder_blocks_tablet_gap . ';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_order_css['tablet'];

$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '@media (max-width:767px){';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . '{';
$uplifters_site_builder_blocks_dynamic_css .= 'padding:' . $uplifters_site_builder_blocks_mobile_padding . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'margin:' . $uplifters_site_builder_blocks_mobile_margin . ';';
$uplifters_site_builder_blocks_dynamic_css .= 'border-radius:' . $uplifters_site_builder_blocks_mobile_radius . ';';

if ( $uplifters_site_builder_blocks_mobile_bg ) {
	$uplifters_site_builder_blocks_dynamic_css .= 'background-color:' . $uplifters_site_builder_blocks_mobile_bg . ';';
}

$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= '#' . $uplifters_site_builder_blocks_unique_id . ' .uplifters-site-builder-blocks-row-layout{';
$uplifters_site_builder_blocks_dynamic_css .= 'gap:' . $uplifters_site_builder_blocks_mobile_gap . ';';
$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_dynamic_css .= $uplifters_site_builder_blocks_order_css['mobile'];

$uplifters_site_builder_blocks_dynamic_css .= '}';

$uplifters_site_builder_blocks_css = $uplifters_site_builder_blocks_static_css . $uplifters_site_builder_blocks_dynamic_css;
$uplifters_site_builder_blocks_css = wp_strip_all_tags( $uplifters_site_builder_blocks_css );

\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css );
?>

<div
	id="<?php echo esc_attr( $uplifters_site_builder_blocks_unique_id ); ?>"
	class="uplifters-site-builder-blocks-row-layout-wrapper"
>
	<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Already-rendered inner block markup. ?>
</div>
